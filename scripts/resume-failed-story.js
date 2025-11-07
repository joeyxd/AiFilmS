import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { openaiService } from '../src/services/openai/index.js';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function resumeFailedStory() {
  console.log('🔄 Resume Failed Story Processing Tool');
  console.log('=====================================\n');

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Find stories that are stuck in "analyzing" status
    console.log('🔍 Finding stories stuck in analyzing status...');
    const { data: stuckStories, error } = await supabase
      .from('stories')
      .select('*')
      .eq('status', 'analyzing')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Database query failed: ${error.message}`);
    }

    if (!stuckStories || stuckStories.length === 0) {
      console.log('✅ No stuck stories found - all good!');
      return;
    }

    console.log(`📋 Found ${stuckStories.length} stuck stories:`);
    stuckStories.forEach((story, index) => {
      console.log(`${index + 1}. "${story.title}" (${story.id})`);
      console.log(`   Created: ${new Date(story.created_at).toLocaleString()}`);
      console.log(`   Processing phases: ${JSON.stringify(story.processing_phases || {})}`);
    });

    // Process the most recent stuck story
    const targetStory = stuckStories[0];
    console.log(`\n🚀 Resuming processing for: "${targetStory.title}"`);
    console.log(`📋 Story ID: ${targetStory.id}`);

    // Apply database schema update first if needed
    console.log('🔧 Ensuring database schema is ready...');
    try {
      await supabase.rpc('exec', { 
        sql: `
          ALTER TABLE stories ADD COLUMN IF NOT EXISTS processing_phases JSONB DEFAULT '{}';
          ALTER TABLE stories ADD COLUMN IF NOT EXISTS processing_metadata JSONB DEFAULT '{}';
          ALTER TABLE stories ADD COLUMN IF NOT EXISTS last_processing_error TEXT;
          ALTER TABLE stories ADD COLUMN IF NOT EXISTS processing_resumed_count INTEGER DEFAULT 0;
        `
      });
      console.log('✅ Database schema ready');
    } catch (schemaError) {
      console.log('📝 Schema update skipped (probably already exists)');
    }

    // Start smart resume processing
    console.log('\n🧠 Starting smart resume processing...');
    const startTime = Date.now();

    const result = await openaiService.processStoryComplete(
      targetStory.full_story_text,
      targetStory.title,
      targetStory.id
    );

    const processingTime = (Date.now() - startTime) / 1000;
    console.log(`\n✅ Resume processing completed in ${processingTime.toFixed(1)}s`);

    // Update story with final results
    console.log('💾 Saving final results to database...');
    
    const updateData = {
      status: 'completed',
      story_metadata: result.analysis.story_metadata,
      commercial_analysis: result.analysis.commercial_analysis,
      ai_analysis_metadata: {
        characters_count: result.analysis.characters?.length || 0,
        chapters_count: result.analysis.chapters?.length || 0,
        selected_style: result.analysis.cover_image_data?.selected_style,
        processing_completed_at: new Date().toISOString(),
        resume_used: true,
        total_processing_time_seconds: processingTime
      },
      cover_image_url: result.coverImage.imageUrl,
      cover_image_prompt: result.coverImage.prompt,
      processing_resumed_count: (targetStory.processing_resumed_count || 0) + 1
    };

    const { error: updateError } = await supabase
      .from('stories')
      .update(updateData)
      .eq('id', targetStory.id);

    if (updateError) {
      throw new Error(`Failed to update story: ${updateError.message}`);
    }

    console.log('\n🎉 SUCCESS! Story processing resumed and completed!');
    console.log('📊 Final Results:');
    console.log(`   Title: ${result.analysis.story_metadata?.title || targetStory.title}`);
    console.log(`   Characters: ${result.analysis.characters?.length || 0}`);
    console.log(`   Chapters: ${result.analysis.chapters?.length || 0}`);
    console.log(`   Marketability: ${result.analysis.commercial_analysis?.marketability_score || 'N/A'}`);
    console.log(`   Cover Image: ${result.coverImage.imageUrl ? 'Generated' : 'Failed'}`);
    console.log(`   Processing Time: ${processingTime.toFixed(1)}s`);

  } catch (error) {
    console.error('\n❌ Resume processing failed:', error);
    console.error('Stack:', error.stack);
  }
}

// Run the resume function
resumeFailedStory().catch(console.error);
