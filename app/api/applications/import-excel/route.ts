import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyAuthToken } from '@/lib/api-auth'
import { prisma } from '@/lib/database'
import * as XLSX from 'xlsx'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    console.log("📊 Excel import API called")
    
    // Verify authentication
    const cookieStore = await cookies()
    const token = cookieStore.get("Gemurai_token")

    if (!token) {
      console.log("❌ No token found")
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await verifyAuthToken(token.value)
    console.log("👤 User verified:", user?.role)

    if (!user) {
      console.log("❌ Invalid token")
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      )
    }

    // Check if user has permission to import applications
    if (user.role !== "EMPLOYER" && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      console.log("❌ Access denied - insufficient permissions")
      return NextResponse.json(
        { success: false, message: "Access denied. Insufficient permissions to import applications." },
        { status: 403 }
      )
    }

    // Get form data
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      console.log("❌ No file provided")
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      console.log("❌ Invalid file type")
      return NextResponse.json(
        { success: false, message: "Invalid file type. Please upload an Excel file (.xlsx or .xls)" },
        { status: 400 }
      )
    }

    console.log("📁 Processing file:", file.name, "Size:", file.size)

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Parse Excel file
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    
    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
    
    console.log("📊 Excel data parsed:", jsonData.length, "rows")

    if (jsonData.length < 2) {
      return NextResponse.json(
        { success: false, message: "Excel file is empty or has no data rows" },
        { status: 400 }
      )
    }

    // Extract headers (first row)
    const headers = jsonData[0] as string[]
    console.log("📋 Headers:", headers)

    // Process data rows (skip header row)
    const dataRows = jsonData.slice(1) as any[][]
    const importedApplications = []
    const errors = []

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i]
      const rowNumber = i + 2 // +2 because we start from row 2 (after header)

      try {
        // Create a mapping from headers to values
        const rowData: any = {}
        headers.forEach((header, index) => {
          if (header && row[index] !== undefined) {
            rowData[header.trim()] = row[index]
          }
        })

        // Map fields based on the existing Excel structure
        const firstName = rowData['formData.q1'] || rowData['First Name'] || ''
        const lastName = rowData['formData.q2'] || rowData['Last Name'] || ''
        const email = rowData['email'] || rowData['formData.email'] || rowData['Email'] || ''
        const phone = rowData['phone'] || rowData['formData.phone'] || rowData['Phone'] || ''
        const existingId = rowData['id'] || '' // Use existing ID from Excel file

        // Validate required fields
        const missingFields = []
        if (!firstName) missingFields.push('First Name')
        if (!lastName) missingFields.push('Last Name')
        if (!email) missingFields.push('Email')
        if (!phone) missingFields.push('Phone')
        
        if (missingFields.length > 0) {
          errors.push({
            row: rowNumber,
            error: `Missing required fields: ${missingFields.join(', ')}`
          })
          continue
        }

        // Check if application already exists (by ID, email or phone)
        const existingApplication = await prisma.application.findFirst({
          where: {
            OR: [
              { id: existingId },
              { email: email },
              { phone: phone }
            ]
          }
        })

        if (existingApplication) {
          errors.push({
            row: rowNumber,
            error: `Application already exists with ID: ${existingId} or email: ${email} or phone: ${phone}`
          })
          continue
        }

        // Use existing ID from Excel file, or generate new one if not available
        const applicationId = existingId || `APP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

        // Create formData object from the Excel row
        const formDataObj: any = {}
        headers.forEach((header, index) => {
          if (header && header.startsWith('formData.') && row[index] !== undefined) {
            const key = header.replace('formData.', '')
            formDataObj[key] = row[index]
          }
        })

        // Add basic fields to formData
        formDataObj['First Name'] = firstName
        formDataObj['Last Name'] = lastName
        formDataObj['Email'] = email
        formDataObj['Phone'] = phone

        // Create application record
        const application = await prisma.application.create({
          data: {
            id: applicationId,
            userId: user.id, // Associate with the importing user
            phone: phone,
            email: email,
            status: 'SUBMITTED', // Default status for imported applications
            formData: formDataObj, // Store all Excel data as formData
            currentStep: 1,
            dccCreated: false,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        })

        importedApplications.push({
          id: application.id,
          name: `${firstName} ${lastName}`,
          email: email,
          phone: phone
        })

        console.log(`✅ Imported application ${i + 1}/${dataRows.length}:`, application.id)

      } catch (error) {
        console.error(`❌ Error importing row ${rowNumber}:`, error)
        errors.push({
          row: rowNumber,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    console.log(`📊 Import completed: ${importedApplications.length} successful, ${errors.length} errors`)

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${importedApplications.length} applications`,
      data: {
        imported: importedApplications,
        errors: errors,
        total: dataRows.length,
        successful: importedApplications.length,
        failed: errors.length
      }
    })

  } catch (error) {
    console.error("❌ Excel import error:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to import Excel file",
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Handle GET request to show import status or template
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Excel import endpoint is ready",
    instructions: {
      method: "POST",
      contentType: "multipart/form-data",
      requiredFields: ["First Name", "Last Name", "Email", "Phone"],
      fieldMapping: {
        "First Name": "formData.q1 or First Name",
        "Last Name": "formData.q2 or Last Name", 
        "Email": "email or formData.email or Email",
        "Phone": "phone or formData.phone or Phone"
      },
      optionalFields: "Any additional columns will be stored in formData",
      fileTypes: [".xlsx", ".xls"]
    }
  })
} 