/**
 * Quick verification script to check that saved images are valid
 */

const fs = require('fs');
const path = require('path');

function verifyImage(filePath) {
  try {
    const stats = fs.statSync(filePath);
    const buffer = fs.readFileSync(filePath);
    
    // Check PNG signature (first 8 bytes)
    const pngSignature = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
    const isPNG = pngSignature.every((byte, index) => buffer[index] === byte);
    
    return {
      exists: true,
      size: stats.size,
      validPNG: isPNG,
      sizeKB: Math.round(stats.size / 1024 * 10) / 10
    };
  } catch (error) {
    return {
      exists: false,
      error: error.message
    };
  }
}

console.log('🔍 Verifying Generated Images');
console.log('=' .repeat(50));

const imageDir = './test-results/images/generated/';
const files = fs.readdirSync(imageDir);

files.forEach((file, index) => {
  if (file.endsWith('.png')) {
    const filePath = path.join(imageDir, file);
    const result = verifyImage(filePath);
    
    console.log(`\n📸 Image ${index + 1}: ${file}`);
    console.log(`   Size: ${result.sizeKB} KB`);
    console.log(`   Valid PNG: ${result.validPNG ? '✅' : '❌'}`);
    console.log(`   Status: ${result.exists ? '✅ Valid' : '❌ Error'}`);
  }
});

console.log('\n✅ Image verification complete!');
