import { HERO_IMAGES } from '../lib/constants/hero-images'
import fs from 'fs'
import path from 'path'
import https from 'https'

// Configuration for placeholder images
const PLACEHOLDER_CONFIG = {
  width: 1920,
  height: 1080,
  service: 'https://placehold.co',
  text_color: 'fff',
  background_color: '1a365d'
}

// Function to download an image
const downloadImage = (url: string, filepath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(filepath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode}`))
        return
      }

      const fileStream = fs.createWriteStream(filepath)
      response.pipe(fileStream)

      fileStream.on('finish', () => {
        fileStream.close()
        resolve()
      })

      fileStream.on('error', reject)
    }).on('error', reject)
  })
}

// Function to generate placeholder URL
const generatePlaceholderUrl = (text: string) => {
  const encodedText = encodeURIComponent(text)
  return `${PLACEHOLDER_CONFIG.service}/${PLACEHOLDER_CONFIG.width}x${PLACEHOLDER_CONFIG.height}/${PLACEHOLDER_CONFIG.background_color}/${PLACEHOLDER_CONFIG.text_color}?text=${encodedText}`
}

async function generatePlaceholders() {
  const heroDir = path.join(process.cwd(), 'public/images/hero')

  // Ensure hero directory exists
  if (!fs.existsSync(heroDir)) {
    fs.mkdirSync(heroDir, { recursive: true })
  }

  // Generate landing page images
  for (const image of HERO_IMAGES.landing) {
    const filename = path.basename(image.path)
    const filepath = path.join(heroDir, filename)
    const placeholderUrl = generatePlaceholderUrl(image.alt)
    
    console.log(`Generating: ${filename}`)
    await downloadImage(placeholderUrl, filepath)
  }

  // Generate section images
  for (const [section, image] of Object.entries(HERO_IMAGES.sections)) {
    const filename = path.basename(image.path)
    const filepath = path.join(heroDir, filename)
    const placeholderUrl = generatePlaceholderUrl(image.alt)
    
    console.log(`Generating: ${filename}`)
    await downloadImage(placeholderUrl, filepath)
  }

  console.log('All placeholder images generated successfully!')
}

// Run the script
generatePlaceholders().catch(console.error) 