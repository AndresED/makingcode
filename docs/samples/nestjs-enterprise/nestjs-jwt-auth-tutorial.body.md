> **What you'll learn:** How to protect a NestJS API with JWT — login with email/password, validate bearer tokens, and restrict routes by role.
>
> **Prerequisites:** A User module with repository port (hexagonal setup).
>
> **Reference:** [JWT auth guide](https://github.com/AndresED/nestjs-enterprise-starter/blob/main/docs/infrastructure/10-jwt-auth.md)

Authentication is not "add `@UseGuards` and done." You need a clear flow: validate credentials → issue token → validate token on every protected request → enforce roles where needed.

We implement this with **Passport** strategies in NestJS, keeping `AuthService` behind your existing `UserRepositoryPort`.

## Architecture overview

```
POST /auth/login
  → LocalStrategy validates email + password
  → AuthService.login() signs JWT
  → Client stores accessToken

GET /users/me  (Authorization: Bearer <token>)
  → JwtStrategy validates + decodes payload
  → request.user = { userId, email, role }
  → RolesGuard checks @Roles('admin') if present
```

## Step 1 — Install dependencies

```bash
npm install @nestjs/passport passport passport-local passport-jwt @nestjs/jwt bcrypt
npm install -D @types/passport-local @types/passport-jwt
```

## Step 2 — Environment variables

```bash
# .env
JWT_SECRET=use-a-long-random-string-in-production
JWT_EXPIRES_IN=7d
```

Never commit real secrets. Rotate `JWT_SECRET` if leaked.

## Step 3 — AuthService

```typescript
@Injectable()
export class AuthService {
  constructor(
    @Inject(UserRepositoryPort)
    private readonly users: UserRepositoryPort,
    private readonly jwt: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.users.findByEmailWithPassword(email);
    if (!user) return null;

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return null;

    const { password: _, ...safe } = user;
    return safe;
  }

  login(user: { id: string; email: string; name: string; role: string }) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: this.jwt.sign(payload),
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    };
  }
}
```

Add `findByEmailWithPassword` to your repository port — it selects the password column only for auth, never for public queries.

## Step 4 — Local strategy (login)

```typescript
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly auth: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string) {
    const user = await this.auth.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }
}
```

Use a **generic** error message — do not reveal whether the email exists.

## Step 5 — JWT strategy (protected routes)

```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  validate(payload: { sub: string; email: string; role: string }) {
    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException('Invalid token');
    }
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
```

Whatever `validate()` returns becomes `request.user`.

## Step 6 — Guards and decorators

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<string[]>('roles', [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!roles?.length) return true;

    const { user } = ctx.switchToHttp().getRequest();
    return user && roles.includes(user.role);
  }
}
```

```typescript
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

export const CurrentUser = createParamDecorator((_data, ctx: ExecutionContext) => {
  return ctx.switchToHttp().getRequest().user;
});
```

## Step 7 — Auth controller

```typescript
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto) {
    const user = await this.auth.validateUser(dto.email, dto.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    return this.auth.login(user);
  }
}
```

Validate DTOs with `class-validator`:

```typescript
export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
```

## Step 8 — Protect routes

```typescript
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  @Get('me')
  me(@CurrentUser() user: IUserPayload) {
    return user;
  }

  @Delete(':id')
  @Roles('admin')
  async remove(@Param('id') id: string) {
    return this.commandBus.execute(new DeleteUserCommand(id));
  }
}
```

Apply guards at controller level when every route requires authentication.

## Step 9 — Auth module wiring

```typescript
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow('JWT_SECRET'),
        signOptions: { expiresIn: config.get('JWT_EXPIRES_IN') || '7d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

## Verify it works

```bash
# Login
TOKEN=$(curl -s -X POST localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"yourpassword"}' \
  | jq -r .accessToken)

# Protected route
curl localhost:3000/users/me -H "Authorization: Bearer $TOKEN"
```

Without the header → `401 Unauthorized`.

## Security checklist

- [ ] `bcrypt` cost factor ≥ 10
- [ ] `JWT_SECRET` from env, not hardcoded
- [ ] `ignoreExpiration: false`
- [ ] No tokens or passwords in logs
- [ ] Role checks via `RolesGuard`, not scattered `if` statements

## Next lesson

Once users are authenticated, offload welcome emails with **Background Jobs in NestJS with BullMQ**.
