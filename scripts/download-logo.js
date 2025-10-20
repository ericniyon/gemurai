const https = require('https');
const fs = require('fs');
const path = require('path');

const logoUrl = 'https://Gemurai.rw/frontend/assets/logo.png';
const filename = 'Gemurai-logo.png';

const downloadLogo = () => {
  const imagePath = path.join(__dirname, '../public/images', filename);
  
  // Create directory if it doesn't exist
  const dir = path.dirname(imagePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  https.get(logoUrl, (response) => {
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

downloadLogo(); 