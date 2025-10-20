# Gemurai Platform Authentication Guide

## Overview

The Gemurai platform uses a comprehensive role-based authentication system with JWT tokens and proper permission management. This guide explains how to test and use the authentication system.

## User Roles & Permissions

### 1. Super Administrator (SUPER_ADMIN)
- **Level**: 100 (Highest)
- **Access**: Complete system control
- **Permissions**: All permissions
- **Use Cases**: System configuration, complete user management, all administrative functions

### 2. Administrator (ADMIN)  
- **Level**: 80
- **Access**: Administrative access with most permissions
- **Permissions**: 
  - Dashboard & analytics
  - User management (view, create, edit)
  - Product management
  - Order management
  - Learning management
  - Job management
  - Financial management
  - Application review & management
  - Generate reports
- **Use Cases**: Day-to-day administration, user management, content management

### 3. Digital Community Champion (DCC)
- **Level**: 40
- **Access**: Core platform features for community champions
- **Permissions**:
  - Dashboard access
  - Product purchasing
  - Order creation and viewing
  - Course enrollment
  - Job applications
  - Financial assistance requests
- **Use Cases**: Selling products, learning, job seeking, financial services

### 4. Employer (EMPLOYER)
- **Level**: 30
- **Access**: Job posting and management capabilities
- **Permissions**:
  - Dashboard access
  - Job posting and management
  - User viewing (for hiring)
- **Use Cases**: Posting jobs, managing applications, hiring

### 5. Consumer (CONSUMER)
- **Level**: 10 (Lowest)
- **Access**: Basic marketplace access
- **Permissions**:
  - Product viewing and purchasing
  - Order creation and viewing
- **Use Cases**: Shopping, basic platform interaction

## Test Credentials

### Development Mode
In development mode, you can use these test credentials without seeding the database:

| Role | Email | Password | Name |
|------|-------|----------|------|
| SUPER_ADMIN | superadmin@Gemurai.rw | superadmin123 | Super Administrator |
| ADMIN | admin@Gemurai.rw | admin123 | Admin User |
| DCC | dcc@Gemurai.rw | dcc123 | John Mugisha |
| EMPLOYER | employer@Gemurai.rw | employer123 | Tech Company Ltd |
| CONSUMER | consumer@Gemurai.rw | consumer123 | Mary Uwimana |

### Production Mode
For production-like testing, seed the database with real users:

```bash
npm run seed-users
```

This will create actual database records with hashed passwords for all test roles.

## Login Methods

### 1. Quick Login (Development)
- Use the colored role tabs on the login page
- Automatically fills credentials and logs you in
- Available for all 5 roles

### 2. Manual Login
- Enter email and password manually
- Works with both test credentials and real database users

### 3. API Login
```javascript
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@Gemurai.rw",
  "password": "admin123"
}
```

Response:
```javascript
{
  "success": true,
  "message": "Login successful as ADMIN",
  "user": {
    "id": "test-admin",
    "email": "admin@Gemurai.rw",
    "name": "Admin User",
    "phone": "+250788123456",
    "role": "ADMIN",
    "permissions": ["dashboard.view", "users.view", ...]
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Route Protection

### Middleware Protection
The middleware (`middleware.ts`) protects routes based on user permissions:

- `/dashboard/*` - Requires authentication and appropriate permissions
- `/admin/*` - Requires admin-level permissions
- `/login` - Redirects to dashboard if already authenticated

### Permission-Based Access
Routes are protected using the permission system:

```typescript
// Example route permissions
"/dashboard": ["dashboard.view"],
"/dashboard/users": ["users.view"],
"/dashboard/my-application": [], // Special case - DCC only
"/admin": ["admin.users", "admin.system", "admin.reports", "admin.forms"]
```

### Role-Specific Routes
- **My Application** (`/dashboard/my-application`): DCC role only
- **Admin Panel** (`/admin/*`): ADMIN and SUPER_ADMIN roles
- **User Management**: ADMIN and SUPER_ADMIN roles
- **Application Review**: ADMIN and SUPER_ADMIN roles

## Authentication Flow

1. **Login Request**: User submits credentials
2. **Validation**: System validates against test credentials or database
3. **Permission Assignment**: Role-based permissions are assigned
4. **Token Generation**: JWT token is created with user data and permissions
5. **Storage**: Token stored in localStorage and HTTP-only cookie
6. **Route Access**: Middleware checks permissions for each route

## Security Features

### Token Management
- JWT tokens with 7-day expiration
- HTTP-only cookies for additional security
- Authorization header support

### Password Security
- bcrypt hashing for database passwords
- Salt rounds: 12

### Permission Validation
- Route-level permission checking
- API endpoint protection
- Role hierarchy enforcement

## Testing Different Roles

### Super Administrator Testing
```bash
# Quick login as Super Admin
1. Go to /login
2. Click "Super" tab
3. Click "Login as Super Admin"
4. Access all routes: /dashboard, /admin, /dashboard/users, etc.
```

### Administrator Testing
```bash
# Quick login as Admin
1. Go to /login
2. Click "Admin" tab  
3. Click "Login as Admin"
4. Test admin functions, user management
```

### DCC Testing
```bash
# Quick login as DCC
1. Go to /login
2. Click "DCC" tab
3. Click "Login as DCC"
4. Access /dashboard/my-application (DCC-only route)
5. Test product purchasing, course enrollment
```

### Employer Testing
```bash
# Quick login as Employer
1. Go to /login
2. Click "Employer" tab
3. Click "Login as Employer"
4. Test job posting and management features
```

### Consumer Testing
```bash
# Quick login as Consumer
1. Go to /login
2. Click "Consumer" tab
3. Click "Login as Consumer"
4. Test basic marketplace functionality
```

## Troubleshooting

### Common Issues

1. **Access Denied**: Check if user role has required permissions
2. **Token Expired**: Login again to refresh token
3. **Route Not Found**: Ensure user has access to the route
4. **Database Connection**: Check database connection for production users

### Development vs Production

- **Development**: Uses in-memory test credentials
- **Production**: Requires database seeding with `npm run seed-users`

### Environment Variables

Ensure these are set:
```bash
JWT_SECRET=your-secure-jwt-secret-key
DATABASE_URL=your-database-connection-string
NODE_ENV=development|production
```

## API Documentation

### Authentication Endpoints

#### POST /api/v1/auth/login
Login with email and password

#### Headers for Protected Routes
```javascript
Authorization: Bearer <jwt-token>
```

### User Context
Authenticated user data is available via:
```javascript
import { useAuth } from '@/hooks/use-auth'

const { user, isAuthenticated, login, logout } = useAuth()
```

## Next Steps

1. **Custom Permissions**: Add specific permissions for new features
2. **Role Management UI**: Build interface to manage roles and permissions
3. **User Registration**: Implement role-based user registration
4. **Audit Logging**: Track authentication and authorization events

---

*Last updated: December 2024* 