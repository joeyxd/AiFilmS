import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🧪 Testing profile access with anon key...');
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testProfileAccess() {
  try {
    console.log('📍 Testing direct query...');
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', '59e25912-f7c2-4816-a97d-6306fa37eadc')
      .single();

    console.log('=== RESULT ===');
    console.log('Data:', data);
    console.log('Error:', error);
    
    if (error) {
      console.log('❌ Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
    }
    
  } catch (err) {
    console.error('💥 Exception:', err);
  }
}

testProfileAccess();
