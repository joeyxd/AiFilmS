// Quick database check using app configuration
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Read .env.local file manually
const envContent = fs.readFileSync('.env.local', 'utf8');
const envLines = envContent.split('\n');
const env = {};

envLines.forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
  }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

console.log('🔍 Checking database with URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkData() {
  try {
    console.log('\n📚 Checking Stories...');
    const { data: stories, error: storiesError } = await supabase
      .from('stories')
      .select('id, title, created_at, user_id')
      .order('created_at', { ascending: false })
      .limit(5);

    if (storiesError) {
      console.error('Stories error:', storiesError);
    } else {
      console.log(`Found ${stories?.length || 0} stories:`);
      stories?.forEach(story => {
        console.log(`  - ${story.title} (${story.visual_style}) - ${story.created_at}`);
      });
    }

    console.log('\n📖 Checking Chapters...');
    const { data: chapters, error: chaptersError } = await supabase
      .from('chapters')
      .select('id, title, story_id, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (chaptersError) {
      console.error('Chapters error:', chaptersError);
    } else {
      console.log(`Found ${chapters?.length || 0} chapters:`);
      chapters?.forEach(chapter => {
        console.log(`  - ${chapter.title} (Story: ${chapter.story_id})`);
      });
    }

    console.log('\n👥 Checking Characters...');
    const { data: characters, error: charactersError } = await supabase
      .from('characters')
      .select('id, name, story_id, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (charactersError) {
      console.error('Characters error:', charactersError);
    } else {
      console.log(`Found ${characters?.length || 0} characters:`);
      characters?.forEach(character => {
        console.log(`  - ${character.name} (Story: ${character.story_id})`);
      });
    }

    console.log('\n👤 Checking Profiles...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, subscription_tier, onboarding_completed')
      .order('created_at', { ascending: false })
      .limit(3);

    if (profilesError) {
      console.error('Profiles error:', profilesError);
    } else {
      console.log(`Found ${profiles?.length || 0} profiles:`);
      profiles?.forEach(profile => {
        console.log(`  - ${profile.username} (${profile.subscription_tier}) - Onboarded: ${profile.onboarding_completed}`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking database:', error);
  }
}

checkData();
