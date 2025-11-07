import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Test database connection and basic operations
async function testDatabaseConnection() {
  console.log('🔍 Testing Database Connection...\n');

  // Check environment variables
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY;

  console.log('📋 Environment Variables Check:');
  console.log(`VITE_SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`);
  console.log(`VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅ Set' : '❌ Missing'}`);
  console.log(`VITE_SUPABASE_SERVICE_KEY: ${supabaseServiceKey ? '✅ Set' : '❌ Missing'}\n`);

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing required environment variables!');
    console.log('\n🔧 Create a .env file with:');
    console.log('VITE_SUPABASE_URL=your_supabase_url');
    console.log('VITE_SUPABASE_ANON_KEY=your_supabase_anon_key');
    console.log('VITE_SUPABASE_SERVICE_KEY=your_supabase_service_key');
    return;
  }

  // Test with anon key (client connection)
  console.log('🔌 Testing Client Connection (Anon Key)...');
  const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  
  try {
    // Test basic connection
    const { data: healthCheck, error: healthError } = await supabaseClient
      .from('profiles')
      .select('count')
      .limit(1);

    if (healthError) {
      console.log(`⚠️  Client connection test: ${healthError.message}`);
    } else {
      console.log('✅ Client connection successful!');
    }
  } catch (error) {
    console.log(`❌ Client connection failed: ${error.message}`);
  }

  // Test with service key (admin connection) if available
  if (supabaseServiceKey) {
    console.log('\n🔌 Testing Admin Connection (Service Key)...');
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    try {
      // Test admin connection with a simple query
      const { data: adminTest, error: adminError } = await supabaseAdmin
        .from('profiles')
        .select('count')
        .limit(1);

      if (adminError) {
        console.log(`⚠️  Admin connection test: ${adminError.message}`);
      } else {
        console.log('✅ Admin connection successful!');
      }
    } catch (error) {
      console.log(`❌ Admin connection failed: ${error.message}`);
    }
  }

  // Test table existence
  console.log('\n📊 Testing Table Structure...');
  const tablesToCheck = [
    'profiles',
    'stories', 
    'chapters',
    'characters',
    'scenes',
    'shots',
    'story_images'
  ];

  for (const table of tablesToCheck) {
    try {
      const { data, error } = await supabaseClient
        .from(table)
        .select('count')
        .limit(1);

      if (error) {
        if (error.message.includes('relation') && error.message.includes('does not exist')) {
          console.log(`❌ Table "${table}": Does not exist`);
        } else {
          console.log(`⚠️  Table "${table}": ${error.message}`);
        }
      } else {
        console.log(`✅ Table "${table}": Exists and accessible`);
      }
    } catch (error) {
      console.log(`❌ Table "${table}": ${error.message}`);
    }
  }

  // Test storage bucket
  console.log('\n🗄️  Testing Storage...');
  try {
    const { data: buckets, error: bucketsError } = await supabaseClient.storage.listBuckets();
    
    if (bucketsError) {
      console.log(`⚠️  Storage test: ${bucketsError.message}`);
    } else {
      console.log(`✅ Storage accessible, found ${buckets.length} buckets`);
      
      // Check for story-assets bucket
      const storyAssetsBucket = buckets.find(bucket => bucket.name === 'story-assets');
      if (storyAssetsBucket) {
        console.log(`✅ "story-assets" bucket: Exists`);
      } else {
        console.log(`⚠️  "story-assets" bucket: Not found (create manually in Supabase Dashboard)`);
      }
    }
  } catch (error) {
    console.log(`❌ Storage test failed: ${error.message}`);
  }

  // Test authentication
  console.log('\n🔐 Testing Authentication...');
  try {
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError) {
      console.log(`ℹ️  Auth test: No user logged in (expected for script)`);
    } else if (user) {
      console.log(`✅ Auth test: User logged in - ${user.email}`);
    } else {
      console.log(`ℹ️  Auth test: No user session (expected for script)`);
    }
  } catch (error) {
    console.log(`❌ Auth test failed: ${error.message}`);
  }

  console.log('\n🎯 Database Connection Test Complete!');
  
  // Summary and recommendations
  console.log('\n📋 Summary & Recommendations:');
  console.log('1. If tables are missing, run the database schema migration');
  console.log('2. If storage bucket is missing, create "story-assets" bucket in Supabase Dashboard');
  console.log('3. If connection issues persist, check your environment variables');
  console.log('4. For timeout issues, check your network connection and Supabase region');
}

// Error handling wrapper
async function runTest() {
  try {
    await testDatabaseConnection();
  } catch (error) {
    console.error('\n💥 Test script failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('- Check your .env file exists and has correct values');
    console.log('- Verify your Supabase project is active');
    console.log('- Check your internet connection');
    console.log('- Try running: npm install @supabase/supabase-js');
  }
}

// Run the test
runTest();
