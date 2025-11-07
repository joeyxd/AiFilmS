import { supabase } from './client';
import { unifiedAIService } from '../unifiedAI';
import { imageStorageService } from './imageStorage';

export interface CreateStoryRequest {
  title: string;
  full_story_text: string;
  logline?: string;
  genre?: string;
  target_audience?: string;
  visual_style?: string; // Visual style ID for cover image generation
  selected_model?: string; // AI model to use for story processing
}

export interface Story {
  id: string;
  user_id: string;
  project_id?: string | null;
  title: string;
  logline?: string | null;
  full_story_text: string;
  genre?: string | null;
  target_audience?: string | null;
  estimated_duration?: number | null;
  status: string;
  cover_image_url?: string | null;
  cover_image_prompt?: string | null;
  ai_analysis_metadata?: any;
  created_at: string;
  updated_at: string;
  
  // Enhanced fields from essential migration
  story_metadata?: any;
  commercial_analysis?: any;
  characters_analysis?: any;
  narrative_architecture?: any;
  production_blueprint?: any;
  processing_phases?: any;
}

export interface Chapter {
  id: string;
  story_id: string;
  chapter_number: number;
  chapter_title: string;
  original_story_text_portion: string;
  chapter_summary: string;
  estimated_film_time: number;
  mood_tone: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Character {
  id: string;
  story_id: string;
  character_name: string;
  role_in_story: string;
  context_backstory: string;
  physical_description: string;
  personality_traits: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export const storiesService = {
  // Create a new story with AI processing
  async createStoryWithAI(storyData: CreateStoryRequest): Promise<{ 
    story: Story | null; 
    chapters: Chapter[] | null;
    characters: Character[] | null;
    coverImagePrompt?: string;
    coverImageUrl?: string;
    error: any 
  }> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { story: null, chapters: null, characters: null, error: new Error('User not authenticated') };
    }

    try {
      console.log('🎬 Creating story and starting AI analysis...');
      
      // Step 1: Create the story record
      const { data: story, error: storyError } = await supabase
        .from('stories')
        .insert({
          user_id: user.id,
          title: storyData.title,
          full_story_text: storyData.full_story_text,
          logline: storyData.logline,
          genre: storyData.genre,
          target_audience: storyData.target_audience,
          status: 'analyzing' as any // Mark as being processed
        })
        .select()
        .single();

      if (storyError || !story) {
        throw new Error(`Failed to create story: ${storyError?.message}`);
      }

      console.log('✅ Story created, starting AI processing...');

      // Step 2: Process with The Enhanced Scenarist Core v2.0 (includes cover image)
      console.log('🚀 Starting The Scenarist Core v2.0 complete processing...');
      const result = await unifiedAIService.processStoryComplete(
        storyData.full_story_text, 
        storyData.title,
        story.id, // Pass story ID for smart resume functionality
        { 
          modelId: storyData.selected_model || 'openai-gpt-4' 
        }
      );

      console.log('✅ Analysis and cover image generation complete!');
      console.log('📊 Analysis phases completed:', Object.keys(result.analysis).length);
      console.log('🎨 Cover image generated:', result.coverImage.imageUrl ? 'Yes' : 'No');

      console.log('💾 Storing cover image permanently...');
      
      // Step 2.5: Store image permanently in Supabase Storage
      const { storedUrl, error: storageError } = await imageStorageService.storeImageFromUrl(
        result.coverImage.imageUrl,
        story.id,
        storyData.title
      );

      if (storageError) {
        console.warn('⚠️ Image storage failed, using temporary URL:', storageError);
      }

      // Use permanent URL if available, fallback to temporary DALL-E URL
      const finalImageUrl = storedUrl || result.coverImage.imageUrl;

      console.log('🎯 The Scenarist Core analysis complete, saving enhanced data...');

      // Step 3: Save chapters with enhanced data
      const chaptersToInsert = result.analysis.chapters.map((chapter: any) => ({
        story_id: story.id,
        chapter_number: chapter.order,
        chapter_title: chapter.title,
        original_story_text_portion: chapter.original_text_portion,
        chapter_summary: chapter.summary,
        estimated_film_time: chapter.estimated_film_time_sec,
        mood_tone: chapter.cinematic_vitals.mood_tone,
        narrative_purpose: chapter.narrative_purpose,
        cinematic_vitals: chapter.cinematic_vitals,
        complexity: chapter.complexity,
        hooks_for_next_chapter: chapter.hooks_for_next_chapter,
        status: 'pending' as any
      }));

      const { data: chapters, error: chaptersError } = await supabase
        .from('chapters')
        .insert(chaptersToInsert)
        .select();

      if (chaptersError) {
        console.error('Error saving enhanced chapters:', chaptersError);
      }

      // Step 4: Save characters with deep psychology
      const charactersToInsert = result.analysis.characters.map((character: any) => ({
        story_id: story.id,
        character_name: character.name,
        role_in_story: character.role_in_story,
        context_backstory: character.narrative_vitals.goals + ' | ' + character.narrative_vitals.wound,
        physical_description: character.visual_dna.look_and_feel,
        personality_traits: character.psychology.motivations,
        narrative_vitals: character.narrative_vitals,
        psychology: character.psychology,
        arc: character.arc,
        emotional_trajectory: character.emotional_trajectory,
        performance_dna: character.performance_dna,
        visual_dna: character.visual_dna,
        status: 'identified' as any
      }));

      const { data: characters, error: charactersError } = await supabase
        .from('characters')
        .insert(charactersToInsert)
        .select();

      if (charactersError) {
        console.error('Error saving enhanced characters:', charactersError);
      }

      // Step 5: Update story with The Scenarist Core v2.0 metadata AND cover image
      const { error: updateError } = await supabase
        .from('stories')
        .update({
          status: 'chapterized' as any,
          story_metadata: result.analysis.story_metadata,
          commercial_analysis: result.analysis.commercial_analysis,
          production_plan: result.analysis.production_plan,
          agent_diagnostics: result.analysis.agent_diagnostics,
          cover_image_url: finalImageUrl, // Use permanent URL
          ai_analysis_metadata: {
            cover_image_prompt: result.analysis.cover_image_data.prompt,
            cover_image_enhanced_prompt: result.coverImage.prompt, // Save enhanced DALL-E prompt
            style_applied: result.analysis.cover_image_data.style_applied,
            selected_style: result.analysis.cover_image_data.selected_style,
            chapters_count: result.analysis.chapters.length,
            characters_count: result.analysis.characters.length,
            agent_version: 'S-1X',
            processed_at: new Date().toISOString(),
            // Add permanent storage info
            image_storage: {
              stored_permanently: !!storedUrl,
              storage_error: storageError?.message || null,
              temporary_url: result.coverImage.imageUrl,
              permanent_url: storedUrl || null
            }
          }
        })
        .eq('id', story.id);

      if (updateError) {
        console.error('Error updating story with Scenarist metadata:', updateError);
      }

      console.log('🎉 Complete! Story processed by The Scenarist Core v2.0 with permanent cover image!');

      return {
        story,
        chapters: chapters as any || [],
        characters: characters as any || [],
        coverImagePrompt: result.analysis.cover_image_data.prompt,
        coverImageUrl: finalImageUrl, // Return the permanent URL
        error: null
      };

    } catch (error) {
      console.error('Error in AI story processing:', error);
      
      // If story was created but AI processing failed, update status
      if (error instanceof Error && error.message.includes('Failed to create story')) {
        // Story creation failed, nothing to update
      } else {
        // AI processing failed, mark story as failed
        await supabase
          .from('stories')
          .update({ status: 'new' }) // Reset to allow retry
          .eq('user_id', user.id)
          .eq('title', storyData.title);
      }
      
      return { 
        story: null, 
        chapters: null, 
        characters: null, 
        error: error instanceof Error ? error : new Error('Unknown error occurred') 
      };
    }
  },

  // Get chapters for a story
  async getStoryChapters(storyId: string): Promise<{ data: Chapter[] | null; error: any }> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    const { data, error } = await supabase
      .from('chapters')
      .select('*')
      .eq('story_id', storyId)
      .order('chapter_number', { ascending: true });

    return { data: data as any, error };
  },

  // Get characters for a story
  async getStoryCharacters(storyId: string): Promise<{ data: Character[] | null; error: any }> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('story_id', storyId)
      .order('character_name', { ascending: true });

    return { data: data as any, error };
  },

  // Get all stories for the current user
  async getUserStories(): Promise<{ data: Story[] | null; error: any }> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  // Get a specific story by ID
  async getStoryById(storyId: string): Promise<{ data: Story | null; error: any }> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('id', storyId)
      .eq('user_id', user.id)
      .single();

    return { data, error };
  },

  // Update a story
  async updateStory(storyId: string, updates: Partial<CreateStoryRequest>): Promise<{ data: Story | null; error: any }> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    const { data, error } = await supabase
      .from('stories')
      .update(updates)
      .eq('id', storyId)
      .eq('user_id', user.id)
      .select()
      .single();

    return { data, error };
  },

  // Delete a story and all related data (current DB version)
  async deleteStoryComplete(storyId: string): Promise<{ 
    success: boolean; 
    deletedData: {
      story: boolean;
      chapters: number;
      characters: number;
      scenes: number;
      shots: number;
    };
    error: any 
  }> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { 
        success: false, 
        deletedData: { story: false, chapters: 0, characters: 0, scenes: 0, shots: 0 },
        error: new Error('User not authenticated') 
      };
    }

    try {
      console.log(`🗑️ Starting complete deletion of story ${storyId}...`);
      
      // First, get counts for reporting
      const { data: chapters } = await supabase
        .from('chapters')
        .select('id')
        .eq('story_id', storyId);
      
      const { data: characters } = await supabase
        .from('characters')
        .select('id')
        .eq('story_id', storyId);

      // Get scenes count (through chapters)
      const chapterIds = chapters?.map(c => c.id) || [];
      let scenes: any[] = [];
      let shots: any[] = [];
      
      if (chapterIds.length > 0) {
        const { data: scenesData } = await supabase
          .from('scenes')
          .select('id')
          .in('chapter_id', chapterIds);
        scenes = scenesData || [];

        // Get shots count (through scenes)
        const sceneIds = scenes.map(s => s.id);
        if (sceneIds.length > 0) {
          const { data: shotsData } = await supabase
            .from('shots')
            .select('id')
            .in('scene_id', sceneIds);
          shots = shotsData || [];
        }
      }

      console.log(`📊 Found: ${chapters?.length || 0} chapters, ${characters?.length || 0} characters, ${scenes.length} scenes, ${shots.length} shots`);

      // Delete in reverse dependency order
      
      // 1. Delete shots first (depend on scenes)
      if (scenes.length > 0) {
        const sceneIds = scenes.map(s => s.id);
        const { error: shotsError } = await supabase
          .from('shots')
          .delete()
          .in('scene_id', sceneIds);
        
        if (shotsError) {
          console.error('Error deleting shots:', shotsError);
        } else {
          console.log(`✅ Deleted ${shots.length} shots`);
        }
      }

      // 2. Delete scene_characters junction records
      if (scenes.length > 0) {
        const sceneIds = scenes.map(s => s.id);
        const { error: sceneCharsError } = await supabase
          .from('scene_characters')
          .delete()
          .in('scene_id', sceneIds);
        
        if (sceneCharsError) {
          console.error('Error deleting scene_characters:', sceneCharsError);
        }
      }

      // 3. Delete scenes (depend on chapters)
      if (chapterIds.length > 0) {
        const { error: scenesError } = await supabase
          .from('scenes')
          .delete()
          .in('chapter_id', chapterIds);
        
        if (scenesError) {
          console.error('Error deleting scenes:', scenesError);
        } else {
          console.log(`✅ Deleted ${scenes.length} scenes`);
        }
      }

      // 4. Delete characters
      const { error: charactersError } = await supabase
        .from('characters')
        .delete()
        .eq('story_id', storyId);
      
      if (charactersError) {
        console.error('Error deleting characters:', charactersError);
      } else {
        console.log(`✅ Deleted ${characters?.length || 0} characters`);
      }

      // 5. Delete chapters
      const { error: chaptersError } = await supabase
        .from('chapters')
        .delete()
        .eq('story_id', storyId);
      
      if (chaptersError) {
        console.error('Error deleting chapters:', chaptersError);
      } else {
        console.log(`✅ Deleted ${chapters?.length || 0} chapters`);
      }

      // 6. Finally, delete the story itself
      const { error: storyError } = await supabase
        .from('stories')
        .delete()
        .eq('id', storyId)
        .eq('user_id', user.id);

      if (storyError) {
        console.error('Error deleting story:', storyError);
        throw storyError;
      }

      console.log('🎉 Story and all related data deleted successfully!');

      return {
        success: true,
        deletedData: {
          story: true,
          chapters: chapters?.length || 0,
          characters: characters?.length || 0,
          scenes: scenes.length,
          shots: shots.length
        },
        error: null
      };

    } catch (error) {
      console.error('Error in complete story deletion:', error);
      return {
        success: false,
        deletedData: { story: false, chapters: 0, characters: 0, scenes: 0, shots: 0 },
        error: error instanceof Error ? error : new Error('Unknown error occurred')
      };
    }
  },
};
