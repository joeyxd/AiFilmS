const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Read .env.local file
const envLocal = fs.readFileSync('.env.local', 'utf8');
const lines = envLocal.split('\n');
const env = {};
lines.forEach(line => {
  if (line.includes('=') && !line.startsWith('#')) {
    const [key, value] = line.split('=');
    env[key.trim()] = value.trim();
  }
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_SERVICE_KEY);

async function retryFailedStory() {
  console.log('🔄 Finding failed story to retry...');
  
  // Get the most recent analyzing story
  const { data: stories, error } = await supabase
    .from('stories')
    .select('*')
    .eq('status', 'analyzing')
    .order('created_at', { ascending: false })
    .limit(1);
    
  if (error) {
    console.error('❌ Error finding story:', error);
    return;
  }
  
  if (!stories || stories.length === 0) {
    console.log('📝 No failed stories found in analyzing status');
    return;
  }
  
  const story = stories[0];
  console.log('📖 Found story to retry:', story.title);
  console.log('📊 Story ID:', story.id);
  console.log('📝 Status:', story.status);
  console.log('📄 Text length:', story.full_story_text?.length || 0, 'characters');
  
  // Mark as failed for manual retry
  const { error: updateError } = await supabase
    .from('stories')
    .update({
      status: 'failed_retry_needed',
      updated_at: new Date().toISOString()
    })
    .eq('id', story.id);
    
  if (updateError) {
    console.error('❌ Update error:', updateError);
  } else {
    console.log('✅ Story marked for retry. Status changed to: failed_retry_needed');
    console.log('🎯 You can now retry processing this story from the UI');
  }
}

retryFailedStory().catch(console.error);
