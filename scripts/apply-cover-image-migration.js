import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Apply cover image migration
async function applyCoverImageMigration() {
  console.log('🔄 Applying cover image fields migration...');

  // Check environment variables
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY;

  if (!supabaseUrl) {
    console.error('❌ VITE_SUPABASE_URL environment variable is required');
    process.exit(1);
  }

  if (!supabaseServiceKey) {
    console.error('❌ VITE_SUPABASE_SERVICE_KEY environment variable is required');
    console.log('💡 You need the service role key for database migrations');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Read the SQL migration file
    const sqlPath = path.join(__dirname, '..', 'supabase-cover-image-fields.sql');
    
    if (!fs.existsSync(sqlPath)) {
      console.error(`❌ Migration file not found: ${sqlPath}`);
      process.exit(1);
    }

    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📝 Reading migration file...');
    console.log(`📍 File: ${sqlPath}`);

    // Split into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--') && stmt.length > 10);
    
    console.log(`� Found ${statements.length} SQL statements to execute\n`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement) continue;
      
      console.log(`⚙️  Executing statement ${i + 1}/${statements.length}:`);
      console.log(`   ${statement.substring(0, 80)}${statement.length > 80 ? '...' : ''}`);
      
      // Use the RPC function to execute raw SQL
      const { data, error } = await supabase.rpc('exec_sql', { 
        sql: statement 
      });
      
      if (error) {
        // Some errors might be expected (like "already exists")
        if (error.message.includes('already exists') || 
            error.message.includes('relation') && error.message.includes('already exists')) {
          console.log(`   ⚠️  Already exists (skipping): ${error.message.split('.')[0]}`);
        } else {
          console.error(`   ❌ Error: ${error.message}`);
          // Don't exit on errors, continue with other statements
        }
      } else {
        console.log(`   ✅ Success`);
      }
    }
    
    console.log('\n🎉 Cover image migration completed!');
    
    // Test the migration worked
    console.log('\n🔍 Testing migration results...');
    
    // Test stories table has new columns
    const { data: testStories, error: testError } = await supabase
      .from('stories')
      .select('id, cover_image_url, cover_image_prompt')
      .limit(1);
    
    if (testError) {
      if (testError.message.includes('column') && testError.message.includes('does not exist')) {
        console.log('❌ Migration may have failed - columns not found');
      } else {
        console.log(`⚠️  Test query: ${testError.message}`);
      }
    } else {
      console.log('✅ Stories table: cover_image_url and cover_image_prompt columns ready');
    }
    
    // Test story_images table
    const { data: testImages, error: imagesError } = await supabase
      .from('story_images')
      .select('id')
      .limit(1);
    
    if (imagesError) {
      if (imagesError.message.includes('relation') && imagesError.message.includes('does not exist')) {
        console.log('❌ story_images table was not created');
      } else {
        console.log(`⚠️  story_images test: ${imagesError.message}`);
      }
    } else {
      console.log('✅ story_images table: Created and accessible');
    }

    console.log('\n📋 Next steps:');
    console.log('1. Create the "story-assets" storage bucket in Supabase Dashboard');
    console.log('2. Test story creation with cover image generation');
    console.log('3. Verify image storage is working properly');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('- Ensure you have the service role key (not anon key)');
    console.log('- Check your Supabase project has the exec_sql function enabled');
    console.log('- Try running individual SQL statements in Supabase SQL Editor');
    process.exit(1);
  }
}

// Run the migration
applyCoverImageMigration();
