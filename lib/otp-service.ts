// Mock OTP service - in real app this would integrate with SMS provider
const otpStorage: Record<string, { code: string; expiresAt: number; attempts: number }> = {}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function sendOTP(phone: string): { success: boolean; message: string } {
  try {
    const code = generateOTP()
    const expiresAt = Date.now() + 5 * 60 * 1000 // 5 minutes

    otpStorage[phone] = {
      code,
      expiresAt,
      attempts: 0,
    }

    // In real app, send SMS here
    console.log(`OTP for ${phone}: ${code}`) // For demo purposes

    return {
      success: true,
      message: `OTP sent to ${phone}. Code: ${code} (Demo mode)`,
    }
  } catch (error) {
    return {
      success: false,
      message: "Failed to send OTP. Please try again.",
    }
  }
}

export function verifyOTP(phone: string, code: string): { success: boolean; message: string } {
  const otpData = otpStorage[phone]

  if (!otpData) {
    return {
      success: false,
      message: "No OTP found for this phone number. Please request a new one.",
    }
  }

  if (Date.now() > otpData.expiresAt) {
    delete otpStorage[phone]
    return {
      success: false,
      message: "OTP has expired. Please request a new one.",
    }
  }

  if (otpData.attempts >= 3) {
    delete otpStorage[phone]
    return {
      success: false,
      message: "Too many failed attempts. Please request a new OTP.",
    }
  }

  if (otpData.code !== code) {
    otpData.attempts++
    return {
      success: false,
      message: `Invalid OTP. ${3 - otpData.attempts} attempts remaining.`,
    }
  }

  // Success
  delete otpStorage[phone]
  return {
    success: true,
    message: "OTP verified successfully!",
  }
}
