// Test GPT-5 vs o3 with correct parameters
import OpenAI from 'openai';
import { config } from 'dotenv';

config({ path: '.env.local' });

const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY
});

console.log('🧪 GPT-5 vs o3 Comparison Test\n');

// Test GPT-5 with CORRECT parameters
async function testGPT5Correct() {
  console.log('🧠 Testing GPT-5 with correct parameters...');
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "user",
          content: "Analyze this story concept: 'A robot discovers emotions'. Provide a brief analysis."
        }
      ],
      max_completion_tokens: 100 // Using CORRECT parameter for GPT-5
    });

    const content = response.choices[0]?.message?.content;
    console.log('✅ GPT-5: SUCCESS');
    console.log(`📝 Response: ${content?.substring(0, 100)}...`);
    console.log(`📊 Usage: ${response.usage?.total_tokens} tokens`);
    console.log('');
    return { success: true, tokens: response.usage?.total_tokens, model: 'gpt-5' };
  } catch (error) {
    console.log('❌ GPT-5: FAILED');
    console.error('Error:', error.message);
    console.log('');
    return { success: false, model: 'gpt-5' };
  }
}

// Test o3 with Responses API
async function testO3() {
  console.log('🔬 Testing o3 with Responses API...');
  try {
    const response = await openai.responses.create({
      model: "o3",
      input: [
        {
          role: "user",
          content: "Analyze this story concept: 'A robot discovers emotions'. Provide a brief analysis."
        }
      ],
      reasoning: {
        effort: "medium"
      },
      store: false,
      max_output_tokens: 100
    });

    const messageOutput = response.output.find(item => item.type === 'message');
    const textContent = messageOutput?.content?.find(content => content.type === 'output_text');
    const content = textContent?.text;

    console.log('✅ o3: SUCCESS');
    console.log(`📝 Response: ${content?.substring(0, 100)}...`);
    console.log(`📊 Usage: ${response.usage?.total_tokens} tokens (${response.usage?.output_tokens_details?.reasoning_tokens} reasoning)`);
    console.log('');
    return { success: true, tokens: response.usage?.total_tokens, reasoning: response.usage?.output_tokens_details?.reasoning_tokens, model: 'o3' };
  } catch (error) {
    console.log('❌ o3: FAILED');
    console.error('Error:', error.message);
    console.log('');
    return { success: false, model: 'o3' };
  }
}

// Test GPT-5-mini for comparison
async function testGPT5Mini() {
  console.log('⚡ Testing GPT-5-mini...');
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        {
          role: "user",
          content: "Analyze this story concept: 'A robot discovers emotions'. Provide a brief analysis."
        }
      ],
      max_completion_tokens: 100
    });

    const content = response.choices[0]?.message?.content;
    console.log('✅ GPT-5-mini: SUCCESS');
    console.log(`📝 Response: ${content?.substring(0, 100)}...`);
    console.log(`📊 Usage: ${response.usage?.total_tokens} tokens`);
    console.log('');
    return { success: true, tokens: response.usage?.total_tokens, model: 'gpt-5-mini' };
  } catch (error) {
    console.log('❌ GPT-5-mini: FAILED');
    console.error('Error:', error.message);
    console.log('');
    return { success: false, model: 'gpt-5-mini' };
  }
}

async function runComparison() {
  const results = {
    gpt5: await testGPT5Correct(),
    o3: await testO3(),
    gpt5mini: await testGPT5Mini()
  };

  console.log('='.repeat(60));
  console.log('📊 COMPARISON RESULTS');
  console.log('='.repeat(60));

  Object.values(results).forEach(result => {
    if (result.success) {
      console.log(`✅ ${result.model}: ${result.tokens} tokens${result.reasoning ? ` (${result.reasoning} reasoning)` : ''}`);
    } else {
      console.log(`❌ ${result.model}: Failed`);
    }
  });

  console.log('\n💡 CONCLUSION:');
  
  const workingModels = Object.values(results).filter(r => r.success);
  if (workingModels.length > 0) {
    console.log('All working models can be used for The Scenarist Core v2.0');
    console.log('The choice depends on:');
    console.log('- GPT-5: Latest flagship model, Chat Completions API');
    console.log('- o3: Reasoning model, Responses API with chain-of-thought');
    console.log('- GPT-5-mini: Efficient and cost-effective');
  }
  
  console.log('='.repeat(60));
}

runComparison().catch(console.error);
