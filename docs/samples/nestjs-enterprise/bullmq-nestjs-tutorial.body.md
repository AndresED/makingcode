> **What you'll learn:** How to add background jobs to NestJS with BullMQ and Redis — enqueue from command handlers, process with workers, and configure retries.
>
> **Prerequisites:** Redis running locally (Docker or native), hexagonal module with command handlers.
>
> **Reference:** [BullMQ setup guide](https://github.com/AndresED/nestjs-enterprise-starter/blob/main/docs/infrastructure/11-bullmq-setup.md)

Waiting for SMTP inside `POST /users` makes registration slow and fragile. The fix: **acknowledge the request immediately**, process slow work in a background worker.

We use BullMQ on Redis, but expose a `IQueueService` port so handlers never import BullMQ directly.

## Step 1 — Start Redis

```bash
docker run -d --name redis -p 6379:6379 redis:7-alpine
```

```bash
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Step 2 — Install packages

```bash
npm install bullmq @nestjs/bullmq
```

## Step 3 — Define the queue port

```typescript
// core/ports/output/queue/queue.port.ts

export interface QueueJob<T = unknown> {
  name: string;
  data: T;
  options?: {
    delay?: number;
    attempts?: number;
    priority?: number;
  };
}

export abstract class IQueueService {
  abstract add<T>(queueName: string, job: QueueJob<T>): Promise<string>;
}
```

## Step 4 — Configure BullMQ module

```typescript
// adapters/secondary/queue/bullmq/bullmq.module.ts

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get('REDIS_HOST', 'localhost'),
          port: parseInt(config.get('REDIS_PORT', '6379'), 10),
        },
      }),
    }),
    BullModule.registerQueue({ name: 'email' }),
  ],
  exports: [BullModule],
})
export class BullMQRootModule {}
```

## Step 5 — Email processor (worker)

```typescript
@Processor('email', { concurrency: 5 })
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  async process(job: Job<{ userId: string; email: string; name: string }>) {
    if (job.name === 'welcome-email') {
      this.logger.log(`Sending welcome email to ${job.data.email}`);
      // await this.mailer.sendWelcome(job.data);
      return { sent: true };
    }
  }
}
```

Processors live in `adapters/secondary/queue/` — they are infrastructure, not domain.

## Step 6 — Queue service adapter

```typescript
@Injectable()
export class BullMQQueueService extends IQueueService {
  constructor(@InjectQueue('email') private readonly emailQueue: Queue) {
    super();
  }

  async add<T>(queueName: string, job: QueueJob<T>): Promise<string> {
    if (queueName !== 'email') throw new Error(`Unknown queue: ${queueName}`);
    const result = await this.emailQueue.add(job.name, job.data, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
      ...job.options,
    });
    return result.id!;
  }
}
```

Register in module:

```typescript
{ provide: IQueueService, useClass: BullMQQueueService }
```

## Step 7 — Enqueue from CreateUserHandler

```typescript
@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    @Inject(UserRepositoryPort) private readonly users: UserRepositoryPort,
    @Inject(IQueueService) private readonly queue: IQueueService,
  ) {}

  async execute(command: CreateUserCommand): Promise<User> {
    const user = await this.users.create(command.dto);

    await this.queue.add('email', {
      name: 'welcome-email',
      data: { userId: user.id, email: user.email, name: user.name },
      options: { delay: 1000 },
    });

    return user;
  }
}
```

The HTTP response returns in milliseconds. The email sends within seconds.

## Step 8 — Default retry policy

```typescript
defaultJobOptions: {
  attempts: 3,
  backoff: { type: 'exponential', delay: 1000 },
  removeOnComplete: { count: 100, age: 3600 },
  removeOnFail: { count: 500, age: 86400 },
},
```

Failed jobs remain inspectable for 24h — enough to debug without filling Redis.

## Verify it works

1. `POST /users` → immediate `201`.
2. Watch worker logs → `Sending welcome email to ...`.
3. Stop Redis → user still created; job fails and retries when Redis returns.

```typescript
const counts = await emailQueue.getJobCounts('waiting', 'active', 'completed', 'failed');
console.log(counts);
```

## Patterns you'll use

| Pattern | BullMQ option | Example |
|---------|---------------|---------|
| Fire and forget | `queue.add()` | Welcome email |
| Delayed | `delay: 86400000` | Payment reminder |
| Recurring | `repeat: { every: ... }` | Daily cleanup |
| Priority | `priority: 1` | Critical alerts |

## Next lesson

When jobs or Kafka consumers can receive duplicates, add **Idempotent Event Consumers**.
