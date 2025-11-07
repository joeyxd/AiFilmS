import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Apply essential table schema fixes
async function fixTableSchema() {
  console.log('🔧 Fixing table schema for story creation...\n');

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables');
    process.exit(1);
  }

  // Use service key for admin operations
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    db: {
      schema: 'public'
    }
  });

  const fixes = [
    {
      name: 'Add missing chapters columns',
      sql: 'ALTER TABLE chapters ADD COLUMN IF NOT EXISTS title TEXT, ADD COLUMN IF NOT EXISTS content TEXT, ADD COLUMN IF NOT EXISTS narrative_purpose TEXT'
    },
    {
      name: 'Add missing characters columns', 
      sql: 'ALTER TABLE characters ADD COLUMN IF NOT EXISTS name TEXT, ADD COLUMN IF NOT EXISTS character_type TEXT, ADD COLUMN IF NOT EXISTS psychology JSONB'
    },
    {
      name: 'Add missing story_images columns',
      sql: 'ALTER TABLE story_images ADD COLUMN IF NOT EXISTS image_url TEXT, ADD COLUMN IF NOT EXISTS image_type TEXT, ADD COLUMN IF NOT EXISTS prompt TEXT'
    },
    {
      name: 'Add story metadata columns',
      sql: 'ALTER TABLE stories ADD COLUMN IF NOT EXISTS story_metadata JSONB, ADD COLUMN IF NOT EXISTS cover_image_url TEXT, ADD COLUMN IF NOT EXISTS cover_image_prompt TEXT'
    }
  ];

  for (const fix of fixes) {
    console.log(`⚙️  ${fix.name}...`);
    try {
      // Use the raw SQL approach with fetch
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey
        },
        body: JSON.stringify({ sql: fix.sql })
      });

      if (response.ok) {
        console.log(`   ✅ Success`);
      } else {
        const error = await response.text();
        console.log(`   ⚠️  Response: ${response.status} - ${error.substring(0, 100)}`);
        
        // Try alternative approach - direct table modification
        if (fix.name.includes('chapters')) {
          await tryAlterTableDirect(supabase, 'chapters', ['title', 'content', 'narrative_purpose']);
        } else if (fix.name.includes('characters')) {
          await tryAlterTableDirect(supabase, 'characters', ['name', 'character_type']);
        } else if (fix.name.includes('story_images')) {
          await tryAlterTableDirect(supabase, 'story_images', ['image_url', 'image_type', 'prompt']);
        }
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }

  console.log('\n🔍 Testing table schema...');
  await testTableSchema(supabase);
}

async function tryAlterTableDirect(supabase, tableName, columns) {
  for (const column of columns) {
    try {
      // Try to query the column to see if it exists
      const { error } = await supabase
        .from(tableName)
        .select(column)
        .limit(1);
      
      if (error && error.message.includes('does not exist')) {
        console.log(`   🔧 Column ${tableName}.${column} needs to be added manually in Supabase Dashboard`);
      } else {
        console.log(`   ✅ Column ${tableName}.${column} exists`);
      }
    } catch (err) {
      console.log(`   ⚠️  Could not check ${tableName}.${column}`);
    }
  }
}

async function testTableSchema(supabase) {
  const tests = [
    { table: 'stories', columns: ['title', 'cover_image_url'] },
    { table: 'chapters', columns: ['title', 'content'] },
    { table: 'characters', columns: ['name', 'character_type'] },
    { table: 'story_images', columns: ['image_url', 'image_type'] }
  ];

  for (const test of tests) {
    try {
      const selectColumns = test.columns.join(', ');
      const { error } = await supabase
        .from(test.table)
        .select(selectColumns)
        .limit(1);
      
      if (error) {
        console.log(`❌ ${test.table} schema: ${error.message}`);
      } else {
        console.log(`✅ ${test.table} schema: Ready`);
      }
    } catch (err) {
      console.log(`❌ ${test.table} schema test failed: ${err.message}`);
    }
  }
}

// Run the schema fix
fixTableSchema().catch(console.error);
