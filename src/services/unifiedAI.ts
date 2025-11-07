import { openRouterService, OPENROUTER_MODELS, OpenRouterMessage, OpenRouterModel } from './openrouter';

export interface AIProcessingOptions {
  modelId?: string;
  temperature?: number;
  maxTokens?: number;
}

class UnifiedAIService {
  /**
   * Process a story with the selected AI model
   */
  async processStoryComplete(
    storyText: string, 
    title: string, 
    storyId: string, 
    options: AIProcessingOptions = {}
  ) {
    const { modelId = 'openai-gpt-4' } = options;

    console.log(`🤖 Processing story with model: ${modelId}`);

    // Check if it's an OpenRouter model
    const openRouterModel = OPENROUTER_MODELS.find((m: OpenRouterModel) => m.id === modelId);
    
    if (openRouterModel && openRouterModel.type === 'text') {
      return this.processWithOpenRouter(storyText, title, storyId, modelId, options);
    } else {
      // Use a fallback processing for default models
      return this.processWithFallback(storyText, title, storyId);
    }
  }

  /**
   * Fallback processing for default models (placeholder for now)
   */
  private async processWithFallback(storyText: string, title: string, storyId: string) {
    console.log('📝 Using fallback story processing...');
    
    // This is a simplified fallback - in production you'd integrate with your existing OpenAI service
    return {
      analysis: {
        phase1_storyDNA: {
          genre: 'Drama',
          themes: ['Human relationships', 'Personal growth'],
          tone: 'Thoughtful',
          pacing: 'Measured',
          style: 'Contemporary narrative'
        },
        phase2_chapters: {
          structure: 'Three-act structure',
          chapters: [
            {
              number: 1,
              title: 'Beginning',
              summary: 'Story introduction',
              key_events: ['Opening scene']
            }
          ]
        },
        phase3_characters: {
          main_characters: [
            {
              name: 'Main Character',
              role: 'protagonist',
              description: 'Central figure of the story',
              traits: ['Determined', 'Complex']
            }
          ]
        }
      },
      coverImage: {
        prompt: `A cinematic poster for "${title}" - dramatic lighting, professional composition`,
        style: 'Cinematic poster style',
        elements: ['Dramatic lighting', 'Professional composition'],
        imageUrl: `https://via.placeholder.com/512x768/1a1a1a/ffffff?text=${encodeURIComponent(title)}`
      }
    };
  }

  /**
   * Process story using OpenRouter models
   */
  private async processWithOpenRouter(
    storyText: string, 
    title: string, 
    storyId: string,
    modelId: string,
    options: AIProcessingOptions = {}
  ) {
    try {
      console.log(`🔀 Using OpenRouter model: ${modelId}`);

      // Create a comprehensive prompt for story analysis
      const analysisPrompt = `You are The Scenarist Core v2.0, an advanced AI story analyzer. Analyze this story comprehensively and return a detailed JSON response.

STORY TITLE: "${title}"

STORY TEXT:
${storyText}

Please analyze and return a JSON object with the following structure:
{
  "analysis": {
    "phase1_storyDNA": {
      "genre": "primary genre",
      "themes": ["theme1", "theme2"],
      "tone": "story tone",
      "pacing": "pacing description",
      "style": "narrative style"
    },
    "phase2_chapters": {
      "structure": "story structure type",
      "chapters": [
        {
          "number": 1,
          "title": "Chapter Title",
          "summary": "Chapter summary",
          "key_events": ["event1", "event2"]
        }
      ]
    },
    "phase3_characters": {
      "main_characters": [
        {
          "name": "Character Name",
          "role": "protagonist/antagonist/supporting",
          "description": "Character description",
          "traits": ["trait1", "trait2"]
        }
      ]
    }
  },
  "coverImage": {
    "prompt": "Detailed visual description for cover image",
    "style": "art style description",
    "elements": ["visual element1", "visual element2"]
  }
}

Ensure your response is valid JSON only.`;

      const messages: OpenRouterMessage[] = [
        {
          role: 'system',
          content: 'You are a professional story analyzer. Always respond with valid JSON format.'
        },
        {
          role: 'user',
          content: analysisPrompt
        }
      ];

      const response = await openRouterService.generateText(
        modelId,
        messages,
        {
          maxTokens: options.maxTokens || 4000,
          temperature: options.temperature || 0.7
        }
      );

      // Parse the JSON response
      let analysisResult;
      try {
        analysisResult = JSON.parse(response);
      } catch (parseError) {
        console.warn('⚠️ Failed to parse JSON response, using fallback structure');
        analysisResult = {
          analysis: {
            phase1_storyDNA: {
              genre: 'Drama',
              themes: ['Human relationships', 'Personal growth'],
              tone: 'Thoughtful',
              pacing: 'Measured',
              style: 'Contemporary narrative'
            },
            phase2_chapters: {
              structure: 'Three-act structure',
              chapters: [
                {
                  number: 1,
                  title: 'Beginning',
                  summary: 'Story introduction',
                  key_events: ['Opening scene']
                }
              ]
            },
            phase3_characters: {
              main_characters: [
                {
                  name: 'Main Character',
                  role: 'protagonist',
                  description: 'Central figure of the story',
                  traits: ['Determined', 'Complex']
                }
              ]
            }
          },
          coverImage: {
            prompt: `A cinematic poster for "${title}" - dramatic lighting, professional composition`,
            style: 'Cinematic poster style',
            elements: ['Dramatic lighting', 'Professional composition']
          }
        };
      }

      // For cover image, we still need to use a proper image generation service
      // For now, create a placeholder URL
      const coverImageUrl = `https://via.placeholder.com/512x768/1a1a1a/ffffff?text=${encodeURIComponent(title)}`;

      return {
        ...analysisResult,
        coverImage: {
          ...analysisResult.coverImage,
          imageUrl: coverImageUrl
        }
      };

    } catch (error) {
      console.error('❌ OpenRouter processing failed:', error);
      
      // Fallback to simple processing if OpenRouter fails
      console.log('🔄 Falling back to simple processing...');
      return this.processWithFallback(storyText, title, storyId);
    }
  }

  /**
   * Generate text for individual workflow steps
   */
  async processWorkflowStep(
    stepName: string,
    prompt: string,
    context: string,
    modelId: string = 'openai-gpt-4',
    options: AIProcessingOptions = {}
  ): Promise<string> {
    console.log(`🔧 Processing workflow step: ${stepName} with model: ${modelId}`);

    const openRouterModel = OPENROUTER_MODELS.find((m: OpenRouterModel) => m.id === modelId);
    
    if (openRouterModel && openRouterModel.type === 'text') {
      const messages: OpenRouterMessage[] = [
        {
          role: 'system',
          content: prompt
        },
        {
          role: 'user',
          content: context
        }
      ];

      return openRouterService.generateText(
        modelId,
        messages,
        {
          maxTokens: options.maxTokens || 2000,
          temperature: options.temperature || 0.7
        }
      );
    } else {
      // For OpenAI models, we would use the existing service
      // This is a placeholder - you'd need to implement OpenAI individual step processing
      throw new Error('OpenAI individual step processing not implemented yet');
    }
  }

  /**
   * Generate image with selected model
   */
  async generateImage(
    prompt: string,
    modelId: string = 'google/gemini-2.5-flash-image-preview'
  ): Promise<string> {
    console.log(`🎨 Generating image with model: ${modelId}`);

    const openRouterModel = OPENROUTER_MODELS.find((m: OpenRouterModel) => m.id === modelId);
    
    if (openRouterModel && openRouterModel.type === 'image') {
      return openRouterService.generateImage(prompt, { model: modelId });
    } else {
      // Fallback for non-OpenRouter models
      throw new Error('Image generation model not supported');
    }
  }

  /**
   * Get available models for a specific type
   */
  getAvailableModels(type: 'text' | 'image' = 'text') {
    const defaultModels = [
      {
        id: 'openai-gpt-4',
        name: 'OpenAI GPT-4 (Default)',
        type: type as 'text' | 'image',
        description: 'Default OpenAI model - high quality, reliable'
      }
    ];

    return [...defaultModels, ...OPENROUTER_MODELS.filter((m: OpenRouterModel) => m.type === type)];
  }
}

export const unifiedAIService = new UnifiedAIService();
export default unifiedAIService;
