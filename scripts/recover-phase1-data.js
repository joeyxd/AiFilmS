import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL, 
  process.env.VITE_SUPABASE_SERVICE_KEY
);

async function testPhase1Recovery() {
  console.log('🔄 Testing Phase 1 data recovery for existing story...');
  
  const storyId = '5e0a6558-5e20-481c-876f-980177e8a6d2';
  
  try {
    console.log('📊 Current story state:');
    const { data: story, error } = await supabase
      .from('stories')
      .select('*')
      .eq('id', storyId)
      .single();
    
    if (error) {
      console.error('❌ Error fetching story:', error);
      return;
    }
    
    console.log('📝 Story Title:', story.title);
    console.log('📊 Status:', story.status);
    console.log('🔄 Processing Phases:', story.processing_phases);
    console.log('💾 Processing Metadata keys:', Object.keys(story.processing_metadata || {}));
    console.log('🧠 AI Analysis Metadata:', story.ai_analysis_metadata);
    console.log('📝 Logline:', story.logline || 'None');
    console.log('🎭 Genre:', story.genre || 'None');
    
    // Check if there's any phase data saved
    if (story.processing_metadata) {
      console.log('\n📋 Checking saved phase data...');
      
      if (story.processing_metadata.phase1_result) {
        console.log('✅ Phase 1 result found!');
        const phase1Data = story.processing_metadata.phase1_result;
        console.log('📊 Phase 1 Story Metadata:', phase1Data.story_metadata ? 'Present' : 'Missing');
        console.log('📊 Phase 1 Commercial Analysis:', phase1Data.commercial_analysis ? 'Present' : 'Missing');
        
        if (phase1Data.story_metadata) {
          console.log('  📝 Logline from Phase 1:', phase1Data.story_metadata.logline);
          console.log('  🎭 Genre from Phase 1:', phase1Data.story_metadata.genre);
          console.log('  🎯 Themes from Phase 1:', phase1Data.story_metadata.themes);
        }
      }
      
      if (story.processing_metadata.phase2_result) {
        console.log('✅ Phase 2 result found!');
        const phase2Data = story.processing_metadata.phase2_result;
        console.log('👥 Characters found:', phase2Data.characters?.length || 0);
      }
      
      if (story.processing_metadata.phase3_result) {
        console.log('✅ Phase 3 result found!');
        const phase3Data = story.processing_metadata.phase3_result;
        console.log('📚 Chapters found:', phase3Data.chapters?.length || 0);
      }
    }
    
    // If we have Phase 1 data in processing_metadata but not in the main story fields,
    // let's apply it
    if (story.processing_metadata?.phase1_result && !story.logline) {
      console.log('\n🔧 RECOVERY: Applying Phase 1 data to story...');
      
      const phase1Data = story.processing_metadata.phase1_result;
      const updateData = {};
      
      if (phase1Data.story_metadata?.logline) {
        updateData.logline = phase1Data.story_metadata.logline;
      }
      
      if (phase1Data.story_metadata?.genre) {
        updateData.genre = phase1Data.story_metadata.genre;
      }
      
      if (phase1Data.story_metadata || phase1Data.commercial_analysis) {
        updateData.ai_analysis_metadata = {
          agent_version: 'S-2X Enhanced',
          processed_at: new Date().toISOString(),
          story_metadata: phase1Data.story_metadata,
          commercial_analysis: phase1Data.commercial_analysis
        };
      }
      
      if (Object.keys(updateData).length > 0) {
        console.log('💾 Updating story with Phase 1 data:', Object.keys(updateData));
        
        const { error: updateError } = await supabase
          .from('stories')
          .update(updateData)
          .eq('id', storyId);
        
        if (updateError) {
          console.error('❌ Failed to update story:', updateError);
        } else {
          console.log('✅ Story updated with Phase 1 data!');
        }
      }
    }
    
    // If we have Phase 2 data, create characters
    if (story.processing_metadata?.phase2_result?.characters) {
      console.log('\n🔧 RECOVERY: Creating characters from Phase 2 data...');
      
      const characters = story.processing_metadata.phase2_result.characters;
      console.log('👥 Found', characters.length, 'characters to create');
      
      const charactersToInsert = characters.map((character) => ({
        story_id: storyId,
        character_name: character.name,
        role_in_story: character.role_in_story,
        physical_description: character.visual_dna?.look_and_feel || character.description || 'Not specified',
        context_backstory: character.narrative_vitals?.goals || character.backstory || 'Not specified',
        status: 'identified'
      }));
      
      const { data: createdCharacters, error: charactersError } = await supabase
        .from('characters')
        .insert(charactersToInsert)
        .select();
      
      if (charactersError) {
        console.error('❌ Failed to create characters:', charactersError);
      } else {
        console.log('✅ Created', createdCharacters.length, 'characters!');
      }
    }
    
    // If we have Phase 3 data, create chapters
    if (story.processing_metadata?.phase3_result?.chapters) {
      console.log('\n🔧 RECOVERY: Creating chapters from Phase 3 data...');
      
      const chapters = story.processing_metadata.phase3_result.chapters;
      console.log('📚 Found', chapters.length, 'chapters to create');
      
      const chaptersToInsert = chapters.map((chapter) => ({
        story_id: storyId,
        chapter_number: chapter.order || chapter.chapter_number,
        chapter_title: chapter.title,
        original_story_text_portion: chapter.original_text_portion || '',
        chapter_summary: chapter.summary,
        estimated_film_time: chapter.estimated_film_time_sec || chapter.estimated_film_time || 300,
        mood_tone: chapter.cinematic_vitals?.mood_tone || chapter.mood_tone || 'neutral',
        status: 'pending'
      }));
      
      const { data: createdChapters, error: chaptersError } = await supabase
        .from('chapters')
        .insert(chaptersToInsert)
        .select();
      
      if (chaptersError) {
        console.error('❌ Failed to create chapters:', chaptersError);
      } else {
        console.log('✅ Created', createdChapters.length, 'chapters!');
      }
    }
    
    console.log('\n🎉 Recovery process complete!');
    
  } catch (error) {
    console.error('❌ Recovery failed:', error);
  }
}

testPhase1Recovery();
