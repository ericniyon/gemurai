import { mkdir } from 'fs/promises'
import { join } from 'path'

async function setup() {
  try {
    // Ensure uploads directory exists
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadsDir, { recursive: true })
    console.log('✓ Created uploads directory')

    console.log('Setup completed successfully!')
  } catch (error) {
    console.error('Setup failed:', error)
    process.exit(1)
  }
}

setup() 