-- =========================================
-- FilmStudio AI Resume System Database Extension
-- =========================================
-- Run this directly in Supabase SQL Editor

-- Add processing phase tracking to stories table
ALTER TABLE stories ADD COLUMN IF NOT EXISTS processing_phases JSONB DEFAULT '{}';
ALTER TABLE stories ADD COLUMN IF NOT EXISTS processing_metadata JSONB DEFAULT '{}';
ALTER TABLE stories ADD COLUMN IF NOT EXISTS last_processing_error TEXT;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS processing_resumed_count INTEGER DEFAULT 0;

-- Update existing stories to have empty processing phases
UPDATE stories 
SET processing_phases = '{}', 
    processing_metadata = '{}',
    processing_resumed_count = 0
WHERE processing_phases IS NULL;

-- Add AI analysis metadata field (if not exists)
ALTER TABLE stories ADD COLUMN IF NOT EXISTS ai_analysis_metadata JSONB DEFAULT '{}';

-- Add analyzing status to stories (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type t 
        JOIN pg_enum e ON t.oid = e.enumtypid 
        WHERE t.typname = 'story_status' AND e.enumlabel = 'analyzing'
    ) THEN
        ALTER TYPE story_status ADD VALUE 'analyzing';
    END IF;
END $$;

-- Create processing_logs table for detailed tracking
CREATE TABLE IF NOT EXISTS processing_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  phase_name TEXT NOT NULL,
  phase_status TEXT NOT NULL, -- 'started', 'completed', 'failed', 'skipped'
  phase_data JSONB,
  error_message TEXT,
  processing_time_ms INTEGER,
  tokens_used JSONB, -- {input: X, output: Y, reasoning: Z}
  cost_usd DECIMAL(10,6),
  model_used TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_processing_logs_story_id ON processing_logs(story_id);
CREATE INDEX IF NOT EXISTS idx_processing_logs_phase ON processing_logs(phase_name);
CREATE INDEX IF NOT EXISTS idx_processing_logs_status ON processing_logs(phase_status);

-- Enable RLS
ALTER TABLE processing_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for processing_logs (skip if already exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'processing_logs' AND policyname = 'Users can view their own processing logs') THEN
        CREATE POLICY "Users can view their own processing logs" ON processing_logs
        FOR SELECT USING (
          story_id IN (
            SELECT id FROM stories WHERE user_id = auth.uid()
          )
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'processing_logs' AND policyname = 'System can insert processing logs') THEN
        CREATE POLICY "System can insert processing logs" ON processing_logs
        FOR INSERT WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'processing_logs' AND policyname = 'System can update processing logs') THEN
        CREATE POLICY "System can update processing logs" ON processing_logs
        FOR UPDATE USING (true);
    END IF;
END $$;

-- Comments for documentation
COMMENT ON COLUMN stories.processing_phases IS 'JSON tracking which phases are complete: {"phase1": "completed", "phase2": "failed", etc}';
COMMENT ON COLUMN stories.processing_metadata IS 'JSON storing intermediate results for resume functionality';
COMMENT ON TABLE processing_logs IS 'Detailed log of all processing attempts for debugging and cost tracking';

-- Verify the changes
SELECT 
  'stories table columns added' as status,
  COUNT(*) as total_stories,
  COUNT(CASE WHEN processing_phases IS NOT NULL THEN 1 END) as stories_with_phases
FROM stories;

SELECT 'processing_logs table created' as status, COUNT(*) as log_count FROM processing_logs;
