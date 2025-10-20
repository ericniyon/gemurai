# Login 500 Error Debugging Guide

## Issue Description
Users are experiencing a 500 Internal Server Error when trying to login via `/api/v1/auth/login` in production.

## Root Cause Analysis

The login endpoint has several complex dependencies that could cause a 500 error:

1. **Database Connection Issues** (Most Likely)
2. **Complex Role System Database Schema**
3. **Missing Environment Variables**
4. **JWT Token Generation Issues**
5. **bcrypt Password Comparison Issues**

## Debug Steps

### 1. Use the Diagnostic Tool (Recommended)
Visit `https://app.ictchamber.rw/debug/login-diagnostic` to run all tests automatically with a user-friendly interface.

### 2. Manual Testing (Alternative)

#### Check Server Health
```bash
curl -X GET https://app.ictchamber.rw/api/debug/health
```

#### Check Database Health
```bash
curl -X GET https://app.ictchamber.rw/api/debug/database-health
```

This will test:
- Database connection
- Basic queries
- User table access
- Role system tables (role, userRole, rolePermissions)
- Environment variables

#### Test Simple Login (Without Complex Role System)
```bash
curl -X POST https://app.ictchamber.rw/api/debug/login-test \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

This tests basic authentication without the complex role system.

#### Use Fallback Login Endpoint
```bash
curl -X POST https://app.ictchamber.rw/api/v1/auth/login-fallback \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

This uses the basic `user.role` field instead of the complex `userRole.role.rolePermissions` system.

### 3. Check Production Logs
Look for these specific error patterns in the production logs:

```
🔐 Attempting login for:
📡 Login response status:
❌ Login failed with status:
💥 Login network/fetch error:
Database connection failed:
User query failed:
Password comparison failed:
Token generation failed:
Role permissions lookup failed:
```

## Immediate Solutions

### Option 1: Use Fallback Login (Recommended)
Temporarily update your frontend to use the fallback endpoint:
```javascript
// Change from:
const response = await fetch('/api/v1/auth/login', {...})

// To:
const response = await fetch('/api/v1/auth/login-fallback', {...})
```

### Option 2: Fix Database Schema
If the role system is broken, you may need to:
1. Check if `Role`, `UserRole`, `RolePermission`, `Permission` tables exist
2. Verify the relationships between these tables
3. Run database migrations if needed

### Option 3: Environment Variables
Ensure these are set in production:
```bash
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret_key
NEXTAUTH_SECRET=your_nextauth_secret
```

## Enhanced Error Logging

The main login endpoint now includes detailed error logging for each step:
- Database connection test
- User lookup
- Password verification
- Role permission lookup
- Token generation
- Cookie setting

## Database Schema Issues

The login endpoint expects this database structure:
```sql
-- Complex role system (current)
User -> UserRole -> Role -> RolePermission -> Permission

-- Simple role system (fallback)
User.role (string field: 'DCC', 'EMPLOYER', 'CONSUMER', etc.)
```

If the complex system is broken, the fallback uses the simple `user.role` field.

## Production Monitoring

Add these endpoints to your monitoring:
- `/api/debug/database-health` - Database health check
- `/api/debug/login-test` - Simple login test
- `/api/v1/auth/login-fallback` - Fallback login

## Next Steps

1. **Run the database health check first**
2. **Check production logs for detailed error messages**
3. **Use the fallback login endpoint as a temporary solution**
4. **Fix the underlying database/schema issues**
5. **Switch back to the main login endpoint once fixed**

## Common Production Issues

### Database Connection Timeout
```json
{
  "error": "Database connection failed",
  "details": "Connection timeout"
}
```

### Missing Role Tables
```json
{
  "error": "User lookup failed",
  "details": "Table 'Role' doesn't exist"
}
```

### Invalid JWT Secret
```json
{
  "error": "Token generation failed",
  "details": "JWT secret is invalid"
}
```

### bcrypt Issues
```json
{
  "error": "Password validation failed",
  "details": "bcrypt compare failed"
}
``` 