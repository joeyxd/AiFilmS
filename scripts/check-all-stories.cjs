require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_KEY);

async function getAllStories() {
  try {
    const { data: allStories, error } = await supabase
      .from('stories')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (error) throw error;
    
    console.log(`📚 Found ${allStories.length} recent stories:`);
    
    allStories.forEach((story, index) => {
      console.log(`\n${index + 1}. "${story.title}"`);
      console.log(`   ID: ${story.id}`);
      console.log(`   Status: ${story.status}`);
      console.log(`   Created: ${story.created_at}`);
      console.log(`   Has story_metadata: ${story.story_metadata ? 'YES' : 'NO'}`);
      console.log(`   Has commercial_analysis: ${story.commercial_analysis ? 'YES' : 'NO'}`);
      
      if (story.story_metadata) {
        console.log(`   ✅ Phase 1 Data Available!`);
        console.log(`      - Title: ${story.story_metadata.title || 'N/A'}`);
        console.log(`      - Genres: ${story.story_metadata.genres?.length || 0}`);
        console.log(`      - Themes: ${story.story_metadata.themes?.length || 0}`);
        
        if (story.commercial_analysis) {
          console.log(`      - Logline: ${story.commercial_analysis.logline ? 'YES' : 'NO'}`);
          console.log(`      - Marketability: ${story.commercial_analysis.marketability_score || 'N/A'}`);
        }
      }
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

getAllStories();
