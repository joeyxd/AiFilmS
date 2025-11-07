const fs = require('fs');
const path = require('path');

/**
 * Converts a base64 string to an image file
 * @param {string} base64String - The base64 image data (with or without data: prefix)
 * @param {string} filename - The output filename (without extension)
 * @param {string} outputDir - Directory to save the image
 * @returns {string} - Path to saved image
 */
function convertBase64ToImage(base64String, filename, outputDir = './test-results/images/openrouter') {
    try {
        // Create output directory if it doesn't exist
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Clean the base64 string - remove data URL prefix if present
        let cleanBase64 = base64String;
        if (base64String.includes(',')) {
            cleanBase64 = base64String.split(',')[1];
        }

        // Determine image format from data URL or default to png
        let format = 'png';
        if (base64String.includes('data:image/')) {
            const formatMatch = base64String.match(/data:image\/([^;]+)/);
            if (formatMatch) {
                format = formatMatch[1];
            }
        }

        // Convert base64 to buffer
        const imageBuffer = Buffer.from(cleanBase64, 'base64');
        
        // Create filename with extension
        const fullFilename = `${filename}.${format}`;
        const outputPath = path.join(outputDir, fullFilename);

        // Write the image file
        fs.writeFileSync(outputPath, imageBuffer);

        const stats = fs.statSync(outputPath);
        console.log(`✅ Image saved: ${outputPath}`);
        console.log(`📦 Size: ${(stats.size / 1024).toFixed(1)} KB`);

        return outputPath;

    } catch (error) {
        console.error('❌ Error converting base64 to image:', error.message);
        throw error;
    }
}

module.exports = { convertBase64ToImage };

// If run directly, provide usage example
if (require.main === module) {
    console.log('🖼️  Base64 to Image Converter');
    console.log('Usage: node convert-base64-image.cjs');
    console.log('Or require this module and call convertBase64ToImage(base64String, filename, outputDir)');
}
