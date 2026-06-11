> **What you'll learn:** How to implement CQRS in NestJS with `@nestjs/cqrs` — commands for writes, queries for reads, and controllers that only dispatch messages.
>
> **Prerequisites:** Completed the hexagonal module tutorial (or equivalent ports/adapters setup).
>
> **Reference:** [CQRS pattern guide](https://github.com/AndresED/nestjs-enterprise-starter/blob/main/docs/infrastructure/04-cqrs-pattern.md)

If every endpoint calls the same `UsersService`, you eventually optimize reads in ways that break writes — or add transactions to simple GET handlers by accident.

**CQRS** (Command Query Responsibility Segregation) means: one path mutates state, another path reads it. In NestJS, that maps cleanly to `CommandBus` and `QueryBus`.

## The pattern in 30 seconds

| HTTP method | Bus | Handler | Does |
|-------------|-----|---------|------|
| `POST /users` | CommandBus | `CreateUserHandler` | Insert, hash password, enqueue email |
| `GET /users/:id` | QueryBus | `GetUserByIdHandler` | Fetch + map to response DTO |
| `GET /users` | QueryBus | `GetUsersPaginatedHandler` | List with filters |

**Rule:** Command handlers never return paginated lists. Query handlers never call `save()`.

## Step 1 — Install and register CQRS

```bash
npm install @nestjs/cqrs
```

```typescript
// app.module.ts
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [CqrsModule, UserModule],
})
export class AppModule {}
```

## Step 2 — Create your first command

Commands are plain classes carrying input:

```typescript
// application/commands/user/create-user.command.ts

import { Command } from '@nestjs/cqrs';

export class CreateUserCommand extends Command {
  constructor(
    public readonly dto: {
      email: string;
      name: string;
      password: string;
    },
  ) {
    super();
  }
}
```

## Step 3 — Implement the command handler

```typescript
@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    @Inject(UserRepositoryPort)
    private readonly users: UserRepositoryPort,
  ) {}

  async execute(command: CreateUserCommand): Promise<User> {
    const existing = await this.users.findByEmail(command.dto.email);
    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const password = await bcrypt.hash(command.dto.password, 10);
    return this.users.create({ ...command.dto, password });
  }
}
```

Return a **domain entity**, not an HTTP DTO. The controller shapes the API response.

## Step 4 — Add a query for reads

```typescript
// application/queries/user/get-user-by-id.query.ts

export class GetUserByIdQuery extends Query {
  constructor(public readonly id: string) {
    super();
  }
}
```

```typescript
@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler implements IQueryHandler<GetUserByIdQuery> {
  constructor(
    @Inject(UserRepositoryPort)
    private readonly users: UserRepositoryPort,
  ) {}

  async execute(query: GetUserByIdQuery): Promise<UserResponseDto | null> {
    const user = await this.users.findById(query.id);
    if (!user) return null;
    return UserResponseDto.fromEntity(user);
  }
}
```

DTO mapping belongs in the **query handler** (read path), not in the command handler.

## Step 5 — Paginated list query

```typescript
export class GetUsersPaginatedQuery extends Query {
  constructor(
    public readonly page: number = 1,
    public readonly pageSize: number = 10,
    public readonly search?: string,
  ) {
    super();
  }
}
```

```typescript
@QueryHandler(GetUsersPaginatedQuery)
export class GetUsersPaginatedHandler implements IQueryHandler<GetUsersPaginatedQuery> {
  async execute(query: GetUsersPaginatedQuery) {
    const { items, total } = await this.users.findAllPaginated({
      page: query.page,
      pageSize: query.pageSize,
      search: query.search,
    });

    return {
      items: items.map(UserResponseDto.fromEntity),
      total,
      page: query.page,
      pageSize: query.pageSize,
      totalPages: Math.ceil(total / query.pageSize),
    };
  }
}
```

## Step 6 — Wire the controller

```typescript
@Controller('users')
export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async create(@Body() dto: CreateUserDto) {
    const user = await this.commandBus.execute(new CreateUserCommand(dto));
    return UserResponseDto.fromEntity(user);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.queryBus.execute(new GetUserByIdQuery(id));
  }

  @Get()
  async list(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
    @Query('search') search?: string,
  ) {
    return this.queryBus.execute(
      new GetUsersPaginatedQuery(Number(page), Number(pageSize), search),
    );
  }
}
```

## Step 7 — Register all handlers in the module

```typescript
const CommandHandlers = [CreateUserHandler, UpdateUserHandler, DeleteUserHandler];
const QueryHandlers = [GetUserByIdHandler, GetUsersPaginatedHandler];

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([UserOrmEntity])],
  controllers: [UserController],
  providers: [USER_REPOSITORY, ...CommandHandlers, ...QueryHandlers],
})
export class UserModule {}
```

**Forgot to register a handler?** NestJS won't throw at boot — the bus will fail at runtime. Add a smoke test per module.

## Step 8 — Transactions in command handlers only

When a write touches multiple tables:

```typescript
return this.dataSource.transaction(async (manager) => {
  const order = await this.orderRepo.create(dto, manager);
  for (const item of dto.items) {
    await this.productRepo.decreaseStock(item.productId, item.quantity, manager);
  }
  return order;
});
```

Do not open transactions in query handlers unless you have a documented read-consistency requirement.

## Verify it works

```bash
# Create
curl -X POST localhost:3000/users -H "Content-Type: application/json" \
  -d '{"email":"cqrs@example.com","name":"CQRS","password":"test1234"}'

# Read
curl localhost:3000/users/<id-from-response>

# List
curl "localhost:3000/users?page=1&pageSize=5"
```

## When CQRS is overkill

- CRUD with 4 endpoints and no complex rules → a thin service may suffice
- Reads and writes always scale together → separation adds folders without benefit

When handlers grow past ~80 lines or you add queue/HTTP/CLI entry points, CQRS pays for itself.

## Next lesson

Add **JWT authentication** so your commands and queries run behind guards — without putting auth logic inside handlers.
