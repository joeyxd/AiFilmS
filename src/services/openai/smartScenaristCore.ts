// The Scenarist Core v2.0 - Smart Learning System
// This enhances story analysis by learning from previous successes

import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

// Initialize services
const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export class SmartScenaristCore {
  
  // 1. REASONING MEMORY SYSTEM
  async saveReasoningContext(storyId: string, phase: string, reasoningItems: any[], qualityScore: number) {
    try {
      // Save high-quality reasoning patterns for future use
      if (qualityScore >= 8) {
        await supabase
          .from('reasoning_memory')
          .insert({
            story_id: storyId,
            phase: phase,
            reasoning_context: reasoningItems,
            quality_score: qualityScore,
            created_at: new Date().toISOString(),
            usage_count: 0
          });
        
        console.log(`🧠 Saved high-quality reasoning pattern (score: ${qualityScore})`);
      }
    } catch (error) {
      console.error('Error saving reasoning context:', error);
    }
  }

  // 2. RETRIEVE SIMILAR REASONING PATTERNS
  async getRelevantReasoningContext(_storyGenres: string[], _storyThemes: string[]): Promise<any[]> {
    try {
      // Find reasoning patterns from similar stories
      const { data: patterns } = await supabase
        .from('reasoning_memory')
        .select('reasoning_context, quality_score, usage_count, id')
        .gte('quality_score', 8)
        .order('quality_score', { ascending: false })
        .limit(3);

      if (patterns && patterns.length > 0) {
        console.log(`🎯 Found ${patterns.length} high-quality reasoning patterns to enhance analysis`);
        
        // Increment usage count
        patterns.forEach(async (pattern) => {
          if (pattern.id && pattern.usage_count !== undefined) {
            await supabase
              .from('reasoning_memory')
              .update({ usage_count: pattern.usage_count + 1 })
              .eq('id', pattern.id);
          }
        });

        return patterns.map(p => p.reasoning_context).flat();
      }
      
      return [];
    } catch (error) {
      console.error('Error retrieving reasoning context:', error);
      return [];
    }
  }

  // 3. VECTOR-BASED CREATIVE ENHANCEMENT
  async getCreativeInspirations(storyText: string, genres: string[]): Promise<string[]> {
    try {
      // Create embedding for the current story
      const embedding = await openai.embeddings.create({
        model: "text-embedding-3-large",
        input: storyText.substring(0, 8000) // Limit for embedding
      });

      // Store embedding and find similar creative patterns
      const storyEmbedding = embedding.data[0].embedding;
      
      // Save current story embedding
      await supabase
        .from('story_embeddings')
        .insert({
          story_text_preview: storyText.substring(0, 500),
          embedding: storyEmbedding,
          genres: genres,
          created_at: new Date().toISOString()
        });

      // TODO: Implement vector similarity search for creative patterns
      // This would require pgvector extension in Supabase
      
      console.log('📊 Story embedding created for future similarity matching');
      return []; // Placeholder for now
      
    } catch (error) {
      console.error('Error creating embeddings:', error);
      return [];
    }
  }

  // 4. ENHANCED ANALYSIS WITH LEARNING
  async enhancedStoryAnalysis(storyText: string, storyTitle: string): Promise<any> {
    try {
      console.log('🚀 Starting Enhanced Scenarist Core v2.0 with Learning...');

      // Step 1: Get relevant reasoning patterns from high-quality past analyses
      const historicalContext = await this.getRelevantReasoningContext([], []); // Simplified for now

      // Step 2: Create enhanced prompt with learning context
      const enhancedPrompt = this.createLearningEnhancedPrompt(storyText, storyTitle, historicalContext);

      // Step 3: Run analysis with o3 maximum reasoning + historical context
      const response = await openai.responses.create({
        model: "o3",
        input: [
          ...historicalContext, // Include successful reasoning patterns
          {
            role: "system",
            content: enhancedPrompt
          },
          {
            role: "user", 
            content: `Analyze this story with maximum creativity and insight: "${storyTitle}"\n\n${storyText}`
          }
        ],
        reasoning: {
          effort: "high", // Maximum reasoning
          summary: "auto"
        },
        store: false,
        include: ["reasoning.encrypted_content"],
        max_output_tokens: 4000
      });

      // Step 4: Extract reasoning and results
      const reasoningItems = response.output.filter(item => item.type === 'reasoning');
      const messageOutput = response.output.find(item => item.type === 'message');
      const textContent = messageOutput?.content?.find(content => content.type === 'output_text');
      const analysis = textContent?.text;

      // Step 5: Save reasoning for future learning (assume high quality for now)
      const storyId = Date.now().toString(); // Simplified ID
      await this.saveReasoningContext(storyId, 'enhanced_analysis', reasoningItems, 9);

      // Step 6: Get creative inspirations for future use
      await this.getCreativeInspirations(storyText, []); // Simplified

      console.log('✅ Enhanced analysis complete with learning integration');

      return {
        analysis: analysis,
        reasoning_items: reasoningItems,
        learning_enhanced: true,
        historical_context_used: historicalContext.length > 0
      };

    } catch (error) {
      console.error('Enhanced analysis failed:', error);
      throw error;
    }
  }

  // 5. LEARNING-ENHANCED PROMPT CREATION
  createLearningEnhancedPrompt(_storyText: string, _storyTitle: string, historicalContext: any[]): string {
    const basePrompt = `You are The Scenarist Core v2.0 - Enhanced with Learning Intelligence.

🧠 LEARNING CONTEXT: ${historicalContext.length > 0 ? 'You have access to successful reasoning patterns from previous high-quality analyses. Use these insights to enhance your analysis.' : 'Building new reasoning patterns for future learning.'}

🎯 MISSION: Provide the most creative, insightful, and cinematically valuable story analysis possible.

ENHANCED CAPABILITIES:
- Maximum reasoning effort with o3 thinking
- Pattern recognition from successful analyses  
- Creative insight synthesis
- Cinematic vision development
- Production-ready recommendations

ANALYSIS FRAMEWORK:
1. Deep narrative deconstruction with creative insights
2. Character psychology with unique angle discovery
3. Visual storytelling opportunities with specific techniques
4. Genre innovation and convention subversion
5. Audience engagement and emotional journey mapping
6. Production feasibility with creative solutions
7. Market positioning with unique value propositions

Think through multiple creative interpretations and choose the most cinematically compelling approach. Consider how this story could be elevated beyond typical genre expectations.

Provide comprehensive analysis that a film producer could immediately action.`;

    return basePrompt;
  }

  // 6. QUALITY FEEDBACK SYSTEM
  async submitQualityFeedback(analysisId: string, qualityScore: number, feedback: string) {
    try {
      await supabase
        .from('analysis_feedback')
        .insert({
          analysis_id: analysisId,
          quality_score: qualityScore,
          feedback: feedback,
          created_at: new Date().toISOString()
        });

      console.log(`📝 Quality feedback submitted (score: ${qualityScore})`);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  }
}

// Export enhanced service
export const smartScenaristCore = new SmartScenaristCore();
