import { NextRequest, NextResponse } from "next/server"
import { CommodityStudioService } from "@/lib/services/CommodityStudioService"
import { verifyAuthToken } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"

/**
 * POST /api/v1/admin/commodity-studio/commodities/[id]/quality-fields - Add quality field
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Test database connection first
    try {
      await prisma.$queryRaw`SELECT 1 as test`
    } catch (dbError: any) {
      console.error("Database connection error:", dbError)
      const errorCode = dbError?.code || 'UNKNOWN'
      const errorMessage = dbError?.message || 'Unknown database error'
      
      if (errorCode === 'P1001' || errorMessage.includes("Can't reach database server")) {
        return NextResponse.json(
          { 
            error: "Database connection failed",
            message: "Cannot reach the database server. Please check if your Railway database is running and accessible.",
            details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
          },
          { status: 503 }
        )
      }
      
      return NextResponse.json(
        { 
          error: "Database connection failed",
          details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        },
        { status: 503 }
      )
    }

    const authToken = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!authToken) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 })
    }

    const user = await verifyAuthToken(authToken)
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Validate commodity exists
    const commodity = await prisma.commodities.findUnique({
      where: { id: params.id },
    })

    if (!commodity) {
      return NextResponse.json(
        {
          error: "Commodity not found",
          details: `Commodity with ID ${params.id} does not exist`,
        },
        { status: 404 }
      )
    }

    const data = await req.json()
    const {
      fieldName,
      fieldType,
      dataType,
      options,
      isMandatory,
      displayOrder,
      description,
    } = data

    if (!fieldName || !fieldType || !dataType) {
      return NextResponse.json(
        { error: "Missing required fields: fieldName, fieldType, dataType" },
        { status: 400 }
      )
    }

    // Validate enum values
    const validFieldTypes = ["NUMERIC", "DROPDOWN", "BOOLEAN", "INDICATOR", "TEXT"]
    if (!validFieldTypes.includes(fieldType)) {
      return NextResponse.json(
        {
          error: "Invalid fieldType",
          details: `fieldType must be one of: ${validFieldTypes.join(", ")}`,
        },
        { status: 400 }
      )
    }

    const validDataTypes = ["PERCENTAGE", "DECIMAL", "INTEGER", "STRING", "BOOLEAN"]
    if (!validDataTypes.includes(dataType)) {
      return NextResponse.json(
        {
          error: "Invalid dataType",
          details: `dataType must be one of: ${validDataTypes.join(", ")}`,
        },
        { status: 400 }
      )
    }

    const qualityField = await CommodityStudioService.addQualityField({
      commodityId: params.id,
      fieldName,
      fieldType,
      dataType,
      options: options || undefined,
      isMandatory: isMandatory || false,
      displayOrder: displayOrder || 0,
      description,
    })

    return NextResponse.json({
      success: true,
      message: "Quality field added successfully",
      data: qualityField,
    })
  } catch (error: any) {
    console.error("Add quality field error:", error)
    console.error("Error details:", {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
      stack: error?.stack,
    })
    
    if (error.code === "P2003") {
      return NextResponse.json(
        { 
          error: "Invalid commodity reference",
          details: process.env.NODE_ENV === 'development' ? error?.meta : undefined
        },
        { status: 400 }
      )
    }
    
    if (error.code === "P2002") {
      return NextResponse.json(
        { 
          error: "Quality field with this name already exists for this commodity",
          details: process.env.NODE_ENV === 'development' ? error?.meta : undefined
        },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { 
        error: "Failed to add quality field",
        message: process.env.NODE_ENV === 'development' ? error?.message : undefined,
        code: process.env.NODE_ENV === 'development' ? error?.code : undefined,
        details: process.env.NODE_ENV === 'development' ? error?.meta : undefined,
      },
      { status: 500 }
    )
  }
}
