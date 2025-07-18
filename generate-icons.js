// Simple script to generate PWA icons
// Run with: node generate-icons.js

const fs = require('fs');
const path = require('path');

// Create a simple SVG icon
const svgIcon = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#1a1a1a"/>
  <circle cx="256" cy="256" r="200" fill="#4CAF50"/>
  <path d="M 200 180 L 200 332 L 340 256 Z" fill="#1a1a1a"/>
</svg>`;

// Save SVG
fs.writeFileSync(path.join(__dirname, 'public', 'icon.svg'), svgIcon);

console.log('Icon generated! You can convert it to PNG using:');
console.log('- Online tools like https://cloudconvert.com/svg-to-png');
console.log('- Or install ImageMagick and run:');
console.log('  gm convert -background none public/icon.svg -resize 192x192 public/pwa-192x192.png');
console.log('  gm convert -background none public/icon.svg -resize 512x512 public/pwa-512x512.png');
