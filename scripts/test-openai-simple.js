// Test OpenAI API with GPT-5/o3 Models (CommonJS version)
const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY
});

console.log('🚀 Testing OpenAI API Connection...\n');

// Test 1: Basic API Connection with GPT-4o-mini
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

// Test 3: o3 Model Availability
async function testO3Model() {
  console.log('🔬 Test 3: o3 Model Availability...');
  try {
    const response = await openai.chat.completions.create({
      model: "o3",
      messages: [
        {
          role: "user",
          content: "Simple test: 2 + 2 = ?"
        }
      ],
      max_tokens: 10
    });

    const content = response.choices[0]?.message?.content;
    console.log('✅ o3 Model: AVAILABLE');
    console.log(`📝 Response: ${content}`);
    console.log(`📊 Usage: ${response.usage?.total_tokens} tokens\n`);
    return true;
  } catch (error) {
    console.log('❌ o3 Model: NOT AVAILABLE');
    console.error('Error:', error.message);
    console.log('Note: o3 model might not be available in your account yet.\n');
    return false;
  }
}

// Test 4: o4-mini Model Availability
async function testO4MiniModel() {
  console.log('⚡ Test 4: o4-mini Model Availability...');
  try {
    const response = await openai.chat.completions.create({
      model: "o4-mini",
      messages: [
        {
          role: "user",
          content: "What's 5 * 3?"
        }
      ],
      max_tokens: 10
    });

    const content = response.choices[0]?.message?.content;
    console.log('✅ o4-mini Model: AVAILABLE');
    console.log(`📝 Response: ${content}`);
    console.log(`📊 Usage: ${response.usage?.total_tokens} tokens\n`);
    return true;
  } catch (error) {
    console.log('❌ o4-mini Model: NOT AVAILABLE');
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

    console.log('✅ Available GPT/Reasoning Models:');
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
    o3Model: await testO3Model(),
    o4MiniModel: await testO4MiniModel(),
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

  if (results.gpt5Model || results.o3Model) {
    console.log('🚀 Advanced GPT-5/o3 models are available for your account!');
  } else {
    console.log('⏳ GPT-5/o3 models are not yet available for your account.');
  }

  console.log('');
  console.log('💡 Recommendation for The Scenarist Core v2.0:');
  if (results.o3Model) {
    console.log('   Use o3 for maximum reasoning capabilities');
  } else if (results.o4MiniModel) {
    console.log('   Use o4-mini for efficient processing');
  } else if (results.gpt5Model) {
    console.log('   Use gpt-5 for advanced analysis');
  } else {
    console.log('   Use gpt-4o-mini as fallback model');
  }
  
  console.log('='.repeat(60));
}

// Run the test suite
runAllTests().catch(console.error);
