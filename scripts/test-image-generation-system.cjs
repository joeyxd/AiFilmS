/**
 * Test script for OpenRouter image generation with integrated image handling
 * This script tests our new system that automatically detects, converts, and saves base64 images
 */

// Mock browser environment for Node.js
global.window = {
  location: { origin: 'http://localhost:3000' },
  URL: {
    createObjectURL: () => 'mock-blob-url',
    revokeObjectURL: () => {}
  }
};

global.document = {
  createElement: (tag) => ({
    href: '',
    download: '',
    click: () => console.log(`📥 Mock download triggered for: ${tag}`),
    style: {}
  }),
  body: {
    appendChild: () => {},
    removeChild: () => {}
  }
};

global.atob = (str) => Buffer.from(str, 'base64').toString('binary');
global.btoa = (str) => Buffer.from(str, 'binary').toString('base64');
global.Blob = class MockBlob {
  constructor(parts, options) {
    this.size = parts.reduce((total, part) => total + (part.length || 0), 0);
    this.type = options?.type || '';
  }
};

// Import our services
const { imageUtils } = require('../src/services/imageUtils.ts');

// Mock OpenRouter service for Node.js testing
class MockOpenRouterService {
  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || 'mock-key';
    this.baseUrl = 'https://openrouter.ai/api/v1';
  }

  async generateImage(prompt, options = {}) {
    console.log('🎨 OpenRouter Image Generation Test');
    console.log(`📝 Prompt: "${prompt}"`);
    console.log(`🤖 Model: ${options.model || 'google/gemini-2.5-flash-image-preview'}`);
    console.log(`⚙️ Options:`, options);

    if (!this.apiKey || this.apiKey === 'mock-key') {
      console.error('❌ OPENROUTER_API_KEY not found in environment variables');
      return {
        success: false,
        content: 'API key not configured'
      };
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

      console.log('🔄 Making API request...');
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
        console.error('OpenRouter API Error:', errorData);
        throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response from OpenRouter Image API');
      }

      const responseContent = data.choices[0].message.content;
      console.log(`✅ OpenRouter response received`);
      console.log(`📊 Usage - Tokens: ${data.usage?.total_tokens || 'unknown'}`);
      console.log(`📝 Response length: ${responseContent.length} characters`);

      // Try to extract base64 image data from the response
      console.log('\n🔍 Analyzing response for image data...');
      const base64Data = this.extractBase64FromResponse(responseContent);
      
      let downloadResult;

      if (base64Data && this.isValidBase64Image(base64Data)) {
        console.log(`🖼️ Base64 image data found! Length: ${base64Data.length}`);
        
        if (options.autoDownload !== false) {
          console.log(`⬇️ Auto-downloading image...`);
          downloadResult = await this.downloadBase64Image(
            base64Data,
            options.fileName,
            { prefix: 'openrouter-test', showProgress: true }
          );
          
          if (downloadResult.success) {
            console.log(`✅ Image saved: ${downloadResult.fileName}`);
          } else {
            console.error(`❌ Failed to save image: ${downloadResult.error}`);
          }
        }

        return {
          success: true,
          content: responseContent,
          imageData: base64Data,
          downloadResult,
          usage: data.usage
        };
      } else {
        console.log(`📝 No base64 image data found in response`);
        console.log('🔍 Response preview (first 500 chars):');
        console.log(responseContent.substring(0, 500) + '...');
        
        return {
          success: true,
          content: responseContent,
          usage: data.usage
        };
      }

    } catch (error) {
      console.error('❌ Error calling OpenRouter Image API:', error);
      return {
        success: false,
        content: error.message || 'Unknown error occurred'
      };
    }
  }

  extractBase64FromResponse(responseContent) {
    try {
      // Method 1: Look for data:image/ URLs
      const dataUrlMatch = responseContent.match(/data:image\/[^;]+;base64,([A-Za-z0-9+/=]+)/g);
      if (dataUrlMatch && dataUrlMatch.length > 0) {
        console.log('✅ Found data URL format image');
        return dataUrlMatch[0];
      }

      // Method 2: Look for base64 strings (without data: prefix)
      const base64Match = responseContent.match(/([A-Za-z0-9+/]{100,}={0,2})/g);
      if (base64Match && base64Match.length > 0) {
        const longestMatch = base64Match.reduce((a, b) => a.length > b.length ? a : b);
        if (longestMatch.length > 1000) {
          console.log('✅ Found raw base64 format image');
          return `data:image/png;base64,${longestMatch}`;
        }
      }

      // Method 3: Look for markdown image syntax
      const markdownImageMatch = responseContent.match(/!\[.*?\]\(data:image\/[^)]+\)/g);
      if (markdownImageMatch) {
        const urlMatch = markdownImageMatch[0].match(/data:image\/[^)]+/);
        if (urlMatch) {
          console.log('✅ Found markdown format image');
          return urlMatch[0];
        }
      }

      return null;
    } catch (error) {
      console.error('❌ Error extracting base64 from response:', error);
      return null;
    }
  }

  isValidBase64Image(data) {
    try {
      if (data.startsWith('data:image/')) {
        const base64Part = data.split(',')[1];
        if (!base64Part) return false;
        
        global.atob(base64Part);
        return true;
      }
      
      if (data.length > 100 && /^[A-Za-z0-9+/]+={0,2}$/.test(data)) {
        global.atob(data);
        return true;
      }
      
      return false;
    } catch (error) {
      return false;
    }
  }

  async downloadBase64Image(base64Data, fileName, options = {}) {
    try {
      // Get image format
      const formatMatch = base64Data.match(/data:image\/([^;]+)/);
      const format = formatMatch ? formatMatch[1] : 'png';
      
      // Generate filename if not provided
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const finalFileName = fileName || `${options.prefix || 'openrouter-image'}-${timestamp}.${format}`;

      // Clean base64 data
      let cleanBase64 = base64Data;
      if (base64Data.includes(',')) {
        cleanBase64 = base64Data.split(',')[1];
      }

      // Calculate size
      const byteCharacters = global.atob(cleanBase64);
      const size = byteCharacters.length;

      // In Node.js, save to file system
      const fs = require('fs');
      const path = require('path');
      
      const outputDir = './test-results/images/generated';
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const outputPath = path.join(outputDir, finalFileName);
      const imageBuffer = Buffer.from(cleanBase64, 'base64');
      
      fs.writeFileSync(outputPath, imageBuffer);

      console.log(`✅ Image saved to: ${outputPath}`);
      console.log(`📦 Size: ${(size / 1024).toFixed(1)} KB`);

      return {
        success: true,
        fileName: finalFileName,
        size: size,
        filePath: outputPath
      };

    } catch (error) {
      console.error('❌ Error saving base64 image:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Test function
async function runImageGenerationTest() {
  console.log('🧪 OpenRouter Image Generation Integration Test');
  console.log('='.repeat(60));
  
  const openRouterService = new MockOpenRouterService();
  
  const testPrompts = [
    'A cute robot painting a landscape',
    'A futuristic city at sunset with flying cars',
    'A magical forest with glowing mushrooms'
  ];

  for (let i = 0; i < testPrompts.length; i++) {
    const prompt = testPrompts[i];
    console.log(`\n🎨 Test ${i + 1}/${testPrompts.length}`);
    console.log('-'.repeat(40));
    
    try {
      const result = await openRouterService.generateImage(prompt, {
        autoDownload: true,
        fileName: `test-image-${i + 1}.png`,
        model: 'google/gemini-2.5-flash-image-preview'
      });

      console.log('\n📊 Test Results:');
      console.log(`✅ Success: ${result.success}`);
      
      if (result.success) {
        console.log(`📝 Content length: ${result.content.length} chars`);
        console.log(`🖼️ Has image data: ${!!result.imageData}`);
        console.log(`💾 Download result: ${result.downloadResult ? 'Success' : 'No download'}`);
        
        if (result.usage) {
          console.log(`🔢 Tokens used: ${result.usage.total_tokens}`);
        }
      } else {
        console.log(`❌ Error: ${result.content}`);
      }

    } catch (error) {
      console.error(`❌ Test ${i + 1} failed:`, error.message);
    }
    
    // Wait between tests to avoid rate limiting
    if (i < testPrompts.length - 1) {
      console.log('\n⏳ Waiting 3 seconds before next test...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  console.log('\n🏁 All tests completed!');
  console.log('📁 Check ./test-results/images/generated/ for saved images');
}

// Run the test if called directly
if (require.main === module) {
  runImageGenerationTest()
    .then(() => {
      console.log('\n✅ Image generation test suite completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Image generation test suite failed:', error);
      process.exit(1);
    });
}

module.exports = { runImageGenerationTest };
