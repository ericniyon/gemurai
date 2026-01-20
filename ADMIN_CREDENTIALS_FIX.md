# Admin Credentials Fix

## Problem
Admin credentials are not working because users need to have roles assigned via the `UserRoleAssignment` table, not just a direct `role` field.

## Solution

Run the fix script to create admin users with proper role assignments:

```bash
npx tsx scripts/fix-admin-credentials.ts
```

Or use the create-admin-user script:

```bash
npx tsx scripts/create-admin-user.ts
```

## Admin Credentials (After Running Script)

### SUPER_ADMIN
- **Email:** `admin@harvestplus.rw`
- **Password:** `admin123`

### ADMIN
- **Email:** `admin2@harvestplus.rw`
- **Password:** `admin123`

## Alternative: Use Existing Scripts

If the above doesn't work, try:

```bash
npm run seed-users
```

Or:

```bash
npx prisma db seed
```

## Manual Database Fix (If Scripts Don't Work)

If you need to manually create the admin user in the database:

1. **Create Role (if doesn't exist):**
```sql
INSERT INTO roles (id, name, description, "isActive", "isSystem", "createdAt", "updatedAt")
VALUES ('super-admin-role-id', 'SUPER_ADMIN', 'Super Administrator', true, true, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;
```

2. **Create User:**
```sql
INSERT INTO users (id, email, name, password, "isActive", "createdAt", "updatedAt")
VALUES (
  'admin-user-id',
  'admin@harvestplus.rw',
  'Super Administrator',
  '$2a$10$...hashed_password...', -- Use bcrypt hash of "admin123"
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password;
```

3. **Assign Role:**
```sql
INSERT INTO user_role_assignments (id, "userId", "roleId", "assignedAt", "isActive")
VALUES (
  'assignment-id',
  'admin-user-id',
  'super-admin-role-id',
  NOW(),
  true
)
ON CONFLICT ("userId") DO UPDATE SET "roleId" = EXCLUDED."roleId";
```

## Password Hash

To generate the bcrypt hash for "admin123", you can use Node.js:

```javascript
const bcrypt = require('bcryptjs');
const hash = await bcrypt.hash('admin123', 10);
console.log(hash);
```
