const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration for placeholder images
const IMAGES = [
  {
    filename: 'dcc-training.jpg',
    text: 'Digital Community Champions Training Session',
    alt: 'Young Rwandans participating in digital skills training'
  },
  {
    filename: 'health-outreach.jpg',
    text: 'Community Health Outreach Program',
    alt: 'Healthcare workers engaging with local community'
  },
  {
    filename: 'tech-education.jpg',
    text: 'Technology Education Initiative',
    alt: 'Students learning digital skills in a modern setting'
  },
  {
    filename: 'community-innovation.jpg',
    text: 'Community Innovation Hub',
    alt: 'Local innovators working on community projects'
  },
  {
    filename: 'about-hero.jpg',
    text: 'About Gemurai Platform',
    alt: 'Team members collaborating on digital solutions'
  },
  {
    filename: 'learning-hero.jpg',
    text: 'Learning and Development',
    alt: 'Interactive learning session with technology'
  },
  {
    filename: 'jobs-hero.jpg',
    text: 'Career Opportunities',
    alt: 'Professional development and job training'
  }
];

const PLACEHOLDER_CONFIG = {
  width: 1920,
  height: 1080,
  service: 'https://placehold.co',
  text_color: 'fff',
  background_color: '1a365d'
};

// Function to download an image
const downloadImage = (url, filepath) => {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(filepath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });

      fileStream.on('error', reject);
    }).on('error', reject);
  });
};

// Function to generate placeholder URL
const generatePlaceholderUrl = (text) => {
  const encodedText = encodeURIComponent(text);
  return `${PLACEHOLDER_CONFIG.service}/${PLACEHOLDER_CONFIG.width}x${PLACEHOLDER_CONFIG.height}/${PLACEHOLDER_CONFIG.background_color}/${PLACEHOLDER_CONFIG.text_color}?text=${encodedText}`;
};

async function generatePlaceholders() {
  const heroDir = path.join(__dirname, '../public/images/hero');

  // Ensure hero directory exists
  if (!fs.existsSync(heroDir)) {
    fs.mkdirSync(heroDir, { recursive: true });
  }

  // Generate all images
  for (const image of IMAGES) {
    const filepath = path.join(heroDir, image.filename);
    const placeholderUrl = generatePlaceholderUrl(image.text);
    
    console.log(`Generating: ${image.filename}`);
    try {
      await downloadImage(placeholderUrl, filepath);
      console.log(`Successfully generated: ${image.filename}`);
    } catch (error) {
      console.error(`Error generating ${image.filename}:`, error);
    }
  }

  console.log('All placeholder images generated successfully!');
}

// Run the script
generatePlaceholders().catch(console.error); 