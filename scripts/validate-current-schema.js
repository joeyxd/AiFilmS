import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Work with existing database schema
async function validateCurrentSchema() {
  console.log('🔍 Working with current database schema...\n');

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Check existing stories and their structure
    console.log('📚 Checking existing stories...');
    const { data: stories, error: storiesError } = await supabase
      .from('stories')
      .select('*')
      .order('created_at', { ascending: false });

    if (storiesError) {
      console.error('❌ Stories error:', storiesError.message);
      return;
    }

    console.log(`✅ Found ${stories?.length || 0} stories`);
    
    if (stories && stories.length > 0) {
      const story = stories[0];
      console.log('\n📖 Latest story structure:');
      console.log(`  Title: ${story.title}`);
      console.log(`  Genre: ${story.genre || 'Not set'}`);
      console.log(`  Status: ${story.status}`);
      console.log(`  User ID: ${story.user_id?.slice(0, 8)}...`);
      console.log(`  Available columns:`, Object.keys(story).join(', '));
      
      // Check if we can create a portfolio entry with existing data
      console.log('\n🎯 Testing portfolio data conversion...');
      
      const portfolioData = {
        id: `story-${story.id}`,
        image: story.cover_image_url || '/img/default-story.jpg',
        title: story.title,
        project: `${story.genre || 'Drama'} Production`,
        category: 'Films',
        storyId: story.id,
        logline: story.logline || `A ${story.genre || 'drama'} story`,
        genre: story.genre,
        chaptersCount: 0, // Will be fetched separately
        charactersCount: 0, // Will be fetched separately  
        status: story.status,
        createdAt: story.created_at,
        visualStyle: 'Unknown Style',
        estimatedDuration: 90
      };
      
      console.log('✅ Portfolio data structure created successfully');
      console.log('📊 Sample portfolio entry:', JSON.stringify(portfolioData, null, 2));
      
      // Test chapters query with flexible column selection
      console.log('\n📖 Testing chapters query...');
      const { data: chapters, error: chaptersError } = await supabase
        .from('chapters')
        .select('*')
        .eq('story_id', story.id);
        
      if (chaptersError) {
        console.log(`⚠️  Chapters query failed: ${chaptersError.message}`);
      } else {
        console.log(`✅ Found ${chapters?.length || 0} chapters for this story`);
        if (chapters && chapters.length > 0) {
          console.log('   Chapter columns:', Object.keys(chapters[0]).join(', '));
        }
      }
      
      // Test characters query
      console.log('\n🎭 Testing characters query...');
      const { data: characters, error: charactersError } = await supabase
        .from('characters')
        .select('*')
        .eq('story_id', story.id);
        
      if (charactersError) {
        console.log(`⚠️  Characters query failed: ${charactersError.message}`);
      } else {
        console.log(`✅ Found ${characters?.length || 0} characters for this story`);
        if (characters && characters.length > 0) {
          console.log('   Character columns:', Object.keys(characters[0]).join(', '));
        }
      }
    }

    console.log('\n🎯 Schema validation complete!');
    console.log('\n📋 Next steps:');
    console.log('1. The story showcase should work with existing data');
    console.log('2. Portfolio will show demo data mixed with real stories');
    console.log('3. Need to manually add missing columns in Supabase Dashboard for full functionality');

  } catch (error) {
    console.error('❌ Schema validation error:', error.message);
  }
}

// Run the validation
validateCurrentSchema().catch(console.error);
