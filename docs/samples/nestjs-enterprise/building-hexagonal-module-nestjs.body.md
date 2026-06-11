> **What you'll learn:** How to structure a NestJS module using hexagonal architecture (ports and adapters), so business logic stays independent from TypeORM, HTTP, and queues.
>
> **Prerequisites:** Basic NestJS (modules, providers, controllers), TypeScript interfaces.
>
> **Reference repo:** [nestjs-enterprise-starter](https://github.com/AndresED/nestjs-enterprise-starter/tree/main/docs/infrastructure)

Most tutorials show you a `UsersService` that imports TypeORM directly. That works for a demo — and breaks the moment you need to swap the database, test without Postgres, or call the same logic from a CLI job.

In this tutorial we build a **User module** the hexagonal way: the domain defines *what* it needs (ports); adapters provide *how* (TypeORM, HTTP).

## Why bother?

Without boundaries, you get:

- `@Column()` decorators inside "domain entities"
- Password hashing inside controllers
- Impossible unit tests without a running database

Hexagonal architecture fixes this with one rule:

**Dependencies point inward.** The core never imports NestJS, TypeORM, or BullMQ.

## Step 1 — Create the folder structure

In your NestJS project, add:

```
src/
├── core/
│   └── ports/output/persistence/
│       └── user.repository.port.ts
├── application/
│   └── commands/user/
│       ├── create-user.command.ts
│       └── create-user.handler.ts
├── adapters/
│   ├── primary/http/
│   │   ├── controllers/user.controller.ts
│   │   └── dto/request/create-user.dto.ts
│   └── secondary/persistence/typeorm/
│       ├── entities/user.orm-entity.ts
│       ├── mappers/user.mapper.ts
│       └── repositories/user.repository.ts
└── modules/user/user.module.ts
```

Configure path aliases in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@core/*": ["src/core/*"],
      "@application/*": ["src/application/*"],
      "@adapters/*": ["src/adapters/*"]
    }
  }
}
```

## Step 2 — Define the port (interface)

The domain declares the contract. No ORM imports here:

```typescript
// core/ports/output/persistence/user.repository.port.ts

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserPayload {
  email: string;
  name: string;
  password: string;
}

export abstract class UserRepositoryPort {
  abstract findByEmail(email: string): Promise<User | null>;
  abstract create(payload: CreateUserPayload): Promise<User>;
}
```

Use an `abstract class` or a string token for NestJS injection — both work. The important part: **handlers depend on this port, not on TypeORM.**

## Step 3 — Implement the TypeORM adapter

```typescript
// adapters/secondary/persistence/typeorm/entities/user.orm-entity.ts

@Entity('users')
export class UserOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column()
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

```typescript
// adapters/secondary/persistence/typeorm/mappers/user.mapper.ts

export class UserMapper {
  static toDomain(orm: UserOrmEntity): User {
    return {
      id: orm.id,
      email: orm.email,
      name: orm.name,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    };
  }
}
```

```typescript
// adapters/secondary/persistence/typeorm/repositories/user.repository.ts

@Injectable()
export class UserRepository extends UserRepositoryPort {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly orm: Repository<UserOrmEntity>,
  ) {
    super();
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.orm.findOne({ where: { email } });
    return row ? UserMapper.toDomain(row) : null;
  }

  async create(payload: CreateUserPayload): Promise<User> {
    const row = this.orm.create(payload);
    const saved = await this.orm.save(row);
    return UserMapper.toDomain(saved);
  }
}
```

Notice: the handler will receive a plain `User` object — never a TypeORM entity.

## Step 4 — Write the command handler (application layer)

Business rules live here, not in the controller:

```typescript
// application/commands/user/create-user.handler.ts

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    @Inject(UserRepositoryPort)
    private readonly users: UserRepositoryPort,
  ) {}

  async execute(command: CreateUserCommand): Promise<User> {
    const exists = await this.users.findByEmail(command.dto.email);
    if (exists) {
      throw new ConflictException('Email already registered');
    }

    const hashed = await bcrypt.hash(command.dto.password, 10);
    return this.users.create({ ...command.dto, password: hashed });
  }
}
```

## Step 5 — Keep the controller thin

```typescript
// adapters/primary/http/controllers/user.controller.ts

@Controller('users')
export class UserController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateUserDto) {
    const user = await this.commandBus.execute(new CreateUserCommand(dto));
    return { id: user.id, email: user.email, name: user.name };
  }
}
```

The controller translates HTTP → command. It does not hash passwords or query the database.

## Step 6 — Wire the module

```typescript
// modules/user/user.module.ts

const USER_REPOSITORY: Provider = {
  provide: UserRepositoryPort,
  useClass: UserRepository,
};

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([UserOrmEntity])],
  controllers: [UserController],
  providers: [USER_REPOSITORY, CreateUserHandler],
})
export class UserModule {}
```

## Verify it works

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"email":"dev@example.com","name":"Dev","password":"secret123"}'
```

You should get `201` with the user payload — and no password in the response.

## Common mistakes

| Mistake | Fix |
|---------|-----|
| Importing TypeORM in `core/` | Move entity to `adapters/secondary` |
| Fat controllers | Move logic to command handlers |
| Returning ORM entities from repository | Always map with `UserMapper.toDomain` |
| Injecting `UserRepository` in handler | Inject `UserRepositoryPort` |

## What you built

```
HTTP → Controller → CommandBus → Handler → Port → TypeORM Adapter → DB
```

Swap TypeORM for Prisma? Change only the adapter and module provider. Your handler stays untouched.

## Next lesson

Continue with **Implementing CQRS in NestJS** to split reads (`GetUserByIdQuery`) from writes (`CreateUserCommand`) in the same module.
