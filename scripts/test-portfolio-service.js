import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Test portfolio service with current data
async function testPortfolioService() {
  console.log('🎬 Testing Portfolio Service with Current Data...\n');

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables');
    process.exit(1);
  }

  // Use service key to see all data (admin view)
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Simulate what the portfolioDataService does
    console.log('📚 Fetching user stories...');
    
    const { data: stories, error } = await supabase
      .from('stories')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching stories:', error);
      return;
    }

    console.log(`✅ Found ${stories?.length || 0} stories`);

    if (!stories || stories.length === 0) {
      console.log('📋 No stories found - portfolio will show demo data');
      return;
    }

    // Convert to portfolio format (mimicking portfolioDataService)
    const portfolioStories = stories.map((story) => {
      console.log(`\n📖 Processing story: "${story.title}"`);
      console.log(`   Available fields:`, Object.keys(story).join(', '));
      
      // Extract metadata safely
      const metadata = story.ai_analysis_metadata || {};
      const chaptersCount = metadata.chapters_count || 0;
      const charactersCount = metadata.characters_count || 0;
      const visualStyle = metadata.style_applied || metadata.selected_style || 'AI Generated';
      
      // Determine category based on genre
      let category = 'Films';
      if (story.genre) {
        const genre = story.genre.toLowerCase();
        if (genre.includes('short') || genre.includes('comedy')) {
          category = 'Shorts';
        } else if (genre.includes('youtube') || genre.includes('social')) {
          category = 'youtube';
        }
      }

      // Use cover image or placeholder
      const image = story.cover_image_url || '/img/default-story.jpg';
      
      // Generate project name
      const project = `${story.genre || 'Drama'} Production`;

      const portfolioEntry = {
        id: `story-${story.id}`,
        image,
        title: story.title,
        project,
        category,
        storyId: story.id,
        logline: story.logline || `A ${story.genre || 'drama'} story`,
        genre: story.genre,
        chaptersCount,
        charactersCount,
        marketabilityScore: 50, // Default score
        status: story.status,
        createdAt: story.created_at,
        visualStyle,
        estimatedDuration: story.estimated_duration || 90
      };

      console.log(`   ✅ Portfolio entry created:`, JSON.stringify(portfolioEntry, null, 2));
      return portfolioEntry;
    });

    console.log(`\n🎯 Portfolio conversion complete!`);
    console.log(`📊 Portfolio stories that will be shown:`, portfolioStories.length);
    
    // Test with some additional data queries
    for (const story of stories) {
      console.log(`\n🔍 Additional data for "${story.title}":`);
      
      // Try to get chapters (with flexible column selection)
      try {
        const { data: chapters } = await supabase
          .from('chapters')
          .select('id, chapter_number')
          .eq('story_id', story.id);
        console.log(`   📖 Chapters: ${chapters?.length || 0}`);
      } catch (err) {
        console.log(`   📖 Chapters: Unable to query`);
      }
      
      // Try to get characters
      try {
        const { data: characters } = await supabase
          .from('characters')
          .select('id')
          .eq('story_id', story.id);
        console.log(`   🎭 Characters: ${characters?.length || 0}`);
      } catch (err) {
        console.log(`   🎭 Characters: Unable to query`);
      }
    }

  } catch (error) {
    console.error('❌ Portfolio service test error:', error.message);
  }

  console.log('\n✅ Portfolio service test complete!');
}

// Run the test
testPortfolioService().catch(console.error);
