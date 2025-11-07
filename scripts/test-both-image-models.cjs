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
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
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
        model: 'google/gemini-2.5-flash-image-preview:free',
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
      
      return {
        success: true,
        response: content,
        responseTime,
        tokens: data.usage?.total_tokens || 0
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
      
      return {
        success: true,
        imageUrl,
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

async function runImageTests() {
  console.log('🎨 DUAL IMAGE GENERATION TEST');
  console.log('=' .repeat(60));
  console.log(`Testing ${TEST_PROMPTS.length} prompts with both models`);
  console.log(`Results will be saved to: ${resultsDir}`);
  console.log('=' .repeat(60));
  console.log();

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
  console.log('🎯 IMAGE GENERATION SUMMARY');
  console.log('=' .repeat(60));
  console.log(`📊 Total prompts tested: ${TEST_PROMPTS.length}`);
  console.log(`🔄 OpenRouter successes: ${results.openrouter.successes}/${TEST_PROMPTS.length}`);
  console.log(`🤖 OpenAI successes: ${results.openai.successes}/${TEST_PROMPTS.length}`);
  console.log();

  console.log('📋 DETAILED RESULTS:');
  console.log();
  
  for (let i = 0; i < TEST_PROMPTS.length; i++) {
    const prompt = TEST_PROMPTS[i];
    const openrouterResult = results.openrouter.results[i];
    const openaiResult = results.openai.results[i];
    
    console.log(`${i + 1}. "${prompt}"`);
    console.log(`   OpenRouter: ${openrouterResult.success ? '✅' : '❌'} ${openrouterResult.success ? openrouterResult.responseTime + 'ms' : 'failed'}`);
    console.log(`   OpenAI: ${openaiResult.success ? '✅' : '❌'} ${openaiResult.success ? openaiResult.responseTime + 'ms' : 'failed'}`);
    console.log();
  }

  // Save results
  const resultsFile = path.join(resultsDir, 'dual-test-results.json');
  fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));

  console.log(`💾 Full results saved to: ${resultsFile}`);
  console.log();
  console.log('🏁 Dual image generation tests completed!');
  console.log(`📁 Check the directory: ${resultsDir}`);
}

// Run the tests
runImageTests().catch(console.error);
