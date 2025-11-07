import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: ['.env.local', '.env'] });

// Check actual data in database tables
async function checkDatabaseData() {
  console.log('📊 Checking Database Data...\n');

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables');
    process.exit(1);
  }

  // Use service key for admin access
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Check profiles data
    console.log('👤 Checking Profiles...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, subscription_tier, onboarding_completed, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (profilesError) {
      console.error('❌ Profiles error:', profilesError.message);
    } else {
      console.log(`✅ Found ${profiles?.length || 0} profiles:`);
      profiles?.forEach(profile => {
        console.log(`  - ${profile.username || 'No name'} (${profile.id.slice(0, 8)}...) - Onboarding: ${profile.onboarding_completed ? '✅' : '❌'}`);
      });
    }

    // Check stories data
    console.log('\n📚 Checking Stories...');
    const { data: stories, error: storiesError } = await supabase
      .from('stories')
      .select('id, title, genre, status, user_id, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (storiesError) {
      console.error('❌ Stories error:', storiesError.message);
    } else {
      console.log(`✅ Found ${stories?.length || 0} stories:`);
      stories?.forEach(story => {
        console.log(`  - "${story.title}" (${story.genre}) - Status: ${story.status} - User: ${story.user_id?.slice(0, 8)}...`);
      });
    }

    // Check chapters data
    console.log('\n📖 Checking Chapters...');
    const { data: chapters, error: chaptersError } = await supabase
      .from('chapters')
      .select('id, title, story_id, chapter_number')
      .order('created_at', { ascending: false })
      .limit(10);

    if (chaptersError) {
      console.error('❌ Chapters error:', chaptersError.message);
    } else {
      console.log(`✅ Found ${chapters?.length || 0} chapters:`);
      chapters?.forEach(chapter => {
        console.log(`  - Ch.${chapter.chapter_number}: "${chapter.title}" (Story: ${chapter.story_id?.slice(0, 8)}...)`);
      });
    }

    // Check characters data
    console.log('\n🎭 Checking Characters...');
    const { data: characters, error: charactersError } = await supabase
      .from('characters')
      .select('id, name, story_id, character_type, age')
      .order('created_at', { ascending: false })
      .limit(10);

    if (charactersError) {
      console.error('❌ Characters error:', charactersError.message);
    } else {
      console.log(`✅ Found ${characters?.length || 0} characters:`);
      characters?.forEach(character => {
        console.log(`  - ${character.name} (${character.character_type}, age: ${character.age || 'N/A'}) - Story: ${character.story_id?.slice(0, 8)}...`);
      });
    }

    // Check story images
    console.log('\n🖼️ Checking Story Images...');
    const { data: images, error: imagesError } = await supabase
      .from('story_images')
      .select('id, story_id, image_type, image_url, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (imagesError) {
      console.error('❌ Story images error:', imagesError.message);
    } else {
      console.log(`✅ Found ${images?.length || 0} story images:`);
      images?.forEach(image => {
        console.log(`  - ${image.image_type} for story ${image.story_id?.slice(0, 8)}... - URL: ${image.image_url ? 'Set' : 'Missing'}`);
      });
    }

    // Check authentication users (limited info)
    console.log('\n🔐 Checking Auth Users...');
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Auth users error:', authError.message);
    } else {
      console.log(`✅ Found ${authData?.users?.length || 0} authenticated users:`);
      authData?.users?.slice(0, 5).forEach(user => {
        console.log(`  - ${user.email} (${user.id.slice(0, 8)}...) - Created: ${new Date(user.created_at).toLocaleDateString()}`);
      });
    }

  } catch (error) {
    console.error('❌ Database check error:', error.message);
  }

  console.log('\n🎯 Database data check complete!');
}

// Run the check
checkDatabaseData().catch(console.error);
