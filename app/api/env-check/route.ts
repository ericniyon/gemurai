import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Check environment variables
    const jwtSecret = process.env.JWT_SECRET
    const nextAuthSecret = process.env.NEXTAUTH_SECRET
    const nodeEnv = process.env.NODE_ENV
    
    return NextResponse.json({
      success: true,
      message: "Environment check",
      env: {
        jwtSecretAvailable: !!jwtSecret,
        jwtSecretLength: jwtSecret?.length || 0,
        nextAuthSecretAvailable: !!nextAuthSecret,
        nextAuthSecretLength: nextAuthSecret?.length || 0,
        nodeEnv: nodeEnv,
        allEnvKeys: Object.keys(process.env).filter(key => 
          key.includes('JWT') || key.includes('AUTH') || key.includes('DATABASE')
        )
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: "Environment check failed",
      error: error.message
    }, { status: 500 })
  }
}

