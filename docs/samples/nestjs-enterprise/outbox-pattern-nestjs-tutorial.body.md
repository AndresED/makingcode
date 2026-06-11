> **What you'll learn:** How to implement the transactional outbox pattern in NestJS so database writes and event publishing stay consistent.
>
> **Prerequisites:** TypeORM transactions, basic understanding of message brokers (Kafka).
>
> **Reference:** [Outbox pattern guide](https://github.com/AndresED/nestjs-enterprise-starter/blob/main/docs/infrastructure/19-outbox-pattern.md)

## The problem you're solving

A common (broken) flow:

```typescript
await this.users.create(dto);           // ✅ committed
await this.kafka.publish('UserCreated', payload);  // ❌ broker timeout
```

The user exists. Downstream services never received the event. Retrying from the client might create duplicates.

**The outbox pattern:** write the event to an `outbox_events` table **in the same transaction** as your business data. A worker publishes pending rows later.

## Step 1 — Create the outbox table

```typescript
@Entity('outbox_events')
@Index('idx_outbox_status', ['status'])
export class OutboxEventOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  aggregateType: string;

  @Column()
  aggregateId: string;

  @Column()
  eventType: string;

  @Column({ type: 'jsonb' })
  payload: Record<string, unknown>;

  @Column({ type: 'enum', enum: ['pending', 'processing', 'published', 'failed'], default: 'pending' })
  status: string;

  @Column({ default: 0 })
  retryCount: number;

  @Column({ nullable: true })
  errorMessage?: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  processedAt?: Date;
}
```

Run a migration before proceeding.

## Step 2 — Outbox repository

```typescript
@Injectable()
export class OutboxRepository {
  constructor(
    @InjectRepository(OutboxEventOrmEntity)
    private readonly repo: Repository<OutboxEventOrmEntity>,
  ) {}

  async create(envelope: { eventType: string; payload: Record<string, unknown> }): Promise<void> {
    const row = this.repo.create({
      aggregateType: envelope.eventType.replace(/Created|Updated|Deleted/, ''),
      aggregateId: String(envelope.payload['userId'] ?? envelope.payload['id']),
      eventType: envelope.eventType,
      payload: envelope.payload,
      status: 'pending',
    });
    await this.repo.save(row);
  }

  async getPending(limit = 100): Promise<OutboxEventOrmEntity[]> {
    return this.repo.find({
      where: { status: 'pending' },
      order: { createdAt: 'ASC' },
      take: limit,
    });
  }

  async markPublished(id: string): Promise<void> {
    await this.repo.update(id, { status: 'published', processedAt: new Date() });
  }

  async markFailed(id: string, message: string): Promise<void> {
    await this.repo.increment({ id }, 'retryCount', 1);
    await this.repo.update(id, { status: 'failed', errorMessage: message });
  }
}
```

## Step 3 — Save user + outbox in one transaction

```typescript
@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    private readonly dataSource: DataSource,
    @Inject(UserRepositoryPort) private readonly users: UserRepositoryPort,
    private readonly outbox: OutboxRepository,
  ) {}

  async execute(command: CreateUserCommand): Promise<User> {
    return this.dataSource.transaction(async () => {
      const user = await this.users.create(command.dto);

      await this.outbox.create({
        eventType: 'UserCreated',
        payload: { userId: user.id, email: user.email, name: user.name },
      });

      return user;
    });
  }
}
```

If either insert fails, **both** roll back. No orphan users without events.

## Step 4 — Background publisher

```typescript
@Injectable()
export class OutboxPublisherService implements OnModuleInit {
  private readonly logger = new Logger(OutboxPublisherService.name);

  constructor(
    private readonly outbox: OutboxRepository,
    private readonly kafka: KafkaProducerService,
  ) {}

  onModuleInit() {
    setInterval(() => this.processBatch(), 1000);
  }

  async processBatch(): Promise<void> {
    const events = await this.outbox.getPending(100);
    for (const event of events) {
      try {
        await this.kafka.publish(
          this.topicFor(event.eventType),
          event.eventType,
          event.payload,
          { key: event.aggregateId },
        );
        await this.outbox.markPublished(event.id);
        this.logger.log(`Published ${event.eventType} (${event.id})`);
      } catch (err) {
        await this.outbox.markFailed(event.id, (err as Error).message);
        this.logger.error(`Failed ${event.id}: ${(err as Error).message}`);
      }
    }
  }

  private topicFor(eventType: string): string {
    const map: Record<string, string> = {
      UserCreated: 'user.created.v1',
      OrderCompleted: 'order.completed.v1',
    };
    return map[eventType] ?? `events.${eventType.toLowerCase()}`;
  }
}
```

In production, prefer a dedicated worker process or BullMQ scheduled job instead of `setInterval` — but the logic is the same.

## Step 5 — Register the module

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([OutboxEventOrmEntity])],
  providers: [OutboxRepository, OutboxPublisherService],
  exports: [OutboxRepository],
})
export class OutboxModule {}
```

Import `OutboxModule` in `AppModule` and in any module whose handlers write to the outbox.

## Verify it works

1. Create a user via API.
2. Query `SELECT * FROM outbox_events WHERE status = 'pending'` — you should see a row.
3. After the worker runs, status becomes `published`.
4. Kill Kafka before creating a user — row stays `pending` or `failed`, user still exists (consistent). Fix Kafka, worker retries.

## Important: consumers must be idempotent

Outbox gives **at-least-once** delivery. The next tutorial covers **idempotent consumers** so duplicate events do not create duplicate side effects.

## Summary

| Step | Responsibility |
|------|----------------|
| Command handler | Atomic write: entity + outbox row |
| Outbox worker | Poll pending → publish → mark published |
| Consumer | Process once per `eventId` |

Never publish to Kafka outside the database transaction unless you explicitly accept inconsistency.
