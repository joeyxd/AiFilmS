import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://fgogcnihdrhmugbotjus.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnb2djbmloZHJobXVnYm90anVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTYzMTE0NCwiZXhwIjoyMDcxMjA3MTQ0fQ.XYFkhPfRWlsRICqWwzVNlOJRolz9QPMLd09CWLV1W9Y';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyScenaristMigration() {
  try {
    console.log('🚀 Applying The Scenarist Core v2.0 database migration...');
    
    const migrationSQL = fs.readFileSync('./supabase-scenarist-v2-migration.sql', 'utf8');
    
    // Execute the full SQL migration
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('❌ Migration error:', error);
    } else {
      console.log('✅ The Scenarist Core v2.0 database migration complete!');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

// Run the migration
applyScenaristMigration();
