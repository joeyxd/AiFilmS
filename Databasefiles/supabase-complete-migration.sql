-- =========================================
-- FilmStudio AI Complete Database Migration
-- =========================================
-- Run this ENTIRE file in the Supabase Cloud SQL editor
-- This creates all necessary tables and columns for the story creation system

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================
-- 1. CREATE CORE TABLES (if they don't exist)
-- =========================================

-- User profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT,
  subscription_tier TEXT DEFAULT 'free',
  is_verified BOOLEAN DEFAULT false,
  creator_score INTEGER DEFAULT 0,
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_completed_at TIMESTAMP WITH TIME ZONE,
  job_role TEXT,
  company_name TEXT,
  company_type TEXT,
  company_size TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  project_type TEXT DEFAULT 'film',
  status TEXT DEFAULT 'draft',
  is_public BOOLEAN DEFAULT false,
  story_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stories table
CREATE TABLE IF NOT EXISTS stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  logline TEXT,
  genre TEXT,
  status TEXT DEFAULT 'new',
  original_text TEXT,
  ai_analysis_metadata JSONB,
  estimated_duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chapters table
CREATE TABLE IF NOT EXISTS chapters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  chapter_number INTEGER NOT NULL,
  title TEXT,
  content TEXT,
  summary TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Characters table  
CREATE TABLE IF NOT EXISTS characters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  name TEXT,
  character_type TEXT,
  description TEXT,
  age INTEGER,
  background TEXT,
  status TEXT DEFAULT 'identified',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scenes table
CREATE TABLE IF NOT EXISTS scenes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
  scene_number INTEGER NOT NULL,
  title TEXT,
  location TEXT,
  time_of_day TEXT,
  description TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shots table
CREATE TABLE IF NOT EXISTS shots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scene_id UUID REFERENCES scenes(id) ON DELETE CASCADE,
  shot_number INTEGER NOT NULL,
  shot_type TEXT,
  description TEXT,
  camera_angle TEXT,
  duration DECIMAL(5,2),
  image_prompt TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Story images table for cover images and assets
CREATE TABLE IF NOT EXISTS story_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  image_url TEXT,
  image_type TEXT DEFAULT 'cover',
  prompt TEXT,
  file_path TEXT,
  file_size INTEGER,
  mime_type TEXT DEFAULT 'image/png',
  original_dalle_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================
-- 2. ADD MISSING COLUMNS TO EXISTING TABLES
-- =========================================

-- Add essential columns to stories table
ALTER TABLE stories ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS cover_image_prompt TEXT;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS story_metadata JSONB;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS commercial_analysis JSONB;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS production_plan JSONB;
ALTER TABLE stories ADD COLUMN IF NOT EXISTS agent_diagnostics JSONB;

-- Add essential columns to chapters table
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS narrative_purpose TEXT;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS cinematic_vitals JSONB;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS complexity JSONB;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS hooks_for_next_chapter TEXT;

-- Add essential columns to characters table
ALTER TABLE characters ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS character_type TEXT;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS age INTEGER;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS background TEXT;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS narrative_vitals JSONB;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS psychology JSONB;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS arc JSONB;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS emotional_trajectory JSONB;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS performance_dna JSONB;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS visual_dna JSONB;

-- Add essential columns to story_images table
ALTER TABLE story_images ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE story_images ADD COLUMN IF NOT EXISTS image_type TEXT;
ALTER TABLE story_images ADD COLUMN IF NOT EXISTS prompt TEXT;
ALTER TABLE story_images ADD COLUMN IF NOT EXISTS image_prompt TEXT;

-- =========================================
-- 3. CREATE ADVANCED TABLES
-- =========================================

-- Location clusters for production planning
CREATE TABLE IF NOT EXISTS location_clusters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  cluster_name TEXT NOT NULL,
  chapters TEXT[], -- Array of chapter IDs
  day_night_split JSONB,
  estimated_shoot_days INTEGER,
  budget_tier TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Story diagnostics for AI analysis
CREATE TABLE IF NOT EXISTS story_diagnostics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  coherence_score DECIMAL(3,2),
  timeline_warnings TEXT[],
  character_consistency_flags TEXT[],
  pacing_notes TEXT,
  improvement_suggestions TEXT[],
  agent_version TEXT DEFAULT 'S-1X',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- =========================================

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_stories_project_id ON stories(project_id);
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_status ON stories(status);
CREATE INDEX IF NOT EXISTS idx_chapters_story_id ON chapters(story_id);
CREATE INDEX IF NOT EXISTS idx_characters_story_id ON characters(story_id);
CREATE INDEX IF NOT EXISTS idx_scenes_chapter_id ON scenes(chapter_id);
CREATE INDEX IF NOT EXISTS idx_shots_scene_id ON shots(scene_id);
CREATE INDEX IF NOT EXISTS idx_shots_status ON shots(status);
CREATE INDEX IF NOT EXISTS idx_story_images_story_id ON story_images(story_id);
CREATE INDEX IF NOT EXISTS idx_story_images_type ON story_images(image_type);
CREATE INDEX IF NOT EXISTS idx_location_clusters_story_id ON location_clusters(story_id);
CREATE INDEX IF NOT EXISTS idx_story_diagnostics_story_id ON story_diagnostics(story_id);

-- =========================================
-- 5. ENABLE ROW LEVEL SECURITY
-- =========================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE shots ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_diagnostics ENABLE ROW LEVEL SECURITY;

-- =========================================
-- 6. CREATE RLS POLICIES
-- =========================================

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Projects policies
DROP POLICY IF EXISTS "Users can manage own projects" ON projects;
DROP POLICY IF EXISTS "Users can view public projects" ON projects;
CREATE POLICY "Users can manage own projects" ON projects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view public projects" ON projects FOR SELECT USING (is_public = true OR auth.uid() = user_id);

-- Stories policies
DROP POLICY IF EXISTS "Users can manage own stories" ON stories;
CREATE POLICY "Users can manage own stories" ON stories FOR ALL USING (auth.uid() = user_id);

-- Chapters policies
DROP POLICY IF EXISTS "Users can manage own chapters" ON chapters;
CREATE POLICY "Users can manage own chapters" ON chapters FOR ALL USING (
  auth.uid() = (SELECT user_id FROM stories WHERE stories.id = chapters.story_id)
);

-- Characters policies
DROP POLICY IF EXISTS "Users can manage own characters" ON characters;
CREATE POLICY "Users can manage own characters" ON characters FOR ALL USING (
  auth.uid() = (SELECT user_id FROM stories WHERE stories.id = characters.story_id)
);

-- Scenes policies
DROP POLICY IF EXISTS "Users can manage own scenes" ON scenes;
CREATE POLICY "Users can manage own scenes" ON scenes FOR ALL USING (
  auth.uid() = (SELECT s.user_id FROM stories s JOIN chapters c ON s.id = c.story_id WHERE c.id = scenes.chapter_id)
);

-- Shots policies
DROP POLICY IF EXISTS "Users can manage own shots" ON shots;
CREATE POLICY "Users can manage own shots" ON shots FOR ALL USING (
  auth.uid() = (SELECT s.user_id FROM stories s 
    JOIN chapters c ON s.id = c.story_id 
    JOIN scenes sc ON c.id = sc.chapter_id 
    WHERE sc.id = shots.scene_id)
);

-- Story images policies
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

-- Location clusters policies
DROP POLICY IF EXISTS "Users can view their own location clusters" ON location_clusters;
CREATE POLICY "Users can view their own location clusters" ON location_clusters
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM stories WHERE stories.id = location_clusters.story_id)
  );

-- Story diagnostics policies
DROP POLICY IF EXISTS "Users can view their own story diagnostics" ON story_diagnostics;
CREATE POLICY "Users can view their own story diagnostics" ON story_diagnostics
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM stories WHERE stories.id = story_diagnostics.story_id)
  );

-- =========================================
-- 7. CREATE TRIGGERS FOR AUTO-UPDATING TIMESTAMPS
-- =========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for auto-updating updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
DROP TRIGGER IF EXISTS update_stories_updated_at ON stories;
DROP TRIGGER IF EXISTS update_chapters_updated_at ON chapters;
DROP TRIGGER IF EXISTS update_characters_updated_at ON characters;
DROP TRIGGER IF EXISTS update_scenes_updated_at ON scenes;
DROP TRIGGER IF EXISTS update_shots_updated_at ON shots;
DROP TRIGGER IF EXISTS update_story_images_updated_at ON story_images;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stories_updated_at BEFORE UPDATE ON stories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chapters_updated_at BEFORE UPDATE ON chapters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_characters_updated_at BEFORE UPDATE ON characters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_scenes_updated_at BEFORE UPDATE ON scenes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shots_updated_at BEFORE UPDATE ON shots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_story_images_updated_at BEFORE UPDATE ON story_images FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =========================================
-- 8. CREATE STORAGE BUCKET (if it doesn't exist)
-- =========================================

-- Note: Storage buckets are usually created through the Supabase Dashboard
-- If this fails, create the bucket manually in Dashboard > Storage
INSERT INTO storage.buckets (id, name, public) 
VALUES ('story-assets', 'story-assets', true)
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- MIGRATION COMPLETE
-- =========================================

-- Final verification queries (these should all succeed)
SELECT 'profiles table' as table_name, count(*) as row_count FROM profiles;
SELECT 'stories table' as table_name, count(*) as row_count FROM stories;
SELECT 'chapters table' as table_name, count(*) as row_count FROM chapters;
SELECT 'characters table' as table_name, count(*) as row_count FROM characters;
SELECT 'story_images table' as table_name, count(*) as row_count FROM story_images;

-- Check that all essential columns exist
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'stories' AND column_name IN ('title', 'cover_image_url', 'cover_image_prompt')
ORDER BY column_name;

SELECT column_name FROM information_schema.columns 
WHERE table_name = 'chapters' AND column_name IN ('title', 'content', 'narrative_purpose')
ORDER BY column_name;

SELECT column_name FROM information_schema.columns 
WHERE table_name = 'characters' AND column_name IN ('name', 'character_type', 'psychology')
ORDER BY column_name;

SELECT column_name FROM information_schema.columns 
WHERE table_name = 'story_images' AND column_name IN ('image_url', 'image_type', 'prompt')
ORDER BY column_name;
