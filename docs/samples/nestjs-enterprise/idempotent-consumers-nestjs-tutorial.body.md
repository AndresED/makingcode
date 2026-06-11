> **What you'll learn:** How to build idempotent Kafka/BullMQ consumers in NestJS so duplicate messages never create duplicate side effects.
>
> **Prerequisites:** Outbox pattern or any at-least-once message delivery.
>
> **Reference:** [Idempotency guide](https://github.com/AndresED/nestjs-enterprise-starter/blob/main/docs/infrastructure/20-idempotency.md)

Brokers retry. Consumers crash mid-processing. The same `UserCreated` event arrives twice. Without idempotency you create two users, charge twice, or send three emails.

**Idempotency:** processing the same message N times has the same effect as processing it once.

## Step 1 — Processed events table

```typescript
@Entity('processed_events')
@Index('idx_processed_event_id', ['eventId'], { unique: true })
export class ProcessedEventOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  eventId: string;

  @Column()
  eventType: string;

  @Column()
  aggregateId: string;

  @Column({ type: 'jsonb', nullable: true })
  result: Record<string, unknown>;

  @CreateDateColumn()
  processedAt: Date;
}
```

`eventId` must be globally unique per message (UUID from your outbox envelope).

## Step 2 — Processed event repository

```typescript
@Injectable()
export class ProcessedEventRepository {
  constructor(
    @InjectRepository(ProcessedEventOrmEntity)
    private readonly repo: Repository<ProcessedEventOrmEntity>,
  ) {}

  async isProcessed(eventId: string): Promise<boolean> {
    const count = await this.repo.count({ where: { eventId } });
    return count > 0;
  }

  async markProcessed(
    eventId: string,
    eventType: string,
    aggregateId: string,
    result?: Record<string, unknown>,
  ): Promise<void> {
    await this.repo.save(
      this.repo.create({ eventId, eventType, aggregateId, result }),
    );
  }
}
```

## Step 3 — Idempotent consumer

```typescript
@Injectable()
export class UserCreatedConsumer {
  private readonly logger = new Logger(UserCreatedConsumer.name);

  constructor(
    private readonly processed: ProcessedEventRepository,
    private readonly users: UserRepositoryPort,
  ) {}

  async handle(envelope: { eventId: string; eventType: string; payload: { userId: string; email: string } }) {
    const { eventId, eventType, payload } = envelope;

    if (await this.processed.isProcessed(eventId)) {
      this.logger.warn(`Skip duplicate event ${eventId}`);
      return;
    }

    const result = await this.processUserCreated(payload);

    await this.processed.markProcessed(eventId, eventType, payload.userId, result);
    this.logger.log(`Processed ${eventId}`);
  }

  private async processUserCreated(payload: { userId: string; email: string }) {
    const exists = await this.users.findByExternalId(payload.userId);
    if (exists) {
      return { status: 'already_exists', userId: exists.id };
    }
    const user = await this.users.createFromEvent(payload);
    return { status: 'created', userId: user.id };
  }
}
```

Order matters: check processed table **before** side effects. On crash after create but before mark, reconciliation logic handles the edge case.

## Step 4 — Reconciliation on retry

```typescript
const exists = await this.users.findByExternalId(payload.userId);
if (exists) {
  if (await this.processed.isProcessed(eventId)) return;
  // User exists, event not marked — likely crash between create and mark
  await this.processed.markProcessed(eventId, eventType, payload.userId, { status: 'reconciled' });
  return;
}
```

Design for **at-least-once**, not exactly-once (which requires distributed transactions).

## Step 5 — Idempotency keys in BullMQ jobs

For queue workers, pass an explicit key:

```typescript
await queue.add('sync-user', {
  idempotencyKey: envelope.eventId,
  userData: payload,
});
```

```typescript
@Processor('sync-user')
export class SyncUserProcessor extends WorkerHost {
  async process(job: Job<{ idempotencyKey: string; userData: unknown }>) {
    if (await this.processed.isProcessed(job.data.idempotencyKey)) {
      return { skipped: true };
    }
    const result = await this.sync(job.data.userData);
    await this.processed.markProcessed(job.data.idempotencyKey, 'SyncUser', '...', result);
    return result;
  }
}
```

Reuse the same `eventId` from the outbox as the idempotency key end-to-end.

## Step 6 — TTL cleanup

Processed events grow forever. Schedule deletion of rows older than 30 days:

```typescript
@Injectable()
export class ProcessedEventsCleanupService {
  async cleanup(daysOld = 30): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysOld);
    const result = await this.repo.delete({ processedAt: LessThan(cutoff) });
    return result.affected ?? 0;
  }
}
```

Keep retention longer than your broker's max retry window.

## Strategy by operation

| Operation | Idempotency approach |
|-----------|---------------------|
| Create | `processed_events` + check external ID |
| Update | Upsert by ID + processed check |
| Delete | Idempotent delete (no error if missing) |
| Payment | Provider idempotency key (Stripe pattern) |

## The full reliability stack

```
Handler → DB txn (entity + outbox)
  → Outbox worker → Kafka
    → Idempotent consumer (processed_events)
      → Retry + DLQ on failure
```

Each layer fixes a different failure mode. Skipping idempotency breaks the chain.

## Verify it works

1. Publish the same `eventId` twice to your consumer (test harness or manual replay).
2. Assert only one user row exists.
3. Assert `processed_events` has exactly one row for that `eventId`.

```typescript
it('should skip duplicate events', async () => {
  await consumer.handle(envelope);
  await consumer.handle(envelope);
  expect(users.createFromEvent).toHaveBeenCalledTimes(1);
});
```
