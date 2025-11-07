/**
 * Test script for OpenRouter text models
 * This script tests all available OpenRouter models with a simple prompt
 */

import { openRouterService, OPENROUTER_MODELS } from '../src/services/openrouter';

// Simple test prompt
const TEST_PROMPT = "Write a short creative story about a robot discovering art for the first time. Keep it under 200 words.";

async function testOpenRouterModels() {
  console.log('🚀 Testing OpenRouter Text Models');
  console.log('=' .repeat(50));
  
  // Get only text models
  const textModels = OPENROUTER_MODELS.filter(model => model.type === 'text');
  
  console.log(`Found ${textModels.length} text models to test:`);
  textModels.forEach(model => {
    console.log(`  - ${model.name} (${model.id})`);
  });
  
  console.log('\n' + '='.repeat(50));
  console.log('Starting tests...\n');

  const results = [];

  for (const model of textModels) {
    console.log(`🤖 Testing: ${model.name}`);
    console.log(`   Model ID: ${model.id}`);
    
    const startTime = Date.now();
    
    try {
      const response = await openRouterService.generateText(
        model.id,
        [
          {
            role: 'system',
            content: 'You are a creative writer. Write engaging short stories.'
          },
          {
            role: 'user',
            content: TEST_PROMPT
          }
        ],
        {
          maxTokens: 300,
          temperature: 0.7
        }
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`   ✅ SUCCESS (${duration}ms)`);
      console.log(`   Response length: ${response.length} characters`);
      console.log(`   Preview: "${response.substring(0, 100)}..."`);
      
      results.push({
        model: model.name,
        modelId: model.id,
        status: 'success',
        duration,
        responseLength: response.length,
        preview: response.substring(0, 100)
      });

    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log(`   ❌ FAILED (${duration}ms)`);
      console.log(`   Error: ${error.message}`);
      
      results.push({
        model: model.name,
        modelId: model.id,
        status: 'failed',
        duration,
        error: error.message
      });
    }
    
    console.log(''); // Empty line for readability
    
    // Add a small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Summary
  console.log('🎯 TEST SUMMARY');
  console.log('=' .repeat(50));
  
  const successful = results.filter(r => r.status === 'success');
  const failed = results.filter(r => r.status === 'failed');
  
  console.log(`Total models tested: ${results.length}`);
  console.log(`Successful: ${successful.length}`);
  console.log(`Failed: ${failed.length}`);
  console.log(`Success rate: ${((successful.length / results.length) * 100).toFixed(1)}%`);
  
  if (successful.length > 0) {
    console.log('\n✅ SUCCESSFUL MODELS:');
    successful.forEach(result => {
      console.log(`  - ${result.model} (${result.duration}ms)`);
    });
  }
  
  if (failed.length > 0) {
    console.log('\n❌ FAILED MODELS:');
    failed.forEach(result => {
      console.log(`  - ${result.model}: ${result.error}`);
    });
  }

  // Performance ranking
  if (successful.length > 0) {
    console.log('\n⚡ PERFORMANCE RANKING (fastest to slowest):');
    successful
      .sort((a, b) => a.duration - b.duration)
      .forEach((result, index) => {
        console.log(`  ${index + 1}. ${result.model} - ${result.duration}ms`);
      });
  }

  return results;
}

// Run the test
if (require.main === module) {
  testOpenRouterModels()
    .then(() => {
      console.log('\n🏁 Test completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Test failed:', error);
      process.exit(1);
    });
}

export { testOpenRouterModels };
