# Gemurai Platform Setup Guide - Twilio Integration

This guide will help you set up the Gemurai platform with Twilio for both SMS and email services.

## 🚀 Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- Twilio account with SMS and SendGrid services

## 📱 Twilio Setup

### 1. Create Twilio Account
1. Go to [Twilio Console](https://console.twilio.com/)
2. Sign up for a new account or log in
3. Complete account verification

### 2. Get Twilio Credentials
1. **Account SID**: Found on your Twilio Console Dashboard
2. **Auth Token**: Found on your Twilio Console Dashboard (click to reveal)
3. **Phone Number**: Purchase a Twilio phone number for SMS

### 3. Set Up Twilio SendGrid
1. Go to [SendGrid](https://sendgrid.com/) (owned by Twilio)
2. Create a SendGrid account or integrate with existing Twilio account
3. Create an API key with "Full Access" permissions
4. Verify your sender email domain

## 🗄️ Database Setup

### Local Development
\`\`\`bash
# Install PostgreSQL locally or use Docker
docker run --name Gemurai-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=Gemurai_platform -p 5432:5432 -d postgres:15

# Or install PostgreSQL directly on your system
\`\`\`

### Production Database Options
- **Neon**: Serverless PostgreSQL (Recommended)
- **Supabase**: PostgreSQL with additional features
- **Railway**: Simple PostgreSQL hosting
- **AWS RDS**: Enterprise-grade PostgreSQL

## ⚙️ Environment Configuration

### 1. Copy Environment Files
\`\`\`bash
# Copy the environment template
cp .env.local .env

# For production
cp .env.production .env.production
\`\`\`

### 2. Configure Environment Variables

#### Required Twilio Variables:
\`\`\`env
# Twilio Configuration
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your_auth_token_here"
TWILIO_PHONE_NUMBER="+1234567890"

# Twilio SendGrid Email
TWILIO_SENDGRID_API_KEY="SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_FROM_EMAIL="noreply@yourdomain.com"
TWILIO_FROM_NAME="Gemurai Platform"
\`\`\`

#### Database Configuration:
\`\`\`env
# Local Database
DATABASE_URL="postgresql://username:password@localhost:5432/Gemurai_platform"

# Production Database (example with Neon)
DATABASE_URL="postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/Gemurai_platform?sslmode=require"
\`\`\`

## 🔧 Installation Steps

### 1. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 2. Set Up Database
\`\`\`bash
# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Seed initial data
npm run db:seed
\`\`\`

### 3. Start Development Server
\`\`\`bash
npm run dev
\`\`\`

## 📧 Email Configuration

### 1. Domain Authentication (Production)
1. Go to SendGrid → Settings → Sender Authentication
2. Authenticate your domain (e.g., Gemurai.rw)
3. Add DNS records as instructed
4. Verify domain authentication

### 2. Email Templates
The platform includes pre-built email templates for:
- Application submission confirmation
- Evaluation feedback
- DCC welcome messages
- Password reset notifications

## 📱 SMS Configuration

### 1. Phone Number Setup
1. In Twilio Console, go to Phone Numbers → Manage → Buy a number
2. Choose a number that supports SMS
3. Configure webhook URLs if needed

### 2. SMS Features
- OTP verification for phone numbers
- Application status notifications
- DCC welcome messages
- Evaluation feedback alerts
- Reminder notifications

## 🧪 Testing

### 1. Test Email Sending
\`\`\`bash
# Use the built-in test endpoints
curl -X POST http://localhost:3000/api/test/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'
\`\`\`

### 2. Test SMS Sending
\`\`\`bash
# Use the built-in test endpoints
curl -X POST http://localhost:3000/api/test/sms \
  -H "Content-Type: application/json" \
  -d '{"phone":"+250788123456","name":"Test User"}'
\`\`\`

## 🚀 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production
\`\`\`env
TWILIO_ACCOUNT_SID=your_production_account_sid
TWILIO_AUTH_TOKEN=your_production_auth_token
TWILIO_PHONE_NUMBER=your_production_phone_number
TWILIO_SENDGRID_API_KEY=your_production_sendgrid_key
DATABASE_URL=your_production_database_url
NEXTAUTH_URL=https://yourdomain.com
\`\`\`

## 📊 Monitoring

### 1. Twilio Console
- Monitor SMS delivery rates
- Track email open/click rates
- View error logs and debugging info

### 2. Database Logs
- Email delivery logs in `EmailLog` table
- SMS delivery logs in `SMSLog` table
- OTP verification logs in `OTPVerification` table

## 🔒 Security Best Practices

1. **Environment Variables**: Never commit API keys to version control
2. **Rate Limiting**: Implement rate limiting for SMS/email endpoints
3. **Input Validation**: Validate all phone numbers and email addresses
4. **Error Handling**: Don't expose sensitive error details to users
5. **Webhook Security**: Verify Twilio webhook signatures

## 🆘 Troubleshooting

### Common Issues:

1. **SMS Not Sending**
   - Check phone number format (+250xxxxxxxxx)
   - Verify Twilio account balance
   - Check SMS logs in database

2. **Email Not Sending**
   - Verify SendGrid API key permissions
   - Check domain authentication status
   - Review email logs for errors

3. **Database Connection Issues**
   - Verify DATABASE_URL format
   - Check database server status
   - Ensure SSL mode for production

### Support Resources:
- [Twilio Documentation](https://www.twilio.com/docs)
- [SendGrid Documentation](https://docs.sendgrid.com/)
- [Prisma Documentation](https://www.prisma.io/docs)

## 📞 Support

For technical support:
- Email: support@Gemurai.rw
- Phone: +250 788 123 456
- Documentation: [Internal Wiki]

---

**Note**: This setup guide assumes you have basic knowledge of Node.js, PostgreSQL, and environment configuration. For additional help, consult the official documentation links provided above.
\`\`\`

Finally, let's create API test endpoints for Twilio services:
