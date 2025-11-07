const { OpenAI } = require('openai');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Test prompts
const TEST_PROMPTS = [
  "A cute robot painting a landscape on canvas in an art studio, digital art",
  "A futuristic city at sunset with flying cars, cyberpunk style",
  "A magical forest with glowing mushrooms and fireflies, fantasy art"
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
    
    console.log(`✅ Saved: ${filepath}`);
    return filepath;
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
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      const content = data.choices[0].message.content;
      console.log(`✅ SUCCESS (${responseTime}ms)`);
      console.log(`📝 Response: ${content.substring(0, 200)}${content.length > 200 ? '...' : ''}`);
      
      // Check if response contains an image URL or is an actual image
      let imageUrl = null;
      let downloadPath = null;
      
      if (content.includes('http') && (content.includes('.png') || content.includes('.jpg') || content.includes('.jpeg'))) {
        // Extract URL from response
        const urlMatch = content.match(/https?:\/\/[^\s]+\.(png|jpg|jpeg)/i);
        if (urlMatch) {
          imageUrl = urlMatch[0];
          const filename = `openrouter_test${testNum}_${Date.now()}.png`;
          downloadPath = await downloadImage(imageUrl, filename);
        }
      }
      
      return {
        success: true,
        response: content,
        responseTime,
        tokens: data.usage?.total_tokens || 0,
        imageUrl,
        downloadPath
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

async function testOpenAIImage(prompt, testNum) {
  console.log(`🤖 OpenAI DALL-E Test ${testNum}: "${prompt}"`);
  console.log('─'.repeat(60));
  
  if (!OPENAI_API_KEY) {
    console.log('❌ SKIPPED - No OpenAI API key found');
    return { success: false, error: 'No API key', responseTime: 0 };
  }

  const startTime = Date.now();
  
  try {
    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY
    });

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      style: "vivid"
    });

    const responseTime = Date.now() - startTime;
    
    if (response.data && response.data[0] && response.data[0].url) {
      const imageUrl = response.data[0].url;
      console.log(`✅ SUCCESS (${responseTime}ms)`);
      console.log(`🖼️  Image URL: ${imageUrl}`);
      
      // Download the image
      const filename = `openai_dalle_test${testNum}_${Date.now()}.png`;
      const downloadPath = await downloadImage(imageUrl, filename);
      
      return {
        success: true,
        imageUrl,
        downloadPath,
        responseTime,
        revisedPrompt: response.data[0].revised_prompt
      };
    } else {
      console.log(`❌ FAILED (${responseTime}ms)`);
      console.log(`💥 Invalid response format`);
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
  console.log('📋 DOWNLOADING PREVIOUS SUCCESSFUL IMAGES');
  console.log('=' .repeat(60));
  
  try {
    const previousResultsFile = path.join(resultsDir, 'dual-test-results.json');
    if (fs.existsSync(previousResultsFile)) {
      const previousResults = JSON.parse(fs.readFileSync(previousResultsFile, 'utf8'));
      
      console.log('🔍 Found previous test results, downloading OpenAI images...');
      
      for (let i = 0; i < previousResults.openai.results.length; i++) {
        const result = previousResults.openai.results[i];
        if (result.success && result.imageUrl) {
          const filename = `previous_openai_test${i + 1}_${Date.now()}.png`;
          console.log(`📥 Image ${i + 1}: "${result.prompt}"`);
          console.log(`🔗 URL: ${result.imageUrl}`);
          await downloadImage(result.imageUrl, filename);
          console.log();
        }
      }
    } else {
      console.log('⚠️  No previous results found');
    }
  } catch (error) {
    console.log(`❌ Error downloading previous images: ${error.message}`);
  }
  
  console.log();
}

async function runImageTests() {
  console.log('🎨 ENHANCED IMAGE GENERATION TEST WITH DOWNLOADS');
  console.log('=' .repeat(70));
  console.log(`Testing ${TEST_PROMPTS.length} prompts with both models`);
  console.log(`Results will be saved to: ${resultsDir}`);
  console.log(`Images will be downloaded to: ${downloadDir}`);
  console.log('=' .repeat(70));
  console.log();

  // First download previous images
  await downloadPreviousImages();

  const results = {
    timestamp: new Date().toISOString(),
    openrouter: { successes: 0, failures: 0, results: [] },
    openai: { successes: 0, failures: 0, results: [] }
  };

  for (let i = 0; i < TEST_PROMPTS.length; i++) {
    const prompt = TEST_PROMPTS[i];
    const testNum = i + 1;

    // Test OpenRouter
    const openrouterResult = await testOpenRouterImage(prompt, testNum);
    results.openrouter.results.push({
      prompt,
      ...openrouterResult
    });
    
    if (openrouterResult.success) {
      results.openrouter.successes++;
    } else {
      results.openrouter.failures++;
    }

    console.log('⏳ Waiting 3 seconds...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Test OpenAI
    const openaiResult = await testOpenAIImage(prompt, testNum);
    results.openai.results.push({
      prompt,
      ...openaiResult
    });
    
    if (openaiResult.success) {
      results.openai.successes++;
    } else {
      results.openai.failures++;
    }

    if (i < TEST_PROMPTS.length - 1) {
      console.log('⏳ Waiting 5 seconds before next prompt...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    console.log();
  }

  // Summary
  console.log('🎯 ENHANCED IMAGE GENERATION SUMMARY');
  console.log('=' .repeat(70));
  console.log(`📊 Total prompts tested: ${TEST_PROMPTS.length}`);
  console.log(`🔄 OpenRouter successes: ${results.openrouter.successes}/${TEST_PROMPTS.length}`);
  console.log(`🤖 OpenAI successes: ${results.openai.successes}/${TEST_PROMPTS.length}`);
  console.log(`📁 Downloaded images location: ${downloadDir}`);
  console.log();

  console.log('📋 DETAILED RESULTS:');
  console.log();
  
  for (let i = 0; i < TEST_PROMPTS.length; i++) {
    const prompt = TEST_PROMPTS[i];
    const openrouterResult = results.openrouter.results[i];
    const openaiResult = results.openai.results[i];
    
    console.log(`${i + 1}. "${prompt}"`);
    console.log(`   OpenRouter: ${openrouterResult.success ? '✅' : '❌'} ${openrouterResult.success ? openrouterResult.responseTime + 'ms' : 'failed'} ${openrouterResult.downloadPath ? '📁 Downloaded' : ''}`);
    console.log(`   OpenAI: ${openaiResult.success ? '✅' : '❌'} ${openaiResult.success ? openaiResult.responseTime + 'ms' : 'failed'} ${openaiResult.downloadPath ? '📁 Downloaded' : ''}`);
    console.log();
  }

  // Save results
  const resultsFile = path.join(resultsDir, 'enhanced-test-results.json');
  fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));

  console.log(`💾 Full results saved to: ${resultsFile}`);
  console.log();
  console.log('🏁 Enhanced image generation tests completed!');
  console.log(`📁 Check downloaded images: ${downloadDir}`);
  console.log(`📁 Check test results: ${resultsDir}`);
}

// Run the tests
runImageTests().catch(console.error);
