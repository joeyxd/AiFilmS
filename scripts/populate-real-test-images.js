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

// Use service key for admin access
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// xxajxx auth user ID
const XXAJXX_USER_ID = '59e25912-f7c2-4816-a97d-6306fa37eadc';

async function populateRealTestImages() {
  console.log('🎨 Creating database entries for real test images...');
  
  try {
    // Clear existing placeholder images
    console.log('🧹 Cleaning up existing placeholder images...');
    const { error: deleteError } = await supabase
      .from('user_generated_images')
      .delete()
      .eq('user_id', XXAJXX_USER_ID);

    if (deleteError) {
      console.warn('⚠️ Could not clean existing images:', deleteError.message);
    }

    // Get actual image files from test-results
    const testResultsPath = path.join(process.cwd(), 'test-results', 'images');
    const downloadedPath = path.join(testResultsPath, 'downloaded');
    const generatedPath = path.join(testResultsPath, 'generated');

    const imagesToInsert = [];

    // Process downloaded images (from previous OpenAI tests)
    if (fs.existsSync(downloadedPath)) {
      const downloadedFiles = fs.readdirSync(downloadedPath).filter(file => file.endsWith('.png'));
      console.log(`📁 Found ${downloadedFiles.length} downloaded test images`);
      
      downloadedFiles.forEach((file, index) => {
        imagesToInsert.push({
          user_id: XXAJXX_USER_ID,
          prompt: `Previous OpenAI API test image ${index + 1} - Generated during development testing`,
          model: 'openai/dall-e-3',
          image_url: `/test-results/images/downloaded/${file}`, // Relative path for frontend
          is_public: true,
          created_at: new Date(Date.now() - (downloadedFiles.length - index) * 60000).toISOString() // Spread out timestamps
        });
      });
    }

    // Process generated images (from recent tests)
    if (fs.existsSync(generatedPath)) {
      const generatedFiles = fs.readdirSync(generatedPath).filter(file => file.endsWith('.png'));
      console.log(`📁 Found ${generatedFiles.length} generated test images`);
      
      generatedFiles.forEach((file, index) => {
        const timestamp = file.match(/(\d+)\.png$/)?.[1];
        const testNumber = file.match(/test-(\d+)/)?.[1];
        
        imagesToInsert.push({
          user_id: XXAJXX_USER_ID,
          prompt: `OpenRouter API test image ${testNumber || index + 1} - Generated during API testing`,
          model: 'google/gemini-2.0-flash-exp (NanoBanana)',
          image_url: `/test-results/images/generated/${file}`, // Relative path for frontend
          is_public: true,
          created_at: timestamp ? new Date(parseInt(timestamp)).toISOString() : new Date().toISOString()
        });
      });
    }

    if (imagesToInsert.length === 0) {
      console.log('⚠️ No test images found in test-results folder');
      return;
    }

    // Insert the database entries
    console.log(`💾 Creating ${imagesToInsert.length} database entries...`);
    imagesToInsert.forEach((img, i) => {
      console.log(`📝 ${i + 1}. ${img.image_url} - "${img.prompt.substring(0, 60)}..."`);
    });

    const { error: insertError } = await supabase
      .from('user_generated_images')
      .insert(imagesToInsert);

    if (insertError) {
      console.error('❌ Error inserting image records:', insertError);
      return;
    }

    console.log(`✅ Successfully created ${imagesToInsert.length} database entries for real test images`);

    // Also add some to showcase (using the same real images)
    console.log('🌟 Adding real images to showcase...');
    
    const showcaseImages = [];
    
    // Take the first 2 real images for showcase
    if (imagesToInsert.length >= 2) {
      showcaseImages.push({
        image_url: imagesToInsert[0].image_url,
        title: "Development Test Image",
        description: "Real image generated during API development testing",
        user_id: XXAJXX_USER_ID,
        created_at: new Date().toISOString()
      });

      showcaseImages.push({
        image_url: imagesToInsert[1].image_url,
        title: "OpenRouter API Test",
        description: "Actual AI-generated image from our testing phase",
        user_id: XXAJXX_USER_ID,
        created_at: new Date().toISOString()
      });

      const { error: showcaseError } = await supabase
        .from('showcase_images')
        .insert(showcaseImages);

      if (showcaseError) {
        console.warn('⚠️ Could not add showcase images:', showcaseError.message);
      } else {
        console.log('✅ Added 2 real images to showcase');
      }
    }

    console.log('\n🎉 Database population complete with REAL test images!');
    console.log('📊 Summary:');
    console.log(`   • ${imagesToInsert.length} real test images added to database`);
    console.log(`   • Images reference actual files in test-results folder`);
    console.log(`   • Frontend will display actual PNG files using relative paths`);
    console.log('\n💡 Refresh your browser to see the real test images!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

populateRealTestImages();
