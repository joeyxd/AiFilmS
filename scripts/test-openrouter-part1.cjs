const { convertBase64ToImage } = require('./convert-base64-image.cjs');

async function testOpenRouterImageGeneration() {
    console.log('🎨 Testing OpenRouter Image Generation - Part 1: API Call');
    
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    if (!OPENROUTER_API_KEY) {
        throw new Error('❌ OPENROUTER_API_KEY not found in environment variables');
    }

    const prompt = "A cute robot painting a landscape";
    console.log(`📝 Prompt: "${prompt}"`);
    
    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'http://localhost:3000',
                'X-Title': 'FilmStudio2 Image Generation Test'
            },
            body: JSON.stringify({
                model: 'google/gemini-2.0-flash-thinking-exp:free',
                messages: [{
                    role: 'user',
                    content: prompt
                }],
                temperature: 0.7,
                max_tokens: 2000
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }

        const result = await response.json();
        
        // Save the full response for analysis
        const fs = require('fs');
        const responseFile = './test-results/openrouter-image-response.json';
        fs.writeFileSync(responseFile, JSON.stringify(result, null, 2));
        console.log(`💾 Full response saved to: ${responseFile}`);
        
        console.log('📊 Response Summary:');
        console.log(`- Model: ${result.model || 'Unknown'}`);
        console.log(`- Usage: ${JSON.stringify(result.usage || {})}`);
        console.log(`- Choices: ${result.choices?.length || 0}`);
        
        return result;
        
    } catch (error) {
        console.error('❌ Error in OpenRouter API call:', error.message);
        throw error;
    }
}

// Export for use in part 2
module.exports = { testOpenRouterImageGeneration };

// Run if called directly
if (require.main === module) {
    testOpenRouterImageGeneration()
        .then(() => console.log('✅ Part 1 completed successfully'))
        .catch(console.error);
}
