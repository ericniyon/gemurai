import { formatRwandaPhoneNumber } from '@/lib/utils/phone-utils';

// SMS Service Configuration
// RapidAPI (Demo/Test Service - may not send real SMS)
const RAPIDAPI_KEY = 'a4613d2c9bmsh8caa37307a437b5p1ebeb0jsnd302ff272107';
const RAPIDAPI_HOST = 'sms-verify3.p.rapidapi.com';

// Twilio Configuration (Real SMS Service)
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

export interface SMSResult {
  success: boolean;
  message: string;
  messageId?: string;
  data?: any;
  otp?: string;
}

export interface SMSVerificationResult {
  success: boolean;
  message: string;
  isValid: boolean;
  data?: any;
}

// Send SMS using multiple services (Twilio preferred, RapidAPI fallback)
export async function sendSMS(to: string, message?: string): Promise<SMSResult> {
  try {
    const formattedPhone = formatRwandaPhoneNumber(to);
    if (!formattedPhone) {
      return {
        success: false,
        message: 'Invalid phone number format'
      };
    }

    // Generate OTP if no message provided
    const otp = message || generateOTP();
    const smsMessage = message || `Your Gemurai verification code is: ${otp}. Valid for 10 minutes.`;

    // Try Twilio first (real SMS service)
    if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
      console.log(`📱 Attempting to send SMS via Twilio to: ${formattedPhone}`);
      
      try {
        const twilio = (await import('twilio')).default;
        const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
        
        const twilioResponse = await client.messages.create({
          body: smsMessage,
          to: formattedPhone,
          from: "Gemurai", // Use Gemurai as sender instead of phone number
        });

        console.log('✅ Twilio SMS sent successfully:', twilioResponse.sid);
        return {
          success: true,
          message: 'SMS sent successfully via Twilio',
          messageId: twilioResponse.sid,
          data: {
            status: twilioResponse.status,
            direction: twilioResponse.direction,
            from: twilioResponse.from,
            to: twilioResponse.to,
            service: 'twilio'
          },
          otp: otp
        };
      } catch (twilioError: any) {
        console.error('❌ Twilio SMS error:', twilioError);
        console.log(`📱 Twilio failed, falling back to RapidAPI for: ${formattedPhone}`);
        // Continue to RapidAPI fallback below
      }
    } else {
      // No Twilio credentials, fall back to RapidAPI
      console.log(`📱 No Twilio credentials, falling back to RapidAPI for: ${formattedPhone}`);
    }

    // RapidAPI fallback - only execute if Twilio failed or not configured
    console.log(`📱 Executing RapidAPI fallback for: ${formattedPhone}`);
    
    const options = {
      method: 'POST',
      url: 'https://sms-verify3.p.rapidapi.com/send-numeric-verify',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST,
        'Content-Type': 'application/json'
      },
      data: {
        target: formattedPhone,
        estimate: true
      }
    };

    try {
      const axios = (await import('axios')).default;
      const response = await axios.request(options);
      
      console.log('📊 RapidAPI SMS response:', response.data);

      if (response.status === 200 && response.data.status === 'success') {
        return {
          success: true,
          message: 'SMS sent successfully (demo service - may not deliver)',
          messageId: response.data.request_id || response.data.id,
          data: { ...response.data, service: 'rapidapi_demo' },
          otp: otp
        };
      } else {
        console.error('❌ RapidAPI SMS error:', response.data);
        return {
          success: false,
          message: response.data.message || 'Failed to send SMS via RapidAPI',
          data: response.data
        };
      }
    } catch (apiError: any) {
      console.error('❌ RapidAPI request error:', apiError);
      return {
        success: false,
        message: apiError.response?.data?.message || apiError.message || 'Failed to send SMS via RapidAPI',
        data: apiError.response?.data
      };
    }
  } catch (error) {
    console.error('❌ SMS service error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'SMS service error'
    };
  }
}

// Generate a 4-digit OTP
function generateOTP(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Verify SMS using database OTP system
export async function verifySMS(phone: string, otp: string): Promise<SMSVerificationResult> {
  try {
    const formattedPhone = formatRwandaPhoneNumber(phone);
    if (!formattedPhone) {
      return {
        success: false,
        message: 'Invalid phone number format',
        isValid: false
      };
    }

    console.log(`🔍 Verifying OTP for: ${formattedPhone}, OTP: ${otp}`);

    // Import OTP service for database verification
    const { verifyOTP } = await import('./otp-service');
    
    // Verify OTP against database
    const verificationResult = await verifyOTP(formattedPhone, otp, 'PASSWORD_RESET');
    
    if (verificationResult.success && verificationResult.isValid) {
      console.log('✅ OTP verified successfully against database');
      return {
        success: true,
        message: 'OTP verified successfully',
        isValid: true,
        data: { 
          verified: true, 
          phone: formattedPhone, 
          method: 'database',
          otpData: verificationResult.otpData 
        }
      };
    } else {
      console.log('❌ OTP verification failed against database');
      return {
        success: true,
        message: verificationResult.message || 'Invalid or expired OTP',
        isValid: false,
        data: { 
          verified: false, 
          phone: formattedPhone, 
          method: 'database',
          error: verificationResult.message 
        }
      };
    }
  } catch (error) {
    console.error('❌ SMS verification service error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'SMS verification service error',
      isValid: false
    };
  }
}

// Template for application submission SMS
export function getApplicationSubmissionTemplate(name: string): string {
  return `Your application was received. We'll update you soon. -Gemurai`;
}

// Send application submission notification
export async function sendApplicationSubmissionSMS(phone: string, name: string): Promise<SMSResult> {
  const message = getApplicationSubmissionTemplate(name);
  return sendSMS(phone, message);
}

// Send application status notification
export async function sendApplicationStatusSMS(
  phone: string,
  name: string,
  status: string
): Promise<SMSResult> {
  let message = "";

  switch (status) {
    case "approved":
      message = `🎉 Congratulations ${name}! Your Gemurai DCC application has been APPROVED. You are now a Level C Digital Community Champion. Welcome to the team! Login at ${process.env.NEXTAUTH_URL}`;
      break;
    case "rejected":
      message = `Dear ${name}, thank you for your interest in Gemurai. Unfortunately, your DCC application was not successful this time. We encourage you to reapply in the future. Contact us at support@djyh.rw for feedback.`;
      break;
    case "under_review":
      message = `Dear ${name}, your Gemurai DCC application is now under review. Our team will evaluate your submission and contact you within 3-5 business days. Thank you for your patience.`;
      break;
    case "pending_documents":
      message = `Dear ${name}, your Gemurai DCC application requires additional documents. Please login to your account and upload the required documents to proceed.`;
      break;
    default:
      message = `Dear ${name}, your Gemurai DCC application status has been updated to: ${status}. For more details, please login to your account or contact support@djyh.rw`;
  }

  return sendSMS(phone, message);
}

// Send evaluation feedback notification
export async function sendEvaluationFeedbackSMS(
  phone: string,
  name: string,
  score: number
): Promise<SMSResult> {
  const scoreEmoji = score >= 80 ? "🎉" : score >= 60 ? "👍" : "📝";
  const message = `${scoreEmoji} Dear ${name}, your Gemurai application evaluation is complete. Score: ${score}%. Check your email for detailed feedback. Questions? Contact support@djyh.rw`;

  return sendSMS(phone, message);
}

// Send reminder SMS
export async function sendReminderSMS(
  phone: string,
  name: string,
  type: string
): Promise<SMSResult> {
  let message = "";

  switch (type) {
    case "complete_application":
      message = `Hi ${name}, you have an incomplete Gemurai DCC application. Complete it at ${process.env.NEXTAUTH_URL}/application to join our community champions!`;
      break;
    case "set_password":
      message = `Hi ${name}, please set your Gemurai account password to access your dashboard. Visit ${process.env.NEXTAUTH_URL}/set-password`;
      break;
    case "training_due":
      message = `Hi ${name}, you have pending training modules in your Gemurai DCC dashboard. Complete them to advance your level!`;
      break;
    default:
      message = `Hi ${name}, you have pending actions in your Gemurai account. Please login to ${process.env.NEXTAUTH_URL} to continue.`;
  }

  return sendSMS(phone, message);
} 