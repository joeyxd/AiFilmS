import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import path from 'path';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: ['.env.local', '.env'] });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in environment variables');
  process.exit(1);
}

// Use service key for admin access
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// xxajxx user ID from auth users
const XXAJXX_USER_ID = '59e25912-f7c2-4816-a97d-6306fa37eadc';

// Create a simple placeholder SVG image
function createPlaceholderImage(prompt, color = '#4F46E5') {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
        <stop offset="100%" style="stop-color:#1e40af;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="512" height="512" fill="url(#grad)"/>
    <text x="256" y="220" font-family="Arial, sans-serif" font-size="16" fill="white" text-anchor="middle" opacity="0.8">AI Generated</text>
    <text x="256" y="280" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="white" text-anchor="middle">${prompt.substring(0, 20)}...</text>
    <text x="256" y="320" font-family="Arial, sans-serif" font-size="14" fill="white" text-anchor="middle" opacity="0.7">Test Image</text>
  </svg>`;
  
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

const testImages = [
  { prompt: "A futuristic cyberpunk city at night with neon lights", model: "google/gemini-2.0-flash-exp (NanoBanana)", color: "#FF6B6B" },
  { prompt: "A magical forest with glowing mushrooms and fairy lights", model: "openai/dall-e-3", color: "#4ECDC4" },
  { prompt: "A cute robot painting a landscape in watercolor style", model: "openai/dall-e-2", color: "#45B7D1" },
  { prompt: "An ancient dragon flying over snow-capped mountains", model: "google/gemini-2.0-flash-exp (NanoBanana)", color: "#96CEB4" },
  { prompt: "A steampunk airship floating above Victorian London", model: "openai/gpt-image", color: "#FFEAA7" },
  { prompt: "A serene Japanese garden with cherry blossoms", model: "openai/dall-e-3", color: "#DDA0DD" },
  { prompt: "A space station orbiting a colorful nebula", model: "google/gemini-2.0-flash-exp (NanoBanana)", color: "#98D8C8" },
  { prompt: "A cozy library filled with floating books and warm light", model: "openai/dall-e-2", color: "#F7DC6F" }
];

async function populateImagesForXxajxx() {
  console.log('🎨 Creating test images for xxajxx user...');
  
  try {
    // Clear existing images for this user
    console.log('🧹 Cleaning up existing images...');
    const { error: deleteError } = await supabase
      .from('user_generated_images')
      .delete()
      .eq('user_id', XXAJXX_USER_ID);

    if (deleteError) {
      console.warn('⚠️ Could not clean existing images:', deleteError.message);
    }

    // Create user images
    const imagesToInsert = [];
    
    for (let i = 0; i < testImages.length; i++) {
      const testImage = testImages[i];
      const imageData = createPlaceholderImage(testImage.prompt, testImage.color);
      
      imagesToInsert.push({
        user_id: XXAJXX_USER_ID,
        prompt: testImage.prompt,
        model: testImage.model,
        image_url: imageData,
        is_public: Math.random() > 0.5, // Random public/private
        created_at: new Date().toISOString()
      });
      
      console.log(`📝 Prepared image ${i + 1}: "${testImage.prompt.substring(0, 40)}..."`);
    }

    const { error: insertError } = await supabase
      .from('user_generated_images')
      .insert(imagesToInsert);

    if (insertError) {
      console.error('❌ Error inserting user images:', insertError);
      return;
    }

    console.log(`✅ Successfully created ${imagesToInsert.length} test images for xxajxx`);

    // Also update showcase images to include some from xxajxx
    console.log('🌟 Adding some images to showcase...');
    
    const showcaseImages = [
      {
        image_url: createPlaceholderImage("Featured: Epic space battle scene", "#FF4757"),
        title: "Epic Space Battle",
        description: "A dramatic space battle with laser beams and starships",
        user_id: XXAJXX_USER_ID,
        is_featured: true,
        created_at: new Date().toISOString()
      },
      {
        image_url: createPlaceholderImage("Featured: Mystical forest portal", "#5F27CD"),
        title: "Mystical Portal",
        description: "A glowing portal in an enchanted forest clearing",
        user_id: XXAJXX_USER_ID,
        is_featured: false,
        created_at: new Date().toISOString()
      }
    ];

    const { error: showcaseError } = await supabase
      .from('showcase_images')
      .insert(showcaseImages);

    if (showcaseError) {
      console.warn('⚠️ Could not add showcase images:', showcaseError.message);
    } else {
      console.log('✅ Added 2 showcase images');
    }

    console.log('\n🎉 Image population complete!');
    console.log('📊 Summary for xxajxx user:');
    console.log(`   • ${testImages.length} personal images created`);
    console.log('   • 2 showcase images added');
    console.log('   • Mixed AI models represented');
    console.log('\n💡 Refresh your browser to see the images!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

populateImagesForXxajxx();
