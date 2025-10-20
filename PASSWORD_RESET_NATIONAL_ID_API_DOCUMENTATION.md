# Password Reset with National ID Verification API Documentation

## Overview

This API provides a secure password reset functionality that requires national ID verification for enhanced security. The system uses a three-step process to ensure the user's identity is properly verified before allowing password reset.

## Security Features

- **National ID Verification**: Users must provide their national ID to initiate password reset
- **Multi-factor Authentication**: Supports both SMS and email verification
- **Time-limited Tokens**: Reset tokens expire after 15 minutes
- **One-time Use**: Reset tokens can only be used once
- **Secure Token Generation**: Uses cryptographically secure random tokens

## API Endpoints

### 1. Request Password Reset

**Endpoint**: `POST /api/v1/auth/password-reset-request`

**Description**: Initiates a password reset request with national ID verification.

**Request Body**:
```json
{
  "nationalId": "string (required)",
  "email": "string (optional)",
  "phone": "string (optional)"
}
```

**Requirements**:
- `nationalId` is required
- At least one of `email` or `phone` must be provided
- The national ID must match a user in the system
- The email/phone must match the user's registered contact information

**Response**:
```json
{
  "success": true,
  "message": "Password reset instructions have been sent to your registered contact methods",
  "resetToken": "string",
  "expiresAt": "2024-01-01T12:00:00.000Z",
  "contactMethods": {
    "email": true,
    "phone": true
  }
}
```

**Error Responses**:
- `400`: Missing required fields or invalid input
- `404`: No account found with provided national ID and contact information
- `403`: Account is inactive
- `500`: Server error

### 2. Verify Reset Request

**Endpoint**: `POST /api/v1/auth/password-reset-verify`

**Description**: Verifies the national ID and reset token, optionally with SMS verification code.

**Request Body**:
```json
{
  "email": "string (required)",
  "resetToken": "string (required)",
  "nationalId": "string (required)",
  "verificationCode": "string (optional)"
}
```

**Requirements**:
- All fields except `verificationCode` are required
- `verificationCode` is required if SMS verification was sent
- The national ID must match the one used in the reset request
- The reset token must be valid and not expired

**Response**:
```json
{
  "success": true,
  "message": "National ID and reset token verified successfully",
  "verificationToken": "string",
  "user": {
    "name": "string",
    "email": "string"
  },
  "nextStep": "set_new_password"
}
```

**Error Responses**:
- `400`: Invalid or expired reset token, national ID mismatch, or invalid verification code
- `404`: User not found or national ID mismatch
- `500`: Server error

### 3. Complete Password Reset

**Endpoint**: `POST /api/v1/auth/password-reset-complete`

**Description**: Sets the new password after successful verification.

**Request Body**:
```json
{
  "verificationToken": "string (required)",
  "newPassword": "string (required)",
  "confirmPassword": "string (required)"
}
```

**Password Requirements**:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

**Response**:
```json
{
  "success": true,
  "message": "Password has been reset successfully",
  "user": {
    "name": "string",
    "email": "string"
  },
  "resetAt": "2024-01-01T12:00:00.000Z"
}
```

**Error Responses**:
- `400`: Invalid verification token, password mismatch, or weak password
- `404`: User not found or national ID mismatch
- `500`: Server error

## Database Schema

### Password Reset Table
```sql
CREATE TABLE password_resets (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  token TEXT NOT NULL,
  expiresAt TIMESTAMP NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  metadata TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### OTP Table (for SMS verification)
```sql
CREATE TABLE o_t_p (
  id SERIAL PRIMARY KEY,
  phone TEXT NOT NULL,
  otp TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'PASSWORD_RESET',
  expiresAt TIMESTAMP NOT NULL,
  isUsed BOOLEAN NOT NULL DEFAULT false,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Security Considerations

### Token Security
- Reset tokens are generated using `crypto.randomBytes(32).toString('hex')`
- Tokens expire after 15 minutes
- Tokens are marked as used after successful password reset
- Old tokens are automatically cleaned up

### National ID Verification
- National ID is required for all password reset operations
- National ID must match the user's registered national ID
- National ID is stored in the reset request metadata for verification

### Rate Limiting
- Consider implementing rate limiting to prevent abuse
- SMS verification codes should have rate limits
- Failed attempts should be tracked and limited

### Data Privacy
- National ID is only used for verification and not stored in logs
- Reset tokens are not logged in plain text
- User data is only returned when necessary

## Frontend Integration

### Step 1: Request Reset
```typescript
const response = await fetch('/api/v1/auth/password-reset-request', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nationalId: '1234567890123',
    email: 'user@example.com',
    phone: '+250788123456'
  })
})
```

### Step 2: Verify Reset
```typescript
const response = await fetch('/api/v1/auth/password-reset-verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    resetToken: 'abc123...',
    nationalId: '1234567890123',
    verificationCode: '123456'
  })
})
```

### Step 3: Complete Reset
```typescript
const response = await fetch('/api/v1/auth/password-reset-complete', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    verificationToken: 'base64encoded...',
    newPassword: 'NewSecurePassword123!',
    confirmPassword: 'NewSecurePassword123!'
  })
})
```

## Error Handling

### Common Error Scenarios

1. **Invalid National ID**: User provides incorrect national ID
2. **Expired Token**: Reset token has expired (15 minutes)
3. **Used Token**: Reset token has already been used
4. **Invalid Verification Code**: SMS code is incorrect or expired
5. **Weak Password**: New password doesn't meet security requirements
6. **Account Inactive**: User account is disabled

### Error Response Format
```json
{
  "success": false,
  "message": "Human-readable error message"
}
```

## Testing

### Test Cases

1. **Valid Reset Flow**:
   - Request reset with valid national ID and contact info
   - Verify with correct national ID and token
   - Complete with strong password

2. **Invalid National ID**:
   - Request reset with non-existent national ID
   - Should return 404 error

3. **Expired Token**:
   - Wait 15+ minutes after token generation
   - Attempt to verify with expired token
   - Should return 400 error

4. **Used Token**:
   - Complete password reset successfully
   - Attempt to use same token again
   - Should return 400 error

5. **Invalid Verification Code**:
   - Request reset with phone number
   - Enter incorrect SMS verification code
   - Should return 400 error

## Monitoring and Logging

### Security Events to Log
- Password reset requests
- Successful verifications
- Failed verification attempts
- Password reset completions
- Suspicious activity (multiple failed attempts)

### Metrics to Track
- Password reset request volume
- Success/failure rates
- Average time to complete reset
- Geographic distribution of requests

## Maintenance

### Cleanup Tasks
- Remove expired reset tokens (older than 24 hours)
- Remove used OTP codes
- Archive old password reset logs

### Regular Security Reviews
- Review failed attempt patterns
- Monitor for abuse or attacks
- Update security measures as needed

## Support

For technical support or security concerns:
- Email: support@Gemurai.rw
- Phone: +250 788 123 456
- Security issues: security@Gemurai.rw
