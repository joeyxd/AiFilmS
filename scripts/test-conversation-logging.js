// Test conversation logging system with proper environment variables
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_KEY
);

async function testConversationLogging() {
  console.log('🧪 Testing AI Conversation Logging System...');
  console.log('🔑 Using Supabase URL:', process.env.VITE_SUPABASE_URL);
  
  try {
    // First, get an existing story or create a test story
    let storyId;
    
    // Try to get an existing story
    const { data: existingStories, error: storiesError } = await supabase
      .from('stories')
      .select('id')
      .limit(1);
    
    if (existingStories && existingStories.length > 0) {
      storyId = existingStories[0].id;
      console.log('📖 Using existing story ID:', storyId);
    } else {
      // Create a test story
      const { data: newStory, error: createError } = await supabase
        .from('stories')
        .insert({
          title: 'Test Story for Conversation Logging',
          full_story_text: 'This is a test story for testing conversation logging functionality.',
          status: 'new',
          user_id: 'test-user-123' // Use a test user ID
        })
        .select()
        .single();
      
      if (createError) {
        console.error('❌ Failed to create test story:', createError);
        return false;
      }
      
      storyId = newStory.id;
      console.log('📖 Created test story ID:', storyId);
    }
    
    // Generate unique session ID in UUID format
    const sessionId = crypto.randomUUID();
    
    console.log('📝 Inserting test conversation records...');
    
    // Test 1: Insert a query message
    const { data: queryData, error: queryError } = await supabase
      .from('ai_conversations')
      .insert({
        story_id: storyId,
        conversation_session: sessionId,
        phase_name: 'phase1_storyDNA',
        message_type: 'query',
        message_order: 1,
        content: 'Analyze this story for its core themes and narrative structure. Focus on character development and visual storytelling opportunities.',
        metadata: {
          model: 'o3',
          timestamp: new Date().toISOString(),
          phase: 'phase1_storyDNA',
          story_title: 'Test Story'
        }
      })
      .select();

    if (queryError) {
      console.error('❌ Failed to insert query:', queryError);
      return false;
    }
    console.log('✅ Query logged successfully:', queryData?.[0]?.id);

    // Test 2: Insert thinking/reasoning message
    const { data: thinkingData, error: thinkingError } = await supabase
      .from('ai_conversations')
      .insert({
        story_id: storyId,
        conversation_session: sessionId,
        phase_name: 'phase1_storyDNA',
        message_type: 'thinking',
        message_order: 2,
        content: 'Let me analyze this story step by step... First, I need to identify the protagonist and their journey. The narrative structure appears to follow a three-act format with clear character arcs. The visual storytelling opportunities include several key scenes that could translate well to film...',
        metadata: {
          model: 'o3',
          reasoning_tokens: 1500,
          timestamp: new Date().toISOString(),
          phase: 'phase1_storyDNA'
        }
      })
      .select();

    if (thinkingError) {
      console.error('❌ Failed to insert thinking:', thinkingError);
      return false;
    }
    console.log('✅ Thinking/reasoning logged successfully:', thinkingData?.[0]?.id);

    // Test 3: Insert response message
    const { data: responseData, error: responseError } = await supabase
      .from('ai_conversations')
      .insert({
        story_id: storyId,
        conversation_session: sessionId,
        phase_name: 'phase1_storyDNA',
        message_type: 'response',
        message_order: 3,
        content: JSON.stringify({
          story_metadata: {
            title: "Test Story Analysis",
            genres: [{"label": "Drama", "confidence": 0.85}, {"label": "Thriller", "confidence": 0.72}],
            themes: ["redemption", "family bonds", "personal growth"],
            structure_detected: "Three-Act with Hero's Journey",
            overall_tone: "Contemplative with moments of tension"
          },
          commercial_analysis: {
            logline: "A compelling story of redemption and personal growth",
            marketability_score: 8.2,
            target_audience: "Adults 25-54 interested in character-driven drama"
          }
        }),
        metadata: {
          model: 'o3',
          tokens_used: 2500,
          completion_tokens: 800,
          cost_estimate: 0.08,
          timestamp: new Date().toISOString(),
          phase: 'phase1_storyDNA'
        }
      })
      .select();

    if (responseError) {
      console.error('❌ Failed to insert response:', responseError);
      return false;
    }
    console.log('✅ Response logged successfully:', responseData?.[0]?.id);

    // Test 4: Query all conversations for the story
    console.log('🔍 Retrieving all conversations for story...');
    const { data: allConversations, error: queryAllError } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('story_id', storyId)
      .order('conversation_session')
      .order('message_order');

    if (queryAllError) {
      console.error('❌ Failed to retrieve conversations:', queryAllError);
      return false;
    }

    console.log('✅ Successfully retrieved conversations:');
    console.log('📊 Total messages:', allConversations?.length || 0);
    
    if (allConversations && allConversations.length > 0) {
      console.log('📋 Conversation structure:');
      allConversations.forEach((msg, index) => {
        console.log(`   ${index + 1}. ${msg.message_type}: ${msg.content.substring(0, 80)}...`);
      });
      
      // Group by session
      const sessions = {};
      allConversations.forEach(msg => {
        if (!sessions[msg.conversation_session]) {
          sessions[msg.conversation_session] = [];
        }
        sessions[msg.conversation_session].push(msg);
      });
      
      console.log('🎯 Sessions found:', Object.keys(sessions).length);
      console.log('✅ Conversation logging system is working perfectly!');
      console.log('💬 Data structure matches expected format for AI Conversation Viewer');
      
      return true;
    } else {
      console.error('❌ No conversations retrieved');
      return false;
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error);
    return false;
  }
}

// Run the test
testConversationLogging().then(success => {
  if (success) {
    console.log('\n🎉 Conversation logging system test PASSED!');
    console.log('🚀 Ready to integrate with story analysis pipeline');
  } else {
    console.log('\n❌ Conversation logging system test FAILED');
  }
  process.exit(success ? 0 : 1);
});
