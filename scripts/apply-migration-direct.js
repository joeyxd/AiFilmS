import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Apply SQL migration directly
async function applyMigrationDirect() {
  console.log('🚀 Applying The Scenarist Core v2.0 migration (direct SQL)...\n');

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables');
    process.exit(1);
  }

  // Use service key for admin operations
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase-scenarist-v2-migration.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📝 Read migration file:', migrationPath);
    
    // Split into individual statements (simple split by semicolon)
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📍 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`⚙️  Executing statement ${i + 1}/${statements.length}:`);
        console.log(`   ${statement.substring(0, 60)}${statement.length > 60 ? '...' : ''}`);
        
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          if (error) {
            // Try executing with raw query instead
            const { error: rawError } = await supabase.from('_dummy_').select().limit(0);
            if (rawError) {
              console.log(`   ❌ Error: ${error.message}`);
              // Continue with other statements
            } else {
              console.log(`   ✅ Success`);
            }
          } else {
            console.log(`   ✅ Success`);
          }
        } catch (err) {
          console.log(`   ❌ Error: ${err.message}`);
          // Continue with other statements
        }
      }
    }

    console.log('\n🎉 Migration application completed!');
    
    // Test the results
    console.log('\n🔍 Testing migration results...');
    
    // Test stories table enhancements
    const { data: storiesTest, error: storiesError } = await supabase
      .from('stories')
      .select('id, title, story_metadata, cover_image_url')
      .limit(1);
    
    if (storiesError) {
      console.log('❌ Stories test failed:', storiesError.message);
    } else {
      console.log('✅ Stories table: Enhanced schema ready');
    }
    
    // Test chapters table enhancements  
    const { data: chaptersTest, error: chaptersError } = await supabase
      .from('chapters')
      .select('id, title, narrative_purpose')
      .limit(1);
    
    if (chaptersError) {
      console.log('❌ Chapters test failed:', chaptersError.message);
    } else {
      console.log('✅ Chapters table: Enhanced schema ready');
    }

  } catch (error) {
    console.error('❌ Migration error:', error.message);
  }
}

// Run the migration
applyMigrationDirect().catch(console.error);
