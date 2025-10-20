import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { defaultFormConfig } from "@/lib/form-service"

export async function GET() {
  try {
    // Get form config from database
    const formConfig = await prisma.formConfig.findFirst({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // If no config exists, create one with default values
    if (!formConfig) {
      const newConfig = await prisma.formConfig.create({
        data: {
          id: defaultFormConfig.id,
          title: defaultFormConfig.title,
          description: defaultFormConfig.description,
          sections: defaultFormConfig.sections,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })

      return NextResponse.json({
        success: true,
        config: newConfig
      })
    }

    return NextResponse.json({
      success: true,
      config: formConfig
    })
  } catch (error) {
    console.error("Error fetching form config:", error)
    return NextResponse.json({
      success: false,
      message: "Failed to fetch form configuration",
      config: defaultFormConfig // Fallback to default config on error
    })
  }
}

// POST /api/v1/form/config
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { config } = body

    if (!config) {
      return NextResponse.json(
        { success: false, message: "Form configuration is required" },
        { status: 400 }
      )
    }

    // Deactivate all existing configs
    await prisma.formConfig.updateMany({
      where: {
        isActive: true,
      },
      data: {
        isActive: false,
      },
    })

    // Create new config
    const newConfig = await prisma.formConfig.create({
      data: {
        id: config.id,
        title: config.title,
        description: config.description,
        sections: config.sections,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      config: newConfig
    })
  } catch (error) {
    console.error("Error saving form config:", error)
    return NextResponse.json(
      { success: false, message: "Failed to save form configuration" },
      { status: 500 }
    )
  }
} 