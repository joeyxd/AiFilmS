/**
 * Debug script to analyze OpenRouter image responses in detail
 */

async function debugOpenRouterImageResponse() {
  console.log('🔍 OpenRouter Image Response Debug');
  console.log('='.repeat(40));
  
  const apiKey = process.env.OPENROUTER_API_KEY || "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";
  
  if (!apiKey) {
    console.error('❌ API key not found');
    return;
  }

  try {
    const request = {
      model: 'google/gemini-2.5-flash-image-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an AI image generator. Generate a detailed image based on the user\'s prompt.'
        },
        {
          role: 'user',
          content: 'Generate an image: A cute robot painting a landscape'
        }
      ],
      max_tokens: 4096,
      temperature: 0.8
    };

    console.log('📤 Request:', JSON.stringify(request, null, 2));
    console.log('\n🔄 Making API call...');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'FilmStudio AI Debug'
      },
      body: JSON.stringify(request)
    });

    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      return;
    }

    const data = await response.json();
    
    console.log('\n📥 Full Response Structure:');
    console.log('Keys:', Object.keys(data));
    
    console.log('\n📊 Usage:', data.usage);
    console.log('📝 Model:', data.model);
    console.log('🔢 Choices:', data.choices?.length || 0);
    
    if (data.choices && data.choices.length > 0) {
      const choice = data.choices[0];
      console.log('\n📋 First Choice:');
      console.log('- Role:', choice.message?.role);
      console.log('- Content Length:', choice.message?.content?.length);
      console.log('- Finish Reason:', choice.finish_reason);
      
      console.log('\n📄 Content:');
      console.log(`"${choice.message?.content}"`);
    }

    // Save full response for analysis
    const fs = require('fs');
    const outputDir = './test-results';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const responseFile = `${outputDir}/openrouter-debug-response.json`;
    fs.writeFileSync(responseFile, JSON.stringify(data, null, 2));
    console.log(`\n💾 Full response saved to: ${responseFile}`);

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

// Run debug
debugOpenRouterImageResponse()
  .then(() => console.log('\n✅ Debug completed'))
  .catch(console.error);
