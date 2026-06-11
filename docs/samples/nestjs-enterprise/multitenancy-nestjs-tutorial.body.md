> **What you'll learn:** How to add multitenancy to a NestJS API — pick an isolation strategy, store `tenant_id`, and enforce filters on every query.
>
> **Prerequisites:** NestJS modules, TypeORM, JWT (tenant often comes from token claims).
>
> **Reference:** [Multitenant intro](https://github.com/AndresED/nestjs-enterprise-starter/blob/main/docs/infrastructure/12-multitenant-intro.md)

Building B2B SaaS means many customers on one deployment. **Tenant A must never see Tenant B's data.** One missing `WHERE tenant_id = ?` is a security incident.

This tutorial implements **row-level tenancy** (`tenant_id` column) — the recommended starting point in the enterprise starter.

## Step 1 — Choose your model

| Model | Isolation | Complexity | When to use |
|-------|-----------|------------|-------------|
| `tenant_id` column | Good (if enforced) | Low | Most SaaS until ~hundreds of tenants |
| Schema per tenant | Strong | Medium | Regulated data, stronger boundaries |
| DB per tenant | Maximum | High | Enterprise contracts, dedicated infra |

We implement **tenant_id** with strict repository enforcement.

## Step 2 — Tenant entity

```typescript
@Entity('tenants')
export class TenantOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  name: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', default: {} })
  settings: { timezone: string; locale: string; currency: string };
}
```

## Step 3 — Add tenant_id to tenant-scoped tables

```typescript
@Entity('accounts')
@Index('idx_accounts_tenant', ['tenantId'])
export class AccountOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'is_global', default: false })
  isGlobal: boolean;
}
```

**Master data** (countries, currencies) lives in modules without `tenant_id`. **Tenant data** (accounts, orders) always has it.

## Step 4 — Tenant context service

```typescript
@Injectable({ scope: Scope.REQUEST })
export class TenantContext {
  private tenantId: string | null = null;

  setTenantId(id: string): void {
    this.tenantId = id;
  }

  getTenantId(): string {
    if (!this.tenantId) {
      throw new ForbiddenException('Tenant context not set');
    }
    return this.tenantId;
  }
}
```

Request-scoped so each HTTP request carries its own tenant.

## Step 5 — Resolve tenant from the request

Common sources:

- JWT claim: `{ tenantId: '...' }`
- Header: `X-Tenant-Id` (for service-to-service)
- Subdomain: `acme.api.example.com` → slug `acme`

```typescript
@Injectable()
export class TenantResolverMiddleware implements NestMiddleware {
  constructor(
    private readonly tenantContext: TenantContext,
    private readonly tenantRepo: TenantRepository,
  ) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const tenantId = req.user?.tenantId ?? req.headers['x-tenant-id'];
    if (!tenantId) {
      throw new BadRequestException('Tenant required');
    }

    const tenant = await this.tenantRepo.findById(String(tenantId));
    if (!tenant?.isActive) {
      throw new ForbiddenException('Invalid or inactive tenant');
    }

    this.tenantContext.setTenantId(tenant.id);
    next();
  }
}
```

Apply to all `/tenant/*` routes in `AppModule.configure()`.

## Step 6 — Tenant-aware repository base class

Never trust developers to remember the filter:

```typescript
export abstract class TenantAwareRepository<T extends { tenantId: string }> {
  constructor(protected readonly tenantContext: TenantContext) {}

  protected withTenantFilter<Q extends SelectQueryBuilder<T>>(qb: Q): Q {
    return qb.andWhere('entity.tenant_id = :tenantId', {
      tenantId: this.tenantContext.getTenantId(),
    });
  }

  async findAllForTenant(repo: Repository<T>): Promise<T[]> {
    return this.withTenantFilter(repo.createQueryBuilder('entity')).getMany();
  }
}
```

Every query on tenant-scoped entities goes through this base.

## Step 7 — Auto-set tenant_id on create

```typescript
async create(payload: CreateAccountPayload): Promise<Account> {
  const row = this.orm.create({
    ...payload,
    tenantId: this.tenantContext.getTenantId(),
  });
  const saved = await this.orm.save(row);
  return AccountMapper.toDomain(saved);
}
```

Inserts without `tenant_id` should be impossible in tenant modules.

## Step 8 — Split master vs tenant modules

```
src/modules/
├── master/
│   ├── countries/
│   └── currencies/     # no tenant filter
└── tenant/
    ├── accounts/
    └── orders/           # always tenant-scoped
```

Document which modules are which in your README — onboarding mistakes are expensive here.

## Verify it works

```bash
# Tenant A token
curl -H "Authorization: Bearer $TOKEN_A" localhost:3000/accounts
# → only Tenant A accounts

# Tenant B token
curl -H "Authorization: Bearer $TOKEN_B" localhost:3000/accounts
# → only Tenant B accounts
```

Add an integration test that creates data for two tenants and asserts cross-tenant reads return empty.

## Common mistakes

- Filtering in controllers but not in background jobs → jobs need `TenantContext` too
- `is_global` rows without documenting who can read them
- Using subdomain routing without validating tenant ownership of the JWT

## Next steps in the starter

The repo continues with dedicated guides for [Tenant Resolver](https://github.com/AndresED/nestjs-enterprise-starter/blob/main/docs/infrastructure/13-tenant-resolver.md), [Tenant Interceptor](https://github.com/AndresED/nestjs-enterprise-starter/blob/main/docs/infrastructure/14-tenant-interceptor.md), and [Tenant Repository](https://github.com/AndresED/nestjs-enterprise-starter/blob/main/docs/infrastructure/15-tenant-repository.md).
