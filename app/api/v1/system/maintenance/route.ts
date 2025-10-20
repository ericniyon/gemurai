import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // In a real application, you might want to check a database or environment variable
    // for the maintenance status. For now, we'll return false by default.
    return NextResponse.json({
      success: true,
      isUnderMaintenance: false,
      message: "System is operational",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error checking maintenance status:", error);
    return NextResponse.json(
      {
        success: false,
        isUnderMaintenance: false,
        message: "Failed to check maintenance status",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
} 