import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL, 
  process.env.VITE_SUPABASE_SERVICE_KEY
);

async function checkStoryData() {
  console.log('🔍 Checking story data...');
  
  try {
    // Get the most recent story
    const { data: stories, error: storiesError } = await supabase
      .from('stories')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (storiesError) {
      console.error('❌ Error fetching stories:', storiesError);
      return;
    }
    
    console.log(`📚 Found ${stories.length} recent stories:`);
    
    for (const story of stories) {
      console.log('\n' + '='.repeat(60));
      console.log(`📖 Story: ${story.title}`);
      console.log(`🆔 ID: ${story.id}`);
      console.log(`📊 Status: ${story.status}`);
      console.log(`📝 Logline: ${story.logline || 'None'}`);
      console.log(`🎭 Genre: ${story.genre || 'None'}`);
      console.log(`🖼️ Cover Image: ${story.cover_image_url ? 'Yes' : 'None'}`);
      console.log(`🧠 AI Metadata:`, story.ai_analysis_metadata || 'None');
      console.log(`🔄 Processing Phases:`, story.processing_phases || 'None');
      console.log(`📅 Created: ${story.created_at}`);
      
      // Check chapters for this story
      const { data: chapters, error: chaptersError } = await supabase
        .from('chapters')
        .select('*')
        .eq('story_id', story.id);
      
      if (!chaptersError) {
        console.log(`📚 Chapters: ${chapters?.length || 0}`);
        if (chapters?.length > 0) {
          chapters.forEach((ch, i) => {
            console.log(`  ${i+1}. ${ch.chapter_title} (${ch.estimated_film_time}m)`);
          });
        }
      }
      
      // Check characters for this story
      const { data: characters, error: charactersError } = await supabase
        .from('characters')
        .select('*')
        .eq('story_id', story.id);
      
      if (!charactersError) {
        console.log(`👥 Characters: ${characters?.length || 0}`);
        if (characters?.length > 0) {
          characters.forEach((ch, i) => {
            console.log(`  ${i+1}. ${ch.character_name} - ${ch.role_in_story}`);
          });
        }
      }
    }
    
    // Check if processing_logs table has any data
    const { data: logs, error: logsError } = await supabase
      .from('processing_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (!logsError && logs?.length > 0) {
      console.log('\n' + '='.repeat(60));
      console.log('📋 Recent Processing Logs:');
      logs.forEach((log, i) => {
        console.log(`${i+1}. Story: ${log.story_id}, Phase: ${log.phase_name}, Status: ${log.status}`);
        console.log(`   Message: ${log.message}`);
        console.log(`   Time: ${log.created_at}`);
      });
    } else {
      console.log('\n📋 No processing logs found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkStoryData();
