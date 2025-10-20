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

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, password } = await request.json()

    // Validate input
    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { phone }
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { 
          success: false, 
          message: existingUser.email === email 
            ? "Email already registered" 
            : "Phone number already registered" 
        },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Check if new role system tables exist
    const [rolesTableExists, userRoleTableExists] = await Promise.all([
      tableExists('roles'),
      tableExists('user_role_assignments')
    ]);

    if (rolesTableExists && userRoleTableExists) {
      // Use new role system
      console.log("Registration using new role system schema");
      
      try {
        // Create user without role/permissions (new schema)
        const user = await prisma.user.create({
          data: {
            name,
            email,
            phone,
            password: hashedPassword,
            isActive: true,
          },
        })

        console.log(`✅ User registered: ${user.email}`);

        // Assign CONSUMER role to new user
        console.log('🔍 Looking for CONSUMER role in database...');
        const consumerRole = await prisma.role.findUnique({
          where: { name: 'CONSUMER' }
        })

        if (!consumerRole) {
          console.error('❌ CONSUMER role not found in database');
          
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
              message: `Registration failed: CONSUMER role not found. Available roles: ${availableRoles.map(r => r.name).join(', ')}` 
            },
            { status: 500 }
          );
        }

        // Create role assignment
        await prisma.userRoleAssignment.create({
          data: {
            userId: user.id,
            roleId: consumerRole.id,
            assignedBy: null, // Self-registration
            assignedAt: new Date()
          }
        })

        console.log(`✅ Successfully assigned CONSUMER role to ${user.email}`);

        // Generate token with permissions from role
        const rolePermissions = await prisma.permission.findMany({
          where: {
            rolePermissions: {
              some: {
                roleId: consumerRole.id
              }
            }
          },
          select: { name: true }
        });

        const permissions = rolePermissions.map(p => p.name);

        const token = await generateAuthToken({
          id: user.id,
          email: user.email,
          role: 'CONSUMER',
          name: user.name,
          permissions: permissions,
          rolePermissions: permissions,
          databasePermissions: permissions,
          avatar: user.avatar,
        })

        return NextResponse.json({
          success: true,
          message: "Registration successful",
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: 'CONSUMER',
            permissions: permissions
          },
          token
        })
      } catch (error) {
        console.error("New schema registration failed:", error);
        throw error;
      }
    } else {
      // Use old schema (fallback)
      console.log("Registration using old schema");
      
      try {
        const user = await prisma.user.create({
          data: {
            name,
            email,
            phone,
            password: hashedPassword,
            role: UserRole.CONSUMER, // Default role
            permissions: ["dashboard.view"] // Default permissions
          },
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

        return NextResponse.json({
          success: true,
          message: "Registration successful",
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            permissions: user.permissions
          },
          token
        })
      } catch (error) {
        console.error("Old schema registration failed:", error);
        throw error;
      }
    }
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred during registration" },
      { status: 500 }
    )
  }
} 