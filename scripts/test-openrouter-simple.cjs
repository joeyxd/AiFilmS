/**
 * Simple OpenRouter API Test
 * Tests all available OpenRouter models with a basic fetch request
 */

// OpenRouter Configuration
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1';
const OPENROUTER_API_KEY = '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';

// Models to test
const MODELS_TO_TEST = [
  'deepseek/deepseek-chat-v3-0324',
  'meta-llama/llama-4-maverick', 
  'qwen/qwen3-235b-a22b',
  'qwen/qwq-32b',
  'google/gemini-2.5-pro-exp-03-25',
  'meta-llama/llama-4-scout',
  'nvidia/llama-3.1-nemotron-ultra-253b-v1',
  'mistralai/mistral-small-3.1-24b-instruct',
  'moonshotai/kimi-vl-a3b-thinking'
];

// Test prompt
const TEST_PROMPT = "Write a very short story (max 50 words) about a robot learning to paint.";

async function testModel(modelId) {
  console.log(`\n🤖 Testing: ${modelId}`);
  console.log('─'.repeat(50));
  
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${OPENROUTER_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3010',
        'X-Title': 'FilmStudio AI Test'
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          {
            role: 'system',
            content: 'You are a creative writer. Write very short, engaging stories.'
          },
          {
            role: 'user', 
            content: TEST_PROMPT
          }
        ],
        max_tokens: 100,
        temperature: 0.7,
        top_p: 1.0,
        frequency_penalty: 0,
        presence_penalty: 0,
        stream: false
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

    const generatedText = data.choices[0].message.content;
    const tokens = data.usage?.total_tokens || 'unknown';

    console.log(`✅ SUCCESS (${duration}ms)`);
    console.log(`📊 Tokens used: ${tokens}`);
    console.log(`📝 Response (${generatedText.length} chars):`);
    console.log(`"${generatedText.trim()}"`);
    
    return {
      model: modelId,
      status: 'success',
      duration,
      tokens,
      response: generatedText.trim(),
      responseLength: generatedText.length
    };

  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`❌ FAILED (${duration}ms)`);
    console.log(`💥 Error: ${error.message}`);
    
    return {
      model: modelId,
      status: 'failed',
      duration,
      error: error.message
    };
  }
}

async function runAllTests() {
  console.log('🚀 OPENROUTER MODELS TEST');
  console.log('='.repeat(60));
  console.log(`Testing ${MODELS_TO_TEST.length} models with prompt: "${TEST_PROMPT}"`);
  console.log('='.repeat(60));

  const results = [];
  
  for (let i = 0; i < MODELS_TO_TEST.length; i++) {
    const modelId = MODELS_TO_TEST[i];
    const result = await testModel(modelId);
    results.push(result);
    
    // Add delay between requests to avoid rate limiting
    if (i < MODELS_TO_TEST.length - 1) {
      console.log('\n⏳ Waiting 3 seconds before next test...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  // Summary
  console.log('\n\n🎯 TEST SUMMARY');
  console.log('='.repeat(60));
  
  const successful = results.filter(r => r.status === 'success');
  const failed = results.filter(r => r.status === 'failed');
  
  console.log(`📊 Total models tested: ${results.length}`);
  console.log(`✅ Successful: ${successful.length}`);
  console.log(`❌ Failed: ${failed.length}`);
  console.log(`📈 Success rate: ${((successful.length / results.length) * 100).toFixed(1)}%`);
  
  if (successful.length > 0) {
    console.log('\n🏆 SUCCESSFUL MODELS:');
    successful
      .sort((a, b) => a.duration - b.duration)
      .forEach((result, index) => {
        console.log(`  ${index + 1}. ${result.model}`);
        console.log(`     ⏱️  ${result.duration}ms | 🪙 ${result.tokens} tokens | 📝 ${result.responseLength} chars`);
      });
  }
  
  if (failed.length > 0) {
    console.log('\n💥 FAILED MODELS:');
    failed.forEach(result => {
      console.log(`  ❌ ${result.model}`);
      console.log(`     Error: ${result.error}`);
    });
  }

  // Save results to JSON file
  const fs = require('fs');
  const resultsFile = './test-results-openrouter.json';
  
  try {
    fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
    console.log(`\n💾 Results saved to: ${resultsFile}`);
  } catch (error) {
    console.log(`\n⚠️  Could not save results: ${error.message}`);
  }

  console.log('\n🏁 Test completed!');
  return results;
}

// Run the test
runAllTests().catch(error => {
  console.error('💥 Test script failed:', error);
  process.exit(1);
});
