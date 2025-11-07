import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('VITE_SUPABASE_URL:', !!supabaseUrl);
  console.error('VITE_SUPABASE_SERVICE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

console.log('🔧 Creating Supabase admin client...');
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixRLSPolicies() {
  try {
    console.log('🛡️ Fixing RLS policies for profiles table...');
    
    // Drop existing policies if they exist
    console.log('🗑️ Dropping existing policies...');
    await supabase.rpc('exec_sql', {
      sql: `
        DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
        DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
        DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
      `
    });
    
    // Create proper RLS policies
    console.log('✨ Creating new RLS policies...');
    await supabase.rpc('exec_sql', {
      sql: `
        -- Allow users to view their own profile
        CREATE POLICY "Users can view own profile" ON profiles
          FOR SELECT USING (auth.uid() = id);
        
        -- Allow users to update their own profile
        CREATE POLICY "Users can update own profile" ON profiles
          FOR UPDATE USING (auth.uid() = id);
        
        -- Allow users to insert their own profile (for registration)
        CREATE POLICY "Users can insert own profile" ON profiles
          FOR INSERT WITH CHECK (auth.uid() = id);
      `
    });
    
    console.log('✅ RLS policies fixed successfully!');
    
    // Test with the actual user
    console.log('🧪 Testing profile access...');
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', '59e25912-f7c2-4816-a97d-6306fa37eadc');
    
    if (error) {
      console.error('❌ Test failed:', error);
    } else {
      console.log('✅ Test successful:', profiles);
    }
    
  } catch (error) {
    console.error('❌ Error fixing RLS policies:', error);
  }
}

fixRLSPolicies();
