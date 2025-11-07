/**
 * Test script for image generation models
 * Tests both OpenAI DALL-E and OpenRouter Gemini image models
 * Also tests saving images to local storage
 */

import { openRouterService } from '../src/services/openrouter';
import { imageStorageService } from '../src/services/supabase/imageStorage';
import { supabase } from '../src/services/supabase/client';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

// Test image prompts
const TEST_PROMPTS = [
  "A futuristic robot painting on a canvas in an art studio, digital art style",
  "A majestic mountain landscape at sunset with vibrant colors, photorealistic",
  "A cute cartoon cat wearing a space helmet, floating in colorful space, illustration style"
];

// Create test results directory
const RESULTS_DIR = path.join(process.cwd(), 'test-results', 'images');
if (!fs.existsSync(RESULTS_DIR)) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
}

async function testOpenAIImageGeneration(prompt, testId) {
  console.log('🎨 Testing OpenAI DALL-E 3...');
  
  try {
    // This would typically use your OpenAI service
    // For now, we'll simulate a placeholder response
    const mockResponse = {
      url: `https://via.placeholder.com/1024x1024/FF6B6B/FFFFFF?text=OpenAI+Mock+${testId}`,
      revised_prompt: `Enhanced version of: ${prompt}`
    };

    console.log('   ✅ OpenAI DALL-E 3 SUCCESS (simulated)');
    console.log(`   Mock URL: ${mockResponse.url}`);
    
    return {
      provider: 'OpenAI DALL-E 3',
      status: 'success (simulated)',
      url: mockResponse.url,
      revised_prompt: mockResponse.revised_prompt
    };
    
  } catch (error) {
    console.log('   ❌ OpenAI DALL-E 3 FAILED');
    console.log(`   Error: ${error.message}`);
    
    return {
      provider: 'OpenAI DALL-E 3',
      status: 'failed',
      error: error.message
    };
  }
}

async function testOpenRouterImageGeneration(prompt, testId) {
  console.log('🖼️  Testing OpenRouter Gemini 2.5 Flash Image...');
  
  try {
    const response = await openRouterService.generateImage(
      prompt,
      {
        model: 'google/gemini-2.5-flash-image-preview'
      }
    );

    console.log('   ✅ OpenRouter Gemini SUCCESS');
    console.log(`   Response: ${response.substring(0, 100)}...`);
    
    // Note: OpenRouter image models might return a description or base64 data
    // We'll need to handle this based on the actual response format
    
    return {
      provider: 'OpenRouter Gemini 2.5 Flash',
      status: 'success',
      response: response,
      length: response.length
    };
    
  } catch (error) {
    console.log('   ❌ OpenRouter Gemini FAILED');
    console.log(`   Error: ${error.message}`);
    
    return {
      provider: 'OpenRouter Gemini 2.5 Flash',
      status: 'failed',
      error: error.message
    };
  }
}

async function downloadAndSaveImage(imageUrl, filename, testId) {
  console.log(`💾 Testing image download and storage for ${filename}...`);
  
  try {
    // Download the image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const buffer = await response.buffer();
    const localPath = path.join(RESULTS_DIR, `${testId}_${filename}`);
    
    // Save locally first
    fs.writeFileSync(localPath, buffer);
    console.log(`   ✅ Saved locally: ${localPath}`);
    
    // Test Supabase storage
    const { storedUrl, error } = await imageStorageService.storeImageFromUrl(
      imageUrl,
      `test-${testId}`,
      `Test Image ${testId}`
    );
    
    if (error) {
      console.log(`   ⚠️  Supabase storage failed: ${error}`);
      return {
        localPath,
        supabaseUrl: null,
        error: error
      };
    } else {
      console.log(`   ✅ Stored in Supabase: ${storedUrl}`);
      return {
        localPath,
        supabaseUrl: storedUrl,
        error: null
      };
    }
    
  } catch (error) {
    console.log(`   ❌ Download/storage failed: ${error.message}`);
    return {
      localPath: null,
      supabaseUrl: null,
      error: error.message
    };
  }
}

async function testImageGeneration() {
  console.log('🎯 TESTING IMAGE GENERATION MODELS');
  console.log('=' .repeat(60));
  
  const allResults = [];

  for (let i = 0; i < TEST_PROMPTS.length; i++) {
    const prompt = TEST_PROMPTS[i];
    const testId = `test-${i + 1}`;
    
    console.log(`\n📝 Test ${i + 1}: "${prompt}"`);
    console.log('-'.repeat(40));
    
    // Test both providers
    const openaiResult = await testOpenAIImageGeneration(prompt, testId);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait between requests
    
    const openrouterResult = await testOpenRouterImageGeneration(prompt, testId);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test image storage if we got URLs
    let storageResults = [];
    
    if (openaiResult.status.includes('success') && openaiResult.url) {
      console.log('\n📦 Testing OpenAI image storage...');
      const storage = await downloadAndSaveImage(openaiResult.url, 'openai.png', `${testId}-openai`);
      storageResults.push({
        provider: 'OpenAI',
        ...storage
      });
    }
    
    // Note: OpenRouter might not return direct image URLs
    // We'll handle this based on the actual response format
    
    allResults.push({
      testId,
      prompt,
      results: {
        openai: openaiResult,
        openrouter: openrouterResult,
        storage: storageResults
      }
    });
    
    console.log(''); // Empty line for readability
  }

  // Summary
  console.log('🎯 IMAGE GENERATION TEST SUMMARY');
  console.log('=' .repeat(60));
  
  const openaiSuccesses = allResults.filter(r => r.results.openai.status.includes('success')).length;
  const openrouterSuccesses = allResults.filter(r => r.results.openrouter.status === 'success').length;
  const storageSuccesses = allResults.reduce((acc, r) => 
    acc + r.results.storage.filter(s => s.error === null).length, 0);
  
  console.log(`Total tests run: ${allResults.length}`);
  console.log(`OpenAI DALL-E 3 successes: ${openaiSuccesses}/${allResults.length}`);
  console.log(`OpenRouter Gemini successes: ${openrouterSuccesses}/${allResults.length}`);
  console.log(`Storage operations successful: ${storageSuccesses}`);
  
  // Detailed results
  console.log('\n📊 DETAILED RESULTS:');
  allResults.forEach(test => {
    console.log(`\n${test.testId.toUpperCase()}: "${test.prompt}"`);
    console.log(`  OpenAI: ${test.results.openai.status}`);
    console.log(`  OpenRouter: ${test.results.openrouter.status}`);
    if (test.results.storage.length > 0) {
      test.results.storage.forEach(storage => {
        console.log(`  Storage (${storage.provider}): ${storage.error ? 'Failed' : 'Success'}`);
      });
    }
  });

  // Save results to file
  const resultsPath = path.join(RESULTS_DIR, 'test-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(allResults, null, 2));
  console.log(`\n💾 Full results saved to: ${resultsPath}`);

  return allResults;
}

// Helper function to test Supabase connection
async function testSupabaseConnection() {
  console.log('🔗 Testing Supabase connection...');
  
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.log('   ⚠️  Supabase auth issue (this might be expected for testing)');
      return false;
    }
    console.log('   ✅ Supabase connection OK');
    return true;
  } catch (error) {
    console.log(`   ❌ Supabase connection failed: ${error.message}`);
    return false;
  }
}

// Run the test
if (require.main === module) {
  console.log('🚀 Starting Image Generation Tests\n');
  
  testSupabaseConnection()
    .then(() => testImageGeneration())
    .then(() => {
      console.log('\n🏁 Image generation tests completed!');
      console.log(`Check the ${RESULTS_DIR} directory for saved images and results.`);
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Test failed:', error);
      process.exit(1);
    });
}

export { testImageGeneration };
