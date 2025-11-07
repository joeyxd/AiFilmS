-- AI Conversation Logging System
-- This table stores complete AI conversations with queries, thinking, and responses

CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  conversation_session UUID DEFAULT uuid_generate_v4(), -- Groups related messages
  phase_name TEXT, -- phase1, phase2, etc.
  message_type TEXT NOT NULL CHECK (message_type IN ('query', 'thinking', 'response', 'error', 'system')),
  message_order INTEGER NOT NULL, -- Order within session
  content TEXT NOT NULL,
  metadata JSONB, -- Model info, tokens, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_ai_conversations_story_session 
ON ai_conversations(story_id, conversation_session, message_order);

CREATE INDEX IF NOT EXISTS idx_ai_conversations_phase 
ON ai_conversations(story_id, phase_name, created_at);

-- RLS Policy
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view conversations for their stories" ON ai_conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = ai_conversations.story_id
      AND stories.user_id = auth.uid()
    )
  );

CREATE POLICY "Service can insert conversations" ON ai_conversations
  FOR INSERT WITH CHECK (true);
