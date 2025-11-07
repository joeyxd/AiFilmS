-- =========================================
-- Enhanced AI Media Generation System Database Migration
-- =========================================
-- Comprehensive system for user-generated AI media (images, videos, audio)

BEGIN;

-- User generated images table (separate from story-specific images)
CREATE TABLE IF NOT EXISTS user_generated_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  model TEXT NOT NULL,
  image_url TEXT,
  file_path TEXT, -- Supabase Storage path
  file_size INTEGER,
  image_width INTEGER,
  image_height INTEGER,
  mime_type TEXT DEFAULT 'image/png',
  base64_data TEXT, -- For temporary storage before upload to storage
  is_public BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false, -- For system-wide showcase
  generation_metadata JSONB, -- Store API response metadata (usage, tokens, etc.)
  tags TEXT[], -- For categorization and search
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User generated videos table for AI video content
CREATE TABLE IF NOT EXISTS user_generated_videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  model TEXT NOT NULL,
  video_url TEXT,
  file_path TEXT, -- Supabase Storage path
  thumbnail_url TEXT, -- Video thumbnail
  thumbnail_path TEXT, -- Thumbnail storage path
  file_size INTEGER,
  duration_seconds INTEGER,
  video_width INTEGER,
  video_height INTEGER,
  fps INTEGER DEFAULT 30,
  codec TEXT DEFAULT 'h264',
  mime_type TEXT DEFAULT 'video/mp4',
  is_public BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  generation_metadata JSONB, -- Model settings, generation time, etc.
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User generated audio table for AI audio content
CREATE TABLE IF NOT EXISTS user_generated_audio (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  model TEXT NOT NULL,
  audio_url TEXT,
  file_path TEXT, -- Supabase Storage path
  file_size INTEGER,
  duration_seconds INTEGER,
  format TEXT DEFAULT 'mp3', -- Audio format (mp3, wav, ogg, etc.)
  sample_rate INTEGER DEFAULT 44100,
  bit_rate INTEGER DEFAULT 128, -- kbps
  channels INTEGER DEFAULT 2, -- 1 = mono, 2 = stereo
  audio_type TEXT, -- music, voice, sfx, ambient, etc.
  mime_type TEXT DEFAULT 'audio/mpeg',
  is_public BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  generation_metadata JSONB, -- Model settings, voice type, etc.
  tags TEXT[],
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
  creator_username TEXT, -- Display name (not actual username)
  featured_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System showcase videos table (curated featured videos)
CREATE TABLE IF NOT EXISTS showcase_videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  original_video_id UUID REFERENCES user_generated_videos(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  prompt TEXT NOT NULL,
  model TEXT NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  creator_username TEXT,
  featured_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System showcase audio table (curated featured audio)
CREATE TABLE IF NOT EXISTS showcase_audio (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  original_audio_id UUID REFERENCES user_generated_audio(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  prompt TEXT NOT NULL,
  model TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  duration_seconds INTEGER,
  audio_type TEXT,
  creator_username TEXT,
  featured_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User media collections (playlists/albums)
CREATE TABLE IF NOT EXISTS user_media_collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  collection_type TEXT CHECK (collection_type IN ('image_gallery', 'video_playlist', 'audio_album', 'mixed')),
  is_public BOOLEAN DEFAULT false,
  cover_image_url TEXT,
  item_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Collection items junction table
CREATE TABLE IF NOT EXISTS collection_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id UUID REFERENCES user_media_collections(id) ON DELETE CASCADE,
  item_type TEXT CHECK (item_type IN ('image', 'video', 'audio')),
  item_id UUID, -- References the specific media table
  order_index INTEGER DEFAULT 0,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_generated_images_user_id ON user_generated_images(user_id);
CREATE INDEX IF NOT EXISTS idx_user_generated_images_is_public ON user_generated_images(is_public);
CREATE INDEX IF NOT EXISTS idx_user_generated_images_is_featured ON user_generated_images(is_featured);
CREATE INDEX IF NOT EXISTS idx_user_generated_images_created_at ON user_generated_images(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_generated_images_tags ON user_generated_images USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_user_generated_videos_user_id ON user_generated_videos(user_id);
CREATE INDEX IF NOT EXISTS idx_user_generated_videos_is_public ON user_generated_videos(is_public);
CREATE INDEX IF NOT EXISTS idx_user_generated_videos_is_featured ON user_generated_videos(is_featured);
CREATE INDEX IF NOT EXISTS idx_user_generated_videos_created_at ON user_generated_videos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_generated_videos_tags ON user_generated_videos USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_user_generated_audio_user_id ON user_generated_audio(user_id);
CREATE INDEX IF NOT EXISTS idx_user_generated_audio_is_public ON user_generated_audio(is_public);
CREATE INDEX IF NOT EXISTS idx_user_generated_audio_is_featured ON user_generated_audio(is_featured);
CREATE INDEX IF NOT EXISTS idx_user_generated_audio_created_at ON user_generated_audio(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_generated_audio_tags ON user_generated_audio USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_user_generated_audio_type ON user_generated_audio(audio_type);

CREATE INDEX IF NOT EXISTS idx_showcase_images_featured_order ON showcase_images(featured_order);
CREATE INDEX IF NOT EXISTS idx_showcase_images_is_active ON showcase_images(is_active);
CREATE INDEX IF NOT EXISTS idx_showcase_videos_featured_order ON showcase_videos(featured_order);
CREATE INDEX IF NOT EXISTS idx_showcase_videos_is_active ON showcase_videos(is_active);
CREATE INDEX IF NOT EXISTS idx_showcase_audio_featured_order ON showcase_audio(featured_order);
CREATE INDEX IF NOT EXISTS idx_showcase_audio_is_active ON showcase_audio(is_active);

CREATE INDEX IF NOT EXISTS idx_collection_items_collection_id ON collection_items(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_item_type_id ON collection_items(item_type, item_id);

-- Enable Row Level Security
ALTER TABLE user_generated_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_generated_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_generated_audio ENABLE ROW LEVEL SECURITY;
ALTER TABLE showcase_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE showcase_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE showcase_audio ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_media_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;

-- =========================================
-- RLS Policies for user_generated_images
-- =========================================
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

-- =========================================
-- RLS Policies for user_generated_videos
-- =========================================
DROP POLICY IF EXISTS "Users can view their own generated videos" ON user_generated_videos;
DROP POLICY IF EXISTS "Users can view public generated videos" ON user_generated_videos;
DROP POLICY IF EXISTS "Users can insert their own generated videos" ON user_generated_videos;
DROP POLICY IF EXISTS "Users can update their own generated videos" ON user_generated_videos;
DROP POLICY IF EXISTS "Users can delete their own generated videos" ON user_generated_videos;

CREATE POLICY "Users can view their own generated videos" ON user_generated_videos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public generated videos" ON user_generated_videos
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can insert their own generated videos" ON user_generated_videos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own generated videos" ON user_generated_videos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own generated videos" ON user_generated_videos
  FOR DELETE USING (auth.uid() = user_id);

-- =========================================
-- RLS Policies for user_generated_audio
-- =========================================
DROP POLICY IF EXISTS "Users can view their own generated audio" ON user_generated_audio;
DROP POLICY IF EXISTS "Users can view public generated audio" ON user_generated_audio;
DROP POLICY IF EXISTS "Users can insert their own generated audio" ON user_generated_audio;
DROP POLICY IF EXISTS "Users can update their own generated audio" ON user_generated_audio;
DROP POLICY IF EXISTS "Users can delete their own generated audio" ON user_generated_audio;

CREATE POLICY "Users can view their own generated audio" ON user_generated_audio
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public generated audio" ON user_generated_audio
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can insert their own generated audio" ON user_generated_audio
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own generated audio" ON user_generated_audio
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own generated audio" ON user_generated_audio
  FOR DELETE USING (auth.uid() = user_id);

-- =========================================
-- RLS Policies for showcase tables
-- =========================================
DROP POLICY IF EXISTS "Anyone can view active showcase images" ON showcase_images;
DROP POLICY IF EXISTS "Anyone can view active showcase videos" ON showcase_videos;
DROP POLICY IF EXISTS "Anyone can view active showcase audio" ON showcase_audio;

CREATE POLICY "Anyone can view active showcase images" ON showcase_images
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view active showcase videos" ON showcase_videos
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view active showcase audio" ON showcase_audio
  FOR SELECT USING (is_active = true);

-- =========================================
-- RLS Policies for user collections
-- =========================================
DROP POLICY IF EXISTS "Users can view their own collections" ON user_media_collections;
DROP POLICY IF EXISTS "Users can view public collections" ON user_media_collections;
DROP POLICY IF EXISTS "Users can insert their own collections" ON user_media_collections;
DROP POLICY IF EXISTS "Users can update their own collections" ON user_media_collections;
DROP POLICY IF EXISTS "Users can delete their own collections" ON user_media_collections;

CREATE POLICY "Users can view their own collections" ON user_media_collections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public collections" ON user_media_collections
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can insert their own collections" ON user_media_collections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collections" ON user_media_collections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collections" ON user_media_collections
  FOR DELETE USING (auth.uid() = user_id);

-- =========================================
-- RLS Policies for collection items
-- =========================================
DROP POLICY IF EXISTS "Users can view items in their collections" ON collection_items;
DROP POLICY IF EXISTS "Users can view items in public collections" ON collection_items;
DROP POLICY IF EXISTS "Users can insert items in their collections" ON collection_items;
DROP POLICY IF EXISTS "Users can update items in their collections" ON collection_items;
DROP POLICY IF EXISTS "Users can delete items in their collections" ON collection_items;

CREATE POLICY "Users can view items in their collections" ON collection_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_media_collections 
      WHERE user_media_collections.id = collection_items.collection_id 
      AND user_media_collections.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view items in public collections" ON collection_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_media_collections 
      WHERE user_media_collections.id = collection_items.collection_id 
      AND user_media_collections.is_public = true
    )
  );

CREATE POLICY "Users can insert items in their collections" ON collection_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_media_collections 
      WHERE user_media_collections.id = collection_items.collection_id 
      AND user_media_collections.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update items in their collections" ON collection_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_media_collections 
      WHERE user_media_collections.id = collection_items.collection_id 
      AND user_media_collections.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete items in their collections" ON collection_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_media_collections 
      WHERE user_media_collections.id = collection_items.collection_id 
      AND user_media_collections.user_id = auth.uid()
    )
  );

-- =========================================
-- Functions and Triggers
-- =========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_user_generated_images_updated_at ON user_generated_images;
DROP TRIGGER IF EXISTS update_user_generated_videos_updated_at ON user_generated_videos;
DROP TRIGGER IF EXISTS update_user_generated_audio_updated_at ON user_generated_audio;
DROP TRIGGER IF EXISTS update_showcase_images_updated_at ON showcase_images;
DROP TRIGGER IF EXISTS update_showcase_videos_updated_at ON showcase_videos;
DROP TRIGGER IF EXISTS update_showcase_audio_updated_at ON showcase_audio;
DROP TRIGGER IF EXISTS update_user_media_collections_updated_at ON user_media_collections;

CREATE TRIGGER update_user_generated_images_updated_at BEFORE UPDATE ON user_generated_images FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_user_generated_videos_updated_at BEFORE UPDATE ON user_generated_videos FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_user_generated_audio_updated_at BEFORE UPDATE ON user_generated_audio FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_showcase_images_updated_at BEFORE UPDATE ON showcase_images FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_showcase_videos_updated_at BEFORE UPDATE ON showcase_videos FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_showcase_audio_updated_at BEFORE UPDATE ON showcase_audio FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_user_media_collections_updated_at BEFORE UPDATE ON user_media_collections FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

COMMIT;

-- =========================================
-- Sample Data (Optional - uncomment to add)
-- =========================================

/*
-- Add some sample showcase content
INSERT INTO showcase_images (title, description, prompt, model, image_url, creator_username, featured_order, tags) VALUES
('Cyberpunk Cityscape', 'A stunning futuristic city with neon lights', 'A futuristic cyberpunk city at night with neon lights reflecting on wet streets', 'google/gemini-2.5-flash-image-preview', 'https://example.com/sample-image-1.png', 'AI Artist', 1, ARRAY['cyberpunk', 'city', 'neon', 'futuristic']),
('Magical Forest', 'An enchanted forest scene', 'A magical forest with glowing mushrooms and fairy lights', 'google/gemini-2.5-flash-image-preview', 'https://example.com/sample-image-2.png', 'Creative Mind', 2, ARRAY['fantasy', 'forest', 'magical', 'nature']);
*/
