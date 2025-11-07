import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

console.log('🔍 Checking profiles with direct REST API (bypassing RLS)...');

async function checkProfiles() {
  try {
    const response = await fetch(
      `${process.env.VITE_SUPABASE_URL}/rest/v1/profiles?select=*`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.VITE_SUPABASE_SERVICE_KEY}`,
          'apikey': process.env.VITE_SUPABASE_SERVICE_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    const profiles = await response.json();
    console.log('✅ Profiles found via REST API:', profiles);
    console.log('📊 Total count:', profiles?.length || 0);
    
    if (profiles && profiles.length > 0) {
      console.log('\n👤 Profile details:');
      profiles.forEach(profile => {
        console.log(`- ${profile.username} (${profile.id}) - Onboarding: ${profile.onboarding_completed}`);
      });
    }
  } catch (error) {
    console.error('❌ Error fetching profiles:', error);
  }
}

checkProfiles();
