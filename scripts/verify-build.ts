#!/usr/bin/env node

import { execSync } from "child_process"
import { existsSync } from "fs"
import path from "path"

console.log("🔍 Verifying Gemurai Platform build...\n")

// Check if required files exist
const requiredFiles = ["package.json", "next.config.mjs", "tailwind.config.ts", "tsconfig.json", "prisma/schema.prisma"]

console.log("📁 Checking required files...")
for (const file of requiredFiles) {
  if (existsSync(file)) {
    console.log(`✅ ${file}`)
  } else {
    console.log(`❌ ${file} - MISSING`)
    process.exit(1)
  }
}

// Check environment variables
console.log("\n🔧 Checking environment variables...")
const requiredEnvVars = ["DATABASE_URL", "JWT_SECRET", "TWILIO_SENDGRID_API_KEY", "TWILIO_FROM_EMAIL"]

for (const envVar of requiredEnvVars) {
  if (process.env[envVar]) {
    console.log(`✅ ${envVar}`)
  } else {
    console.log(`⚠️  ${envVar} - NOT SET (may cause runtime issues)`)
  }
}

// Run type checking
console.log("\n🔍 Running TypeScript type check...")
try {
  execSync("npx tsc --noEmit", { stdio: "inherit" })
  console.log("✅ TypeScript check passed")
} catch (error) {
  console.log("❌ TypeScript check failed")
  process.exit(1)
}

// Run build
console.log("\n🏗️  Running production build...")
try {
  execSync("npm run build", { stdio: "inherit" })
  console.log("\n✅ Build completed successfully!")
} catch (error) {
  console.log("\n❌ Build failed")
  process.exit(1)
}

// Check build output
console.log("\n📦 Checking build output...")
const buildDir = ".next"
if (existsSync(buildDir)) {
  console.log("✅ Build directory created")

  const staticDir = path.join(buildDir, "static")
  if (existsSync(staticDir)) {
    console.log("✅ Static assets generated")
  }

  const serverDir = path.join(buildDir, "server")
  if (existsSync(serverDir)) {
    console.log("✅ Server files generated")
  }
} else {
  console.log("❌ Build directory not found")
  process.exit(1)
}

console.log("\n🎉 Build verification completed successfully!")
console.log("🚀 Your Gemurai Platform is ready for deployment!")
