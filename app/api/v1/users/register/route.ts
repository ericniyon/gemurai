import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { generateAuthToken } from "@/lib/token"
import { UserRole } from "@prisma/client"

export const runtime = "nodejs"

// Check if a table exists
async function tableExists(tableName: string): Promise<boolean> {
  try {
    const result = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = ${tableName}
      )
    ` as any[];
    return result[0]?.exists || false;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  }
}

// Optional field validators (only validate when value is provided)
function optionalString(value: unknown, minLen: number, maxLen: number, label: string): string | null {
  if (value == null || value === "") return null
  const s = String(value).trim()
  if (s.length > 0 && s.length < minLen) return `${label} must be at least ${minLen} characters`
  if (s.length > maxLen) return `${label} must be at most ${maxLen} characters`
  return null
}
function optionalDate(value: unknown): string | null {
  if (value == null || value === "") return null
  const d = value instanceof Date ? value : new Date(String(value))
  if (Number.isNaN(d.getTime())) return "Date of birth must be a valid date"
  const now = new Date()
  if (d > now) return "Date of birth cannot be in the future"
  return null
}

// Enhanced validation function for individual registration
function validateIndividualRegistration(data: any) {
  const errors: string[] = []

  // Required: personal
  if (!data.name || data.name.trim().length < 2) {
    errors.push("Full name must be at least 2 characters long")
  }

  // Required: contact
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push("Please provide a valid email address")
  }
  if (!data.phone || data.phone.trim().length < 10) {
    errors.push("Please provide a valid phone number")
  }

  // Required: account
  if (!data.password || data.password.length < 6) {
    errors.push("Password must be at least 6 characters long")
  }
  if (data.password && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)) {
    errors.push("Password must contain at least one uppercase letter, one lowercase letter, and one number")
  }

  // Optional: personal
  const genderErr = optionalString(data.gender, 1, 50, "Gender")
  if (genderErr) errors.push(genderErr)
  const dobErr = optionalDate(data.dateOfBirth)
  if (dobErr) errors.push(dobErr)

  // Optional: identification
  const nationalIdErr = optionalString(data.nationalId, 5, 50, "National ID")
  if (nationalIdErr) errors.push(nationalIdErr)

  // Optional: contact
  const altPhoneErr = optionalString(data.alternatePhone, 10, 20, "Alternate phone")
  if (altPhoneErr) errors.push(altPhoneErr)
  const districtErr = optionalString(data.district, 2, 100, "District")
  if (districtErr) errors.push(districtErr)
  const addressErr = optionalString(data.address, 5, 500, "Address")
  if (addressErr) errors.push(addressErr)

  return errors
}

// Enhanced validation function for company registration
function validateCompanyRegistration(data: any) {
  const errors: string[] = []

  // Required fields for company
  if (!data.businessName || data.businessName.trim().length < 2) {
    errors.push("Business name must be at least 2 characters long")
  }

  if (!data.tin || data.tin.trim().length < 5) {
    errors.push("TIN (Tax Identification Number) must be at least 5 characters long")
  }

  if (!data.contactPerson || data.contactPerson.trim().length < 2) {
    errors.push("Contact person name must be at least 2 characters long")
  }

  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push("Please provide a valid email address")
  }

  if (!data.phone || data.phone.trim().length < 10) {
    errors.push("Please provide a valid phone number")
  }

  if (!data.password || data.password.length < 6) {
    errors.push("Password must be at least 6 characters long")
  }

  if (!data.businessSize || !['SMALL', 'MEDIUM', 'LARGE'].includes(data.businessSize)) {
    errors.push("Please select a valid business size (SMALL, MEDIUM, or LARGE)")
  }
  if (data.password && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)) {
    errors.push("Password must contain at least one uppercase letter, one lowercase letter, and one number")
  }

  // Optional contact for company
  const altPhoneErr = optionalString(data.alternatePhone, 10, 20, "Alternate phone")
  if (altPhoneErr) errors.push(altPhoneErr)
  const districtErr = optionalString(data.district, 2, 100, "District")
  if (districtErr) errors.push(districtErr)
  const addressErr = optionalString(data.address, 5, 500, "Address")
  if (addressErr) errors.push(addressErr)

  return errors
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      registrationType, // 'individual' or 'company'
      // Personal (required for individual: name)
      name, 
      // Identification (optional)
      nationalId,
      // Contact (required: email, phone)
      email, 
      phone, 
      alternatePhone,
      district,
      address,
      // Personal optional
      gender,
      dateOfBirth,
      // Account
      password, 
      // Company fields
      businessName,
      tin,
      businessSize,
      contactPerson,
      // Common
      role = 'CONSUMER', 
      additionalData = {} 
    } = body

    console.log("🔍 User registration request received:", { 
      registrationType, 
      name: registrationType === 'individual' ? name : businessName, 
      email, 
      phone, 
      role 
    })

    const validRegistrationTypes = ['individual', 'cooperative', 'company', 'ngo'] as const
    if (!registrationType || !validRegistrationTypes.includes(registrationType as any)) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Registration type must be one of: Cooperative, Company, NGO, Individual",
          errors: ["Invalid registration type"]
        },
        { status: 400 }
      )
    }

    const isOrganization = ['cooperative', 'company', 'ngo'].includes(registrationType)

    let validationErrors: string[] = []
    if (registrationType === 'individual') {
      validationErrors = validateIndividualRegistration({
        name, email, phone, password,
        gender, dateOfBirth, nationalId, alternatePhone, district, address,
      })
    } else {
      validationErrors = validateCompanyRegistration({ 
        businessName, tin, businessSize, contactPerson, 
        email, phone, password,
        alternatePhone, district, address,
      })
    }

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Validation failed", 
          errors: validationErrors 
        },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { phone }
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { 
          success: false, 
          message: existingUser.email === email.toLowerCase() 
            ? "Email already registered" 
            : "Phone number already registered",
          field: existingUser.email === email.toLowerCase() ? 'email' : 'phone'
        },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12) // Increased salt rounds for better security

    // Check if new role system tables exist
    const [rolesTableExists, userRoleTableExists] = await Promise.all([
      tableExists('roles'),
      tableExists('user_role_assignments')
    ]);

    if (rolesTableExists && userRoleTableExists) {
      // Use new role system
      console.log("🔧 Registration using new role system schema");
      
      try {
        // Base required fields
        const userData: Record<string, unknown> = {
          email: email.toLowerCase().trim(),
          phone: phone.trim(),
          password: hashedPassword,
          isActive: true,
        }

        if (registrationType === 'individual') {
          userData.name = name.trim()
          if (gender?.trim()) userData.gender = gender.trim()
          if (dateOfBirth) userData.dateOfBirth = new Date(dateOfBirth)
          if (nationalId?.trim()) userData.national_id = nationalId.trim()
          if (alternatePhone?.trim()) userData.alternatePhone = alternatePhone.trim()
          if (district?.trim()) userData.district = district.trim()
          if (address?.trim()) userData.address = address.trim()
        } else {
          userData.organizationType = registrationType.toUpperCase() // COOPERATIVE | COMPANY | NGO
          userData.name = contactPerson.trim()
          userData.businessName = businessName.trim()
          userData.tin = tin.trim()
          userData.businessSize = businessSize
          userData.contactPerson = contactPerson.trim()
          if (alternatePhone?.trim()) userData.alternatePhone = alternatePhone.trim()
          if (district?.trim()) userData.district = district.trim()
          if (address?.trim()) userData.address = address.trim()
        }

        // Allow extra safe fields from additionalData (no overwrite of required)
        const allowedExtra = ['gender', 'dateOfBirth', 'national_id', 'alternatePhone', 'district', 'address']
        for (const key of allowedExtra) {
          if (additionalData[key] != null && additionalData[key] !== '' && userData[key] === undefined) {
            if (key === 'dateOfBirth') userData.dateOfBirth = new Date(additionalData[key])
            else userData[key] = typeof additionalData[key] === 'string' ? additionalData[key].trim() : additionalData[key]
          }
        }

        const user = await prisma.user.create({
          data: userData as any,
        })

        console.log(`✅ User created: ${user.email}`);

        // Role assignment is optional (nullable): use requested role if it exists in DB, else fallback, else skip
        const requestedRole = (role && String(role).trim()) ? String(role).toUpperCase() : 'FARMER'
        const availableRoles = await prisma.role.findMany({ select: { id: true, name: true } })
        let userRole = availableRoles.find((r) => r.name === requestedRole) ?? null

        if (!userRole) {
          // Fallback to FARMER for individual, or first available role for org
          const fallbackName = registrationType === 'individual' ? 'FARMER' : 'FARMER'
          userRole = availableRoles.find((r) => r.name === fallbackName) ?? availableRoles[0] ?? null
          if (userRole) {
            console.warn(`⚠️ Role ${requestedRole} not found, using fallback: ${userRole.name}`)
          }
        }

        let finalRole: string | null = null
        let permissions: string[] = []

        if (userRole) {
          await prisma.userRoleAssignment.create({
            data: {
              userId: user.id,
              roleId: userRole.id,
              assignedBy: null,
              assignedAt: new Date(),
              isActive: true
            }
          })
          finalRole = userRole.name
          console.log(`✅ Assigned role ${finalRole} to ${user.email}`)

          const rolePermissions = await prisma.permission.findMany({
            where: {
              rolePermissions: {
                some: { roleId: userRole!.id }
              }
            },
            select: { name: true }
          })
          permissions = rolePermissions.map((p) => p.name)
        } else {
          console.warn(`⚠️ No role assigned (no roles in database); registration still successful`)
        }

        const token = await generateAuthToken({
          id: user.id,
          email: user.email,
          role: (finalRole ?? 'FARMER') as import('@prisma/client').UserRole,
          name: user.name,
          permissions: permissions,
          rolePermissions: permissions,
          databasePermissions: permissions,
          avatar: user.avatar,
        })

        console.log(`✅ Registration completed successfully for ${user.email}`);

        // Prepare response data (personal, identification, contact)
        const responseUser: Record<string, unknown> = {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: finalRole,
          permissions: permissions,
          isActive: user.isActive,
          createdAt: user.createdAt,
        }
        if (user.gender) responseUser.gender = user.gender
        if (user.dateOfBirth) responseUser.dateOfBirth = user.dateOfBirth
        if (user.national_id) responseUser.nationalId = user.national_id
        if (user.alternatePhone) responseUser.alternatePhone = user.alternatePhone
        if (user.district) responseUser.district = user.district
        if (user.address) responseUser.address = user.address
        if (isOrganization) {
          if ((user as any).organizationType) responseUser.organizationType = (user as any).organizationType
          if (user.businessName) responseUser.businessName = user.businessName
          if (user.tin) responseUser.tin = user.tin
          if (user.businessSize) responseUser.businessSize = user.businessSize
          if (user.contactPerson) responseUser.contactPerson = user.contactPerson
        }

        const typeLabel = registrationType === 'individual' ? 'Individual' : registrationType.charAt(0).toUpperCase() + registrationType.slice(1)
        return NextResponse.json({
          success: true,
          message: `${typeLabel} registration successful`,
          user: responseUser,
          token
        })
      } catch (error) {
        console.error("❌ New schema registration failed:", error);
        throw error;
      }
    } else {
      // Use old schema (fallback)
      console.log("🔧 Registration using old schema (fallback)");
      
      try {
        // Prepare user data for old schema
        const userData = {
          email: email.toLowerCase().trim(),
          phone: phone.trim(),
          password: hashedPassword,
          role: UserRole.CONSUMER, // Default role for old schema
          permissions: ["dashboard.view"] // Default permissions
        }

        if (registrationType === 'individual') {
          userData.name = name.trim()
        } else {
          // For organization registration in old schema, store org info in name field
          userData.name = `${contactPerson.trim()} (${businessName.trim()})`
        }

        const user = await prisma.user.create({
          data: userData,
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            permissions: true,
            createdAt: true
          }
        })

        const token = await generateAuthToken({
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
          permissions: user.permissions,
          rolePermissions: user.permissions,
          databasePermissions: user.permissions,
          avatar: null,
        })

        console.log(`✅ Registration completed successfully for ${user.email} (old schema)`);

        // Prepare response for old schema
        const responseUser = {
          id: user.id,
          email: user.email,
          phone: user.phone,
          role: user.role,
          permissions: user.permissions,
          createdAt: user.createdAt
        }

        if (registrationType === 'individual') {
          responseUser.name = user.name
        } else {
          // For company registration in old schema
          responseUser.name = user.name // This contains "Contact Person (Business Name)"
          responseUser.businessName = businessName
          responseUser.tin = tin
          responseUser.businessSize = businessSize
          responseUser.contactPerson = contactPerson
        }

        const typeLabel = registrationType === 'individual' ? 'Individual' : registrationType.charAt(0).toUpperCase() + registrationType.slice(1)
        return NextResponse.json({
          success: true,
          message: `${typeLabel} registration successful`,
          user: responseUser,
          token
        })
      } catch (error) {
        console.error("❌ Old schema registration failed:", error);
        throw error;
      }
    }
  } catch (error) {
    console.error("❌ Registration error:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: "An error occurred during registration",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

// GET method for checking registration status or validation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const phone = searchParams.get('phone')

    if (!email && !phone) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Please provide either email or phone parameter" 
        },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          ...(email ? [{ email: email.toLowerCase() }] : []),
          ...(phone ? [{ phone }] : [])
        ]
      },
      select: {
        id: true,
        email: true,
        phone: true,
        isActive: true
      }
    })

    return NextResponse.json({
      success: true,
      exists: !!existingUser,
      available: !existingUser,
      user: existingUser ? {
        email: existingUser.email,
        phone: existingUser.phone,
        isActive: existingUser.isActive
      } : null
    })
  } catch (error) {
    console.error("❌ Error checking user existence:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: "An error occurred while checking user existence" 
      },
      { status: 500 }
    )
  }
} 