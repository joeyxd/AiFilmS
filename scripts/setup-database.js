import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use service key for admin operations
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://supabasekong-dwgwc8g8wgo4oso8000k0cgk.62.171.136.148.sslip.io';
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc1NTQzNjgwMCwiZXhwIjo0OTExMTEwNDAwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.pBe_2m7N2JUe6Uleh928JCEL2UQDNPiaG5G5X7Vk5rw';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  try {
    console.log('🚀 Setting up FilmStudio AI database...');
    
    // Read the SQL schema file
    const schemaPath = join(__dirname, '..', 'supabase-schema.sql');
    const schema = readFileSync(schemaPath, 'utf8');
    
    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute...`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          
          if (error) {
            console.warn(`⚠️  Warning in statement ${i + 1}:`, error.message);
          }
        } catch (err) {
          console.error(`❌ Error in statement ${i + 1}:`, err);
        }
      }
    }
    
    console.log('✅ Database setup completed!');
    console.log('');
    console.log('🎉 FilmStudio AI is ready to use!');
    console.log('📍 Your Supabase URL:', supabaseUrl);
    console.log('');
    console.log('Next steps:');
    console.log('1. Start your development server: npm run dev');
    console.log('2. Visit http://localhost:3010');
    console.log('3. Create your first account and start building!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

// Alternative: Manual setup instructions
function showManualSetup() {
  console.log('🔧 Manual Database Setup Instructions:');
  console.log('');
  console.log('1. Go to your Supabase Dashboard');
  console.log('2. Navigate to SQL Editor');
  console.log('3. Copy and paste the content of supabase-schema.sql');
  console.log('4. Run the SQL script');
  console.log('');
  console.log('Your Supabase Configuration:');
  console.log('URL:', supabaseUrl);
  console.log('Anon Key: [Configured in .env]');
}

if (process.argv.includes('--manual')) {
  showManualSetup();
} else {
  setupDatabase();
}
