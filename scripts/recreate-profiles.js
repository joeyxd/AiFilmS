import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseAdmin = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_KEY);

console.log('🔧 Recreating profiles for existing auth users...');

const profiles = [
  {
    id: '59e25912-f7c2-4816-a97d-6306fa37eadc', // xxajxx@gmail.com
    username: 'xxajxx',
    subscription_tier: 'enterprise',
    is_verified: true,
    creator_score: 1500,
    onboarding_completed: true,
    onboarding_completed_at: new Date().toISOString(),
    created_at: '2025-08-19T19:52:00.036087+00:00', // Match auth creation time
    updated_at: new Date().toISOString()
  },
  {
    id: 'bef4c334-9f27-4f2c-aa2a-6a2588a54fe0', // revolutioco@gmail.com  
    username: 'revolutioco',
    subscription_tier: 'free',
    is_verified: false,
    creator_score: 0,
    onboarding_completed: true,
    onboarding_completed_at: new Date().toISOString(),
    created_at: '2025-08-19T19:36:50.823715+00:00', // Match auth creation time
    updated_at: new Date().toISOString()
  }
];

async function recreateProfiles() {
  for (const profile of profiles) {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .insert(profile)
      .select();

    if (error) {
      console.error(`❌ Failed to create profile for ${profile.username}:`, error);
    } else {
      console.log(`✅ Created profile for ${profile.username}`);
    }
  }

  console.log('🎯 Profile recreation complete!');
}

recreateProfiles();
