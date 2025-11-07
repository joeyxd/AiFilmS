// Quick environment variables check
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

console.log('🔍 Environment Variables Check:');
console.log('================================');

const envVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY', 
  'VITE_SUPABASE_SERVICE_KEY',
  'VITE_OPENAI_API_KEY',
  'VITE_RESEND_API_KEY'
];

envVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅ Set' : '❌ Missing';
  const preview = value ? `${value.substring(0, 20)}...` : 'Not found';
  console.log(`${varName}: ${status} (${preview})`);
});

console.log('================================');
console.log('🎯 Environment check complete!');
