const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Test prompt
const TEST_PROMPT = "A cute robot painting a landscape on canvas in an art studio, digital art";

// Ensure test results directory exists
const resultsDir = path.join(__dirname, '..', 'test-results', 'images');
const downloadDir = path.join(resultsDir, 'downloaded');
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}
if (!fs.existsSync(downloadDir)) {
  fs.mkdirSync(downloadDir, { recursive: true });
}

async function testOpenRouterImageDetailed() {
  console.log('🎨 DETAILED OPENROUTER IMAGE TEST');
  console.log('=' .repeat(60));
  console.log(`Prompt: "${TEST_PROMPT}"`);
  console.log('─'.repeat(60));
  
  const startTime = Date.now();
  
  try {
    console.log('📡 Making API request to OpenRouter...');
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'FilmStudio AI'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: TEST_PROMPT
          }
        ],
        max_tokens: 2000
      })
    });

    const responseTime = Date.now() - startTime;
    
    if (!response.ok) {
      const errorData = await response.text();
      console.log(`❌ FAILED (${responseTime}ms)`);
      console.log(`💥 Error: HTTP ${response.status}: ${errorData}`);
      return;
    }

    const data = await response.json();
    
    console.log(`✅ Response received (${responseTime}ms)`);
    console.log('🔍 Full response structure:');
    console.log(JSON.stringify(data, null, 2));
    
    console.log();
    console.log('📊 Usage details:');
    if (data.usage) {
      console.log(`  Total tokens: ${data.usage.total_tokens}`);
      console.log(`  Prompt tokens: ${data.usage.prompt_tokens}`);
      console.log(`  Completion tokens: ${data.usage.completion_tokens}`);
      if (data.usage.completion_tokens_details) {
        console.log(`  Image tokens: ${data.usage.completion_tokens_details.image_tokens}`);
      }
    }
    
    console.log();
    console.log('📝 Response content:');
    if (data.choices && data.choices[0] && data.choices[0].message) {
      const content = data.choices[0].message.content;
      console.log(`"${content}"`);
      
      // Check for different possible image formats in the response
      console.log();
      console.log('🔍 Searching for image data...');
      
      // Look for base64 encoded images
      if (content.includes('data:image/')) {
        console.log('📸 Found base64 image data!');
        const base64Match = content.match(/data:image\/[^;]+;base64,([^\\s"]+)/);
        if (base64Match) {
          const base64Data = base64Match[1];
          const filename = `openrouter_gemini_base64_${Date.now()}.png`;
          const filepath = path.join(downloadDir, filename);
          
          try {
            const buffer = Buffer.from(base64Data, 'base64');
            fs.writeFileSync(filepath, buffer);
            const fileSizeKB = Math.round(buffer.length / 1024);
            console.log(`✅ Saved base64 image: ${filename} (${fileSizeKB} KB)`);
          } catch (err) {
            console.log(`❌ Failed to save base64 image: ${err.message}`);
          }
        }
      }
      
      // Look for URLs
      if (content.includes('http')) {
        console.log('🔗 Found URL in response!');
        const urlMatches = content.match(/https?:\/\/[^\s"<>]+/g);
        if (urlMatches) {
          console.log(`Found ${urlMatches.length} URLs:`);
          urlMatches.forEach((url, i) => {
            console.log(`  ${i + 1}. ${url}`);
          });
          
          // Try to download the first URL that looks like an image
          for (const url of urlMatches) {
            if (url.match(/\.(png|jpg|jpeg|gif|webp)($|\?)/i)) {
              console.log(`📥 Attempting to download: ${url}`);
              try {
                const imgResponse = await fetch(url);
                if (imgResponse.ok) {
                  const buffer = await imgResponse.buffer();
                  const filename = `openrouter_gemini_url_${Date.now()}.png`;
                  const filepath = path.join(downloadDir, filename);
                  fs.writeFileSync(filepath, buffer);
                  const fileSizeKB = Math.round(buffer.length / 1024);
                  console.log(`✅ Downloaded image: ${filename} (${fileSizeKB} KB)`);
                  break;
                } else {
                  console.log(`❌ Failed to download: HTTP ${imgResponse.status}`);
                }
              } catch (err) {
                console.log(`❌ Download error: ${err.message}`);
              }
            }
          }
        }
      }
      
      // Check if the response indicates the image was generated but not provided directly
      if (data.usage?.completion_tokens_details?.image_tokens > 0) {
        console.log('🤔 Image tokens were used but no image URL/data found in response');
        console.log('   This suggests the model generated an image but returned it differently');
        console.log('   OpenRouter Gemini might use a different response format');
      }
      
    } else {
      console.log('❌ No message content in response');
    }

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.log(`❌ FAILED (${responseTime}ms)`);
    console.log(`💥 Error: ${error.message}`);
  }
}

// Check OpenRouter models to see image model details
async function checkImageModelDetails() {
  console.log('🔍 CHECKING OPENROUTER IMAGE MODEL DETAILS');
  console.log('=' .repeat(50));
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      const geminiModel = data.data.find(model => 
        model.id === 'google/gemini-2.5-flash-image-preview'
      );
      
      if (geminiModel) {
        console.log('📋 Gemini Image Model Details:');
        console.log(JSON.stringify(geminiModel, null, 2));
      } else {
        console.log('❌ Gemini image model not found');
        
        // Look for any image-related models
        const imageModels = data.data.filter(model => 
          model.id.includes('image') || model.name?.includes('image')
        );
        console.log(`🔍 Found ${imageModels.length} image-related models:`);
        imageModels.forEach(model => {
          console.log(`  - ${model.id}: ${model.name}`);
        });
      }
    } else {
      console.log(`❌ Failed to fetch models: HTTP ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Error fetching models: ${error.message}`);
  }
  
  console.log();
}

async function runDetailedTest() {
  await checkImageModelDetails();
  await testOpenRouterImageDetailed();
  
  console.log();
  console.log('📁 Check downloaded images in:', downloadDir);
}

// Run the detailed test
runDetailedTest().catch(console.error);
