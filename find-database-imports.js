#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Find all API route files that import from database.ts
function findDatabaseImports(dir) {
  const files = [];
  
  function scanDirectory(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else if (item === 'route.ts' || item === 'route.js') {
        const content = fs.readFileSync(fullPath, 'utf8');
        
        // Check if file imports from database.ts
        if (content.includes('from "@/lib/database"') || 
            content.includes('from "@/lib/prisma"') ||
            content.includes('prisma') && content.includes('database')) {
          files.push(fullPath);
        }
      }
    }
  }
  
  scanDirectory(dir);
  return files;
}

// Main execution
const apiDir = path.join(__dirname, 'app', 'api');
const files = findDatabaseImports(apiDir);

console.log('Files that import from database.ts:');
files.forEach(file => {
  console.log(`- ${file}`);
});

console.log(`\nTotal files: ${files.length}`);
