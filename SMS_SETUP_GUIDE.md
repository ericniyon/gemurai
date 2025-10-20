# 📱 Free SMS API Setup Guide

## 🆓 **Free SMS Service Options**

### **1. RapidAPI SMS (Currently Implemented - Working!)**
- **Status**: ✅ **ACTIVE AND WORKING**
- **Free Tier**: Varies by API provider
- **Global Coverage**: Yes
- **Setup Time**: 2 minutes

#### **Current Setup:**
- **API Key**: `a4613d2c9bmsh8caa37307a437b5p1ebeb0jsnd302ff272107`
- **Host**: `sms-verify3.p.rapidapi.com`
- **Status**: ✅ **SMS sending working**
- **Verification**: Local OTP validation (since API doesn't support verification)

#### **Test Results:**
```bash
# SMS Sending: ✅ SUCCESS
curl -X POST http://localhost:3000/api/sms/password-reset \
  -H "Content-Type: application/json" \
  -d '{"phone": "0787283351"}'

# Response: {"success":true,"message":"Password reset SMS sent successfully","otp":"635548"}

# OTP Verification: ✅ SUCCESS  
curl -X POST http://localhost:3000/api/sms/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "0787283351", "otp": "635548"}'

# Response: {"success":true,"message":"OTP verified successfully","isValid":true}
```

### **2. TextLocal (Alternative - 100 SMS/day free)**
- **Website**: https://www.textlocal.in/
- **Free Tier**: 100 SMS/day
- **Global Coverage**: Yes
- **Setup Time**: 5 minutes

#### **Setup Steps:**
1. **Sign up** at https://www.textlocal.in/
2. **Verify your email** and phone number
3. **Get API Key** from your dashboard
4. **Add to .env file**:
   ```env
   TEXTLOCAL_API_KEY=your_api_key_here
   TEXTLOCAL_SENDER=TXTLCL
   ```

### **2. Twilio (1000 SMS/month trial)**
- **Website**: https://www.twilio.com/
- **Free Tier**: 1,000 SMS/month (trial)
- **Global Coverage**: Excellent
- **Setup Time**: 10 minutes

#### **Setup Steps:**
1. **Sign up** at https://www.twilio.com/
2. **Verify your phone** and add credit card
3. **Get Account SID and Auth Token**
4. **Add to .env file**:
   ```env
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_number
   ```

### **3. Vonage (Nexmo) - $2 free credit**
- **Website**: https://www.vonage.com/
- **Free Tier**: $2 credit on signup
- **Global Coverage**: Excellent
- **Setup Time**: 8 minutes

### **4. MSG91 - 100 SMS/day**
- **Website**: https://msg91.com/
- **Free Tier**: 100 SMS/day
- **Global Coverage**: Good
- **Setup Time**: 7 minutes

### **5. 2Factor.in - 100 SMS/day**
- **Website**: https://2factor.in/
- **Free Tier**: 100 SMS/day
- **Global Coverage**: Good
- **Setup Time**: 5 minutes

## 🚀 **Current Status: RapidAPI SMS Working!**

### **✅ What's Working:**
- **SMS Sending**: ✅ RapidAPI successfully sends SMS
- **OTP Generation**: ✅ 4-digit OTPs generated automatically
- **OTP Verification**: ✅ Local verification system working
- **Frontend Integration**: ✅ Complete forgot password flow

### **📱 Test the Complete Flow:**

1. **Visit**: `http://localhost:3000/en/forgot-password`
2. **Enter phone**: `0787283351`
3. **Click**: "Send Reset Code"
4. **Check response**: You'll get a real OTP (e.g., `635548`)
5. **Click**: "Enter OTP Code"
6. **Enter OTP**: Use the OTP from step 4
7. **Click**: "Verify OTP"
8. **Success**: Redirects to password reset page

### **🔧 Alternative Setup with TextLocal:**

If you want to switch to TextLocal:

#### **Step 1: Sign Up**
1. Go to https://www.textlocal.in/
2. Click "Sign Up"
3. Fill in your details
4. Verify your email and phone

#### **Step 2: Get API Key**
1. Login to your dashboard
2. Go to "API" section
3. Copy your API key

#### **Step 3: Configure Environment**
Add to your `.env` file:
```env
TEXTLOCAL_API_KEY=your_api_key_here
TEXTLOCAL_SENDER=TXTLCL
```

#### **Step 4: Test**
```bash
curl -X POST http://localhost:3000/api/sms/password-reset \
  -H "Content-Type: application/json" \
  -d '{"phone": "0787283351"}'
```

## 🔧 **Alternative: Demo Mode**

If you don't want to set up SMS services right now, the system works in **demo mode**:

1. **No API key needed**
2. **Shows demo OTP**: `1234`
3. **Perfect for testing**
4. **Works immediately**

## 📊 **Cost Comparison**

| Service | Free Tier | Cost per SMS | Global Coverage |
|---------|-----------|--------------|-----------------|
| TextLocal | 100/day | $0.02 | Good |
| Twilio | 1000/month | $0.0079 | Excellent |
| Vonage | $2 credit | $0.06 | Excellent |
| MSG91 | 100/day | $0.02 | Good |
| 2Factor | 100/day | $0.02 | Good |

## 🎯 **Recommendation**

**For Development/Testing**: Use **TextLocal** (100 SMS/day free)
**For Production**: Use **Twilio** (most reliable, good pricing)

## 🔒 **Security Notes**

1. **Never commit API keys** to version control
2. **Use environment variables** for all API keys
3. **Rate limit** SMS sending to prevent abuse
4. **Validate phone numbers** before sending
5. **Log SMS activities** for monitoring

## 🚨 **Troubleshooting**

### **Common Issues:**

1. **"Invalid API Key"**
   - Check your API key in .env file
   - Ensure no extra spaces

2. **"Number not supported"**
   - TextLocal works best with international format
   - Try: +250787283351

3. **"Daily limit exceeded"**
   - Switch to test mode: `test: '1'`
   - Or upgrade your plan

4. **"Network error"**
   - Check your internet connection
   - Verify the API endpoint is accessible

### **Test Mode**
Set `test: '1'` in the SMS service to avoid charges during development.
