> **What you'll learn:** How to test NestJS command and query handlers with Jest — mock ports, assert business rules, and keep coverage on the code that matters.
>
> **Prerequisites:** Jest basics, a CQRS handler using repository ports.
>
> **Reference:** [TDD strategy guide](https://github.com/AndresED/nestjs-enterprise-starter/blob/main/docs/infrastructure/08-tdd-strategy.md)

Hexagonal architecture only helps if you can test handlers **without PostgreSQL**. This tutorial walks through unit tests for `CreateUserHandler` and `GetUserByIdHandler` — the highest-ROI tests in a CQRS codebase.

## What to test where

| Layer | Test type | Mock what |
|-------|-----------|-----------|
| Command handler | Unit | `UserRepositoryPort`, `IQueueService` |
| Query handler | Unit | `UserRepositoryPort` |
| Controller | Integration | `CommandBus`, `QueryBus` |
| Repository | Integration | Real DB or test container |

We focus on **handler unit tests** — fast, deterministic, no Docker.

## Step 1 — Jest path aliases

```javascript
// jest.config.js
module.exports = {
  moduleNameMapper: {
    '^@core/(.*)$': '<rootDir>/core/$1',
    '^@application/(.*)$': '<rootDir>/application/$1',
    '^@adapters/(.*)$': '<rootDir>/adapters/$1',
  },
};
```

Aliases must match `tsconfig.json` paths.

## Step 2 — Reusable mocks

```typescript
// __tests__/mocks/user.repository.mock.ts

export function createMockUserRepository() {
  return {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
    findAllPaginated: jest.fn(),
  };
}

// __tests__/mocks/queue.service.mock.ts

export function createMockQueueService() {
  return {
    add: jest.fn().mockResolvedValue('job-123'),
  };
}
```

## Step 3 — Test CreateUserHandler

```typescript
describe('CreateUserHandler', () => {
  let handler: CreateUserHandler;
  let users: ReturnType<typeof createMockUserRepository>;
  let queue: ReturnType<typeof createMockQueueService>;

  beforeEach(async () => {
    users = createMockUserRepository();
    queue = createMockQueueService();

    const module = await Test.createTestingModule({
      providers: [
        CreateUserHandler,
        { provide: UserRepositoryPort, useValue: users },
        { provide: IQueueService, useValue: queue },
      ],
    }).compile();

    handler = module.get(CreateUserHandler);
  });

  const dto = { email: 'test@example.com', name: 'Test', password: 'pass1234' };
  const created = { id: 'uuid', ...dto, role: 'user', createdAt: new Date(), updatedAt: new Date() };

  it('should create user and enqueue welcome email', async () => {
    users.findByEmail.mockResolvedValue(null);
    users.create.mockResolvedValue(created);

    const result = await handler.execute(new CreateUserCommand(dto));

    expect(users.findByEmail).toHaveBeenCalledWith(dto.email);
    expect(users.create).toHaveBeenCalled();
    expect(queue.add).toHaveBeenCalledWith('email', expect.objectContaining({
      name: 'welcome-email',
    }));
    expect(result.id).toBe(created.id);
  });

  it('should reject duplicate email', async () => {
    users.findByEmail.mockResolvedValue(created);

    await expect(handler.execute(new CreateUserCommand(dto)))
      .rejects.toThrow(/already exists/i);

    expect(users.create).not.toHaveBeenCalled();
    expect(queue.add).not.toHaveBeenCalled();
  });
});
```

**Naming convention:** `should <behavior> when <condition>`.

## Step 4 — Test GetUserByIdHandler

```typescript
describe('GetUserByIdHandler', () => {
  let handler: GetUserByIdHandler;
  let users: ReturnType<typeof createMockUserRepository>;

  beforeEach(async () => {
    users = createMockUserRepository();
    const module = await Test.createTestingModule({
      providers: [
        GetUserByIdHandler,
        { provide: UserRepositoryPort, useValue: users },
      ],
    }).compile();
    handler = module.get(GetUserByIdHandler);
  });

  it('should return null when user not found', async () => {
    users.findById.mockResolvedValue(null);
    const result = await handler.execute(new GetUserByIdQuery('missing-id'));
    expect(result).toBeNull();
  });

  it('should map entity to response DTO', async () => {
    const user = { id: '1', email: 'a@b.com', name: 'A', createdAt: new Date(), updatedAt: new Date() };
    users.findById.mockResolvedValue(user);

    const result = await handler.execute(new GetUserByIdQuery('1'));

    expect(result?.email).toBe('a@b.com');
    expect(result).not.toHaveProperty('password');
  });
});
```

## Step 5 — Controller integration (thin layer)

```typescript
describe('UserController', () => {
  it('should dispatch CreateUserCommand on POST', async () => {
    commandBus.execute.mockResolvedValue(createdUser);

    await controller.create(createUserDto);

    expect(commandBus.execute).toHaveBeenCalledWith(expect.any(CreateUserCommand));
  });
});
```

Controllers should have minimal logic — one or two tests per endpoint is enough.

## Step 6 — Coverage thresholds

```javascript
coverageThreshold: {
  global: { branches: 70, functions: 70, lines: 70, statements: 70 },
},
```

Aim higher on handlers:

| File | Target |
|------|--------|
| Command handlers | 90% |
| Query handlers | 90% |
| Domain entities | 80% |

Exclude `*.module.ts` and `main.ts` from coverage collection.

## Run tests

```bash
npm test
npm run test:cov
npm run test:watch   # during TDD loop
```

## TDD workflow for a new feature

1. Write a failing handler test (`should apply discount when coupon valid`)
2. Implement minimal handler code to pass
3. Refactor without changing test behavior
4. Add edge-case tests (expired coupon, max uses)

## Why this matters

If you inject `UserRepository` (TypeORM) directly, you need a database for every test. Ports + mocks keep the feedback loop under 100ms — that's what makes TDD sustainable in NestJS.
