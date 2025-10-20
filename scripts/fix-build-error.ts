#!/usr/bin/env node

import { execSync } from "child_process"
import { existsSync, rmSync } from "fs"

console.log("🔧 Fixing build error: Cannot find module './9379.js'\n")

// Step 1: Clear Next.js build cache
console.log("1️⃣ Clearing Next.js build cache...")
const nextDir = ".next"
if (existsSync(nextDir)) {
  rmSync(nextDir, { recursive: true, force: true })
  console.log("✅ Cleared .next directory")
} else {
  console.log("ℹ️  .next directory doesn't exist")
}

// Step 2: Clear node_modules cache
console.log("\n2️⃣ Clearing node_modules cache...")
const nodeModulesDir = "node_modules"
if (existsSync(nodeModulesDir)) {
  rmSync(nodeModulesDir, { recursive: true, force: true })
  console.log("✅ Cleared node_modules directory")
} else {
  console.log("ℹ️  node_modules directory doesn't exist")
}

// Step 3: Clear package lock
console.log("\n3️⃣ Clearing package lock...")
const packageLock = "package-lock.json"
if (existsSync(packageLock)) {
  rmSync(packageLock, { force: true })
  console.log("✅ Cleared package-lock.json")
}

const yarnLock = "yarn.lock"
if (existsSync(yarnLock)) {
  rmSync(yarnLock, { force: true })
  console.log("✅ Cleared yarn.lock")
}

// Step 4: Reinstall dependencies
console.log("\n4️⃣ Reinstalling dependencies...")
try {
  execSync("npm install", { stdio: "inherit" })
  console.log("✅ Dependencies reinstalled successfully")
} catch (error) {
  console.log("❌ Failed to reinstall dependencies")
  console.log("Please run 'npm install' manually")
  process.exit(1)
}

// Step 5: Generate Prisma client
console.log("\n5️⃣ Generating Prisma client...")
try {
  execSync("npx prisma generate", { stdio: "inherit" })
  console.log("✅ Prisma client generated successfully")
} catch (error) {
  console.log("⚠️  Prisma generation failed (this is okay if database isn't set up yet)")
}

// Step 6: Try a clean build
console.log("\n6️⃣ Attempting clean build...")
try {
  execSync("npm run build", { stdio: "inherit" })
  console.log("\n🎉 Build completed successfully!")
  console.log("✅ Error './9379.js' has been resolved!")
} catch (error) {
  console.log("\n⚠️  Build still has issues. Trying development mode...")
  try {
    console.log("Starting development server to check for runtime errors...")
    execSync("timeout 10s npm run dev || true", { stdio: "inherit" })
  } catch (devError) {
    console.log("Please check the development server output above for specific errors")
  }
}

console.log("\n📋 If the error persists, try these manual steps:")
console.log("1. Delete .next folder: rm -rf .next")
console.log("2. Delete node_modules: rm -rf node_modules")
console.log("3. Delete package-lock.json: rm package-lock.json")
console.log("4. Reinstall: npm install")
console.log("5. Build: npm run build")
