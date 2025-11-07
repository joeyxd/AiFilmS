require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_KEY);

async function getSpecificStory() {
  try {
    // Check for the specific story ID from browser logs
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('id', '5e0a6558-5e20-481c-876f-980177e8a6d2')
      .single();
    
    if (error) {
      console.log('❌ Story not found with that ID');
      
      // Let's check all stories and find the "Every Day's Chemistry" one
      const { data: allStories, error: allError } = await supabase
        .from('stories')
        .select('*')
        .ilike('title', '%Every Day%')
        .order('created_at', { ascending: false });
        
      if (allError) throw allError;
      
      console.log(`📚 Found ${allStories.length} stories matching "Every Day":`)
      allStories.forEach(story => {
        console.log(`- ${story.id}: "${story.title}" (${story.status})`);
      });
      
      if (allStories.length > 0) {
        const latestStory = allStories[0];
        console.log('\n=== USING LATEST STORY ===');
        analyzeStory(latestStory);
      }
      return;
    }
    
    analyzeStory(data);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

function analyzeStory(data) {
  console.log('=== STORY ANALYSIS ===');
  console.log('ID:', data.id);
  console.log('Title:', data.title);
  console.log('Status:', data.status);
  console.log('Story Metadata Keys:', data.story_metadata ? Object.keys(data.story_metadata) : 'NONE');
  console.log('Commercial Analysis Keys:', data.commercial_analysis ? Object.keys(data.commercial_analysis) : 'NONE');
  console.log('Characters Analysis:', data.characters_analysis ? 'YES' : 'NO');
  console.log('Narrative Architecture:', data.narrative_architecture ? 'YES' : 'NO');
  console.log('Production Blueprint:', data.production_blueprint ? 'YES' : 'NO');
  console.log('Processing Phases:', data.processing_phases ? JSON.stringify(data.processing_phases) : 'NONE');
  console.log('Cover Image URL:', data.cover_image_url ? 'YES' : 'NO');
  console.log('AI Analysis Metadata Keys:', data.ai_analysis_metadata ? Object.keys(data.ai_analysis_metadata) : 'NONE');
  
  // Check if we have the Phase 1 data you showed
  if (data.story_metadata) {
    console.log('\n✅ PHASE 1 DATA AVAILABLE!');
    console.log('- Title from metadata:', data.story_metadata.title);
    console.log('- Genres:', data.story_metadata.genres?.length || 0);
    console.log('- Themes:', data.story_metadata.themes?.length || 0);
    
    if (data.commercial_analysis) {
      console.log('- Logline:', data.commercial_analysis.logline ? 'YES' : 'NO');
      console.log('- Marketability Score:', data.commercial_analysis.marketability_score);
    }
  } else {
    console.log('\n❌ NO PHASE 1 DATA - Story metadata missing');
  }
  
  // Show what phases should be displayed
  console.log('\n=== PHASE STATUS ===');
  console.log('Phase 1 (Story DNA):', data.story_metadata ? '✅ COMPLETED' : '❌ PENDING');
  console.log('Phase 2 (Characters):', data.characters_analysis ? '✅ COMPLETED' : '❌ PENDING');
  console.log('Phase 3 (Narrative):', data.narrative_architecture ? '✅ COMPLETED' : '❌ PENDING');
  console.log('Phase 4 (Production):', data.production_blueprint ? '✅ COMPLETED' : '❌ PENDING');
  console.log('Phase 5 (Cover Image):', data.cover_image_url ? '✅ COMPLETED' : '❌ PENDING');
}

getSpecificStory();
