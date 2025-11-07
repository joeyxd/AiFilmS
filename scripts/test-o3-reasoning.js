// Test o3 reasoning capabilities at different effort levels
import OpenAI from 'openai';
import { config } from 'dotenv';

config({ path: '.env.local' });

const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY
});

console.log('🧠 Testing o3 Reasoning Capabilities\n');

async function testO3Reasoning(effort, testName) {
  console.log(`🔬 Testing o3 with ${effort} reasoning effort (${testName})...`);
  try {
    const response = await openai.responses.create({
      model: "o3",
      input: [
        {
          role: "user",
          content: "Analyze this story concept deeply: 'A detective with amnesia must solve their own murder case'. Think through all the narrative implications, psychological layers, plot possibilities, and thematic depth. Provide a comprehensive analysis."
        }
      ],
      reasoning: {
        effort: effort,
        summary: "auto" // Show reasoning summary
      },
      store: false,
      include: ["reasoning.encrypted_content"],
      max_output_tokens: 800
    });

    // Extract reasoning summary
    const reasoningItem = response.output.find(item => item.type === 'reasoning');
    const reasoningSummary = reasoningItem?.summary?.[0]?.text;

    // Extract main response
    const messageOutput = response.output.find(item => item.type === 'message');
    const textContent = messageOutput?.content?.find(content => content.type === 'output_text');
    const content = textContent?.text;

    console.log(`✅ o3 (${effort} effort): SUCCESS`);
    console.log(`🧠 Reasoning tokens: ${response.usage?.output_tokens_details?.reasoning_tokens || 0}`);
    console.log(`📊 Total tokens: ${response.usage?.total_tokens}`);
    console.log(`💭 Reasoning summary: ${reasoningSummary?.substring(0, 150)}...`);
    console.log(`📝 Response length: ${content?.length} characters`);
    console.log('');
    
    return {
      success: true,
      reasoningTokens: response.usage?.output_tokens_details?.reasoning_tokens || 0,
      totalTokens: response.usage?.total_tokens,
      responseLength: content?.length,
      reasoningSummary: reasoningSummary
    };
  } catch (error) {
    console.log(`❌ o3 (${effort} effort): FAILED`);
    console.error('Error:', error.message);
    console.log('');
    return { success: false };
  }
}

async function runReasoningTests() {
  console.log('='.repeat(70));
  console.log('🧪 O3 REASONING CAPABILITY TEST');
  console.log('='.repeat(70));
  console.log('');

  const results = {
    low: await testO3Reasoning("low", "Baseline"),
    medium: await testO3Reasoning("medium", "Standard"),
    high: await testO3Reasoning("high", "Maximum Thinking")
  };

  console.log('='.repeat(70));
  console.log('📊 REASONING COMPARISON RESULTS');
  console.log('='.repeat(70));

  Object.entries(results).forEach(([effort, result]) => {
    if (result.success) {
      console.log(`${effort.toUpperCase()} EFFORT:`);
      console.log(`  🧠 Reasoning tokens: ${result.reasoningTokens}`);
      console.log(`  📊 Total tokens: ${result.totalTokens}`);
      console.log(`  📝 Response depth: ${result.responseLength} chars`);
      console.log('');
    }
  });

  const highResult = results.high;
  if (highResult.success) {
    console.log('🎯 MAXIMUM REASONING SAMPLE:');
    console.log(`💭 How o3 thinks: "${highResult.reasoningSummary?.substring(0, 200)}..."`);
    console.log('');
  }

  console.log('💡 RECOMMENDATION FOR THE SCENARIST CORE v2.0:');
  
  if (results.high.success) {
    console.log('✅ USE O3 WITH HIGH REASONING EFFORT');
    console.log('   - Maximum thinking capability');
    console.log('   - Visible reasoning process');
    console.log('   - Reasoning persistence between story phases');
    console.log('   - Perfect for deep story analysis');
  }
  
  console.log('='.repeat(70));
}

runReasoningTests().catch(console.error);
