// This script sets up the initial database schema in Supabase
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const dotenvPath = path.resolve(__dirname, '../.env');
const envConfig = fs.readFileSync(dotenvPath, 'utf8')
  .split('\n')
  .filter(Boolean)
  .map(line => line.trim())
  .filter(line => !line.startsWith('#'))
  .reduce((acc, line) => {
    const [key, value] = line.split('=');
    acc[key] = value;
    return acc;
  }, {});

const supabaseUrl = envConfig.VITE_SUPABASE_URL;
const supabaseServiceKey = envConfig.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

// Initialize Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Read SQL schema
const schemaPath = path.resolve(__dirname, './schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

async function setupDatabase() {
  console.log('Setting up database schema...');
  
  try {
    // Execute SQL script
    const { error } = await supabase.rpc('exec_sql', { sql_query: schema });
    
    if (error) {
      throw error;
    }
    
    console.log('Database schema created successfully');
  } catch (error) {
    console.error('Error setting up database:', error.message);
    process.exit(1);
  }
}

setupDatabase();
