import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Testing profile query for user: 59e25912-f7c2-4816-a97d-6306fa37eadc');
console.log('Using URL:', supabaseUrl);
console.log('Using Key:', supabaseKey ? 'Present' : 'Missing');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testProfile() {
  try {
    console.log('\n⏱️  Starting profile query...');
    const start = Date.now();
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', '59e25912-f7c2-4816-a97d-6306fa37eadc')
      .single();
    
    const duration = Date.now() - start;
    console.log(`✅ Query completed in ${duration}ms`);
    
    if (error) {
      console.error('❌ Query error:', error);
    } else {
      console.log('✅ Profile data:', data);
      console.log('   - Username:', data?.username);
      console.log('   - Onboarding completed:', data?.onboarding_completed);
      console.log('   - Subscription tier:', data?.subscription_tier);
    }
  } catch (err) {
    console.error('❌ Exception:', err);
  }
}

testProfile();
