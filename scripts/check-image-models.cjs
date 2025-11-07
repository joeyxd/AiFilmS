const fetch = require('node-fetch');
require('dotenv').config();

const headers = {
  'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
  'Content-Type': 'application/json'
};

// Check available models
fetch('https://openrouter.ai/api/v1/models', { headers })
  .then(res => res.json())
  .then(data => {
    console.log('🔍 Searching for image models...');
    const imageModels = data.data.filter(model => 
      model.id.includes('image') || 
      model.id.includes('gemini') ||
      (model.architecture && model.architecture.includes('image')) ||
      model.id.includes('dall-e')
    );
    
    console.log(`\nFound ${imageModels.length} potential image models:`);
    imageModels.forEach(model => {
      const pricing = model.pricing;
      const isFree = pricing.prompt === 0 && pricing.completion === 0;
      console.log(`${isFree ? '🆓' : '💰'} ${model.id}`);
      console.log(`   Name: ${model.name || 'N/A'}`);
      console.log(`   Pricing: $${pricing.prompt}/1K prompt, $${pricing.completion}/1K completion`);
      console.log();
    });
  })
  .catch(err => console.error('Error:', err));
