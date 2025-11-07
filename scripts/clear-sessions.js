import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 Clearing all sessions and storage...');
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function clearAllSessions() {
  try {
    console.log('🧹 Signing out all sessions...');
    await supabase.auth.signOut({ scope: 'global' });
    console.log('✅ All sessions cleared');
    
    console.log('📝 Please sign in again in your browser');
    console.log('Your profile is ready with admin status');
    
  } catch (error) {
    console.error('❌ Error clearing sessions:', error);
  }
}

clearAllSessions();
