import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
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

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Sample test images with their data
const testImages = [
  {
    prompt: "A futuristic cyberpunk city at night with neon lights reflecting on wet streets",
    model: "google/gemini-2.5-flash-image-preview",
    tags: ["cyberpunk", "city", "neon", "futuristic", "night"]
  },
  {
    prompt: "A magical forest with glowing mushrooms and fairy lights",
    model: "google/gemini-2.5-flash-image-preview", 
    tags: ["magical", "forest", "mushrooms", "fairy", "fantasy"]
  },
  {
    prompt: "A cute robot painting a landscape in watercolor style",
    model: "openai/dall-e-3",
    tags: ["robot", "painting", "watercolor", "landscape", "art"]
  },
  {
    prompt: "An ancient dragon flying over snow-capped mountains",
    model: "openai/gpt-image-1",
    tags: ["dragon", "mountains", "fantasy", "ancient", "flying"]
  },
  {
    prompt: "A steampunk airship floating above Victorian London",
    model: "openai/dall-e-2",
    tags: ["steampunk", "airship", "victorian", "london", "vintage"]
  },
  {
    prompt: "A serene Japanese garden with cherry blossoms",
    model: "google/gemini-2.5-flash-image-preview",
    tags: ["japanese", "garden", "cherry", "blossoms", "serene"]
  },
  {
    prompt: "A space station orbiting a colorful nebula",
    model: "openai/gpt-image-1",
    tags: ["space", "station", "nebula", "colorful", "sci-fi"]
  },
  {
    prompt: "A cozy library filled with floating books and warm light",
    model: "openai/dall-e-3",
    tags: ["library", "books", "cozy", "magical", "warm"]
  }
];

// Function to create a base64 placeholder image
function createPlaceholderImage(text, width = 1024, height = 1024) {
  // Create a simple SVG placeholder
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad1)"/>
      <text x="50%" y="40%" font-family="Arial, sans-serif" font-size="24" font-weight="bold" 
            text-anchor="middle" fill="white">${text.substring(0, 30)}...</text>
      <text x="50%" y="60%" font-family="Arial, sans-serif" font-size="16" 
            text-anchor="middle" fill="rgba(255,255,255,0.8)">AI Generated Image</text>
      <text x="50%" y="75%" font-family="Arial, sans-serif" font-size="14" 
            text-anchor="middle" fill="rgba(255,255,255,0.6)">${width}×${height}</text>
    </svg>
  `;
  
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

async function getAdminUserId() {
  try {
    // Get the first admin user from profiles table
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, username')
      .limit(1);

    if (error) {
      console.error('Error fetching admin profile:', error);
      return null;
    }

    if (profiles && profiles.length > 0) {
      console.log(`📋 Using admin user: ${profiles[0].username} (${profiles[0].id})`);
      return profiles[0].id;
    }

    // If no admin found, get any user
    const { data: anyProfiles, error: anyError } = await supabase
      .from('profiles')
      .select('id, username')
      .limit(1);

    if (anyError) {
      console.error('Error fetching any profile:', anyError);
      return null;
    }

    if (anyProfiles && anyProfiles.length > 0) {
      console.log(`📋 Using user: ${anyProfiles[0].username} (${anyProfiles[0].id})`);
      return anyProfiles[0].id;
    }

    return null;
  } catch (err) {
    console.error('Error getting user ID:', err);
    return null;
  }
}

async function populateTestImages() {
  try {
    console.log('🎨 Starting to populate test images...');
    
    const userId = await getAdminUserId();
    if (!userId) {
      console.error('❌ No user found to associate images with');
      return;
    }

    // Clear existing test images (optional)
    console.log('🧹 Cleaning up existing test images...');
    const { error: deleteError } = await supabase
      .from('user_generated_images')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      console.warn('⚠️ Could not clean existing images:', deleteError.message);
    }

    console.log('🖼️ Creating test images...');
    const imagesToInsert = [];

    for (let i = 0; i < testImages.length; i++) {
      const testImage = testImages[i];
      const imageData = createPlaceholderImage(testImage.prompt);
      
      imagesToInsert.push({
        user_id: userId,
        prompt: testImage.prompt,
        model: testImage.model,
        image_url: imageData,
        image_width: 1024,
        image_height: 1024,
        file_size: Math.round(imageData.length * 0.75), // Approximate file size
        mime_type: 'image/svg+xml',
        base64_data: imageData,
        is_public: i % 3 === 0, // Make every 3rd image public
        is_featured: i < 2, // Feature first 2 images
        generation_metadata: {
          usage: {
            prompt_tokens: Math.floor(Math.random() * 50) + 10,
            completion_tokens: 0,
            total_tokens: Math.floor(Math.random() * 50) + 10
          },
          model_name: testImage.model.split('/')[1] || testImage.model,
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(), // Random time within last week
          generation_type: i % 4 === 0 ? 'image-to-image' : 'text-to-image',
          input_image_used: i % 4 === 0
        },
        tags: testImage.tags
      });

      console.log(`📝 Prepared image ${i + 1}: "${testImage.prompt.substring(0, 40)}..."`);
    }

    // Insert all images
    const { data, error } = await supabase
      .from('user_generated_images')
      .insert(imagesToInsert)
      .select();

    if (error) {
      console.error('❌ Error inserting images:', error);
      return;
    }

    console.log(`✅ Successfully inserted ${data.length} test images`);

    // Create some showcase images from the public ones
    const publicImages = data.filter(img => img.is_public);
    if (publicImages.length > 0) {
      console.log('🌟 Creating showcase images...');
      
      const showcaseImages = publicImages.slice(0, 3).map((img, index) => ({
        original_image_id: img.id,
        title: `Featured Creation ${index + 1}`,
        description: `Amazing AI-generated artwork: ${img.prompt.substring(0, 100)}`,
        prompt: img.prompt,
        model: img.model,
        image_url: img.image_url,
        creator_username: 'AI Artist',
        featured_order: index + 1,
        is_active: true,
        view_count: Math.floor(Math.random() * 500) + 50,
        like_count: Math.floor(Math.random() * 100) + 10,
        tags: img.tags
      }));

      const { data: showcaseData, error: showcaseError } = await supabase
        .from('showcase_images')
        .insert(showcaseImages)
        .select();

      if (showcaseError) {
        console.warn('⚠️ Error creating showcase images:', showcaseError.message);
      } else {
        console.log(`✅ Created ${showcaseData.length} showcase images`);
      }
    }

    console.log('\n🎉 Database population complete!');
    console.log(`📊 Summary:`);
    console.log(`   • ${data.length} user images created`);
    console.log(`   • ${publicImages.length} public images`);
    console.log(`   • ${data.filter(img => img.is_featured).length} featured images`);
    console.log(`   • Mixed models: Gemini, DALL-E 2/3, GPT Image`);

  } catch (err) {
    console.error('💥 Error populating images:', err);
  }
}

// Run the script
populateTestImages();
