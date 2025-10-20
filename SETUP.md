# Gemurai Platform Database Setup Guide

This guide will help you set up the Gemurai platform with PostgreSQL, SendGrid, and Pindo integration.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ installed and running
- SendGrid account and API key
- Pindo account and API key

## Local Development Setup

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Database Setup

#### Option A: Local PostgreSQL
1. Install PostgreSQL on your machine
2. Create a database:
\`\`\`sql
CREATE DATABASE Gemurai_platform;
CREATE USER Gemurai_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE Gemurai_platform TO Gemurai_user;
\`\`\`

#### Option B: Docker PostgreSQL
\`\`\`bash
docker run --name Gemurai-postgres \
  -e POSTGRES_DB=Gemurai_platform \
  -e POSTGRES_USER=Gemurai_user \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  -d postgres:14
\`\`\`

### 3. Environment Configuration

1. Copy `.env.local` to your project root
2. Update the following variables:

\`\`\`env
# Database
DATABASE_URL="postgresql://Gemurai_user:your_password@localhost:5432/Gemurai_platform"

# SendGrid (get from https://app.sendgrid.com/settings/api_keys)
SENDGRID_API_KEY="your_sendgrid_api_key"
SENDGRID_FROM_EMAIL="noreply@yourdomain.com"

# Pindo (get from https://pindo.io/dashboard)
PINDO_API_KEY="your_pindo_api_key"
PINDO_SENDER_ID="YOUR_SENDER_ID"

# Generate secure secrets
NEXTAUTH_SECRET="your_secure_random_string"
JWT_SECRET="your_jwt_secret"
ENCRYPTION_KEY="your_encryption_key"
\`\`\`

### 4. Database Migration

\`\`\`bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Run initial migration
npm run db:migrate

# Seed database with initial data
npm run db:seed
\`\`\`

### 5. Start Development Server

\`\`\`bash
npm run dev
\`\`\`

## Production Setup

### 1. Database Setup

Use a managed PostgreSQL service like:
- **Neon** (recommended): https://neon.tech
- **Supabase**: https://supabase.com
- **AWS RDS**: https://aws.amazon.com/rds/
- **Google Cloud SQL**: https://cloud.google.com/sql

### 2. Environment Variables

Set these in your production environment:

\`\`\`env
DATABASE_URL="your_production_database_url"
SENDGRID_API_KEY="your_production_sendgrid_key"
PINDO_API_KEY="your_production_pindo_key"
NEXTAUTH_URL="https://yourdomain.com"
NODE_ENV="production"
\`\`\`

### 3. Deploy

#### Vercel (Recommended)
1. Connect your GitHub repository
2. Add environment variables in Vercel dashboard
3. Deploy automatically

#### Other Platforms
- **Netlify**: Add build command `npm run build`
- **Railway**: Connect repository and add environment variables
- **DigitalOcean App Platform**: Use App Spec with environment variables

## API Keys Setup

### SendGrid Setup
1. Go to https://app.sendgrid.com
2. Create account or login
3. Go to Settings > API Keys
4. Create new API key with "Full Access"
5. Copy the key to your environment variables

### Pindo Setup
1. Go to https://pindo.io
2. Create account or login
3. Go to Dashboard > API Keys
4. Create new API key
5. Set up sender ID for SMS
6. Copy credentials to environment variables

## Database Schema

The platform uses the following main tables:
- `users` - User accounts and permissions
- `applications` - DCC applications
- `application_evaluations` - Application reviews
- `dcc_profiles` - DCC member profiles
- `email_logs` - Email delivery tracking
- `sms_logs` - SMS delivery tracking

## Testing

### Test Accounts
- **Admin**: admin@Gemurai.rw / Login@123
- **Employer**: employer@Gemurai.rw / password123
- **DCC**: dcc@Gemurai.rw / password123

### Test Email/SMS
In development mode:
- Emails are logged to console
- SMS codes are returned in API response
- All communications are tracked in logs tables

## Troubleshooting

### Database Connection Issues
\`\`\`bash
# Test database connection
npm run db:studio
\`\`\`

### Migration Issues
\`\`\`bash
# Reset database (WARNING: This deletes all data)
npx prisma migrate reset

# Apply migrations
npx prisma migrate deploy
\`\`\`

### Email/SMS Issues
- Check API keys are correct
- Verify sender domains/IDs are configured
- Check logs tables for error messages

## Monitoring

### Database Monitoring
- Use Prisma Studio: `npm run db:studio`
- Check logs tables for email/SMS delivery status
- Monitor application and user creation

### Application Monitoring
- Check browser console for errors
- Monitor API responses
- Use database logs for debugging

## Security Notes

- Never commit `.env` files to version control
- Use strong, unique secrets for production
- Regularly rotate API keys
- Monitor email/SMS usage to prevent abuse
- Use HTTPS in production
- Implement rate limiting for APIs

## Support

For issues with:
- **Database**: Check PostgreSQL logs and connection strings
- **Email**: Verify SendGrid configuration and domain authentication
- **SMS**: Check Pindo account balance and sender ID approval
- **Application**: Check browser console and server logs
