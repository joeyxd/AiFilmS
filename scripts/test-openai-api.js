// Test OpenAI API with GPT-5/o3 Models
// This script tests both Chat Completions API and the new Responses API

import OpenAI from 'openai';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY
});

console.log('🚀 Testing OpenAI API Connection...\n');

// Test 1: Basic API Connection with GPT-4o-mini (fallback model)
async function testBasicConnection() {
  console.log('📡 Test 1: Basic API Connection (GPT-4o-mini)...');
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant. Respond with exactly: 'API_TEST_SUCCESS'"
        },
        {
          role: "user",
          content: "Test connection"
        }
      ],
      max_tokens: 10
    });

    const content = response.choices[0]?.message?.content;
    if (content?.includes('API_TEST_SUCCESS')) {
      console.log('✅ Basic API Connection: SUCCESS');
      console.log(`📊 Usage: ${response.usage?.total_tokens} tokens\n`);
      return true;
    } else {
      console.log('❌ Basic API Connection: FAILED - Unexpected response');
      console.log('Response:', content);
      return false;
    }
  } catch (error) {
    console.log('❌ Basic API Connection: FAILED');
    console.error('Error:', error.message);
    return false;
  }
}

// Test 2: GPT-5 Model Availability
async function testGPT5Model() {
  console.log('🧠 Test 2: GPT-5 Model Availability...');
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "user",
          content: "What model are you? Respond with your exact model name."
        }
      ],
      max_tokens: 20
    });

    const content = response.choices[0]?.message?.content;
    console.log('✅ GPT-5 Model: AVAILABLE');
    console.log(`📝 Response: ${content}`);
    console.log(`📊 Usage: ${response.usage?.total_tokens} tokens\n`);
    return true;
  } catch (error) {
    console.log('❌ GPT-5 Model: NOT AVAILABLE');
    console.error('Error:', error.message);
    console.log('Note: GPT-5 might not be available in your account yet.\n');
    return false;
  }
}

// Test 3: o3 Model with Responses API
async function testO3ResponsesAPI() {
  console.log('🔬 Test 3: o3 Model with Responses API...');
  try {
    const response = await openai.responses.create({
      model: "o3",
      input: [
        {
          role: "user",
          content: "Solve this simple math: 2 + 2 = ? Just respond with the number."
        }
      ],
      reasoning: {
        effort: "low" // Low effort for simple test
      },
      store: false,
      include: ["reasoning.encrypted_content"],
      max_output_tokens: 20
    });

    // Extract content from Responses API format
    const messageOutput = response.output.find(item => item.type === 'message');
    const textContent = messageOutput?.content?.find(content => content.type === 'output_text');
    const content = textContent?.text;

    // Check for reasoning items
    const reasoningItems = response.output.filter(item => item.type === 'reasoning');
    
    console.log('✅ o3 Responses API: SUCCESS');
    console.log(`📝 Response: ${content}`);
    console.log(`🧠 Reasoning items: ${reasoningItems.length}`);
    console.log(`📊 Usage: ${response.usage?.total_tokens} tokens (${response.usage?.output_tokens_details?.reasoning_tokens} reasoning tokens)`);
    
    if (reasoningItems.length > 0 && reasoningItems[0].encrypted_content) {
      console.log('🔐 Encrypted reasoning content: AVAILABLE');
    }
    console.log('');
    return true;
  } catch (error) {
    console.log('❌ o3 Responses API: NOT AVAILABLE');
    console.error('Error:', error.message);
    console.log('Note: o3 model might not be available in your account yet.\n');
    return false;
  }
}

// Test 4: o4-mini Model with Responses API
async function testO4MiniResponsesAPI() {
  console.log('⚡ Test 4: o4-mini Model with Responses API...');
  try {
    const response = await openai.responses.create({
      model: "o4-mini",
      input: [
        {
          role: "user",
          content: "What's 5 * 3? Just respond with the number."
        }
      ],
      reasoning: {
        effort: "medium"
      },
      store: false,
      max_output_tokens: 10
    });

    // Extract content from Responses API format
    const messageOutput = response.output.find(item => item.type === 'message');
    const textContent = messageOutput?.content?.find(content => content.type === 'output_text');
    const content = textContent?.text;

    console.log('✅ o4-mini Responses API: SUCCESS');
    console.log(`📝 Response: ${content}`);
    console.log(`📊 Usage: ${response.usage?.total_tokens} tokens\n`);
    return true;
  } catch (error) {
    console.log('❌ o4-mini Responses API: NOT AVAILABLE');
    console.error('Error:', error.message);
    console.log('Note: o4-mini model might not be available in your account yet.\n');
    return false;
  }
}

// Test 5: Available Models List
async function testAvailableModels() {
  console.log('📋 Test 5: Available Models List...');
  try {
    const models = await openai.models.list();
    const modelNames = models.data
      .map(model => model.id)
      .filter(id => id.includes('gpt') || id.includes('o3') || id.includes('o4'))
      .sort();

    console.log('✅ Available Models:');
    modelNames.forEach(model => {
      console.log(`   - ${model}`);
    });
    console.log('');
    return true;
  } catch (error) {
    console.log('❌ Models List: FAILED');
    console.error('Error:', error.message);
    console.log('');
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('='.repeat(60));
  console.log('🧪 OpenAI API & GPT-5/o3 Model Testing Suite');
  console.log('='.repeat(60));
  console.log('');

  const results = {
    basicConnection: await testBasicConnection(),
    gpt5Model: await testGPT5Model(),
    o3ResponsesAPI: await testO3ResponsesAPI(),
    o4MiniResponsesAPI: await testO4MiniResponsesAPI(),
    availableModels: await testAvailableModels()
  };

  console.log('='.repeat(60));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(60));
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const testName = test.replace(/([A-Z])/g, ' $1').toUpperCase();
    console.log(`${status} - ${testName}`);
  });

  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log('');
  console.log(`🎯 Overall Score: ${passedTests}/${totalTests} tests passed`);
  
  if (results.basicConnection) {
    console.log('✅ Your OpenAI API is working correctly!');
  } else {
    console.log('❌ Basic API connection failed. Check your API key.');
  }

  if (results.gpt5Model || results.o3ResponsesAPI) {
    console.log('🚀 Advanced GPT-5/o3 models are available for your account!');
  } else {
    console.log('⏳ GPT-5/o3 models are not yet available for your account.');
  }

  console.log('');
  console.log('💡 Recommendation for The Scenarist Core v2.0:');
  if (results.o3ResponsesAPI) {
    console.log('   Use o3 with Responses API for maximum reasoning capabilities');
  } else if (results.o4MiniResponsesAPI) {
    console.log('   Use o4-mini with Responses API for efficient processing');
  } else if (results.gpt5Model) {
    console.log('   Use gpt-5 with Chat Completions API');
  } else {
    console.log('   Use gpt-4o-mini as fallback model');
  }
  
  console.log('='.repeat(60));
}

// Run the test suite
runAllTests().catch(console.error);
