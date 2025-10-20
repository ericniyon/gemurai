const https = require('https');
const fs = require('fs');
const path = require('path');

const images = [
  {
    url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1920&q=80", // People collaborating with technology
    filename: "hero-1.jpg"
  },
  {
    url: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=1920&q=80", // Community meeting
    filename: "hero-2.jpg"
  },
  {
    url: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1920&q=80", // Business growth/impact
    filename: "hero-3.jpg"
  }
];

const downloadImage = (url, filename) => {
  const imagePath = path.join(__dirname, '../public/images', filename);
  
  // Create directory if it doesn't exist
  const dir = path.dirname(imagePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  https.get(url, (response) => {
    const fileStream = fs.createWriteStream(imagePath);
    response.pipe(fileStream);

    fileStream.on('finish', () => {
      fileStream.close();
      console.log(`Downloaded ${filename}`);
    });
  }).on('error', (err) => {
    console.error(`Error downloading ${filename}:`, err.message);
  });
};

// Download all images
images.forEach(image => {
  downloadImage(image.url, image.filename);
}); 