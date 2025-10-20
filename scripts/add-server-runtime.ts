import fs from 'fs'
import path from 'path'

const apiDir = path.join(process.cwd(), 'app', 'api')

function addServerRuntime(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf8')
  
  // Skip if runtime is already defined
  if (content.includes('export const runtime')) {
    return
  }

  // Add runtime after imports
  const lines = content.split('\n')
  const importEndIndex = lines.findIndex((line, index) => {
    const nextLine = lines[index + 1] || ''
    return line.trim().startsWith('import') && !nextLine.trim().startsWith('import')
  })

  if (importEndIndex === -1) {
    // No imports found, add at the beginning
    lines.unshift('export const runtime = "nodejs"', '')
  } else {
    // Add after imports
    lines.splice(importEndIndex + 1, 0, '', 'export const runtime = "nodejs"')
  }

  fs.writeFileSync(filePath, lines.join('\n'))
  console.log(`✅ Added runtime config to ${filePath}`)
}

function processDirectory(dir: string) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      processDirectory(fullPath)
    } else if (entry.name === 'route.ts' || entry.name === 'route.tsx') {
      addServerRuntime(fullPath)
    }
  }
}

// Start processing from the api directory
processDirectory(apiDir)
console.log('✅ Finished adding runtime config to all API routes') 