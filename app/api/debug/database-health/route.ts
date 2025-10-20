import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    console.log("Database health check starting...");
    
    const health = {
      timestamp: new Date().toISOString(),
      database: "disconnected",
      tables: {
        users: false,
        roles: false,
        permissions: false,
        userRoleAssignments: false,
      },
      migration_status: "unknown",
      sample_data: {
        userCount: 0,
        roleCount: 0,
        permissionCount: 0,
      }
    }

    // Test basic database connection with timeout
    const connectionTest = Promise.race([
      prisma.$connect().then(() => true),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Connection timeout")), 5000))
    ]);

    try {
      await connectionTest;
      health.database = "connected";
      console.log("Database connection successful");
    } catch (error) {
      console.error("Database connection failed:", error);
      health.database = "error";
      return NextResponse.json(health);
    }

    // Check tables existence safely
    const tableChecks = [
      { name: 'users', check: () => prisma.user.count() },
      { name: 'roles', check: () => prisma.role.count() },
      { name: 'permissions', check: () => prisma.permission.count() },
      { name: 'userRoleAssignments', check: () => prisma.userRoleAssignment.count() }
    ];

    for (const { name, check } of tableChecks) {
      try {
        const count = await Promise.race([
          check(),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Query timeout")), 3000))
        ]);
        health.tables[name] = true;
        if (name === 'users') health.sample_data.userCount = count;
        if (name === 'roles') health.sample_data.roleCount = count;
        if (name === 'permissions') health.sample_data.permissionCount = count;
        console.log(`Table ${name}: ${count} records`);
      } catch (error) {
        console.log(`Table ${name}: not available or error -`, error.message);
        health.tables[name] = false;
      }
    }

    // Determine migration status
    if (health.tables.roles && health.tables.permissions && health.tables.userRoleAssignments) {
      health.migration_status = "applied";
    } else if (health.tables.users) {
      health.migration_status = "partial";
    } else {
      health.migration_status = "not_applied";
    }

    console.log("Database health check completed:", health);
    return NextResponse.json(health);
  } catch (error) {
    console.error("Health check error:", error);
    return NextResponse.json(
      {
        error: "Health check failed",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  } finally {
    // Ensure we disconnect to prevent connection leaks
    try {
      await prisma.$disconnect();
    } catch (error) {
      console.error("Error disconnecting from database:", error);
    }
  }
} 