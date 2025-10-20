import { PrismaClient } from '@prisma/client'

// Initialize Prisma client with proper error handling for Next.js
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export interface OTPData {
  id: string
  phone: string
  otp: string
  type: 'PASSWORD_RESET' | 'VERIFICATION'
  expiresAt: Date
  isUsed: boolean
  createdAt: Date
}

export interface OTPResult {
  success: boolean
  message: string
  otp?: string
  expiresAt?: Date
}

export interface OTPVerificationResult {
  success: boolean
  message: string
  isValid: boolean
  otpData?: OTPData
}

// Generate a 4-digit OTP
export function generateOTP(): string {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

// Store OTP in database
export async function storeOTP(phone: string, otp: string, type: 'PASSWORD_RESET' | 'VERIFICATION' = 'PASSWORD_RESET'): Promise<OTPResult> {
  try {
    console.log(`🔧 Attempting to store OTP for ${phone}: ${otp}`)
    console.log(`🔧 Prisma client available:`, !!prisma)
    console.log(`🔧 OTP model available:`, !!prisma.oTP)
    
    // Set expiration time (10 minutes from now)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    // Create OTP record
    let otpRecord;
    try {
      otpRecord = await prisma.oTP.create({
        data: {
          phone,
          otp,
          type,
          expiresAt,
          isUsed: false,
        },
      });
    } catch (dbError) {
      console.error('❌ Database error creating OTP:', dbError);
      throw new Error(`Database error: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`);
    }

    console.log(`✅ OTP stored for ${phone}: ${otp} (expires: ${expiresAt})`)

    return {
      success: true,
      message: 'OTP stored successfully',
      otp,
      expiresAt,
    }
  } catch (error) {
    console.error('❌ Error storing OTP:', error)
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      prismaAvailable: !!prisma,
      otpModelAvailable: !!prisma.oTP
    })
    return {
      success: false,
      message: `Failed to store OTP: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

// Verify OTP
export async function verifyOTP(phone: string, otp: string, type: 'PASSWORD_RESET' | 'VERIFICATION' = 'PASSWORD_RESET'): Promise<OTPVerificationResult> {
  try {
    console.log(`🔧 Attempting to verify OTP for ${phone}: ${otp}`)
    console.log(`🔧 Prisma client available:`, !!prisma)
    console.log(`🔧 OTP model available:`, !!prisma.oTP)
    
    // Find the OTP record
    let otpRecord;
    try {
      otpRecord = await prisma.oTP.findFirst({
        where: {
          phone,
          otp,
          type,
          isUsed: false,
          expiresAt: {
            gt: new Date(), // Not expired
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (dbError) {
      console.error('❌ Database error finding OTP:', dbError);
      throw new Error(`Database error: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`);
    }

    if (!otpRecord) {
      console.log(`❌ No valid OTP found for ${phone}: ${otp}`)
      return {
        success: true,
        message: 'Invalid or expired OTP',
        isValid: false,
      }
    }

    // Mark OTP as used
    try {
      await prisma.oTP.update({
        where: { id: otpRecord.id },
        data: { isUsed: true },
      });
    } catch (dbError) {
      console.error('❌ Database error updating OTP:', dbError);
      throw new Error(`Database error: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`);
    }

    console.log(`✅ OTP verified for ${phone}: ${otp}`)

    return {
      success: true,
      message: 'OTP verified successfully',
      isValid: true,
      otpData: otpRecord,
    }
  } catch (error) {
    console.error('❌ Error verifying OTP:', error)
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      prismaAvailable: !!prisma,
      otpModelAvailable: !!prisma.oTP
    })
    return {
      success: false,
      message: `Failed to verify OTP: ${error instanceof Error ? error.message : 'Unknown error'}`,
      isValid: false,
    }
  }
}

// Clean up expired OTPs
export async function cleanupExpiredOTPs(): Promise<void> {
  try {
    const result = await prisma.oTP.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    })

    if (result.count > 0) {
      console.log(`🧹 Cleaned up ${result.count} expired OTPs`)
    }
  } catch (error) {
    console.error('❌ Error cleaning up expired OTPs:', error)
  }
}

// Get OTP by phone (for debugging)
export async function getOTPByPhone(phone: string): Promise<OTPData | null> {
  try {
    const otpRecord = await prisma.oTP.findFirst({
      where: {
        phone,
        isUsed: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return otpRecord
  } catch (error) {
    console.error('❌ Error getting OTP:', error)
    return null
  }
}
