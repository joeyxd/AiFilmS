/**
 * Simplified test script for OpenRouter image generation
 * Tests the complete flow: API call -> Base64 detection -> Image saving
 */

const fs = require('fs');
const path = require('path');

// Image utilities for Node.js
class ImageUtils {
  extractBase64FromResponse(response) {
    const base64Images = [];
    
    try {
      console.log('🔍 Analyzing response for image data...');
      
      // Method 1: Check for OpenRouter specific format (message.images array)
      if (response && typeof response === 'object') {
        // Handle OpenRouter response format
        if (response.choices && response.choices[0] && response.choices[0].message && response.choices[0].message.images) {
          const images = response.choices[0].message.images;
          console.log(`✅ Found OpenRouter images array with ${images.length} image(s)`);
          for (const image of images) {
            if (image.image_url && image.image_url.url) {
              const dataUrlMatch = image.image_url.url.match(/data:image\/[^;]+;base64,([A-Za-z0-9+/=]+)/);
              if (dataUrlMatch) {
                console.log(`✅ Extracted image from OpenRouter format`);
                base64Images.push(image.image_url.url); // Return full data URL
              }
            }
          }
          if (base64Images.length > 0) {
            return base64Images;
          }
        }
        
        // Handle direct images array format
        if (response.images && Array.isArray(response.images)) {
          console.log(`✅ Found direct images array with ${response.images.length} image(s)`);
          for (const image of response.images) {
            if (image.image_url && image.image_url.url) {
              const dataUrlMatch = image.image_url.url.match(/data:image\/[^;]+;base64,([A-Za-z0-9+/=]+)/);
              if (dataUrlMatch) {
                base64Images.push(image.image_url.url);
              }
            }
          }
          if (base64Images.length > 0) {
            return base64Images;
          }
        }
      }
      
      const responseContent = typeof response === 'string' ? response : JSON.stringify(response);
      console.log(`📝 Fallback - Response length: ${responseContent.length} characters`);
      
      // Method 2: Look for data:image/ URLs
      const dataUrlRegex = /data:image\/[^;]+;base64,([A-Za-z0-9+/=]+)/g;
      const dataUrlMatch = responseContent.match(dataUrlRegex);
      if (dataUrlMatch && dataUrlMatch.length > 0) {
        console.log(`✅ Found ${dataUrlMatch.length} data URL format image(s)`);
        return dataUrlMatch;
      }

      // Method 3: Look for standalone base64 strings
      const base64Regex = /([A-Za-z0-9+/]{100,}={0,2})/g;
      const base64Matches = responseContent.match(base64Regex);
      if (base64Matches && base64Matches.length > 0) {
        for (const match of base64Matches) {
          if (match.length > 1000) { // Reasonable size for image data
            console.log(`✅ Found raw base64 format image (${match.length} chars)`);
            base64Images.push(`data:image/png;base64,${match}`);
          }
        }
        if (base64Images.length > 0) {
          return base64Images;
        }
      }

      // Method 4: Look for markdown image syntax
      const markdownImageRegex = /!\[.*?\]\(data:image\/[^)]+\)/g;
      const markdownImageMatch = responseContent.match(markdownImageRegex);
      if (markdownImageMatch) {
        for (const match of markdownImageMatch) {
          const urlMatch = match.match(/data:image\/[^)]+/);
          if (urlMatch) {
            console.log('✅ Found markdown format image');
            base64Images.push(urlMatch[0]);
          }
        }
      }

      console.log('❌ No base64 image data detected');
      return [];
    } catch (error) {
      console.error('❌ Error extracting base64:', error.message);
      return [];
    }
  }

  isValidBase64Image(data) {
    try {
      if (data.startsWith('data:image/')) {
        const base64Part = data.split(',')[1];
        if (!base64Part) return false;
        
        Buffer.from(base64Part, 'base64');
        return true;
      }
      
      if (data.length > 100 && /^[A-Za-z0-9+/]+={0,2}$/.test(data)) {
        Buffer.from(data, 'base64');
        return true;
      }
      
      return false;
    } catch (error) {
      return false;
    }
  }

  async saveBase64Image(base64Data, fileName, outputDir = './test-results/images/generated') {
    try {
      // Create output directory
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Get image format
      const formatMatch = base64Data.match(/data:image\/([^;]+)/);
      const format = formatMatch ? formatMatch[1] : 'png';
      
      // Generate filename if not provided
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const finalFileName = fileName || `openrouter-image-${timestamp}.${format}`;

      // Clean base64 data
      let cleanBase64 = base64Data;
      if (base64Data.includes(',')) {
        cleanBase64 = base64Data.split(',')[1];
      }

      // Convert to buffer and save
      const imageBuffer = Buffer.from(cleanBase64, 'base64');
      const outputPath = path.join(outputDir, finalFileName);
      
      fs.writeFileSync(outputPath, imageBuffer);

      const stats = fs.statSync(outputPath);
      console.log(`✅ Image saved to: ${outputPath}`);
      console.log(`📦 Size: ${(stats.size / 1024).toFixed(1)} KB`);

      return {
        success: true,
        fileName: finalFileName,
        size: stats.size,
        filePath: outputPath
      };

    } catch (error) {
      console.error('❌ Error saving image:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// OpenRouter service
class OpenRouterImageService {
  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY;
    this.baseUrl = 'https://openrouter.ai/api/v1';
    this.imageUtils = new ImageUtils();
  }

  async generateImage(prompt, options = {}) {
    console.log('🎨 OpenRouter Image Generation');
    console.log(`📝 Prompt: "${prompt}"`);
    
    if (!this.apiKey) {
      throw new Error('❌ OPENROUTER_API_KEY not found in environment variables');
    }

    try {
      const modelId = options.model || 'google/gemini-2.5-flash-image-preview';
      
      const messages = [
        {
          role: 'system',
          content: 'You are an AI image generator. Generate a detailed image based on the user\'s prompt.'
        },
        {
          role: 'user',
          content: `Generate an image: ${prompt}`
        }
      ];

      const request = {
        model: modelId,
        messages,
        max_tokens: 4096,
        temperature: 0.8,
        top_p: 1.0
      };

      console.log('🔄 Making OpenRouter API request...');
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'FilmStudio AI Test'
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`API Error ${response.status}: ${errorData}`);
      }

      const data = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response from OpenRouter API');
      }

      const responseContent = data.choices[0].message.content;
      console.log(`✅ OpenRouter response received`);
      console.log(`📊 Usage: ${data.usage?.total_tokens || 'unknown'} tokens`);

      // Extract and process image data (now returns array)
      const base64DataArray = this.imageUtils.extractBase64FromResponse(data);
      
      let downloadResults = [];

      if (base64DataArray.length > 0) {
        console.log(`🖼️ Found ${base64DataArray.length} valid base64 image(s)!`);
        
        if (options.autoSave !== false) {
          console.log(`💾 Auto-saving ${base64DataArray.length} image(s)...`);
          
          for (let i = 0; i < base64DataArray.length; i++) {
            const base64Data = base64DataArray[i];
            if (this.imageUtils.isValidBase64Image(base64Data)) {
              const fileName = base64DataArray.length > 1 
                ? `${options.fileName || 'openrouter-image'}-${i + 1}`
                : options.fileName;
              
              const downloadResult = await this.imageUtils.saveBase64Image(
                base64Data,
                fileName
              );
              
              downloadResults.push(downloadResult);
            }
          }
        }

        return {
          success: true,
          content: responseContent,
          imageData: base64DataArray,
          downloadResults,
          usage: data.usage
        };
      } else {
        console.log('📝 No base64 image data found - text response only');
        
        return {
          success: true,
          content: responseContent,
          usage: data.usage,
          hasImage: false
        };
      }

    } catch (error) {
      console.error('❌ Generation failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Test function
async function runImageTest() {
  console.log('🧪 OpenRouter Image Generation System Test');
  console.log('='.repeat(50));
  
  const service = new OpenRouterImageService();
  
  const testPrompts = [
    'A cute robot painting a landscape',
    'A cyberpunk city at night with neon lights'
  ];

  for (let i = 0; i < testPrompts.length; i++) {
    const prompt = testPrompts[i];
    console.log(`\n🎨 Test ${i + 1}/${testPrompts.length}`);
    console.log('-'.repeat(30));
    
    try {
      const startTime = Date.now();
      
      const result = await service.generateImage(prompt, {
        autoSave: true,
        fileName: `test-${i + 1}-${Date.now()}.png`
      });

      const duration = Date.now() - startTime;
      console.log(`⏱️ Duration: ${duration}ms`);
      
      console.log('\n📊 Results:');
      console.log(`✅ Success: ${result.success}`);
      
      if (result.success) {
        console.log(`📝 Response length: ${result.content.length} chars`);
        console.log(`🖼️ Has image: ${!!result.imageData}`);
        console.log(`💾 Saved: ${result.downloadResult?.success || false}`);
        
        if (result.downloadResult?.success) {
          console.log(`📁 File: ${result.downloadResult.fileName}`);
          console.log(`📦 Size: ${(result.downloadResult.size / 1024).toFixed(1)} KB`);
        }
        
        if (result.usage) {
          console.log(`🔢 Tokens: ${result.usage.total_tokens}`);
        }
        
        // Show response preview
        console.log('\n📄 Response preview (first 200 chars):');
        console.log(`"${result.content.substring(0, 200)}${result.content.length > 200 ? '...' : ''}"`);
        
      } else {
        console.log(`❌ Error: ${result.error}`);
      }

    } catch (error) {
      console.error(`❌ Test ${i + 1} failed:`, error.message);
    }
    
    // Brief pause between tests
    if (i < testPrompts.length - 1) {
      console.log('\n⏳ Waiting 2 seconds...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log('\n🏁 Test completed!');
  console.log('📁 Check ./test-results/images/generated/ for any saved images');
}

// Run the test
if (require.main === module) {
  runImageTest()
    .then(() => {
      console.log('\n✅ Image generation system test completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Test failed:', error.message);
      process.exit(1);
    });
}

module.exports = { OpenRouterImageService, ImageUtils };
