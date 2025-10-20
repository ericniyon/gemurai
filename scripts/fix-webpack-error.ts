#!/usr/bin/env node

import { execSync } from "child_process"
import { existsSync, readFileSync, writeFileSync } from "fs"

console.log("🔧 Fixing webpack DefinePlugin error\n")

// Check if next.config.mjs exists
const configPath = "next.config.mjs"
if (!existsSync(configPath)) {
  console.error(`❌ ${configPath} not found!`)
  process.exit(1)
}

// Read the current config
const currentConfig = readFileSync(configPath, "utf-8")

// Check if the config contains the problematic code
if (currentConfig.includes("config.webpack.DefinePlugin")) {
  console.log("🔍 Found problematic webpack configuration")

  // Replace the problematic code
  const fixedConfig = currentConfig.replace(/config\.webpack\.DefinePlugin/g, "webpack.DefinePlugin")

  // Write the fixed config
  writeFileSync(configPath, fixedConfig)
  console.log("✅ Fixed webpack configuration")

  // Update package.json to add the fix script
  const packageJsonPath = "package.json"
  if (existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"))

    if (!packageJson.scripts["fix-webpack"]) {
      packageJson.scripts["fix-webpack"] = "tsx scripts/fix-webpack-error.ts"
      writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
      console.log("✅ Added fix-webpack script to package.json")
    }
  }

  // Try to build
  console.log("\n🔄 Attempting to build with fixed configuration...")
  try {
    execSync("npm run build", { stdio: "inherit" })
    console.log("\n🎉 Build successful!")
  } catch (error) {
    console.error("\n❌ Build failed. There might be additional issues.")
    console.log("\nTry running: npm run clean && npm run build")
  }
} else {
  console.log("✅ No webpack configuration issues found")
}
