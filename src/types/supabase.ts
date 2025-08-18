// Generated with Supabase CLI and modified for our needs
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      ai_processing_jobs: {
        Row: {
          agent_type: Database["public"]["Enums"]["agent_type"]
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          input_data: Json
          output_data: Json | null
          project_id: string
          started_at: string | null
          status: Database["public"]["Enums"]["job_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_type: Database["public"]["Enums"]["agent_type"]
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          input_data: Json
          output_data?: Json | null
          project_id: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_type?: Database["public"]["Enums"]["agent_type"]
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          input_data?: Json
          output_data?: Json | null
          project_id?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_processing_jobs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_processing_jobs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      chapters: {
        Row: {
          chapter_number: number
          chapter_summary: string | null
          chapter_title: string
          created_at: string
          estimated_film_time: number | null
          id: string
          original_story_text_portion: string
          status: Database["public"]["Enums"]["chapter_status"]
          story_id: string
          updated_at: string
        }
        Insert: {
          chapter_number: number
          chapter_summary?: string | null
          chapter_title: string
          created_at?: string
          estimated_film_time?: number | null
          id?: string
          original_story_text_portion: string
          status?: Database["public"]["Enums"]["chapter_status"]
          story_id: string
          updated_at?: string
        }
        Update: {
          chapter_number?: number
          chapter_summary?: string | null
          chapter_title?: string
          created_at?: string
          estimated_film_time?: number | null
          id?: string
          original_story_text_portion?: string
          status?: Database["public"]["Enums"]["chapter_status"]
          story_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapters_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          }
        ]
      }
      characters: {
        Row: {
          character_name: string
          context_backstory: string | null
          created_at: string
          generated_character_image_url: string | null
          id: string
          role_in_story: string
          status: Database["public"]["Enums"]["character_status"]
          still_image_prompt: string | null
          story_id: string
          suggested_look_feel: string | null
          updated_at: string
        }
        Insert: {
          character_name: string
          context_backstory?: string | null
          created_at?: string
          generated_character_image_url?: string | null
          id?: string
          role_in_story: string
          status?: Database["public"]["Enums"]["character_status"]
          still_image_prompt?: string | null
          story_id: string
          suggested_look_feel?: string | null
          updated_at?: string
        }
        Update: {
          character_name?: string
          context_backstory?: string | null
          created_at?: string
          generated_character_image_url?: string | null
          id?: string
          role_in_story?: string
          status?: Database["public"]["Enums"]["character_status"]
          still_image_prompt?: string | null
          story_id?: string
          suggested_look_feel?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "characters_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          }
        ]
      }
      clips: {
        Row: {
          created_at: string
          duration: number
          id: string
          media_asset_id: string | null
          media_start_time: number
          properties: Json
          start_time: number
          track_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration: number
          id?: string
          media_asset_id?: string | null
          media_start_time: number
          properties?: Json
          start_time: number
          track_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration?: number
          id?: string
          media_asset_id?: string | null
          media_start_time?: number
          properties?: Json
          start_time?: number
          track_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clips_media_asset_id_fkey"
            columns: ["media_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clips_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          }
        ]
      }
      media_assets: {
        Row: {
          created_at: string
          description: string | null
          duration: number | null
          file_size: number
          file_url: string
          height: number | null
          id: string
          media_type: Database["public"]["Enums"]["media_type"]
          metadata: Json | null
          project_id: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          user_id: string
          width: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration?: number | null
          file_size: number
          file_url: string
          height?: number | null
          id?: string
          media_type: Database["public"]["Enums"]["media_type"]
          metadata?: Json | null
          project_id?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          user_id: string
          width?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          duration?: number | null
          file_size?: number
          file_url?: string
          height?: number | null
          id?: string
          media_type?: Database["public"]["Enums"]["media_type"]
          metadata?: Json | null
          project_id?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_assets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_assets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          id: string
          subscription_tier: string
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          id: string
          subscription_tier?: string
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          id?: string
          subscription_tier?: string
          updated_at?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      projects: {
        Row: {
          cover_image_url: string | null
          created_at: string
          description: string
          id: string
          project_type: Database["public"]["Enums"]["project_type"]
          status: Database["public"]["Enums"]["project_status"]
          story_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          description: string
          id?: string
          project_type: Database["public"]["Enums"]["project_type"]
          status?: Database["public"]["Enums"]["project_status"]
          story_id?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          description?: string
          id?: string
          project_type?: Database["public"]["Enums"]["project_type"]
          status?: Database["public"]["Enums"]["project_status"]
          story_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      scene_characters: {
        Row: {
          character_id: string
          id: string
          scene_id: string
        }
        Insert: {
          character_id: string
          id?: string
          scene_id: string
        }
        Update: {
          character_id?: string
          id?: string
          scene_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scene_characters_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scene_characters_scene_id_fkey"
            columns: ["scene_id"]
            isOneToOne: false
            referencedRelation: "scenes"
            referencedColumns: ["id"]
          }
        ]
      }
      scenes: {
        Row: {
          artistic_focus: string | null
          chapter_id: string
          created_at: string
          id: string
          location: string | null
          overall_mood_feel: string | null
          scene_description: string
          scene_number: number
          status: Database["public"]["Enums"]["scene_status"]
          time_of_day: string | null
          updated_at: string
        }
        Insert: {
          artistic_focus?: string | null
          chapter_id: string
          created_at?: string
          id?: string
          location?: string | null
          overall_mood_feel?: string | null
          scene_description: string
          scene_number: number
          status?: Database["public"]["Enums"]["scene_status"]
          time_of_day?: string | null
          updated_at?: string
        }
        Update: {
          artistic_focus?: string | null
          chapter_id?: string
          created_at?: string
          id?: string
          location?: string | null
          overall_mood_feel?: string | null
          scene_description?: string
          scene_number?: number
          status?: Database["public"]["Enums"]["scene_status"]
          time_of_day?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scenes_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          }
        ]
      }
      shots: {
        Row: {
          artistic_intent: string | null
          camera_movement: string | null
          camera_shot_type: string | null
          color_palette_focus: string | null
          created_at: string
          estimated_duration: number | null
          generated_still_image_url: string | null
          generated_video_clip_url: string | null
          id: string
          lens_choice_suggestion: string | null
          lighting_description: string | null
          scene_id: string
          shot_description: string
          shot_number_in_scene: number
          status: Database["public"]["Enums"]["shot_status"]
          still_image_prompt: string | null
          updated_at: string
          video_generation_prompt: string | null
          video_shot_flow_description: string | null
        }
        Insert: {
          artistic_intent?: string | null
          camera_movement?: string | null
          camera_shot_type?: string | null
          color_palette_focus?: string | null
          created_at?: string
          estimated_duration?: number | null
          generated_still_image_url?: string | null
          generated_video_clip_url?: string | null
          id?: string
          lens_choice_suggestion?: string | null
          lighting_description?: string | null
          scene_id: string
          shot_description: string
          shot_number_in_scene: number
          status?: Database["public"]["Enums"]["shot_status"]
          still_image_prompt?: string | null
          updated_at?: string
          video_generation_prompt?: string | null
          video_shot_flow_description?: string | null
        }
        Update: {
          artistic_intent?: string | null
          camera_movement?: string | null
          camera_shot_type?: string | null
          color_palette_focus?: string | null
          created_at?: string
          estimated_duration?: number | null
          generated_still_image_url?: string | null
          generated_video_clip_url?: string | null
          id?: string
          lens_choice_suggestion?: string | null
          lighting_description?: string | null
          scene_id?: string
          shot_description?: string
          shot_number_in_scene?: number
          status?: Database["public"]["Enums"]["shot_status"]
          still_image_prompt?: string | null
          updated_at?: string
          video_generation_prompt?: string | null
          video_shot_flow_description?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shots_scene_id_fkey"
            columns: ["scene_id"]
            isOneToOne: false
            referencedRelation: "scenes"
            referencedColumns: ["id"]
          }
        ]
      }
      stories: {
        Row: {
          created_at: string
          full_story_text: string
          id: string
          logline: string | null
          project_id: string | null
          status: Database["public"]["Enums"]["story_status"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_story_text: string
          id?: string
          logline?: string | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["story_status"]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_story_text?: string
          id?: string
          logline?: string | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["story_status"]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      timelines: {
        Row: {
          created_at: string
          duration: number
          id: string
          project_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration: number
          id?: string
          project_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration?: number
          id?: string
          project_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "timelines_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
      }
      tracks: {
        Row: {
          created_at: string
          id: string
          name: string
          position: number
          timeline_id: string
          type: Database["public"]["Enums"]["track_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          position: number
          timeline_id: string
          type: Database["public"]["Enums"]["track_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          position?: number
          timeline_id?: string
          type?: Database["public"]["Enums"]["track_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracks_timeline_id_fkey"
            columns: ["timeline_id"]
            isOneToOne: false
            referencedRelation: "timelines"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_service_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      agent_type: "story_deconstructor" | "character_extractor" | "scene_designer" | "shot_architect" | "image_prompt_engineer" | "video_flow_designer"
      chapter_status: "pending_scenes" | "scripting_scenes" | "completed"
      character_status: "identified" | "awaiting_look_feel" | "awaiting_image_prompt" | "awaiting_image" | "concept_ready"
      job_status: "pending" | "processing" | "completed" | "failed"
      media_type: "image" | "video" | "audio"
      project_status: "draft" | "in_progress" | "completed"
      project_type: "film" | "cartoon" | "faceless_youtube"
      scene_status: "pending_shots" | "designing_shots" | "completed"
      shot_status: "pending_still_prompt" | "pending_still_image" | "pending_video_flow" | "pending_video_prompt" | "pending_video_generation" | "completed" | "still_image_failed" | "video_generation_failed"
      story_status: "new" | "chapterizing" | "character_extraction" | "scripting_scenes" | "designing_shots" | "generating_stills" | "generating_video_prompts" | "generating_video" | "completed"
      track_type: "video" | "audio" | "text" | "effects"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
