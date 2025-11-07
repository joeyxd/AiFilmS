import { storiesService } from '../services/supabase/stories';

export interface PortfolioStoryData {
  id: string;
  image: string;
  title: string;
  project: string;
  category: string;
  // Enhanced story fields
  storyId: string;
  logline?: string;
  genre?: string;
  chaptersCount: number;
  charactersCount: number;
  marketabilityScore?: number;
  status: string;
  createdAt: string;
  visualStyle?: string;
  estimatedDuration?: number;
}

export const portfolioDataService = {
  // Convert story data to portfolio format
  async getPortfolioStories(): Promise<PortfolioStoryData[]> {
    try {
      const { data: stories, error } = await storiesService.getUserStories();
      
      if (error) {
        console.error('Error loading stories for portfolio:', error);
        return [];
      }

      if (!stories || stories.length === 0) {
        console.log('📋 No user stories found');
        return [];
      }

      console.log(`📚 Found ${stories.length} user stories for portfolio`);

      // Convert stories to portfolio format
      const portfolioStories: PortfolioStoryData[] = await Promise.all(
        stories.map(async (story) => {
          console.log(`🔄 Processing story: "${story.title}" (${story.status})`);
          
          // Extract metadata from AI analysis (with better fallbacks)
          const metadata = story.ai_analysis_metadata || {};
          let chaptersCount = metadata.chapters_count || 0;
          let charactersCount = metadata.characters_count || 0;
          
          // Try to get actual counts from database (if schema allows)
          try {
            // Get chapters count safely
            const chaptersResult = await storiesService.getStoryChapters(story.id);
            if (chaptersResult.data) {
              chaptersCount = chaptersResult.data.length;
            }
          } catch (err) {
            console.log(`   ⚠️ Could not get chapters count for ${story.title}`);
          }
          
          try {
            // Get characters count safely  
            const charactersResult = await storiesService.getStoryCharacters(story.id);
            if (charactersResult.data) {
              charactersCount = charactersResult.data.length;
            }
          } catch (err) {
            console.log(`   ⚠️ Could not get characters count for ${story.title}`);
          }
          
          const visualStyle = metadata.style_applied || metadata.selected_style || 'AI Generated';
          
          // Determine category based on genre or default
          let category = 'Films';
          if (story.genre) {
            const genre = story.genre.toLowerCase();
            if (genre.includes('short') || genre.includes('comedy')) {
              category = 'Shorts';
            } else if (genre.includes('youtube') || genre.includes('social')) {
              category = 'youtube';
            } else if (genre.includes('documentary')) {
              category = 'Films';
            }
          }

          // Generate project name based on user or default
          const project = `${story.genre || 'Drama'} Production`;

          // Use cover image or placeholder with better fallback
          const image = story.cover_image_url || '/img/default-story.jpg';

          // Calculate estimated duration in minutes
          const estimatedDuration = story.estimated_duration || 90;

          const portfolioEntry = {
            id: `story-${story.id}`,
            image,
            title: story.title,
            project,
            category,
            storyId: story.id,
            logline: story.logline || `A ${story.genre || 'drama'} story`,
            genre: story.genre || undefined,
            chaptersCount,
            charactersCount,
            marketabilityScore: this.calculateMarketabilityScore(story),
            status: story.status,
            createdAt: story.created_at,
            visualStyle,
            estimatedDuration
          };
          
          console.log(`   ✅ Created portfolio entry: ${portfolioEntry.title} (${portfolioEntry.status})`);
          return portfolioEntry;
        })
      );

      console.log(`📊 Successfully converted ${portfolioStories.length} stories for portfolio showcase`);
      return portfolioStories;

    } catch (error) {
      console.error('Error in getPortfolioStories:', error);
      return [];
    }
  },

  // Calculate a marketability score based on story data
  calculateMarketabilityScore(story: any): number {
    let score = 50; // Base score

    // Story completeness
    if (story.status === 'completed') score += 30;
    else if (story.status === 'chapterized') score += 20;
    else if (story.status === 'analyzing') score += 10;

    // Has AI analysis
    if (story.ai_analysis_metadata) score += 15;

    // Has cover image
    if (story.cover_image_url) score += 10;

    // Has logline (important for marketing)
    if (story.logline) score += 10;

    // Genre popularity boost
    if (story.genre) {
      const genre = story.genre.toLowerCase();
      if (genre.includes('action') || genre.includes('thriller')) score += 15;
      else if (genre.includes('comedy') || genre.includes('drama')) score += 10;
      else if (genre.includes('horror') || genre.includes('sci-fi')) score += 12;
    }

    // Story length (optimal range)
    const metadata = story.ai_analysis_metadata || {};
    const chaptersCount = metadata.chapters_count || 0;
    if (chaptersCount >= 5 && chaptersCount <= 12) score += 10;
    else if (chaptersCount >= 3 && chaptersCount <= 15) score += 5;

    // Recent creation boost
    const daysOld = Math.floor((Date.now() - new Date(story.created_at).getTime()) / (1000 * 60 * 60 * 24));
    if (daysOld <= 7) score += 5;
    else if (daysOld <= 30) score += 3;

    return Math.min(100, Math.max(0, score));
  },

  // Get portfolio data with category filtering
  async getFilteredPortfolioStories(category?: string): Promise<PortfolioStoryData[]> {
    const allStories = await this.getPortfolioStories();
    
    if (!category || category === 'All') {
      return allStories;
    }

    return allStories.filter(story => story.category === category);
  },

  // Get default demo data if no real stories exist
  getDemoPortfolioData(): PortfolioStoryData[] {
    return [
      {
        id: 'demo-1',
        image: '/img/Leonardo_Phoenix_10_Panoramic_shot_of_the_ancient_lost_city_Th_0.jpg',
        title: 'The Lost City',
        project: 'Adventure Epic',
        category: 'Films',
        storyId: 'demo-1',
        logline: 'An archaeologist discovers an ancient civilization hidden beneath the ocean.',
        genre: 'Adventure',
        chaptersCount: 8,
        charactersCount: 5,
        marketabilityScore: 85,
        status: 'completed',
        createdAt: new Date().toISOString(),
        visualStyle: 'Cinematic Realism',
        estimatedDuration: 120
      },
      {
        id: 'demo-2',
        image: '/img/Lucid_Origin_Surreal_lunar_colony_situated_under_a_vibrant_glo_0.jpg',
        title: 'Lunar Colony',
        project: 'Sci-Fi Drama',
        category: 'Films',
        storyId: 'demo-2',
        logline: 'The first human colony on the moon faces an unprecedented crisis.',
        genre: 'Science Fiction',
        chaptersCount: 6,
        charactersCount: 7,
        marketabilityScore: 78,
        status: 'chapterized',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        visualStyle: 'Futuristic Aesthetic',
        estimatedDuration: 95
      },
      {
        id: 'demo-3',
        image: '/img/Leonardo_Anime_XL_A_highly_detailed_digital_painting_of_a_coas_0 (1).jpg',
        title: 'Coastal Dreams',
        project: 'Anime Short',
        category: 'Shorts',
        storyId: 'demo-3',
        logline: 'A young artist finds inspiration in the changing tides of a mystical coastline.',
        genre: 'Drama',
        chaptersCount: 3,
        charactersCount: 3,
        marketabilityScore: 72,
        status: 'analyzing',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        visualStyle: 'Anime Style',
        estimatedDuration: 25
      }
    ];
  },

  // Get stories for showcase - ONLY real data, no fake demos
  async getShowcaseStories(): Promise<PortfolioStoryData[]> {
    const realStories = await this.getPortfolioStories();
    
    if (realStories.length === 0) {
      console.log('📋 No user stories found');
      return [];
    }

    return realStories;
  },

  // Delete a story (with confirmation)
  async deleteStory(storyId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`🗑️ Deleting story: ${storyId}`);
      
      // Use the stories service to delete (complete deletion with all related data)
      const result = await storiesService.deleteStoryComplete(storyId);
      
      if (result.error) {
        console.error('Error deleting story:', result.error);
        return { success: false, error: result.error.message };
      }
      
      console.log(`✅ Story ${storyId} deleted successfully:`, result.deletedData);
      return { success: true };
    } catch (error) {
      console.error('Error in deleteStory:', error);
      return { success: false, error: (error as Error).message };
    }
  }
};
