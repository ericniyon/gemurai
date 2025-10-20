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

// Enhanced validation function for individual registration
function validateIndividualRegistration(data: any) {
  const errors: string[] = []

  // Required fields for individual
  if (!data.name || data.name.trim().length < 2) {
    errors.push("Full name must be at least 2 characters long")
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

  // Optional: password strength validation
  if (data.password && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)) {
    errors.push("Password must contain at least one uppercase letter, one lowercase letter, and one number")
  }

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

  // Optional: password strength validation
  if (data.password && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)) {
    errors.push("Password must contain at least one uppercase letter, one lowercase letter, and one number")
  }

  return errors
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      registrationType, // 'individual' or 'company'
      // Individual fields
      name, 
      email, 
      phone, 
      password, 
      // Company fields
      businessName,
      tin,
      businessSize,
      contactPerson,
      // Common fields
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

    // Validate registration type
    if (!registrationType || !['individual', 'company'].includes(registrationType)) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Registration type must be either 'individual' or 'company'",
          errors: ["Invalid registration type"]
        },
        { status: 400 }
      )
    }

    // Enhanced validation based on registration type
    let validationErrors: string[] = []
    if (registrationType === 'individual') {
      validationErrors = validateIndividualRegistration({ name, email, phone, password })
    } else {
      validationErrors = validateCompanyRegistration({ 
        businessName, 
        tin, 
        businessSize, 
        contactPerson, 
        email, 
        phone, 
        password 
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
        // Prepare user data based on registration type
        const userData = {
          email: email.toLowerCase().trim(),
          phone: phone.trim(),
          password: hashedPassword,
          isActive: true,
          ...additionalData // Allow additional user data
        }

        // Add name or business information based on registration type
        if (registrationType === 'individual') {
          userData.name = name.trim()
        } else {
          // For company registration, store business info in additionalData
          userData.name = contactPerson.trim() // Use contact person as the main name
          userData.businessName = businessName.trim()
          userData.tin = tin.trim()
          userData.businessSize = businessSize
          userData.contactPerson = contactPerson.trim()
        }

        // Create user without role/permissions (new schema)
        const user = await prisma.user.create({
          data: userData,
        })

        console.log(`✅ User created: ${user.email}`);

        // Validate and assign role
        const validRoles = ['CONSUMER', 'EMPLOYER', 'AGENT', 'INTERVIEWER']
        const requestedRole = role.toUpperCase()
        
        if (!validRoles.includes(requestedRole)) {
          console.warn(`⚠️ Invalid role requested: ${requestedRole}, defaulting to CONSUMER`)
        }

        const finalRole = validRoles.includes(requestedRole) ? requestedRole : 'CONSUMER'
        
        // Find the role in database
        console.log(`🔍 Looking for ${finalRole} role in database...`);
        const userRole = await prisma.role.findUnique({
          where: { name: finalRole }
        })

        if (!userRole) {
          console.error(`❌ ${finalRole} role not found in database`);
          
          // Log all available roles for debugging
          const availableRoles = await prisma.role.findMany({
            select: { name: true }
          });
          console.error('Available roles in database:', availableRoles.map(r => r.name));
          
          // Delete the user since role assignment failed
          await prisma.user.delete({ where: { id: user.id } });
          return NextResponse.json(
            { 
              success: false, 
              message: `Registration failed: ${finalRole} role not found. Available roles: ${availableRoles.map(r => r.name).join(', ')}` 
            },
            { status: 500 }
          );
        }

        // Create role assignment
        await prisma.userRoleAssignment.create({
          data: {
            userId: user.id,
            roleId: userRole.id,
            assignedBy: null, // Self-registration
            assignedAt: new Date(),
            isActive: true
          }
        })

        console.log(`✅ Successfully assigned ${finalRole} role to ${user.email}`);

        // Generate token with permissions from role
        const rolePermissions = await prisma.permission.findMany({
          where: {
            rolePermissions: {
              some: {
                roleId: userRole.id
              }
            }
          },
          select: { name: true }
        });

        const permissions = rolePermissions.map(p => p.name);

        const token = await generateAuthToken({
          id: user.id,
          email: user.email,
          role: finalRole,
          name: user.name,
          permissions: permissions,
          rolePermissions: permissions,
          databasePermissions: permissions,
          avatar: user.avatar,
        })

        console.log(`✅ Registration completed successfully for ${user.email}`);

        // Prepare response data based on registration type
        const responseUser = {
          id: user.id,
          email: user.email,
          phone: user.phone,
          role: finalRole,
          permissions: permissions,
          isActive: user.isActive,
          createdAt: user.createdAt
        }

        if (registrationType === 'individual') {
          responseUser.name = user.name
        } else {
          // For company registration, include business information
          responseUser.name = user.name // This is the contact person
          responseUser.businessName = user.businessName
          responseUser.tin = user.tin
          responseUser.businessSize = user.businessSize
          responseUser.contactPerson = user.contactPerson
        }

        return NextResponse.json({
          success: true,
          message: `${registrationType === 'individual' ? 'Individual' : 'Company'} registration successful`,
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
          // For company registration in old schema, store business info in name field
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

        return NextResponse.json({
          success: true,
          message: `${registrationType === 'individual' ? 'Individual' : 'Company'} registration successful`,
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