import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fgogcnihdrhmugbotjus.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnb2djbmloZHJobXVnYm90anVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTYzMTE0NCwiZXhwIjoyMDcxMjA3MTQ0fQ.XYFkhPfRWlsRICqWwzVNlOJRolz9QPMLd09CWLV1W9Y';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateToAdmin() {
  try {
    // First, let's see current profiles
    console.log('Checking current profiles...');
    const { data: profiles, error: fetchError } = await supabase
      .from('profiles')
      .select('*');
    
    if (fetchError) {
      console.error('Error fetching profiles:', fetchError);
      return;
    }
    
    console.log('Current profiles:', JSON.stringify(profiles, null, 2));
    
    if (profiles && profiles.length > 0) {
      // Update the first profile to admin status
      const profile = profiles[0];
      console.log(`Updating profile ${profile.id} to admin status...`);
      
      const { data: updated, error: updateError } = await supabase
        .from('profiles')
        .update({
          subscription_tier: 'enterprise',
          creator_score: 1500, // Above 1000 to qualify for admin
          is_verified: true
        })
        .eq('id', profile.id)
        .select();
      
      if (updateError) {
        console.error('Error updating profile:', updateError);
      } else {
        console.log('Successfully updated profile to admin:', JSON.stringify(updated, null, 2));
      }
    }
  } catch (error) {
    console.error('Script error:', error);
  }
}

updateToAdmin();
