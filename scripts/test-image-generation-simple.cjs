/**
 * Simple Image Generation Test
 * Tests OpenRouter Gemini image model and demonstrates image handling
 */

const fs = require('fs');
const path = require('path');

// OpenRouter Configuration
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1';
const OPENROUTER_API_KEY = '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';

// Test prompts
const TEST_PROMPTS = [
  "A cute robot painting a landscape on canvas in an art studio, digital art",
  "A futuristic city at sunset with flying cars, cyberpunk style",
  "A magical forest with glowing mushrooms and fireflies, fantasy art"
];

// Create results directory
const RESULTS_DIR = path.join(process.cwd(), 'test-results', 'images');
if (!fs.existsSync(RESULTS_DIR)) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
}

async function testOpenRouterImageGeneration(prompt, testIndex) {
  console.log(`\n🎨 Test ${testIndex + 1}: "${prompt}"`);
  console.log('─'.repeat(60));
  
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${OPENROUTER_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3010',
        'X-Title': 'FilmStudio AI Image Test'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an AI image generator. Generate detailed images based on the user\'s description.'
          },
          {
            role: 'user',
            content: `Generate an image: ${prompt}`
          }
        ],
        max_tokens: 4096,
        temperature: 0.8,
        top_p: 1.0
      })
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response choices returned');
    }

    const generatedResponse = data.choices[0].message.content;
    const tokens = data.usage?.total_tokens || 'unknown';

    console.log(`✅ SUCCESS (${duration}ms)`);
    console.log(`📊 Tokens used: ${tokens}`);
    console.log(`📝 Response type: ${typeof generatedResponse}`);
    console.log(`📏 Response length: ${generatedResponse.length} characters`);
    
    // Check if response contains base64 image data
    const base64Pattern = /data:image\/[^;]+;base64,([^"]+)/;
    const base64Match = generatedResponse.match(base64Pattern);
    
    if (base64Match) {
      console.log('🖼️  Base64 image detected! Saving...');
      const base64Data = base64Match[1];
      const imageBuffer = Buffer.from(base64Data, 'base64');
      const filename = `openrouter_test_${testIndex + 1}.png`;
      const filepath = path.join(RESULTS_DIR, filename);
      
      fs.writeFileSync(filepath, imageBuffer);
      console.log(`💾 Image saved: ${filepath}`);
      
      return {
        prompt,
        status: 'success',
        duration,
        tokens,
        hasImage: true,
        imagePath: filepath,
        responseLength: generatedResponse.length
      };
    } else {
      console.log('📄 Text response (no image detected):');
      console.log(`"${generatedResponse.substring(0, 200)}..."`);
      
      // Save text response for analysis
      const filename = `openrouter_response_${testIndex + 1}.txt`;
      const filepath = path.join(RESULTS_DIR, filename);
      fs.writeFileSync(filepath, generatedResponse);
      console.log(`💾 Response saved: ${filepath}`);
      
      return {
        prompt,
        status: 'success',
        duration,
        tokens,
        hasImage: false,
        textResponse: generatedResponse.substring(0, 500),
        responsePath: filepath,
        responseLength: generatedResponse.length
      };
    }

  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`❌ FAILED (${duration}ms)`);
    console.log(`💥 Error: ${error.message}`);
    
    return {
      prompt,
      status: 'failed',
      duration,
      error: error.message
    };
  }
}

async function testMockOpenAIGeneration(prompt, testIndex) {
  console.log(`\n🤖 Mock OpenAI DALL-E Test ${testIndex + 1}: "${prompt}"`);
  console.log('─'.repeat(60));
  
  // Simulate OpenAI DALL-E response (since we don't have the API set up yet)
  const mockImageUrl = `https://via.placeholder.com/1024x1024/4A90E2/FFFFFF?text=DALL-E+Mock+${testIndex + 1}`;
  
  console.log('🎨 Simulating OpenAI DALL-E 3 response...');
  console.log(`✅ Mock URL generated: ${mockImageUrl}`);
  
  // Download and save mock image
  try {
    const fetch = require('node-fetch') || global.fetch;
    const response = await fetch(mockImageUrl);
    const buffer = await response.buffer();
    
    const filename = `openai_mock_${testIndex + 1}.png`;
    const filepath = path.join(RESULTS_DIR, filename);
    fs.writeFileSync(filepath, buffer);
    
    console.log(`💾 Mock image saved: ${filepath}`);
    
    return {
      prompt,
      provider: 'OpenAI DALL-E 3 (Mock)',
      status: 'success (simulated)',
      imagePath: filepath,
      imageUrl: mockImageUrl
    };
    
  } catch (error) {
    console.log(`❌ Mock image download failed: ${error.message}`);
    
    return {
      prompt,
      provider: 'OpenAI DALL-E 3 (Mock)',
      status: 'failed',
      error: error.message
    };
  }
}

async function runImageTests() {
  console.log('🎨 IMAGE GENERATION TEST');
  console.log('='.repeat(60));
  console.log(`Testing with ${TEST_PROMPTS.length} different prompts`);
  console.log(`Results will be saved to: ${RESULTS_DIR}`);
  console.log('='.repeat(60));

  const allResults = [];
  
  for (let i = 0; i < TEST_PROMPTS.length; i++) {
    const prompt = TEST_PROMPTS[i];
    
    // Test OpenRouter Gemini
    const openRouterResult = await testOpenRouterImageGeneration(prompt, i);
    
    // Wait between requests
    console.log('\n⏳ Waiting 3 seconds...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Test Mock OpenAI
    const openAIResult = await testMockOpenAIGeneration(prompt, i);
    
    allResults.push({
      prompt,
      openrouter: openRouterResult,
      openai: openAIResult
    });
    
    if (i < TEST_PROMPTS.length - 1) {
      console.log('\n⏳ Waiting 5 seconds before next prompt...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  // Summary
  console.log('\n\n🎯 IMAGE GENERATION SUMMARY');
  console.log('='.repeat(60));
  
  const openRouterSuccesses = allResults.filter(r => r.openrouter.status === 'success').length;
  const openRouterImages = allResults.filter(r => r.openrouter.hasImage).length;
  const openAISuccesses = allResults.filter(r => r.openai.status.includes('success')).length;
  
  console.log(`📊 Total prompts tested: ${allResults.length}`);
  console.log(`✅ OpenRouter successes: ${openRouterSuccesses}/${allResults.length}`);
  console.log(`🖼️  OpenRouter images generated: ${openRouterImages}/${openRouterSuccesses}`);
  console.log(`🤖 OpenAI mock successes: ${openAISuccesses}/${allResults.length}`);
  
  console.log('\n📋 DETAILED RESULTS:');
  allResults.forEach((result, index) => {
    console.log(`\n${index + 1}. "${result.prompt}"`);
    console.log(`   OpenRouter: ${result.openrouter.status} ${result.openrouter.hasImage ? '🖼️' : '📄'}`);
    console.log(`   OpenAI Mock: ${result.openai.status}`);
  });

  // Save results
  const resultsFile = path.join(RESULTS_DIR, 'test-results.json');
  fs.writeFileSync(resultsFile, JSON.stringify(allResults, null, 2));
  console.log(`\n💾 Full results saved to: ${resultsFile}`);
  
  console.log('\n🏁 Image generation tests completed!');
  console.log(`📁 Check the directory: ${RESULTS_DIR}`);
  
  return allResults;
}

// Run the test
runImageTests().catch(error => {
  console.error('💥 Image test script failed:', error);
  process.exit(1);
});
