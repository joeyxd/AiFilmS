-- =========================================
-- Image Generation System Database Migration
-- =========================================
-- Add this to your existing Supabase database

-- User generated images table (separate from story-specific images)
CREATE TABLE IF NOT EXISTS user_generated_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  model TEXT NOT NULL,
  image_url TEXT,
  file_path TEXT,
  file_size INTEGER,
  mime_type TEXT DEFAULT 'image/png',
  base64_data TEXT, -- For temporary storage before upload to storage
  is_public BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false, -- For system-wide showcase
  generation_metadata JSONB, -- Store API response metadata (usage, tokens, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System showcase images table (curated featured images)
CREATE TABLE IF NOT EXISTS showcase_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  original_image_id UUID REFERENCES user_generated_images(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  prompt TEXT NOT NULL,
  model TEXT NOT NULL,
  image_url TEXT NOT NULL,
  featured_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_generated_images_user_id ON user_generated_images(user_id);
CREATE INDEX IF NOT EXISTS idx_user_generated_images_is_public ON user_generated_images(is_public);
CREATE INDEX IF NOT EXISTS idx_user_generated_images_is_featured ON user_generated_images(is_featured);
CREATE INDEX IF NOT EXISTS idx_user_generated_images_created_at ON user_generated_images(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_showcase_images_featured_order ON showcase_images(featured_order);
CREATE INDEX IF NOT EXISTS idx_showcase_images_is_active ON showcase_images(is_active);

-- Enable Row Level Security
ALTER TABLE user_generated_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE showcase_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_generated_images
DROP POLICY IF EXISTS "Users can view their own generated images" ON user_generated_images;
DROP POLICY IF EXISTS "Users can view public generated images" ON user_generated_images;
DROP POLICY IF EXISTS "Users can insert their own generated images" ON user_generated_images;
DROP POLICY IF EXISTS "Users can update their own generated images" ON user_generated_images;
DROP POLICY IF EXISTS "Users can delete their own generated images" ON user_generated_images;

CREATE POLICY "Users can view their own generated images" ON user_generated_images
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public generated images" ON user_generated_images
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can insert their own generated images" ON user_generated_images
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own generated images" ON user_generated_images
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own generated images" ON user_generated_images
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for showcase_images
DROP POLICY IF EXISTS "Anyone can view active showcase images" ON showcase_images;

CREATE POLICY "Anyone can view active showcase images" ON showcase_images
  FOR SELECT USING (is_active = true);
