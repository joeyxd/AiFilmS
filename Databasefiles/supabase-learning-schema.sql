-- The Scenarist Core v2.0 - Smart Learning Database Schema
-- This creates tables for reasoning memory, embeddings, and quality feedback

-- ENABLE REQUIRED EXTENSIONS
-- Enable pgvector extension for vector embeddings (if available)
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. REASONING MEMORY TABLE
-- Stores successful reasoning patterns for reuse
CREATE TABLE IF NOT EXISTS reasoning_memory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id TEXT NOT NULL,
  phase TEXT NOT NULL,
  reasoning_context JSONB NOT NULL,
  quality_score INTEGER CHECK (quality_score >= 1 AND quality_score <= 10),
  usage_count INTEGER DEFAULT 0,
  genres TEXT[] DEFAULT '{}',
  themes TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast quality-based retrieval
CREATE INDEX IF NOT EXISTS idx_reasoning_memory_quality ON reasoning_memory(quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_reasoning_memory_genres ON reasoning_memory USING GIN(genres);

-- 2. STORY EMBEDDINGS TABLE  
-- Stores vector embeddings for semantic similarity matching (optional - requires pgvector)
CREATE TABLE IF NOT EXISTS story_embeddings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  story_text_preview TEXT NOT NULL,
  embedding TEXT, -- Store as TEXT if pgvector not available, JSON array format
  embedding_vector vector(3072), -- Only if pgvector extension is available
  genres TEXT[] DEFAULT '{}',
  themes TEXT[] DEFAULT '{}',
  quality_score INTEGER DEFAULT 5,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vector similarity index (requires pgvector extension)
-- Uncomment these lines if pgvector extension is successfully enabled:
-- ALTER TABLE story_embeddings DROP COLUMN IF EXISTS embedding;
-- CREATE INDEX IF NOT EXISTS idx_story_embeddings_cosine ON story_embeddings USING ivfflat (embedding_vector vector_cosine_ops);

-- 3. ANALYSIS FEEDBACK TABLE
-- Tracks quality ratings and improvement suggestions
CREATE TABLE IF NOT EXISTS analysis_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_id TEXT NOT NULL,
  story_id TEXT,
  quality_score INTEGER CHECK (quality_score >= 1 AND quality_score <= 10),
  feedback TEXT,
  feedback_type TEXT DEFAULT 'general', -- 'general', 'character', 'plot', 'dialogue', etc.
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for feedback analysis
CREATE INDEX IF NOT EXISTS idx_analysis_feedback_quality ON analysis_feedback(quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_analysis_feedback_type ON analysis_feedback(feedback_type);

-- 4. CREATIVE PATTERNS TABLE
-- Stores successful creative techniques and approaches
CREATE TABLE IF NOT EXISTS creative_patterns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pattern_name TEXT NOT NULL,
  pattern_description TEXT NOT NULL,
  techniques JSONB NOT NULL,
  success_stories TEXT[] DEFAULT '{}',
  genres TEXT[] DEFAULT '{}',
  effectiveness_score DECIMAL(3,2) DEFAULT 5.0,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. LEARNING INSIGHTS TABLE  
-- Stores discovered patterns and insights from successful analyses
CREATE TABLE IF NOT EXISTS learning_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  insight_type TEXT NOT NULL, -- 'character_development', 'plot_structure', 'dialogue_style', etc.
  insight_content TEXT NOT NULL,
  supporting_examples JSONB DEFAULT '[]',
  confidence_score DECIMAL(3,2) DEFAULT 5.0,
  genres TEXT[] DEFAULT '{}',
  discovered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  validated_count INTEGER DEFAULT 0
);

-- 6. ENABLE ROW LEVEL SECURITY
ALTER TABLE reasoning_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE creative_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_insights ENABLE ROW LEVEL SECURITY;

-- 7. CREATE POLICIES (Allow all operations for authenticated users)
CREATE POLICY "Allow all operations for authenticated users" ON reasoning_memory
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON story_embeddings
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON analysis_feedback
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON creative_patterns
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON learning_insights
  FOR ALL USING (auth.role() = 'authenticated');

-- 8. HELPER FUNCTIONS

-- Function to get similar reasoning patterns
CREATE OR REPLACE FUNCTION get_similar_reasoning_patterns(
  input_genres TEXT[],
  input_themes TEXT[],
  min_quality INTEGER DEFAULT 8,
  limit_count INTEGER DEFAULT 5
)
RETURNS TABLE (
  reasoning_context JSONB,
  quality_score INTEGER,
  similarity_score DECIMAL
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rm.reasoning_context,
    rm.quality_score,
    -- Simple similarity based on genre/theme overlap
    CASE 
      WHEN cardinality(rm.genres & input_genres) > 0 OR cardinality(rm.themes & input_themes) > 0 
      THEN (cardinality(rm.genres & input_genres) + cardinality(rm.themes & input_themes))::DECIMAL / 
           GREATEST(cardinality(rm.genres) + cardinality(rm.themes), 1)
      ELSE 0.0
    END as similarity_score
  FROM reasoning_memory rm
  WHERE rm.quality_score >= min_quality
  ORDER BY similarity_score DESC, rm.quality_score DESC
  LIMIT limit_count;
END;
$$;

-- Function to update usage counts
CREATE OR REPLACE FUNCTION increment_usage_count(table_name TEXT, record_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  IF table_name = 'reasoning_memory' THEN
    UPDATE reasoning_memory SET usage_count = usage_count + 1 WHERE id = record_id;
  ELSIF table_name = 'story_embeddings' THEN
    UPDATE story_embeddings SET usage_count = usage_count + 1 WHERE id = record_id;
  ELSIF table_name = 'creative_patterns' THEN
    UPDATE creative_patterns SET usage_count = usage_count + 1 WHERE id = record_id;
  END IF;
END;
$$;

-- Sample creative patterns to get started
INSERT INTO creative_patterns (pattern_name, pattern_description, techniques, genres, effectiveness_score) VALUES
('Unreliable Narrator Revelation', 'Gradually revealing that the narrator has been withholding or misrepresenting key information', 
 '{"techniques": ["subtle_contradictions", "perspective_shifts", "reality_anchors", "revelation_timing"]}', 
 '{"thriller", "psychological_drama", "mystery"}', 8.5),

('Emotional Core Amplification', 'Identifying and amplifying the emotional heart of character relationships', 
 '{"techniques": ["shared_vulnerabilities", "opposing_values", "sacrifice_moments", "recognition_scenes"]}', 
 '{"drama", "romance", "family"}', 9.0),

('Time Structure Innovation', 'Non-linear storytelling that enhances rather than confuses the narrative', 
 '{"techniques": ["parallel_timelines", "circular_structure", "flashback_motivation", "future_echoes"]}', 
 '{"sci-fi", "thriller", "drama"}', 7.8);

COMMENT ON TABLE reasoning_memory IS 'Stores successful AI reasoning patterns for learning and reuse';
COMMENT ON TABLE story_embeddings IS 'Vector embeddings for semantic story similarity matching';
COMMENT ON TABLE analysis_feedback IS 'Quality feedback to improve future analyses';
COMMENT ON TABLE creative_patterns IS 'Successful creative techniques and storytelling approaches';
COMMENT ON TABLE learning_insights IS 'Discovered patterns and insights from successful analyses';
