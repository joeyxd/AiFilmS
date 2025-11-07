// Realistic Cost Calculator for The Scenarist Core v2.0
// Based on actual o3 pricing: $2 input / $8 output per 1M tokens

console.log('💰 The Scenarist Core v2.0 - REAL Cost Analysis');
console.log('='.repeat(60));
console.log('');

// Based on our test results and typical story analysis
const storyAnalysis = {
  // Estimated tokens per phase based on our tests
  phase1: { input: 1500, output: 800, reasoning: 768 },
  phase2: { input: 2000, output: 1200, reasoning: 640 },
  phase3: { input: 2500, output: 1500, reasoning: 400 }, 
  phase4: { input: 1800, output: 1000, reasoning: 200 },
  phase5: { input: 1200, output: 600, reasoning: 100 }
};

// o3 pricing per 1M tokens
const pricing = {
  input: 2.00,      // $2 per 1M input tokens
  output: 8.00,     // $8 per 1M output tokens (includes reasoning)
  cached: 0.50      // $0.50 per 1M cached input tokens
};

function calculatePhaseCost(phase, phaseName) {
  const inputCost = (phase.input / 1000000) * pricing.input;
  const outputCost = ((phase.output + phase.reasoning) / 1000000) * pricing.output;
  const totalCost = inputCost + outputCost;
  
  console.log(`${phaseName}:`);
  console.log(`  Input: ${phase.input} tokens = $${inputCost.toFixed(4)}`);
  console.log(`  Output: ${phase.output} tokens = $${outputCost.toFixed(4)}`);
  console.log(`  Reasoning: ${phase.reasoning} tokens (included in output)`);
  console.log(`  Phase Total: $${totalCost.toFixed(4)}`);
  console.log('');
  
  return totalCost;
}

console.log('📊 COST BREAKDOWN PER STORY ANALYSIS:');
console.log('');

let totalCost = 0;
Object.entries(storyAnalysis).forEach(([phaseKey, phase], index) => {
  const phaseName = `Phase ${index + 1} (${phaseKey})`;
  const cost = calculatePhaseCost(phase, phaseName);
  totalCost += cost;
});

console.log('='.repeat(40));
console.log(`💸 TOTAL COST PER STORY: $${totalCost.toFixed(4)}`);
console.log('='.repeat(40));
console.log('');

// Volume pricing scenarios
console.log('📈 VOLUME COST SCENARIOS:');
console.log('');

const volumes = [1, 10, 100, 1000];
volumes.forEach(volume => {
  const volumeCost = totalCost * volume;
  console.log(`${volume} stories: $${volumeCost.toFixed(2)}`);
});

console.log('');

// Cost optimization with caching
console.log('🚀 COST OPTIMIZATION WITH CACHING:');
console.log('');

// With caching, subsequent stories reuse context (75% cheaper input)
const cachedInputCost = (8000 / 1000000) * pricing.cached; // Assuming 8k cached tokens
const freshInputCost = (2000 / 1000000) * pricing.input;   // Assuming 2k fresh tokens  
const outputCost = (4100 / 1000000) * pricing.output;      // Total output tokens

const optimizedCost = cachedInputCost + freshInputCost + outputCost;

console.log(`With caching optimization: $${optimizedCost.toFixed(4)} per story`);
console.log(`Savings: ${((totalCost - optimizedCost) / totalCost * 100).toFixed(1)}%`);
console.log('');

// Comparison with alternatives
console.log('💡 COST COMPARISON:');
console.log('');
console.log(`o3 (maximum reasoning): $${totalCost.toFixed(4)} per story`);
console.log(`Human script consultant: $500-2000 per story`);
console.log(`Professional story analyst: $1000-5000 per story`);
console.log(`Film development consultant: $2000-10000 per story`);
console.log('');

const savings = Math.round(500 / totalCost);
console.log(`🎯 Result: o3 provides ${savings}x more value than cheapest human alternative!`);

// Break-even analysis
console.log('');
console.log('📊 BREAK-EVEN ANALYSIS:');
console.log('If you process:');
console.log(`- 10 stories/month: $${(totalCost * 10).toFixed(2)}/month`);
console.log(`- 50 stories/month: $${(totalCost * 50).toFixed(2)}/month`);  
console.log(`- 100 stories/month: $${(totalCost * 100).toFixed(2)}/month`);
console.log('');

console.log('💰 RECOMMENDATION:');
if (totalCost < 0.50) {
  console.log('✅ EXTREMELY COST-EFFECTIVE - Process unlimited stories!');
} else if (totalCost < 1.00) {
  console.log('✅ VERY AFFORDABLE - Great for high-volume processing');
} else if (totalCost < 2.00) {
  console.log('⚠️  MODERATE COST - Consider volume vs quality tradeoffs');
} else {
  console.log('❌ HIGH COST - Consider o3-mini or GPT-5-mini for volume');
}

console.log('='.repeat(60));
