# FilmStudio AI Platform - Supabase Database Schema

This file contains the SQL schema required to set up the database structure for the FilmStudio AI Platform in Supabase.

## Database Schema SQL

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  project_type TEXT NOT NULL CHECK (project_type IN ('film', 'cartoon', 'youtube')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'archived')),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create stories table
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  logline TEXT,
  full_story_text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'processed', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create chapters table
CREATE TABLE IF NOT EXISTS chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  chapter_number INTEGER NOT NULL,
  chapter_title TEXT NOT NULL,
  original_story_text_portion TEXT NOT NULL,
  chapter_summary_ai TEXT,
  estimated_film_time INTEGER,
  status TEXT NOT NULL DEFAULT 'pending_scenes' CHECK (status IN ('pending_scenes', 'scenes_generated', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(story_id, chapter_number)
);

-- Create characters table
CREATE TABLE IF NOT EXISTS characters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  character_name TEXT NOT NULL,
  role_in_story TEXT,
  backstory_ai TEXT,
  look_feel_ai TEXT,
  personality_ai TEXT,
  still_image_prompt TEXT,
  generated_character_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'identified' CHECK (status IN ('identified', 'developed', 'visualized')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(story_id, character_name)
);

-- Create scenes table
CREATE TABLE IF NOT EXISTS scenes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  scene_number TEXT NOT NULL,
  location_ai TEXT,
  time_of_day_ai TEXT,
  overall_mood_feel_ai TEXT,
  artistic_focus_ai TEXT,
  scene_description_ai TEXT,
  status TEXT NOT NULL DEFAULT 'pending_shots' CHECK (status IN ('pending_shots', 'shots_generated', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(chapter_id, scene_number)
);

-- Create scene_characters junction table
CREATE TABLE IF NOT EXISTS scene_characters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scene_id UUID NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(scene_id, character_id)
);

-- Create shots table
CREATE TABLE IF NOT EXISTS shots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scene_id UUID NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
  shot_number_in_scene INTEGER NOT NULL,
  shot_description_ai TEXT,
  camera_shot_type_ai TEXT,
  camera_movement_ai TEXT,
  lens_choice_suggestion_ai TEXT,
  lighting_description_ai TEXT,
  color_palette_focus_ai TEXT,
  artistic_intent_ai TEXT,
  still_image_prompt_technical_ai TEXT,
  generated_still_image_url TEXT,
  video_shot_flow_description_ai TEXT,
  video_generation_prompt_technical_ai TEXT,
  estimated_duration_ai INTEGER,
  generated_video_clip_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending_still_prompt' CHECK (
    status IN (
      'pending_still_prompt', 
      'still_prompt_ready', 
      'still_generated', 
      'pending_video_prompt',
      'video_prompt_ready', 
      'video_generated'
    )
  ),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(scene_id, shot_number_in_scene)
);

-- Create media_library table
CREATE TABLE IF NOT EXISTS media_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('video', 'image', 'audio', 'text')),
  url TEXT NOT NULL,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  metadata JSONB DEFAULT '{}',
  duration INTEGER, -- For video/audio in seconds
  width INTEGER, -- For images/video
  height INTEGER, -- For images/video
  fps FLOAT, -- For video
  tags TEXT[],
  is_public BOOLEAN NOT NULL DEFAULT false,
  is_generated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create timelines table
CREATE TABLE IF NOT EXISTS timelines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  duration INTEGER NOT NULL DEFAULT 0, -- in seconds
  data JSONB NOT NULL DEFAULT '{"tracks": []}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create export_configs table
CREATE TABLE IF NOT EXISTS export_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('youtube', 'tiktok', 'instagram', 'facebook', 'twitter', 'generic')),
  settings JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create exports table
CREATE TABLE IF NOT EXISTS exports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  timeline_id UUID NOT NULL REFERENCES timelines(id) ON DELETE CASCADE,
  export_config_id UUID REFERENCES export_configs(id) ON DELETE SET NULL,
  url TEXT,
  filename TEXT,
  format TEXT NOT NULL CHECK (format IN ('mp4', 'webm', 'gif', 'mov')),
  resolution TEXT NOT NULL,
  duration INTEGER, -- in seconds
  size_bytes BIGINT,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create ai_agents table to track API usage and processing history
CREATE TABLE IF NOT EXISTS ai_agent_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  agent_type TEXT NOT NULL,
  input JSONB NOT NULL,
  output JSONB,
  tokens_used INTEGER,
  error_message TEXT,
  processing_time_ms INTEGER,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  preferences JSONB DEFAULT '{}',
  api_keys JSONB DEFAULT '{}',
  credits INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Set up RLS policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE scene_characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE shots ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE timelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Projects RLS policies
CREATE POLICY "Users can view their own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- Stories RLS policies (via project relationship)
CREATE POLICY "Users can view stories of their own projects" ON stories
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = stories.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert stories to their own projects" ON stories
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = stories.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update stories of their own projects" ON stories
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = stories.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete stories of their own projects" ON stories
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = stories.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Media library RLS policies
CREATE POLICY "Users can view their own media" ON media_library
  FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert their own media" ON media_library
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own media" ON media_library
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own media" ON media_library
  FOR DELETE USING (auth.uid() = user_id);

-- User settings RLS policies
CREATE POLICY "Users can view their own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Create storage buckets
-- Note: This part would typically be done through the Supabase dashboard or CLI
-- as it involves storage configuration, but here's what it would look like:

/*
-- Create media storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', false);

-- Create generated images bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('generated_images', 'generated_images', false);

-- Create generated videos bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('generated_videos', 'generated_videos', false);

-- Create exports bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('exports', 'exports', false);

-- Set up storage policies for media bucket
CREATE POLICY "Users can view their own media files" ON storage.objects
  FOR SELECT USING (
    (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]) OR
    (bucket_id = 'media' AND EXISTS (
      SELECT 1 FROM media_library
      WHERE url LIKE '%' || name
      AND (user_id = auth.uid() OR is_public = true)
    ))
  );

CREATE POLICY "Users can upload to their own media folder" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'media' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own media files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'media' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own media files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'media' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
*/

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS projects_user_id_idx ON projects(user_id);
CREATE INDEX IF NOT EXISTS stories_project_id_idx ON stories(project_id);
CREATE INDEX IF NOT EXISTS chapters_story_id_idx ON chapters(story_id);
CREATE INDEX IF NOT EXISTS scenes_chapter_id_idx ON scenes(chapter_id);
CREATE INDEX IF NOT EXISTS shots_scene_id_idx ON shots(scene_id);
CREATE INDEX IF NOT EXISTS media_library_user_id_idx ON media_library(user_id);
CREATE INDEX IF NOT EXISTS media_library_project_id_idx ON media_library(project_id);
CREATE INDEX IF NOT EXISTS media_library_type_idx ON media_library(type);
CREATE INDEX IF NOT EXISTS timelines_project_id_idx ON timelines(project_id);
CREATE INDEX IF NOT EXISTS exports_project_id_idx ON exports(project_id);
CREATE INDEX IF NOT EXISTS exports_timeline_id_idx ON exports(timeline_id);

-- Create functions for automatic updated_at timestamps
CREATE OR REPLACE FUNCTION update_modified_column() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW; 
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_projects_modtime
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_stories_modtime
  BEFORE UPDATE ON stories
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_chapters_modtime
  BEFORE UPDATE ON chapters
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_characters_modtime
  BEFORE UPDATE ON characters
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_scenes_modtime
  BEFORE UPDATE ON scenes
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_shots_modtime
  BEFORE UPDATE ON shots
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_timelines_modtime
  BEFORE UPDATE ON timelines
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_export_configs_modtime
  BEFORE UPDATE ON export_configs
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_exports_modtime
  BEFORE UPDATE ON exports
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_ai_agent_runs_modtime
  BEFORE UPDATE ON ai_agent_runs
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_user_settings_modtime
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();
```

## Database Schema Diagram

```
projects
├── id (PK)
├── user_id (FK -> auth.users)
├── title
├── description
├── project_type
├── status
├── settings
├── created_at
└── updated_at

stories
├── id (PK)
├── project_id (FK -> projects)
├── title
├── logline
├── full_story_text
├── status
├── created_at
└── updated_at

chapters
├── id (PK)
├── story_id (FK -> stories)
├── chapter_number
├── chapter_title
├── original_story_text_portion
├── chapter_summary_ai
├── estimated_film_time
├── status
├── created_at
└── updated_at

characters
├── id (PK)
├── story_id (FK -> stories)
├── character_name
├── role_in_story
├── backstory_ai
├── look_feel_ai
├── personality_ai
├── still_image_prompt
├── generated_character_image_url
├── status
├── created_at
└── updated_at

scenes
├── id (PK)
├── chapter_id (FK -> chapters)
├── scene_number
├── location_ai
├── time_of_day_ai
├── overall_mood_feel_ai
├── artistic_focus_ai
├── scene_description_ai
├── status
├── created_at
└── updated_at

scene_characters (junction)
├── id (PK)
├── scene_id (FK -> scenes)
├── character_id (FK -> characters)
└── created_at

shots
├── id (PK)
├── scene_id (FK -> scenes)
├── shot_number_in_scene
├── shot_description_ai
├── camera_shot_type_ai
├── camera_movement_ai
├── lens_choice_suggestion_ai
├── lighting_description_ai
├── color_palette_focus_ai
├── artistic_intent_ai
├── still_image_prompt_technical_ai
├── generated_still_image_url
├── video_shot_flow_description_ai
├── video_generation_prompt_technical_ai
├── estimated_duration_ai
├── generated_video_clip_url
├── status
├── created_at
└── updated_at

media_library
├── id (PK)
├── user_id (FK -> auth.users)
├── project_id (FK -> projects)
├── type
├── url
├── filename
├── original_filename
├── mime_type
├── size_bytes
├── metadata
├── duration
├── width
├── height
├── fps
├── tags
├── is_public
├── is_generated
└── created_at

timelines
├── id (PK)
├── project_id (FK -> projects)
├── name
├── duration
├── data
├── created_at
└── updated_at

export_configs
├── id (PK)
├── project_id (FK -> projects)
├── platform
├── settings
├── created_at
└── updated_at

exports
├── id (PK)
├── project_id (FK -> projects)
├── timeline_id (FK -> timelines)
├── export_config_id (FK -> export_configs)
├── url
├── filename
├── format
├── resolution
├── duration
├── size_bytes
├── status
├── error_message
├── created_at
└── updated_at

ai_agent_runs
├── id (PK)
├── project_id (FK -> projects)
├── agent_type
├── input
├── output
├── tokens_used
├── error_message
├── processing_time_ms
├── status
├── created_at
└── updated_at

user_settings
├── user_id (PK, FK -> auth.users)
├── display_name
├── avatar_url
├── preferences
├── api_keys
├── credits
├── created_at
└── updated_at
```

## TypeScript Types for Database Schema

```typescript
// src/types/supabase.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          project_type: 'film' | 'cartoon' | 'youtube';
          status: 'draft' | 'in_progress' | 'completed' | 'archived';
          settings: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          project_type: 'film' | 'cartoon' | 'youtube';
          status?: 'draft' | 'in_progress' | 'completed' | 'archived';
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          project_type?: 'film' | 'cartoon' | 'youtube';
          status?: 'draft' | 'in_progress' | 'completed' | 'archived';
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      
      stories: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          logline: string | null;
          full_story_text: string;
          status: 'new' | 'processed' | 'completed';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          logline?: string | null;
          full_story_text: string;
          status?: 'new' | 'processed' | 'completed';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          title?: string;
          logline?: string | null;
          full_story_text?: string;
          status?: 'new' | 'processed' | 'completed';
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "stories_project_id_fkey";
            columns: ["project_id"];
            referencedRelation: "projects";
            referencedColumns: ["id"];
          }
        ];
      };
      
      chapters: {
        Row: {
          id: string;
          story_id: string;
          chapter_number: number;
          chapter_title: string;
          original_story_text_portion: string;
          chapter_summary_ai: string | null;
          estimated_film_time: number | null;
          status: 'pending_scenes' | 'scenes_generated' | 'completed';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          story_id: string;
          chapter_number: number;
          chapter_title: string;
          original_story_text_portion: string;
          chapter_summary_ai?: string | null;
          estimated_film_time?: number | null;
          status?: 'pending_scenes' | 'scenes_generated' | 'completed';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          story_id?: string;
          chapter_number?: number;
          chapter_title?: string;
          original_story_text_portion?: string;
          chapter_summary_ai?: string | null;
          estimated_film_time?: number | null;
          status?: 'pending_scenes' | 'scenes_generated' | 'completed';
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "chapters_story_id_fkey";
            columns: ["story_id"];
            referencedRelation: "stories";
            referencedColumns: ["id"];
          }
        ];
      };
      
      // Additional tables omitted for brevity, but would follow the same pattern
    };
    
    Views: {
      [_ in never]: never;
    };
    
    Functions: {
      [_ in never]: never;
    };
    
    Enums: {
      [_ in never]: never;
    };
    
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
```

This comprehensive database schema provides a solid foundation for the FilmStudio AI Platform. It includes all the necessary tables for managing projects, stories, chapters, scenes, shots, media, timelines, and exports. Row Level Security (RLS) policies are implemented to ensure that users can only access their own data, and indexes are created to optimize query performance.
