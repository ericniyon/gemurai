import { type NextRequest, NextResponse } from "next/server"
import { getFormConfig } from "@/lib/form-service"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    const formConfig = getFormConfig()

    return NextResponse.json({
      success: true,
      data: formConfig,
    })
  } catch (error) {
    console.error("Error fetching form configuration:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch form configuration",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { formConfig } = body

    if (!formConfig) {
      return NextResponse.json(
        {
          success: false,
          error: "Form configuration is required",
        },
        { status: 400 },
      )
    }

    // In a real application, you would save this to a database
    // For now, we'll use the form service
    const { saveFormConfig, validateFormConfig } = await import("@/lib/form-service")

    if (!validateFormConfig(formConfig)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid form configuration structure",
        },
        { status: 400 },
      )
    }

    saveFormConfig(formConfig)

    return NextResponse.json({
      success: true,
      message: "Form configuration updated successfully",
    })
  } catch (error) {
    console.error("Error updating form configuration:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update form configuration",
      },
      { status: 500 },
    )
  }
}
