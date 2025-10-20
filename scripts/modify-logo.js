const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const outputPath = path.join(__dirname, '../public/images/Gemurai-logo.png');

// Create a new image with transparent background
sharp({
  create: {
    width: 800,
    height: 300,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background
  }
})
.composite([
  {
    input: Buffer.from(`
      <svg width="800" height="300">
        <style>
          .title { fill: #FF4512; font-size: 120px; font-weight: bold; font-family: Arial; }
          .subtitle { fill: #FF4512; font-size: 32px; font-family: Arial; }
          .frame { fill: none; stroke: #FF4512; stroke-width: 3; }
        </style>
        <!-- Measure text width for frame -->
        <text x="-1000" y="-1000" class="title" id="measure">Gemurai</text>
        <!-- Frame around Gemurai -->
        <rect x="40" y="50" width="320" height="120" rx="15" class="frame" />
        <!-- Corner decorations -->
        <circle cx="40" cy="50" r="6" fill="#FF4512" />
        <circle cx="360" cy="50" r="6" fill="#FF4512" />
        <circle cx="40" cy="170" r="6" fill="#FF4512" />
        <circle cx="360" cy="170" r="6" fill="#FF4512" />
        <!-- Logo text -->
        <text x="50" y="150" class="title">Gemurai</text>
        <text x="50" y="220" class="subtitle">Digital Community Platform</text>
      </svg>`
    ),
    top: 0,
    left: 0
  }
])
.png()
.toFile(outputPath)
.then(() => {
  console.log('Logo created successfully');
})
.catch(err => {
  console.error('Error creating logo:', err);
}); 