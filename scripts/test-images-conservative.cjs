const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Test prompts (just one to test OpenRouter)
const TEST_PROMPTS = [
  "A cute robot painting a landscape on canvas in an art studio, digital art"
];

// Ensure test results directory exists
const resultsDir = path.join(__dirname, '..', 'test-results', 'images');
const downloadDir = path.join(resultsDir, 'downloaded');
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}
if (!fs.existsSync(downloadDir)) {
  fs.mkdirSync(downloadDir, { recursive: true });
}

// Download image from URL and save locally
async function downloadImage(url, filename) {
  try {
    console.log(`📥 Downloading: ${filename}...`);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const buffer = await response.buffer();
    const filepath = path.join(downloadDir, filename);
    fs.writeFileSync(filepath, buffer);
    
    const fileSizeKB = Math.round(buffer.length / 1024);
    console.log(`✅ Saved: ${filename} (${fileSizeKB} KB)`);
    return { filepath, sizeKB: fileSizeKB };
  } catch (error) {
    console.log(`❌ Download failed: ${error.message}`);
    return null;
  }
}

async function testOpenRouterImage(prompt, testNum) {
  console.log(`🎨 OpenRouter Test ${testNum}: "${prompt}"`);
  console.log('─'.repeat(60));
  
  const startTime = Date.now();
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'FilmStudio AI'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: `Generate an image: ${prompt}`
          }
        ],
        max_tokens: 1000
      })
    });

    const responseTime = Date.now() - startTime;
    
    if (!response.ok) {
      const errorData = await response.text();
      console.log(`❌ FAILED (${responseTime}ms)`);
      console.log(`💥 Error: HTTP ${response.status}: ${errorData}`);
      return { success: false, error: `HTTP ${response.status}: ${errorData}`, responseTime };
    }

    const data = await response.json();
    
    // Check credit usage if available
    let creditUsage = 'Unknown';
    if (data.usage) {
      console.log(`💰 Usage Info:`, JSON.stringify(data.usage, null, 2));
      creditUsage = data.usage;
    }
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      const content = data.choices[0].message.content;
      console.log(`✅ SUCCESS (${responseTime}ms)`);
      console.log(`💰 Credits used: ${JSON.stringify(creditUsage)}`);
      console.log(`📝 Response: ${content.substring(0, 200)}${content.length > 200 ? '...' : ''}`);
      
      // Check if response contains an image URL
      let imageUrl = null;
      let downloadResult = null;
      
      if (content.includes('http') && (content.includes('.png') || content.includes('.jpg') || content.includes('.jpeg'))) {
        // Extract URL from response
        const urlMatch = content.match(/https?:\/\/[^\s]+\.(png|jpg|jpeg)/i);
        if (urlMatch) {
          imageUrl = urlMatch[0];
          const filename = `openrouter_gemini_${Date.now()}.png`;
          downloadResult = await downloadImage(imageUrl, filename);
        }
      }
      
      return {
        success: true,
        response: content,
        responseTime,
        tokens: data.usage?.total_tokens || 0,
        creditUsage,
        imageUrl,
        downloadResult
      };
    } else {
      console.log(`❌ FAILED (${responseTime}ms)`);
      console.log(`💥 Invalid response format:`, JSON.stringify(data, null, 2));
      return { success: false, error: 'Invalid response format', responseTime };
    }

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.log(`❌ FAILED (${responseTime}ms)`);
    console.log(`💥 Error: ${error.message}`);
    return { success: false, error: error.message, responseTime };
  }
}

// Download images from previous test results
async function downloadPreviousImages() {
  console.log('📋 DOWNLOADING PREVIOUS OPENAI IMAGES');
  console.log('=' .repeat(60));
  
  try {
    const previousResultsFile = path.join(resultsDir, 'dual-test-results.json');
    if (fs.existsSync(previousResultsFile)) {
      const previousResults = JSON.parse(fs.readFileSync(previousResultsFile, 'utf8'));
      
      console.log('🔍 Found previous test results, downloading OpenAI images...');
      console.log();
      
      const downloadedImages = [];
      
      for (let i = 0; i < previousResults.openai.results.length; i++) {
        const result = previousResults.openai.results[i];
        if (result.success && result.imageUrl) {
          const filename = `previous_openai_test${i + 1}.png`;
          console.log(`📥 Image ${i + 1}: "${result.prompt}"`);
          console.log(`🔗 URL: ${result.imageUrl}`);
          console.log(`⏱️  Generation time: ${result.responseTime}ms`);
          console.log(`📝 Revised prompt: ${result.revisedPrompt}`);
          
          const downloadResult = await downloadImage(result.imageUrl, filename);
          if (downloadResult) {
            downloadedImages.push({
              prompt: result.prompt,
              filename,
              ...downloadResult
            });
          }
          console.log();
        }
      }
      
      console.log(`✅ Downloaded ${downloadedImages.length} previous OpenAI images`);
      console.log('📊 Download summary:');
      downloadedImages.forEach((img, i) => {
        console.log(`   ${i + 1}. ${img.filename} - ${img.sizeKB} KB`);
      });
      
    } else {
      console.log('⚠️  No previous results found');
    }
  } catch (error) {
    console.log(`❌ Error downloading previous images: ${error.message}`);
  }
  
  console.log();
}

// Check OpenRouter credits
async function checkOpenRouterCredits() {
  console.log('💳 CHECKING OPENROUTER CREDITS');
  console.log('=' .repeat(40));
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('💰 Credit info:', JSON.stringify(data, null, 2));
    } else {
      console.log(`❌ Failed to check credits: HTTP ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Error checking credits: ${error.message}`);
  }
  
  console.log();
}

async function runConservativeImageTest() {
  console.log('🎨 CONSERVATIVE IMAGE TEST - DOWNLOAD EXISTING + TEST OPENROUTER');
  console.log('=' .repeat(80));
  console.log(`Download existing OpenAI images + Test 1 OpenRouter image`);
  console.log(`Results will be saved to: ${resultsDir}`);
  console.log(`Images will be downloaded to: ${downloadDir}`);
  console.log('=' .repeat(80));
  console.log();

  // Check credits first
  await checkOpenRouterCredits();

  // Download previous images
  await downloadPreviousImages();

  // Test just one OpenRouter image
  console.log('🔄 TESTING OPENROUTER GEMINI (PAID VERSION)');
  console.log('=' .repeat(60));
  
  const openrouterResult = await testOpenRouterImage(TEST_PROMPTS[0], 1);
  
  const results = {
    timestamp: new Date().toISOString(),
    creditConservative: true,
    openrouter: {
      successes: openrouterResult.success ? 1 : 0,
      failures: openrouterResult.success ? 0 : 1,
      results: [{
        prompt: TEST_PROMPTS[0],
        ...openrouterResult
      }]
    },
    previousDownloads: 'Downloaded existing OpenAI images without generating new ones'
  };

  // Summary
  console.log();
  console.log('🎯 CONSERVATIVE TEST SUMMARY');
  console.log('=' .repeat(50));
  console.log(`🔄 OpenRouter test: ${openrouterResult.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`📁 Previous images downloaded from existing results`);
  console.log(`💾 Images location: ${downloadDir}`);
  console.log();

  if (openrouterResult.success) {
    console.log('📋 OPENROUTER RESULT:');
    console.log(`   Prompt: "${TEST_PROMPTS[0]}"`);
    console.log(`   Response Time: ${openrouterResult.responseTime}ms`);
    console.log(`   Credits Used: ${JSON.stringify(openrouterResult.creditUsage)}`);
    if (openrouterResult.downloadResult) {
      console.log(`   Downloaded: ${openrouterResult.downloadResult.filepath}`);
      console.log(`   File Size: ${openrouterResult.downloadResult.sizeKB} KB`);
    }
  }

  // Save results
  const resultsFile = path.join(resultsDir, 'conservative-test-results.json');
  fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));

  console.log();
  console.log(`💾 Results saved to: ${resultsFile}`);
  console.log('🏁 Conservative image test completed!');
  console.log(`📁 Check downloaded images: ${downloadDir}`);
}

// Run the conservative test
runConservativeImageTest().catch(console.error);
