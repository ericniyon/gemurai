# SOROMA FOODS — Phase 2 RBAC & Multi-Tenant Security

## Implemented

### RBAC catalog (`lib/soroma/permissions.ts`)

- Central permission keys (module view/manage, actions, widgets)
- `permissionSatisfies()` — manage implies view for nav and guards

### Role resolution (`lib/soroma/rbac.ts`)

- Platform roles → permission sets
- Tenant roles → permission sets
- Used by `lib/soroma/auth.ts` session builder

### Guards

| Layer | File |
|-------|------|
| Route (server) | `components/soroma/soroma-route-guard.tsx` + `lib/soroma/route-permissions.ts` |
| API tenant scope | `lib/soroma/guards.ts` → `requireTenantScope` |
| API permission | `lib/soroma/guards.ts` → `checkApiPermission` |
| Widget/action (client) | `components/soroma/permission-guard.tsx` |
| Role (client) | `components/soroma/role-guard.tsx` |

### Dynamic navigation (`config/navigation/soroma.ts`)

- Permission-aware sidebar (any of view/manage)
- Backward compatible via `lib/soroma/navigation.ts` re-exports

### Layouts

| Layout | Component |
|--------|-----------|
| PlatformLayout | `components/layouts/soroma-platform-layout.tsx` |
| TenantLayout | `components/layouts/soroma-tenant-layout.tsx` |
| AuthLayout | `components/layouts/soroma-auth-layout.tsx` |
| MinimalLayout | `components/layouts/soroma-minimal-layout.tsx` |

### Workspace switching

- Cookies: `soroma_workspace`, `soroma_tenant_id`
- API: `POST /api/v1/soroma/workspace/switch`
- Audit: `workspace.switched`, `workspace.tenant_impersonation`

### Audit foundations

- `POST /api/v1/soroma/auth/audit-login` → `auth.login`
- Workspace switch events logged to `soroma_audit_logs`

### Middleware

- Sets `x-pathname` on SOROMA routes for server route guards

## Usage examples

### Client widget guard

```tsx
<PermissionGuard permission="soroma.finance.export">
  <ExportButton />
</PermissionGuard>
```

### Client role guard

```tsx
<RoleGuard roles={["FINANCE_MANAGER", "TENANT_ADMIN"]} workspace="tenant">
  <FinanceActions />
</RoleGuard>
```

### Server page guard

Route permissions are enforced automatically in `SoromaPlatformLayout` / `SoromaTenantLayout` via `SoromaRouteGuard`.

## Phase 2.1 (implemented)

- Prisma: `soroma_permissions`, `soroma_roles`, `soroma_role_permissions`
- Seed: `npx tsx scripts/seed-soroma-rbac.ts`
- Resolver: `lib/soroma/rbac-resolver.ts` (DB-first, code fallback)
- Quick actions support `permission` prop with `PermissionGuard`
- `soroma.po.approve` enforced on procurement approve/reject transitions

## Phase 2.2 (next)

- Admin UI to edit role permissions in DB
- Finance export API with `soroma.finance.export` enforcement
- Feature flags on memberships
