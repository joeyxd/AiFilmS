import { supabase } from './client';

export interface StoredImage {
  id: string;
  story_id: string;
  file_path: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  original_dalle_url: string;
  created_at: string;
}

export const imageStorageService = {
  /**
   * Downloads DALL-E image and stores it permanently in Supabase Storage
   * DALL-E URLs expire after a few hours, so we need to store them permanently
   */
  async storeImageFromUrl(
    imageUrl: string, 
    storyId: string, 
    storyTitle: string
  ): Promise<{ 
    storedUrl: string | null; 
    filePath: string | null;
    error: any 
  }> {
    try {
      console.log('📥 Downloading DALL-E image for permanent storage...');

      // 1. Download the image from DALL-E URL
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      const imageBlob = await response.blob();
      const fileSize = imageBlob.size;
      
      // 2. Generate unique filename
      const timestamp = Date.now();
      const sanitizedTitle = storyTitle.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
      const fileName = `${sanitizedTitle}-${timestamp}.png`;
      const filePath = `story-covers/${storyId}/${fileName}`;

      console.log(`💾 Uploading to Supabase Storage: ${filePath}`);

      // 3. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('story-assets')
        .upload(filePath, imageBlob, {
          contentType: 'image/png',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // 4. Get public URL
      const { data: urlData } = supabase.storage
        .from('story-assets')
        .getPublicUrl(filePath);

      if (!urlData.publicUrl) {
        throw new Error('Failed to get public URL');
      }

      // 5. Store metadata in database
      const { error: dbError } = await supabase
        .from('story_images')
        .insert({
          story_id: storyId,
          file_path: filePath,
          image_url: urlData.publicUrl,
          file_size: fileSize,
          mime_type: 'image/png',
          original_dalle_url: imageUrl,
          image_type: 'cover'
        });

      if (dbError) {
        console.error('Database storage failed:', dbError);
        // Don't throw - the file is still uploaded successfully
      }

      console.log('✅ Image stored permanently:', urlData.publicUrl);

      return {
        storedUrl: urlData.publicUrl,
        filePath: filePath,
        error: null
      };

    } catch (error) {
      console.error('❌ Image storage failed:', error);
      return {
        storedUrl: null,
        filePath: null,
        error: error instanceof Error ? error : new Error('Unknown storage error')
      };
    }
  },

  /**
   * Get stored image for a story
   */
  async getStoredImage(storyId: string): Promise<{
    image: StoredImage | null;
    error: any;
  }> {
    try {
      const { data, error } = await supabase
        .from('story_images')
        .select('*')
        .eq('story_id', storyId)
        .eq('image_type', 'cover')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      return {
        image: data as StoredImage | null,
        error
      };

    } catch (error) {
      return {
        image: null,
        error: error instanceof Error ? error : new Error('Unknown error')
      };
    }
  },

  /**
   * Clean up old DALL-E URLs and invalid images
   */
  async cleanupExpiredImages(): Promise<void> {
    try {
      // Get images older than 24 hours with DALL-E URLs
      const { data: expiredImages } = await supabase
        .from('story_images')
        .select('*')
        .not('original_dalle_url', 'is', null)
        .lt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (!expiredImages || expiredImages.length === 0) return;

      console.log(`🧹 Cleaning up ${expiredImages.length} expired image references...`);

      // Update records to remove expired DALL-E URLs
      for (const image of expiredImages) {
        await supabase
          .from('story_images')
          .update({ original_dalle_url: null })
          .eq('id', image.id);
      }

    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  }
};

/**
 * Story to Showcase Slide Mapper
 * Converts database story records to SlideData format for the portfolio showcase
 */
export const storyShowcaseMapper = {
  /**
   * Convert story data to SlideData format for the draggable showcase
   */
  mapStoryToSlide(story: any): any {
    // Extract data from the complex story structure
    const storyMetadata = story.story_metadata || {};
    const commercialAnalysis = story.commercial_analysis || {};
    const aiMetadata = story.ai_analysis_metadata || {};

    return {
      id: story.id,
      image: story.cover_image_url || '/img/default-story-cover.jpg', // Fallback image
      title: story.title || 'Untitled Story',
      project: commercialAnalysis.logline || 'No logline available',
      category: storyMetadata.genres?.[0]?.label || story.genre || 'Story',
      
      // Enhanced fields for story showcase
      storyId: story.id,
      logline: commercialAnalysis.logline,
      genre: storyMetadata.genres?.[0]?.label || story.genre,
      chaptersCount: aiMetadata.chapters_count || 0,
      charactersCount: aiMetadata.characters_count || 0,
      marketabilityScore: commercialAnalysis.marketability_score || 0,
      status: story.status,
      createdAt: story.created_at,
      visualStyle: aiMetadata.selected_style || 'Unknown'
    };
  },

  /**
   * Get stories formatted for showcase
   */
  async getStoriesForShowcase(): Promise<{
    slides: any[];
    error: any;
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { slides: [], error: new Error('User not authenticated') };
      }

      const { data: stories, error } = await supabase
        .from('stories')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed') // Only completed stories
        .order('created_at', { ascending: false });

      if (error) {
        return { slides: [], error };
      }

      const slides = (stories || []).map(story => this.mapStoryToSlide(story));

      return { slides, error: null };

    } catch (error) {
      return {
        slides: [],
        error: error instanceof Error ? error : new Error('Unknown error')
      };
    }
  }
};
