# 🔧 Environment Variables Template

Copy this to your `.env` file:

```env
# SMS Service Configuration
# Choose one of the following SMS services:

# TextLocal (Recommended - 100 SMS/day free)
TEXTLOCAL_API_KEY=your_textlocal_api_key_here
TEXTLOCAL_SENDER=TXTLCL

# Twilio (1000 SMS/month trial)
# TWILIO_ACCOUNT_SID=your_twilio_account_sid
# TWILIO_AUTH_TOKEN=your_twilio_auth_token
# TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Vonage (Nexmo) - $2 free credit
# VONAGE_API_KEY=your_vonage_api_key
# VONAGE_API_SECRET=your_vonage_api_secret

# MSG91 - 100 SMS/day
# MSG91_API_KEY=your_msg91_api_key
# MSG91_SENDER=your_sender_id

# 2Factor.in - 100 SMS/day
# TWOFACTOR_API_KEY=your_2factor_api_key

# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# JWT Configuration
JWT_SECRET=your_jwt_secret_here

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Other Configuration
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
```

## 🚀 **Quick Setup Steps:**

1. **Copy the template** above to your `.env` file
2. **Choose an SMS service** (TextLocal recommended)
3. **Get your API key** from the SMS service
4. **Replace the placeholder** with your actual API key
5. **Restart your server** to load the new environment variables

## 🎯 **For Immediate Testing:**

If you don't want to set up SMS services yet, **leave the API keys empty** and the system will work in **demo mode** with OTP: `1234`.
