import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyAuthToken } from "@/lib/token"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { getNextDisplayId } from "@/lib/display-id"
import { hash } from "bcryptjs"

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

// GET /api/v1/superadmin/users
export async function GET(request: NextRequest) {
  try {
    // Verify superadmin authentication
    const cookieStore = await cookies()
    const token = cookieStore.get("Gemurai_token")

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await verifyAuthToken(token.value)

    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      )
    }

    // Check if new role system tables exist
    const [rolesTableExists, userRoleTableExists] = await Promise.all([
      tableExists('roles'),
      tableExists('user_role_assignments')
    ]);

    // Optional role filter
    const url = new URL(request.url)
    const roleFilter = url.searchParams.get("role")?.toUpperCase() || undefined

    if (rolesTableExists && userRoleTableExists) {
      // Use new schema
      console.log("Using new role system schema");
      try {
        const users = await prisma.user.findMany({
          where: roleFilter
            ? {
                userRole: {
                  isActive: true,
                  role: { name: roleFilter },
                },
              }
            : undefined,
          select: {
            id: true,
            displayId: true,
            email: true,
            name: true,
            phone: true,
            createdAt: true,
            updatedAt: true,
            isActive: true,
            userRole: {
              select: {
                role: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                  }
                }
              }
            }
          },
          orderBy: {
            createdAt: "desc",
          },
        })

        const transformedUsers = users.map(user => ({
          id: user.id,
          displayId: user.displayId ?? undefined,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.userRole?.role?.name || 'CONSUMER',
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          isActive: user.isActive,
        }))

        return NextResponse.json({ success: true, users: transformedUsers })
      } catch (error) {
        console.error("New schema query failed:", error);
        throw error;
      }
    } else {
      // Use old schema
      console.log("Using old role system schema");
      try {
        const users = await prisma.user.findMany({
          where: roleFilter ? { role: roleFilter as any } : undefined,
          select: {
            id: true,
            displayId: true,
            email: true,
            name: true,
            phone: true,
            role: true,
            createdAt: true,
            updatedAt: true,
            isActive: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        })

        return NextResponse.json({ success: true, users })
      } catch (error) {
        console.error("Old schema query failed:", error);
        throw error;
      }
    }
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: "Internal server error",
        debug: {
          error: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : "No stack",
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    )
  }
}

// POST /api/v1/superadmin/users
export async function POST(request: Request) {
  try {
    // Verify superadmin authentication
    const cookieStore = await cookies()
    const token = cookieStore.get("Gemurai_token")

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const admin = await verifyAuthToken(token.value)

    if (!admin || admin.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      email,
      password,
      role,
      name,
      phone,
      // Optional: personal, identification, contact
      gender,
      dateOfBirth,
      nationalId,
      alternatePhone,
      district,
      country,
      city,
      address,
      postalCode,
      languagePreference,
      // Organization (when userType is cooperative | company | ngo)
      userType,
      businessName,
      tin,
      businessSize,
      contactPerson,
    } = body

    const isOrganization = ['cooperative', 'company', 'ngo'].includes(String(userType || '').toLowerCase())

    // Resolve display name and required name validation
    const displayName = isOrganization
      ? (contactPerson || '').trim()
      : (name || '').trim()

    if (!displayName || displayName.length < 2) {
      return NextResponse.json(
        { success: false, message: isOrganization ? "Contact person name is required (min 2 characters)" : "Name is required (min 2 characters)" },
        { status: 400 }
      )
    }

    // Validate input (role is optional; can be assigned later)
    if (!email || !password) {
      console.error('❌ Missing required fields:', { hasEmail: !!email, hasPassword: !!password })
      return NextResponse.json(
        { success: false, message: "Missing required fields: email and password are required" },
        { status: 400 }
      )
    }

    if (isOrganization) {
      if (!(businessName || '').trim() || (businessName || '').trim().length < 2) {
        return NextResponse.json(
          { success: false, message: "Organization name is required (min 2 characters)" },
          { status: 400 }
        )
      }
      if (!(tin || '').trim() || (tin || '').trim().length < 5) {
        return NextResponse.json(
          { success: false, message: "TIN is required (min 5 characters)" },
          { status: 400 }
        )
      }
      const validSizes = ['SMALL', 'MEDIUM', 'LARGE']
      if (!businessSize || !validSizes.includes(String(businessSize).toUpperCase())) {
        return NextResponse.json(
          { success: false, message: "Business size is required (SMALL, MEDIUM, or LARGE)" },
          { status: 400 }
        )
      }
    }

    // Role is optional: resolve if provided, otherwise user can be assigned a role later
    let roleRecord: { id: string; name: string } | null = null;
    let roleName: string | null = null;
    const roleProvided = (role || '').trim().length > 0;

    if (roleProvided) {
      const roleVal = (role || '').trim();
      const isRoleId = roleVal.length > 20 && /^[a-z0-9]+$/i.test(roleVal);

      if (isRoleId) {
        roleRecord = await prisma.role.findUnique({ where: { id: roleVal } });
        roleName = roleRecord?.name ?? null;
      } else {
        roleName = roleVal.toUpperCase();
        if (roleName === 'CUSTOMER') roleName = 'CONSUMER';
        const allowedRoles = [
          'SUPER_ADMIN', 'ADMIN', 'EMPLOYER', 'DCC', 'CONSUMER', 'AGENT',
          'MCC_MANAGER', 'FIELD_AGENT', 'COOP_ADMIN', 'FARMER', 'ACCOUNTANT'
        ];
        if (!allowedRoles.includes(roleName)) {
          return NextResponse.json(
            { success: false, message: `Invalid role "${role}". Allowed: ${allowedRoles.join(', ')}` },
            { status: 400 }
          );
        }
        roleRecord = await prisma.role.findUnique({ where: { name: roleName } });
      }

      if (!roleRecord) {
        const availableRoles = await prisma.role.findMany({ select: { name: true, id: true } });
        return NextResponse.json(
          { success: false, message: `Role not found. Available: ${availableRoles.map(r => r.name).join(', ')}` },
          { status: 400 }
        );
      }
      console.log(`✅ Role validated: ${roleRecord.name} (ID: ${roleRecord.id})`);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Check if new role system tables exist
    const [rolesTableExists, userRoleTableExists] = await Promise.all([
      tableExists('roles'),
      tableExists('user_role_assignments')
    ]);

    if (rolesTableExists && userRoleTableExists) {
      // Use new schema
      console.log("Creating user with new role system schema");
      try {
        const userData: Record<string, unknown> = {
          email: email.trim().toLowerCase(),
          name: displayName,
          phone: (phone || '').trim() || null,
          password: hashedPassword,
          isActive: true,
        }
        if (gender?.trim()) userData.gender = gender.trim()
        if (dateOfBirth) userData.dateOfBirth = new Date(dateOfBirth)
        if (nationalId?.trim()) userData.national_id = nationalId.trim()
        if (alternatePhone?.trim()) userData.alternatePhone = alternatePhone.trim()
        if (district?.trim()) userData.district = district.trim()
        if (country?.trim()) userData.country = country.trim()
        if (city?.trim()) userData.city = city.trim()
        if (address?.trim()) userData.address = address.trim()
        if (postalCode?.trim()) userData.postalCode = postalCode.trim()
        if (languagePreference?.trim()) userData.languagePreference = languagePreference.trim()
        if (isOrganization) {
          userData.organizationType = String(userType).toUpperCase()
          userData.businessName = (businessName || '').trim()
          userData.tin = (tin || '').trim()
          userData.businessSize = String(businessSize).toUpperCase()
          userData.contactPerson = (contactPerson || '').trim()
        }
        try {
          userData.displayId = await getNextDisplayId(prisma)
        } catch (e) {
          console.error("Failed to generate displayId:", e)
        }
        let user: Awaited<ReturnType<typeof prisma.user.create>>
        try {
          user = await prisma.user.create({ data: userData as any })
        } catch (err: any) {
          if (err?.code === "P2002" && String(err?.meta?.target || "").includes("displayId")) {
            userData.displayId = await getNextDisplayId(prisma)
            user = await prisma.user.create({ data: userData as any })
          } else {
            throw err
          }
        }

        console.log(`✅ User created successfully: ${user.email}${user.displayId ? ` (${user.displayId})` : ""}`);

        if (roleRecord) {
          await prisma.userRoleAssignment.create({
            data: {
              userId: user.id,
              roleId: roleRecord.id,
              assignedBy: admin.id,
              assignedAt: new Date()
            }
          });
          console.log(`✅ Assigned role ${roleName} to user ${user.email}`);
        }

        return NextResponse.json({
          success: true,
          user: {
            id: user.id,
            displayId: user.displayId ?? undefined,
            email: user.email,
            name: user.name,
            phone: user.phone,
            role: roleName ?? 'No Role',
            createdAt: user.createdAt,
            isActive: user.isActive,
          },
          message: roleName ? `User created with ${roleName} role` : 'User created. Assign a role later from user management.'
        })
      } catch (error) {
        console.error("New schema user creation failed:", error);
        
        // If it's a role assignment error, provide specific feedback
        if (error instanceof Error && error.message.includes('userRoleAssignment')) {
          return NextResponse.json(
            { success: false, message: "User created but role assignment failed. Please assign role manually." },
            { status: 500 }
          );
        }
        
        throw error;
      }
    } else {
      // Use old schema (role column on user; use CONSUMER as default when not provided)
      console.log("Creating user with old role system schema");
      const fallbackRole = roleName ?? 'CONSUMER';
      let displayId: string | undefined;
      try {
        displayId = await getNextDisplayId(prisma)
      } catch (_) {}
      try {
        const user = await prisma.user.create({
          data: {
            email,
            name: name || "",
            phone: phone || null,
            password: hashedPassword,
            role: fallbackRole,
            isActive: true,
            ...(displayId && { displayId }),
          },
        })

        return NextResponse.json({
          success: true,
          user: {
            id: user.id,
            displayId: user.displayId ?? undefined,
            email: user.email,
            name: user.name,
            phone: user.phone,
            role: user.role,
            createdAt: user.createdAt,
            isActive: user.isActive,
          },
          message: roleName ? `User created with ${user.role} role` : 'User created. Assign a role later from user management.'
        })
      } catch (error) {
        console.error("Old schema user creation failed:", error);
        throw error;
      }
    }
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: "Internal server error",
        debug: {
          error: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : "No stack",
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    )
  }
} 