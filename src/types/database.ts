// Basic user types
export interface User {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  subscription_tier: string;
}

// Project types
export type ProjectType = 'film' | 'cartoon' | 'faceless_youtube';
export type ProjectStatus = 'draft' | 'in_progress' | 'completed';

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string;
  cover_image_url?: string;
  project_type: ProjectType;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
  story_id?: string;
}

// Story types
export type StoryStatus = 
  'new' | 
  'chapterizing' | 
  'character_extraction' | 
  'scripting_scenes' | 
  'designing_shots' | 
  'generating_stills' | 
  'generating_video_prompts' | 
  'generating_video' | 
  'completed';

export interface Story {
  id: string;
  title: string;
  logline?: string;
  full_story_text: string;
  status: StoryStatus;
  created_at: string;
  updated_at: string;
  user_id: string;
  project_id?: string;
}

// Chapter types
export interface Chapter {
  id: string;
  story_id: string;
  chapter_number: number;
  chapter_title: string;
  original_story_text_portion: string;
  chapter_summary?: string;
  estimated_film_time?: number; // in seconds
  status: 'pending_scenes' | 'scripting_scenes' | 'completed';
  created_at: string;
  updated_at: string;
}

// Character types
export interface Character {
  id: string;
  story_id: string;
  character_name: string;
  role_in_story: string;
  context_backstory?: string;
  suggested_look_feel?: string;
  still_image_prompt?: string;
  generated_character_image_url?: string;
  status: 'identified' | 'awaiting_look_feel' | 'awaiting_image_prompt' | 'awaiting_image' | 'concept_ready';
  created_at: string;
  updated_at: string;
}

// Scene types
export interface Scene {
  id: string;
  chapter_id: string;
  scene_number: number;
  location?: string;
  time_of_day?: string;
  overall_mood_feel?: string;
  artistic_focus?: string;
  scene_description: string;
  status: 'pending_shots' | 'designing_shots' | 'completed';
  created_at: string;
  updated_at: string;
}

// Scene Character Junction
export interface SceneCharacter {
  id: string;
  scene_id: string;
  character_id: string;
}

// Shot types
export interface Shot {
  id: string;
  scene_id: string;
  shot_number_in_scene: number;
  shot_description: string;
  camera_shot_type?: string;
  camera_movement?: string;
  lens_choice_suggestion?: string;
  lighting_description?: string;
  color_palette_focus?: string;
  artistic_intent?: string;
  still_image_prompt?: string;
  generated_still_image_url?: string;
  video_shot_flow_description?: string;
  video_generation_prompt?: string;
  estimated_duration?: number; // in seconds
  generated_video_clip_url?: string;
  status: 'pending_still_prompt' | 'pending_still_image' | 'pending_video_flow' | 'pending_video_prompt' | 'pending_video_generation' | 'completed' | 'still_image_failed' | 'video_generation_failed';
  created_at: string;
  updated_at: string;
}

// Media Asset types
export type MediaType = 'image' | 'video' | 'audio';

export interface MediaAsset {
  id: string;
  user_id: string;
  project_id?: string;
  title: string;
  description?: string;
  media_type: MediaType;
  file_url: string;
  thumbnail_url?: string;
  duration?: number; // for video/audio in seconds
  width?: number; // for images/videos
  height?: number; // for images/videos
  file_size: number; // in bytes
  metadata?: Record<string, any>; // JSON for additional metadata
  created_at: string;
  updated_at: string;
}

// Timeline types
export interface Timeline {
  id: string;
  project_id: string;
  title: string;
  duration: number; // in seconds
  created_at: string;
  updated_at: string;
}

export interface Track {
  id: string;
  timeline_id: string;
  name: string;
  type: 'video' | 'audio' | 'text' | 'effects';
  position: number; // order in the timeline
  created_at: string;
  updated_at: string;
}

export interface Clip {
  id: string;
  track_id: string;
  media_asset_id?: string; // null for generated clips
  start_time: number; // in seconds, position in the timeline
  duration: number; // in seconds
  media_start_time: number; // in seconds, position in the original media
  properties: Record<string, any>; // JSON for clip-specific properties (effects, transitions, etc.)
  created_at: string;
  updated_at: string;
}

// AI Processing Job types
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type AgentType = 
  'story_deconstructor' | 
  'character_extractor' | 
  'scene_designer' | 
  'shot_architect' | 
  'image_prompt_engineer' | 
  'video_flow_designer';

export interface AIProcessingJob {
  id: string;
  user_id: string;
  project_id: string;
  agent_type: AgentType;
  input_data: Record<string, any>; // JSON
  output_data?: Record<string, any>; // JSON
  status: JobStatus;
  error_message?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}
