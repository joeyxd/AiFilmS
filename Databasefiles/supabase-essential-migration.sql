-- =========================================
-- FilmStudio AI Essential Database Migration
-- =========================================
-- Run this in the Supabase Cloud SQL editor
-- Adds only the essential fields needed for the enhanced o3 system

-- =========================================
-- 1. ADD ESSENTIAL FIELDS TO STORIES TABLE
-- =========================================

-- Add cover image fields (needed for o3 image generation)
ALTER TABLE stories ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS cover_image_prompt TEXT;

-- Add metadata fields (needed for o3 analysis storage)
ALTER TABLE stories ADD COLUMN IF NOT EXISTS story_metadata JSONB;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS commercial_analysis JSONB;

-- =========================================
-- 2. CREATE STORY_IMAGES TABLE (for proper image management)
-- =========================================

CREATE TABLE IF NOT EXISTS story_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_type TEXT DEFAULT 'cover',
  prompt TEXT,
  file_path TEXT,
  file_size INTEGER,
  mime_type TEXT DEFAULT 'image/png',
  original_dalle_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_story_images_story_id ON story_images(story_id);
CREATE INDEX IF NOT EXISTS idx_story_images_type ON story_images(image_type);

-- Enable RLS
ALTER TABLE story_images ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view their own story images" ON story_images;
DROP POLICY IF EXISTS "Users can insert their own story images" ON story_images;
DROP POLICY IF EXISTS "Users can update their own story images" ON story_images;
DROP POLICY IF EXISTS "Users can delete their own story images" ON story_images;

CREATE POLICY "Users can view their own story images" ON story_images
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM stories WHERE stories.id = story_images.story_id)
  );

CREATE POLICY "Users can insert their own story images" ON story_images
  FOR INSERT WITH CHECK (
    auth.uid() = (SELECT user_id FROM stories WHERE stories.id = story_images.story_id)
  );

CREATE POLICY "Users can update their own story images" ON story_images
  FOR UPDATE USING (
    auth.uid() = (SELECT user_id FROM stories WHERE stories.id = story_images.story_id)
  );

CREATE POLICY "Users can delete their own story images" ON story_images
  FOR DELETE USING (
    auth.uid() = (SELECT user_id FROM stories WHERE stories.id = story_images.story_id)
  );

-- =========================================
-- 3. ADD ENHANCED FIELDS TO CHARACTERS TABLE
-- =========================================

-- Add psychology and character arc fields (needed for enhanced analysis)
ALTER TABLE characters ADD COLUMN IF NOT EXISTS age INTEGER;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS psychology JSONB;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS arc JSONB;

-- =========================================
-- 4. ADD ENHANCED FIELDS TO CHAPTERS TABLE
-- =========================================

-- Add narrative analysis fields
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS narrative_purpose TEXT;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS cinematic_vitals JSONB;

-- =========================================
-- 5. CREATE REASONING_MEMORY TABLE (for o3 learning system)
-- =========================================

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

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_reasoning_memory_quality ON reasoning_memory(quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_reasoning_memory_genres ON reasoning_memory USING GIN(genres);

-- Enable RLS
ALTER TABLE reasoning_memory ENABLE ROW LEVEL SECURITY;

-- Create policy
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON reasoning_memory;
CREATE POLICY "Allow all operations for authenticated users" ON reasoning_memory
  FOR ALL USING (auth.role() = 'authenticated');

-- =========================================
-- 6. CREATE TRIGGERS FOR AUTO-UPDATING TIMESTAMPS
-- =========================================

-- Function to update updated_at timestamp (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for new tables
DROP TRIGGER IF EXISTS update_story_images_updated_at ON story_images;
DROP TRIGGER IF EXISTS update_reasoning_memory_updated_at ON reasoning_memory;

CREATE TRIGGER update_story_images_updated_at 
  BEFORE UPDATE ON story_images 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reasoning_memory_updated_at 
  BEFORE UPDATE ON reasoning_memory 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =========================================
-- 7. CREATE STORAGE BUCKET FOR STORY ASSETS
-- =========================================

-- Create storage bucket for story images (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('story-assets', 'story-assets', true)
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- MIGRATION VERIFICATION
-- =========================================

-- Check that all essential fields were added successfully
SELECT 'stories table columns' as check_type, 
       string_agg(column_name, ', ' ORDER BY column_name) as columns
FROM information_schema.columns 
WHERE table_name = 'stories' 
AND column_name IN ('cover_image_url', 'cover_image_prompt', 'story_metadata', 'commercial_analysis');

SELECT 'characters table columns' as check_type,
       string_agg(column_name, ', ' ORDER BY column_name) as columns  
FROM information_schema.columns 
WHERE table_name = 'characters' 
AND column_name IN ('age', 'psychology', 'arc');

SELECT 'chapters table columns' as check_type,
       string_agg(column_name, ', ' ORDER BY column_name) as columns
FROM information_schema.columns 
WHERE table_name = 'chapters' 
AND column_name IN ('narrative_purpose', 'cinematic_vitals');

SELECT 'story_images table exists' as check_type,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'story_images') 
            THEN 'YES' ELSE 'NO' END as status;

SELECT 'reasoning_memory table exists' as check_type,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reasoning_memory') 
            THEN 'YES' ELSE 'NO' END as status;

SELECT 'storage bucket exists' as check_type,
       CASE WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'story-assets') 
            THEN 'YES' ELSE 'NO' END as status;

-- Show row counts
SELECT 'stories' as table_name, count(*) as row_count FROM stories
UNION ALL
SELECT 'characters' as table_name, count(*) as row_count FROM characters  
UNION ALL
SELECT 'chapters' as table_name, count(*) as row_count FROM chapters
UNION ALL
SELECT 'story_images' as table_name, count(*) as row_count FROM story_images
UNION ALL
SELECT 'reasoning_memory' as table_name, count(*) as row_count FROM reasoning_memory
ORDER BY table_name;

-- =========================================
-- MIGRATION COMPLETE
-- =========================================

-- Success message
SELECT 'Essential migration completed successfully!' as status,
       'Ready for enhanced o3 system with cover images and learning capabilities' as message;
