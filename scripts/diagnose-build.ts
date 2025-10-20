#!/usr/bin/env node

import { existsSync, readFileSync } from "fs"

console.log("🔍 Diagnosing build issues...\n")

// Check for common problematic files
const problematicPatterns = ["import.*from.*'.*\\.js'", "require.*'.*\\.js'", "import.*from.*'\\./[0-9]+\\.js'"]

const filesToCheck = [
  "app/admin/roles/page.tsx",
  "components/ui/scroll-area.tsx",
  "components/ui/dialog.tsx",
  "components/ui/checkbox.tsx",
]

console.log("📁 Checking for problematic imports...")
for (const file of filesToCheck) {
  if (existsSync(file)) {
    const content = readFileSync(file, "utf-8")

    for (const pattern of problematicPatterns) {
      const regex = new RegExp(pattern, "g")
      const matches = content.match(regex)

      if (matches) {
        console.log(`⚠️  Found problematic import in ${file}:`)
        matches.forEach((match) => console.log(`   ${match}`))
      }
    }
    console.log(`✅ ${file} - OK`)
  } else {
    console.log(`❌ ${file} - MISSING`)
  }
}

// Check package.json dependencies
console.log("\n📦 Checking dependencies...")
if (existsSync("package.json")) {
  const packageJson = JSON.parse(readFileSync("package.json", "utf-8"))
  const requiredDeps = [
    "@radix-ui/react-scroll-area",
    "@radix-ui/react-dialog",
    "@radix-ui/react-checkbox",
    "@radix-ui/react-label",
  ]

  for (const dep of requiredDeps) {
    if (packageJson.dependencies[dep]) {
      console.log(`✅ ${dep} - ${packageJson.dependencies[dep]}`)
    } else {
      console.log(`❌ ${dep} - MISSING`)
    }
  }
}

console.log("\n🔧 Recommended fixes:")
console.log("1. Run: npm run fix-build")
console.log("2. Or manually: npm run clean")
console.log("3. Check for any dynamic imports in your components")
console.log("4. Ensure all @radix-ui dependencies are installed")
