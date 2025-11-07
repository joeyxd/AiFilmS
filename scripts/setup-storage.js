import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Setup storage buckets
async function setupStorage() {
  console.log('🗄️ Setting up Supabase Storage...\n');

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables');
    process.exit(1);
  }

  // Use service key for admin operations
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError.message);
      return;
    }

    console.log('📋 Current buckets:', buckets.map(b => b.name));

    const bucketExists = buckets.some(bucket => bucket.name === 'story-assets');

    if (bucketExists) {
      console.log('✅ "story-assets" bucket already exists');
    } else {
      console.log('🔧 Creating "story-assets" bucket...');
      
      const { data, error } = await supabase.storage.createBucket('story-assets', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        fileSizeLimit: 10485760, // 10MB
      });

      if (error) {
        console.error('❌ Error creating bucket:', error.message);
      } else {
        console.log('✅ "story-assets" bucket created successfully!');
      }
    }

    // Test upload permissions
    console.log('\n🔐 Testing upload permissions...');
    
    const testFileName = `test-${Date.now()}.json`;
    const testContent = JSON.stringify({ test: 'upload file' });
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('story-assets')
      .upload(testFileName, testContent, {
        contentType: 'application/json'
      });

    if (uploadError) {
      console.error('❌ Upload test failed:', uploadError.message);
    } else {
      console.log('✅ Upload test successful');
      
      // Clean up test file
      const { error: deleteError } = await supabase.storage
        .from('story-assets')
        .remove([testFileName]);
        
      if (!deleteError) {
        console.log('✅ Test file cleaned up');
      }
    }

  } catch (error) {
    console.error('❌ Storage setup error:', error.message);
  }

  console.log('\n🎯 Storage setup complete!');
}

// Run the setup
setupStorage().catch(console.error);
