import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyAuthToken } from "@/lib/token"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
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
    const { email, password, role, name, phone } = body

    // Log incoming request data for debugging
    console.log('📋 User creation request received:', {
      email: email || 'MISSING',
      hasPassword: !!password,
      role: role || 'MISSING',
      roleType: typeof role,
      name: name || 'MISSING',
      phone: phone || 'MISSING',
      fullBody: body
    });

    // Validate input
    if (!email || !password || !role) {
      console.error('❌ Missing required fields:', {
        hasEmail: !!email,
        hasPassword: !!password,
        hasRole: !!role
      });
      return NextResponse.json(
        { success: false, message: "Missing required fields: email, password, and role are required" },
        { status: 400 }
      )
    }

    // Determine if role is an ID or a name
    let roleRecord;
    let roleName;
    
    // Check if role looks like an ID (long string with alphanumeric characters)
    const isRoleId = role.length > 20 && /^[a-z0-9]+$/i.test(role);
    
    if (isRoleId) {
      console.log(`🔍 Role appears to be an ID: "${role}"`);
      // Look up role by ID
      roleRecord = await prisma.role.findUnique({
        where: { id: role }
      });
      roleName = roleRecord?.name;
      console.log(`🔄 Role ID "${role}" resolved to name: "${roleName}"`);
    } else {
      console.log(`🔍 Role appears to be a name: "${role}"`);
      // Normalize role name (trim and uppercase)
      roleName = role.trim().toUpperCase();
      console.log(`🔄 Role normalized from "${role}" to "${roleName}"`);
      
      // Map CUSTOMER to CONSUMER for database compatibility
      if (roleName === 'CUSTOMER') {
        roleName = 'CONSUMER';
        console.log(`🔄 Mapped CUSTOMER to CONSUMER for database compatibility`);
      }
      
      // Validate role is one of the allowed values (including MCC roles)
      const allowedRoles = [
        'SUPER_ADMIN', 
        'ADMIN', 
        'EMPLOYER', 
        'DCC', 
        'CONSUMER', 
        'AGENT',
        'MCC_MANAGER',
        'FIELD_AGENT',
        'COOP_ADMIN',
        'FARMER',
        'ACCOUNTANT'
      ];
      if (!allowedRoles.includes(roleName)) {
        console.error(`❌ Invalid role name "${roleName}". Allowed roles:`, allowedRoles);
        return NextResponse.json(
          { success: false, message: `Invalid role "${role}". Allowed roles: ${allowedRoles.join(', ')}` },
          { status: 400 }
        )
      }
      
      // Look up role by name
      roleRecord = await prisma.role.findUnique({
        where: { name: roleName }
      });
    }

    // Validate that we have a valid role
    if (!roleRecord) {
      console.error(`❌ Role not found: original="${role}", resolved name="${roleName}"`);
      
      // Log all available roles for debugging
      const availableRoles = await prisma.role.findMany({
        select: { name: true, id: true }
      });
      console.error('Available roles in database:', availableRoles);
      
      return NextResponse.json(
        { 
          success: false, 
          message: `Role not found. Original role: "${role}", Resolved name: "${roleName}". Available roles: ${availableRoles.map(r => `${r.name} (${r.id})`).join(', ')}` 
        },
        { status: 400 }
      );
    }

    console.log(`✅ Role validated: ${roleRecord.name} (ID: ${roleRecord.id})`);

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
        const user = await prisma.user.create({
          data: {
            email,
            name: name || "",
            phone: phone || null,
            password: hashedPassword,
            isActive: true,
          },
        })

        console.log(`✅ User created successfully: ${user.email}`);

        // Create role assignment (role already validated above)

        const roleAssignment = await prisma.userRoleAssignment.create({
          data: {
            userId: user.id,
            roleId: roleRecord.id,
            assignedBy: admin.id,
            assignedAt: new Date()
          }
        })

        console.log(`✅ Successfully assigned role ${roleName} to user ${user.email}`);

        return NextResponse.json({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            role: roleName,
            createdAt: user.createdAt,
            isActive: user.isActive,
          },
          message: `User created successfully with ${roleName} role`
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
      // Use old schema
      console.log("Creating user with old role system schema");
      try {
        const user = await prisma.user.create({
          data: {
            email,
            name: name || "",
            phone: phone || null,
            password: hashedPassword,
            role: roleName, // Use role name for old schema
            isActive: true,
          },
        })

        return NextResponse.json({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            role: user.role,
            createdAt: user.createdAt,
            isActive: user.isActive,
          },
          message: `User created successfully with ${user.role} role`
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