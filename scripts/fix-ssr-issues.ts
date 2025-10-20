#!/usr/bin/env node

import fs from "fs"
import path from "path"

console.log("🔧 Fixing SSR and WorkerGlobalScope issues...")

// Create enhanced polyfills.js
const polyfillsPath = path.join(process.cwd(), "polyfills.js")
const polyfillsContent = `// Global polyfills for browser compatibility and SSR safety
(function() {
  'use strict';
  
  // Polyfill for self
  if (typeof self === 'undefined') {
    if (typeof window !== 'undefined') {
      window.self = window;
    } else if (typeof global !== 'undefined') {
      global.self = global;
    } else {
      var selfPolyfill = {};
      if (typeof globalThis !== 'undefined') {
        globalThis.self = selfPolyfill;
      }
    }
  }
  
  // Ensure self is available globally
  if (typeof window !== 'undefined' && typeof window.self === 'undefined') {
    window.self = window;
  }
  
  // Polyfill for WorkerGlobalScope (always undefined in main thread)
  if (typeof WorkerGlobalScope === 'undefined') {
    if (typeof window !== 'undefined') {
      window.WorkerGlobalScope = undefined;
    } else if (typeof global !== 'undefined') {
      global.WorkerGlobalScope = undefined;
    }
  }
  
  // Polyfill for importScripts (only available in workers)
  if (typeof importScripts === 'undefined') {
    if (typeof window !== 'undefined') {
      window.importScripts = undefined;
    } else if (typeof global !== 'undefined') {
      global.importScripts = undefined;
    }
  }
  
  // Additional browser API polyfills
  if (typeof window !== 'undefined') {
    if (!window.requestAnimationFrame) {
      window.requestAnimationFrame = function(callback) {
        return setTimeout(callback, 16);
      };
    }
    
    if (!window.cancelAnimationFrame) {
      window.cancelAnimationFrame = function(id) {
        clearTimeout(id);
      };
    }
  }
})();`

fs.writeFileSync(polyfillsPath, polyfillsContent)
console.log("✅ Created/updated polyfills.js with WorkerGlobalScope fixes")

// Check for problematic imports and patterns
const checkFile = (filePath: string) => {
  if (!fs.existsSync(filePath)) return

  const content = fs.readFileSync(filePath, "utf8")
  const issues: string[] = []

  // Check for direct WorkerGlobalScope usage
  if (content.includes("WorkerGlobalScope") && !content.includes("typeof WorkerGlobalScope")) {
    issues.push("Direct WorkerGlobalScope usage without type check")
  }

  // Check for direct self usage
  if (content.includes("self.") && !content.includes("typeof self")) {
    issues.push("Direct self usage without type check")
  }

  // Check for worker-related APIs
  if (content.includes("importScripts") && !content.includes("typeof importScripts")) {
    issues.push("Direct importScripts usage without type check")
  }

  // Check for missing "use client" directive
  if (content.includes("useState") || content.includes("useEffect")) {
    if (!content.includes('"use client"') && !content.includes("'use client'")) {
      issues.push('Missing "use client" directive for client-side hooks')
    }
  }

  if (issues.length > 0) {
    console.log(`⚠️  Issues in ${filePath}:`)
    issues.forEach((issue) => console.log(`   - ${issue}`))
  }
}

// Check common problematic files
const filesToCheck = [
  "app/admin/roles/page.tsx",
  "components/ui/scroll-area.tsx",
  "components/ui/dialog.tsx",
  "lib/browser-utils.ts",
  "lib/environment.ts",
  "components/ssr-safe.tsx",
]

filesToCheck.forEach(checkFile)

// Create .env.local with proper settings if it doesn't exist
const envPath = path.join(process.cwd(), ".env.local")
if (!fs.existsSync(envPath)) {
  const envContent = `# SSR and Build Configuration
NEXT_TELEMETRY_DISABLED=1
NODE_ENV=development

# Add your other environment variables here
`
  fs.writeFileSync(envPath, envContent)
  console.log("✅ Created .env.local with SSR-safe settings")
}

console.log("🎉 SSR and WorkerGlobalScope issue fixes complete!")
console.log("")
console.log("📋 Next steps:")
console.log("1. Delete .next folder: rm -rf .next")
console.log("2. Clear npm cache: npm cache clean --force")
console.log("3. Run: npm run build")
console.log("4. Run: npm run dev")
console.log("5. Test the application")
console.log("")
console.log('💡 If you still see "WorkerGlobalScope is not defined" errors:')
console.log("1. Check if any third-party libraries are causing issues")
console.log("2. Add specific library exclusions to next.config.mjs")
console.log("3. Use dynamic imports for problematic components")
console.log("4. Check browser console for specific error locations")

export default function fixSSRIssues() {
  console.log("SSR and WorkerGlobalScope issues fix script executed")
}
