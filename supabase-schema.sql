-- FilmStudio AI Database Schema for Supabase
-- Run this in the Supabase SQL editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types (enums)
CREATE TYPE project_type AS ENUM ('film', 'cartoon', 'faceless_youtube');
CREATE TYPE project_status AS ENUM ('draft', 'in_progress', 'completed', 'published');
CREATE TYPE story_status AS ENUM (
  'new', 'analyzing', 'chapterized', 'character_extracted', 
  'scenes_designed', 'shots_planned', 'images_generated', 
  'videos_generated', 'completed'
);
CREATE TYPE chapter_status AS ENUM ('pending', 'scenes_designed', 'completed');
CREATE TYPE character_status AS ENUM ('identified', 'designed', 'image_generated', 'ready');
CREATE TYPE scene_status AS ENUM ('pending', 'shots_designed', 'completed');
CREATE TYPE shot_status AS ENUM (
  'pending', 'image_prompted', 'image_generated', 
  'video_prompted', 'video_generated', 'completed', 'failed'
);
CREATE TYPE media_type AS ENUM ('image', 'video', 'audio', 'text');
CREATE TYPE media_source AS ENUM ('user_upload', 'ai_generated', 'stock', 'community');
CREATE TYPE track_type AS ENUM ('video', 'audio', 'text', 'effects');
CREATE TYPE agent_type AS ENUM (
  'story_analyzer', 'character_extractor', 'scene_designer',
  'shot_architect', 'image_prompt_engineer', 'video_flow_designer',
  'image_generator', 'video_generator'
);
CREATE TYPE job_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- User profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT, -- user bio/description
  website_url TEXT, -- personal website
  social_links JSONB, -- social media links
  subscription_tier TEXT DEFAULT 'free',
  is_verified BOOLEAN DEFAULT false, -- verified creator status
  creator_score INTEGER DEFAULT 0, -- overall creator performance score
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User settings
CREATE TABLE user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'dark',
  auto_save BOOLEAN DEFAULT true,
  ai_processing_notifications BOOLEAN DEFAULT true,
  community_sharing_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  project_type project_type NOT NULL,
  status project_status DEFAULT 'draft',
  is_public BOOLEAN DEFAULT false,
  story_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stories
CREATE TABLE stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  logline TEXT,
  full_story_text TEXT NOT NULL,
  genre TEXT,
  target_audience TEXT,
  estimated_duration INTEGER,
  status story_status DEFAULT 'new',
  ai_analysis_metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chapters
CREATE TABLE chapters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  chapter_number INTEGER NOT NULL,
  chapter_title TEXT NOT NULL,
  original_story_text_portion TEXT NOT NULL,
  chapter_summary TEXT,
  estimated_film_time INTEGER,
  mood_tone TEXT,
  key_events TEXT[],
  status chapter_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Characters
CREATE TABLE characters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  character_name TEXT NOT NULL,
  role_in_story TEXT NOT NULL,
  context_backstory TEXT,
  physical_description TEXT,
  personality_traits TEXT[],
  suggested_look_feel TEXT,
  still_image_prompt TEXT,
  generated_character_image_url TEXT,
  voice_characteristics TEXT,
  status character_status DEFAULT 'identified',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scenes
CREATE TABLE scenes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
  scene_number INTEGER NOT NULL,
  location TEXT,
  time_of_day TEXT,
  weather_atmosphere TEXT,
  overall_mood_feel TEXT,
  artistic_focus TEXT,
  scene_description TEXT NOT NULL,
  dialogue_hints TEXT,
  emotional_core TEXT,
  estimated_duration INTEGER,
  status scene_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scene characters junction
CREATE TABLE scene_characters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scene_id UUID REFERENCES scenes(id) ON DELETE CASCADE,
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  character_actions TEXT,
  emotional_state TEXT,
  UNIQUE(scene_id, character_id)
);

-- Shots
CREATE TABLE shots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scene_id UUID REFERENCES scenes(id) ON DELETE CASCADE,
  shot_number_in_scene INTEGER NOT NULL,
  shot_description TEXT NOT NULL,
  camera_shot_type TEXT,
  camera_movement TEXT,
  lens_choice_suggestion TEXT,
  lighting_description TEXT,
  color_palette_focus TEXT,
  artistic_intent TEXT,
  estimated_duration INTEGER,
  still_image_prompt TEXT,
  generated_still_image_url TEXT,
  video_shot_flow_description TEXT,
  video_generation_prompt TEXT,
  generated_video_clip_url TEXT,
  status shot_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Media assets
CREATE TABLE media_assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  media_type media_type NOT NULL,
  media_source media_source DEFAULT 'user_upload',
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER,
  width INTEGER,
  height INTEGER,
  file_size BIGINT,
  metadata JSONB,
  tags TEXT[],
  is_public BOOLEAN DEFAULT false,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Timelines
CREATE TABLE timelines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  duration INTEGER NOT NULL DEFAULT 0,
  frame_rate INTEGER DEFAULT 30,
  resolution_width INTEGER DEFAULT 1920,
  resolution_height INTEGER DEFAULT 1080,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tracks
CREATE TABLE tracks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timeline_id UUID REFERENCES timelines(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type track_type NOT NULL,
  position INTEGER NOT NULL,
  is_locked BOOLEAN DEFAULT false,
  is_muted BOOLEAN DEFAULT false,
  volume DECIMAL(3,2) DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clips
CREATE TABLE clips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
  media_asset_id UUID REFERENCES media_assets(id) ON DELETE SET NULL,
  start_time DECIMAL(10,3) NOT NULL,
  duration DECIMAL(10,3) NOT NULL,
  media_start_time DECIMAL(10,3) DEFAULT 0,
  properties JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI processing jobs
CREATE TABLE ai_processing_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  agent_type agent_type NOT NULL,
  input_data JSONB NOT NULL,
  output_data JSONB,
  status job_status DEFAULT 'pending',
  progress_percentage INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community posts
CREATE TABLE community_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  featured_media_url TEXT,
  tags TEXT[],
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  rating_average DECIMAL(3,2) DEFAULT 0.00, -- average rating from 0.00 to 5.00
  rating_count INTEGER DEFAULT 0, -- total number of ratings
  is_featured BOOLEAN DEFAULT false,
  quality_score INTEGER DEFAULT 0, -- algorithmic quality score
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community likes
CREATE TABLE community_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- Community comments
CREATE TABLE community_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES community_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rating system for community posts
CREATE TABLE community_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5), -- 1-5 star rating
  review_text TEXT, -- optional written review
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id) -- users can only rate a post once
);

-- User reputation and rating system
CREATE TABLE user_reputation (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  overall_rating DECIMAL(3,2) DEFAULT 0.00, -- average rating from 0.00 to 5.00
  total_ratings_received INTEGER DEFAULT 0,
  total_posts INTEGER DEFAULT 0,
  featured_posts INTEGER DEFAULT 0,
  community_points INTEGER DEFAULT 0, -- points from various activities
  creator_level TEXT DEFAULT 'beginner', -- beginner, intermediate, advanced, expert, master
  badges TEXT[] DEFAULT '{}', -- array of earned badges
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Badge system for achievements
CREATE TABLE user_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL, -- 'first_post', 'high_rated', 'community_favorite', etc.
  badge_name TEXT NOT NULL,
  badge_description TEXT,
  badge_icon_url TEXT,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User rating/review system (users rating other users)
CREATE TABLE user_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reviewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reviewed_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  review_category TEXT, -- 'creativity', 'technical_skill', 'community_contribution'
  post_reference_id UUID REFERENCES community_posts(id) ON DELETE SET NULL, -- optional reference to specific post
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(reviewer_id, reviewed_user_id, post_reference_id), -- prevent duplicate reviews
  CHECK (reviewer_id != reviewed_user_id) -- users can't review themselves
);

-- Create indexes for performance
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_stories_project_id ON stories(project_id);
CREATE INDEX idx_stories_user_id ON stories(user_id);
CREATE INDEX idx_chapters_story_id ON chapters(story_id);
CREATE INDEX idx_characters_story_id ON characters(story_id);
CREATE INDEX idx_scenes_chapter_id ON scenes(chapter_id);
CREATE INDEX idx_shots_scene_id ON shots(scene_id);
CREATE INDEX idx_shots_status ON shots(status);
CREATE INDEX idx_media_assets_user_id ON media_assets(user_id);
CREATE INDEX idx_media_assets_project_id ON media_assets(project_id);
CREATE INDEX idx_media_assets_type ON media_assets(media_type);
CREATE INDEX idx_media_assets_public ON media_assets(is_public);
CREATE INDEX idx_timelines_project_id ON timelines(project_id);
CREATE INDEX idx_tracks_timeline_id ON tracks(timeline_id);
CREATE INDEX idx_clips_track_id ON clips(track_id);
CREATE INDEX idx_ai_jobs_user_id ON ai_processing_jobs(user_id);
CREATE INDEX idx_ai_jobs_status ON ai_processing_jobs(status);
CREATE INDEX idx_ai_jobs_agent_type ON ai_processing_jobs(agent_type);
CREATE INDEX idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX idx_community_posts_featured ON community_posts(is_featured);
CREATE INDEX idx_community_likes_post_id ON community_likes(post_id);
CREATE INDEX idx_community_posts_rating ON community_posts(rating_average DESC);
CREATE INDEX idx_community_posts_quality ON community_posts(quality_score DESC);
CREATE INDEX idx_community_ratings_post_id ON community_ratings(post_id);
CREATE INDEX idx_community_ratings_user_id ON community_ratings(user_id);
CREATE INDEX idx_user_reputation_rating ON user_reputation(overall_rating DESC);
CREATE INDEX idx_user_reputation_level ON user_reputation(creator_level);
CREATE INDEX idx_user_reviews_reviewed_user ON user_reviews(reviewed_user_id);
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_user_badges_type ON user_badges(badge_type);

-- Update foreign key constraint for projects.story_id
ALTER TABLE projects 
ADD CONSTRAINT fk_projects_story_id 
FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE SET NULL;

-- Row Level Security (RLS) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE scene_characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE shots ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE timelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE clips ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_processing_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reputation ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reviews ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (users can only access their own data)
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can manage own projects" ON projects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view public projects" ON projects FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can manage own stories" ON stories FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own chapters" ON chapters FOR ALL USING (
  auth.uid() = (SELECT user_id FROM stories WHERE stories.id = chapters.story_id)
);

CREATE POLICY "Users can manage own characters" ON characters FOR ALL USING (
  auth.uid() = (SELECT user_id FROM stories WHERE stories.id = characters.story_id)
);

CREATE POLICY "Users can manage own scenes" ON scenes FOR ALL USING (
  auth.uid() = (SELECT s.user_id FROM stories s JOIN chapters c ON s.id = c.story_id WHERE c.id = scenes.chapter_id)
);

CREATE POLICY "Users can manage own shots" ON shots FOR ALL USING (
  auth.uid() = (SELECT s.user_id FROM stories s JOIN chapters c ON s.id = c.story_id JOIN scenes sc ON c.id = sc.chapter_id WHERE sc.id = shots.scene_id)
);

CREATE POLICY "Users can manage own media" ON media_assets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view public media" ON media_assets FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can manage own AI jobs" ON ai_processing_jobs FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view all community posts" ON community_posts FOR SELECT USING (true);
CREATE POLICY "Users can manage own community posts" ON community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own community posts" ON community_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own community posts" ON community_posts FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own likes" ON community_likes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own comments" ON community_comments FOR ALL USING (auth.uid() = user_id);

-- Rating system policies
CREATE POLICY "Users can view all ratings" ON community_ratings FOR SELECT USING (true);
CREATE POLICY "Users can manage own ratings" ON community_ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ratings" ON community_ratings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own ratings" ON community_ratings FOR DELETE USING (auth.uid() = user_id);

-- User reputation policies
CREATE POLICY "Everyone can view user reputation" ON user_reputation FOR SELECT USING (true);
CREATE POLICY "Users can view own reputation details" ON user_reputation FOR ALL USING (auth.uid() = user_id);

-- Badge policies
CREATE POLICY "Everyone can view user badges" ON user_badges FOR SELECT USING (true);
CREATE POLICY "Users can view own badges" ON user_badges FOR ALL USING (auth.uid() = user_id);

-- User review policies
CREATE POLICY "Everyone can view user reviews" ON user_reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON user_reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY "Users can update own reviews" ON user_reviews FOR UPDATE USING (auth.uid() = reviewer_id);
CREATE POLICY "Users can delete own reviews" ON user_reviews FOR DELETE USING (auth.uid() = reviewer_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers to auto-update updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stories_updated_at BEFORE UPDATE ON stories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chapters_updated_at BEFORE UPDATE ON chapters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_characters_updated_at BEFORE UPDATE ON characters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_scenes_updated_at BEFORE UPDATE ON scenes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shots_updated_at BEFORE UPDATE ON shots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_media_assets_updated_at BEFORE UPDATE ON media_assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_timelines_updated_at BEFORE UPDATE ON timelines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tracks_updated_at BEFORE UPDATE ON tracks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clips_updated_at BEFORE UPDATE ON clips FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_processing_jobs_updated_at BEFORE UPDATE ON ai_processing_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_community_posts_updated_at BEFORE UPDATE ON community_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_community_comments_updated_at BEFORE UPDATE ON community_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_community_ratings_updated_at BEFORE UPDATE ON community_ratings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_reputation_updated_at BEFORE UPDATE ON user_reputation FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_reviews_updated_at BEFORE UPDATE ON user_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create storage buckets (run these in Supabase Dashboard > Storage)
-- You'll need to create these buckets manually:
-- 1. 'avatars' - for user profile pictures
-- 2. 'media-assets' - for user uploaded videos, images, audio
-- 3. 'ai-generated' - for AI generated content
-- 4. 'community' - for community shared content

-- Helper function to get user's subscription tier
CREATE OR REPLACE FUNCTION get_user_subscription_tier(user_uuid UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT subscription_tier FROM profiles WHERE id = user_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has reached project limit
CREATE OR REPLACE FUNCTION user_can_create_project(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_tier TEXT;
  project_count INTEGER;
BEGIN
  user_tier := get_user_subscription_tier(user_uuid);
  project_count := (SELECT COUNT(*) FROM projects WHERE user_id = user_uuid);
  
  CASE user_tier
    WHEN 'free' THEN RETURN project_count < 3;
    WHEN 'pro' THEN RETURN project_count < 50;
    WHEN 'enterprise' THEN RETURN true;
    ELSE RETURN false;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update post rating average when a rating is added/updated/deleted
CREATE OR REPLACE FUNCTION update_post_rating_stats()
RETURNS TRIGGER AS $$
DECLARE
  post_uuid UUID;
  avg_rating DECIMAL(3,2);
  rating_count INTEGER;
BEGIN
  -- Get the post ID from either NEW or OLD record
  post_uuid := COALESCE(NEW.post_id, OLD.post_id);
  
  -- Calculate new average and count
  SELECT 
    COALESCE(AVG(rating), 0)::DECIMAL(3,2),
    COUNT(*)
  INTO avg_rating, rating_count
  FROM community_ratings 
  WHERE post_id = post_uuid;
  
  -- Update the post
  UPDATE community_posts 
  SET 
    rating_average = avg_rating,
    rating_count = rating_count,
    updated_at = NOW()
  WHERE id = post_uuid;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to update user reputation when they receive ratings
CREATE OR REPLACE FUNCTION update_user_reputation_stats()
RETURNS TRIGGER AS $$
DECLARE
  target_user_uuid UUID;
  avg_rating DECIMAL(3,2);
  total_ratings INTEGER;
  total_posts INTEGER;
  featured_posts INTEGER;
  new_level TEXT;
  points INTEGER;
BEGIN
  -- Get user ID from the post that was rated
  SELECT user_id INTO target_user_uuid 
  FROM community_posts 
  WHERE id = COALESCE(NEW.post_id, OLD.post_id);
  
  -- Calculate user's overall stats
  SELECT 
    COALESCE(AVG(cr.rating), 0)::DECIMAL(3,2),
    COUNT(cr.rating),
    COUNT(DISTINCT cp.id),
    COUNT(DISTINCT CASE WHEN cp.is_featured THEN cp.id END)
  INTO avg_rating, total_ratings, total_posts, featured_posts
  FROM community_posts cp
  LEFT JOIN community_ratings cr ON cp.id = cr.post_id
  WHERE cp.user_id = target_user_uuid;
  
  -- Calculate creator level based on stats
  CASE 
    WHEN avg_rating >= 4.5 AND total_posts >= 50 AND featured_posts >= 10 THEN new_level := 'master';
    WHEN avg_rating >= 4.0 AND total_posts >= 25 AND featured_posts >= 5 THEN new_level := 'expert';
    WHEN avg_rating >= 3.5 AND total_posts >= 10 AND featured_posts >= 2 THEN new_level := 'advanced';
    WHEN avg_rating >= 3.0 AND total_posts >= 5 THEN new_level := 'intermediate';
    ELSE new_level := 'beginner';
  END CASE;
  
  -- Calculate community points
  points := (avg_rating * 100)::INTEGER + (total_posts * 10) + (featured_posts * 50);
  
  -- Update or insert user reputation
  INSERT INTO user_reputation (
    user_id, overall_rating, total_ratings_received, 
    total_posts, featured_posts, creator_level, community_points
  ) VALUES (
    target_user_uuid, avg_rating, total_ratings,
    total_posts, featured_posts, new_level, points
  )
  ON CONFLICT (user_id) DO UPDATE SET
    overall_rating = EXCLUDED.overall_rating,
    total_ratings_received = EXCLUDED.total_ratings_received,
    total_posts = EXCLUDED.total_posts,
    featured_posts = EXCLUDED.featured_posts,
    creator_level = EXCLUDED.creator_level,
    community_points = EXCLUDED.community_points,
    updated_at = NOW();
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to award badges based on achievements
CREATE OR REPLACE FUNCTION check_and_award_badges()
RETURNS TRIGGER AS $$
DECLARE
  target_user_uuid UUID;
  user_stats RECORD;
BEGIN
  -- Get user ID
  target_user_uuid := NEW.user_id;
  
  -- Get current user stats
  SELECT 
    ur.overall_rating,
    ur.total_posts,
    ur.featured_posts,
    ur.community_points
  INTO user_stats
  FROM user_reputation ur
  WHERE ur.user_id = target_user_uuid;
  
  -- Award badges based on achievements
  
  -- First post badge
  IF user_stats.total_posts = 1 THEN
    INSERT INTO user_badges (user_id, badge_type, badge_name, badge_description)
    VALUES (target_user_uuid, 'first_post', 'First Creation', 'Published your first creation')
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- High rating badge
  IF user_stats.overall_rating >= 4.5 AND user_stats.total_posts >= 5 THEN
    INSERT INTO user_badges (user_id, badge_type, badge_name, badge_description)
    VALUES (target_user_uuid, 'high_rated', 'Quality Creator', 'Maintained 4.5+ star average with 5+ posts')
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Prolific creator badge
  IF user_stats.total_posts >= 25 THEN
    INSERT INTO user_badges (user_id, badge_type, badge_name, badge_description)
    VALUES (target_user_uuid, 'prolific_creator', 'Prolific Creator', 'Published 25+ creations')
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Featured creator badge
  IF user_stats.featured_posts >= 5 THEN
    INSERT INTO user_badges (user_id, badge_type, badge_name, badge_description)
    VALUES (target_user_uuid, 'featured_creator', 'Featured Creator', 'Had 5+ creations featured')
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Community favorite badge
  IF user_stats.community_points >= 1000 THEN
    INSERT INTO user_badges (user_id, badge_type, badge_name, badge_description)
    VALUES (target_user_uuid, 'community_favorite', 'Community Favorite', 'Earned 1000+ community points')
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate quality score for posts
CREATE OR REPLACE FUNCTION calculate_quality_score()
RETURNS TRIGGER AS $$
DECLARE
  score INTEGER := 0;
BEGIN
  -- Base score from rating (0-500 points)
  score := score + (NEW.rating_average * 100)::INTEGER;
  
  -- Bonus for number of ratings (engagement)
  score := score + LEAST(NEW.rating_count * 5, 100);
  
  -- Bonus for views
  score := score + LEAST(NEW.view_count, 200);
  
  -- Bonus for likes
  score := score + (NEW.like_count * 2);
  
  -- Bonus if featured
  IF NEW.is_featured THEN
    score := score + 200;
  END IF;
  
  NEW.quality_score := score;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic rating and reputation updates
CREATE TRIGGER update_post_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON community_ratings
  FOR EACH ROW EXECUTE FUNCTION update_post_rating_stats();

CREATE TRIGGER update_user_reputation_trigger
  AFTER INSERT OR UPDATE OR DELETE ON community_ratings
  FOR EACH ROW EXECUTE FUNCTION update_user_reputation_stats();

CREATE TRIGGER award_badges_trigger
  AFTER UPDATE ON user_reputation
  FOR EACH ROW EXECUTE FUNCTION check_and_award_badges();

CREATE TRIGGER calculate_quality_score_trigger
  BEFORE INSERT OR UPDATE ON community_posts
  FOR EACH ROW EXECUTE FUNCTION calculate_quality_score();
