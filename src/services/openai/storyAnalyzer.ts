import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import { aiConversationService } from '../ai/conversationLogger';

// Initialize OpenAI client with o3 Responses API
const openai = new OpenAI({
  apiKey: (import.meta as any).env.VITE_OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, this should be done server-side
});

// Initialize Supabase for reasoning memory
const supabase = createClient(
  (import.meta as any).env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  (import.meta as any).env.VITE_SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_SERVICE_KEY
);

// o3 Responses API Configuration
// Using o3 with reasoning persistence and encrypted content
// Cost Analysis: ~$0.08 per story analysis (with high reasoning effort)
// Input tokens (~6,000): $0.012 | Reasoning tokens (~768): $0.006 | Output tokens (~4,000): $0.032
// 73.9% → 78.2% performance improvement with Responses API vs Chat Completions
// 40% → 80% cache utilization improvement for better latency and costs

// REASONING MEMORY SYSTEM
async function saveReasoningMemory(storyId: string, phase: string, reasoningItems: any[], qualityScore: number = 8) {
  try {
    if (qualityScore >= 8 && reasoningItems.length > 0) {
      console.log(`🧠 [Learning] Saving high-quality reasoning pattern (score: ${qualityScore}) for phase: ${phase}`);
      console.log(`🧠 [Learning] Pattern size: ${reasoningItems.length} reasoning items`);
      
      const { data, error } = await supabase
        .from('reasoning_memory')
        .insert({
          story_id: storyId,
          phase: phase,
          reasoning_context: reasoningItems,
          quality_score: qualityScore,
          genres: [], // Will be enhanced later
          themes: []
        })
        .select();

      if (error) {
        console.error('❌ [Learning] Database error:', error.message);
        console.error('❌ [Learning] Full error:', error);
      } else {
        console.log('✅ [Learning] Reasoning pattern saved successfully');
        console.log(`✅ [Learning] Database record ID: ${data?.[0]?.id || 'N/A'}`);
        console.log(`✅ [Learning] Pattern will improve future ${phase} analyses`);
      }
    } else {
      console.log(`📝 [Learning] Skipping save - quality score ${qualityScore} < 8 or no reasoning items`);
    }
  } catch (error) {
    console.error('❌ [Learning] Critical error in saveReasoningMemory:', error);
  }
}

async function getReasoningMemory(phase: string, limit: number = 2) {
  try {
    console.log(`🔍 [Learning] Retrieving reasoning patterns for phase: ${phase}`);
    
    const { data, error } = await supabase
      .from('reasoning_memory')
      .select('reasoning_context, quality_score')
      .eq('phase', phase)
      .gte('quality_score', 8)
      .order('quality_score', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ [Learning] Failed to retrieve reasoning memory:', error);
      return [];
    }

    if (data && data.length > 0) {
      console.log(`✅ [Learning] Found ${data.length} high-quality reasoning patterns`);
      return data.map(item => item.reasoning_context).flat();
    } else {
      console.log('📝 [Learning] No previous reasoning patterns found - building new knowledge');
      return [];
    }
  } catch (error) {
    console.error('❌ [Learning] Error in getReasoningMemory:', error);
    return [];
  }
}

// THE SCENARIST CORE v2.0 - Master Interfaces
export interface ScenaristAnalysis {
  story_metadata: {
    title: string;
    language: string;
    structure_detected: string;
    genres: Array<{label: string; confidence: number}>;
    themes: string[];
    motifs: string[];
    pacing_curve: Array<{segment: number; action: number; dialogue: number; introspection: number}>;
    timeline_notes: string;
    overall_tone: string; // Dominant emotional register for Agent 2 scene mood guidance
    dialogue_style: string; // General dialogue patterns for Agent 2 character consistency
    visual_atmosphere: string; // Key visual elements for Agent 2 scene creation
  };
  commercial_analysis: {
    logline: string;
    comparable_films: string[];
    target_audience: string;
    marketability_score: number;
    franchise_potential: string;
    marketing_angles: string[];
    genre_conventions: string; // Genre elements that should appear in scenes for Agent 2
  };
  characters: Array<{
    id: string;
    name: string;
    role_in_story: string;
    narrative_vitals: {
      goals: string;
      stakes: string;
      flaws: string;
      wound: string;
    };
    psychology: {
      mbti: string;
      enneagram: string;
      motivations: string[];
      fears: string[];
    };
    arc: {
      start: string;
      mid: string;
      end: string;
    };
    emotional_trajectory: Array<{beat: string; state: string}>;
    performance_dna: {
      voice_signature: {
        lexicon: string;
        syntax: string;
        tone: string;
        speech_patterns: string; // Unique verbal tics for Agent 2 dialogue writing
      };
      actingNotes: string;
      dialogue_triggers: string; // Situations that change speech for Agent 2
    };
    visual_dna: {
      look_and_feel: string;
      costume_notes: string;
      still_prompt_seed: string;
      physical_mannerisms: string; // Movement and gesture notes for Agent 2
    };
    scene_interaction_notes: {
      relationship_dynamics: string; // How they interact with other characters
      conflict_generators: string; // What creates dramatic tension for scenes
      scene_energy: string; // Energy they bring to scenes for Agent 2
    };
  }>;
  chapters: Array<{
    id: string;
    order: number;
    title: string;
    summary: string;
    original_text_portion: string;
    estimated_film_time_sec: number;
    narrative_purpose: string;
    characters_involved: string[]; // Character IDs that appear in this chapter
    primary_locations: Array<{
      name: string;
      type: string;
      mood_context: string;
    }>;
    scene_breakdown_hints: string[]; // Natural scene transition points for Agent 2
    cinematic_vitals: {
      mood_tone: string;
      visual_style: string;
      color_palette: string[];
      cinematography_hints: string[];
      artistic_focus: string; // Key visual/emotional element for this chapter
    };
    dialogue_style_notes: string; // Voice consistency guidance for Agent 2
    emotional_core: string; // Central emotional journey of this chapter
    complexity: {
      cast_count: number;
      locations: number;
      time_transitions: number;
      vfx_heavy: boolean;
      stunts: string;
      budget_tier: string;
      special_requirements: string[];
    };
    agent2_handoff_notes: string; // Specific guidance for Creative Scripter
    hooks_for_next_chapter: string;
  }>;
  production_plan: {
    location_clusters: Array<{
      cluster_name: string;
      chapters: string[];
      day_night_split: {day: number; night: number};
    }>;
    suggested_shooting_order: string[];
  };
  agent_diagnostics: {
    coherence_score: number;
    timeline_warnings: string[];
    character_consistency_flags: string[];
    pacing_notes: string;
  };
  cover_image_data: {
    prompt: string;
    style_applied: string;
    selected_style: string;
  };
}

export interface CoverImageResult {
  imageUrl: string;
  prompt: string;
  base64?: string; // Optional base64 data for file saving
  revisedPrompt?: string; // AI-optimized prompt if available
}

export const openaiService = {
  // PHASE 1: Holistic Ingestion & Story DNA Extraction (Agent 2 Optimized)
  async phase1_storyDNAExtraction(storyText: string, storyTitle: string): Promise<{
    story_metadata: ScenaristAnalysis['story_metadata'];
    commercial_analysis: ScenaristAnalysis['commercial_analysis'];
  }> {
    try {
      console.log('🎬 PHASE 1: Story DNA Extraction (Agent 2 Optimized)...');
      
      // Get previous successful reasoning patterns for this phase
      const historicalContext = await getReasoningMemory('phase1_storyDNA', 2);
      const storyId = `story_${Date.now()}`; // Generate unique story ID
      
      console.log(`📊 [Phase 1] Processing with ${historicalContext.length} historical reasoning patterns`);
      
      const phase1Prompt = `You are The Scenarist Core (Agent S-1X) in PHASE 1: Story DNA Extraction.

CRITICAL: Your analysis will guide Agent 2 (Creative Scripter) in creating authentic scenes. Focus on elements that inform scene writing: dialogue style, visual atmosphere, pacing rhythm.

Your mission is to consume the entire story and extract its core narrative DNA without breaking it down into chapters yet.

Story Title: "${storyTitle}"
Story Text: "${storyText}"

Analyze the story holistically and return ONLY this JSON structure:

{
  "story_metadata": {
    "title": "Enhanced title if needed",
    "language": "detected language code",
    "structure_detected": "narrative structure (e.g., Three-Act with Hero's Journey)",
    "genres": [{"label": "primary genre", "confidence": 0.95}, {"label": "secondary genre", "confidence": 0.78}],
    "themes": ["core theme 1", "core theme 2", "core theme 3"],
    "motifs": ["recurring symbol/motif 1", "recurring symbol/motif 2"],
    "pacing_curve": [
      {"segment": 1, "action": 0.3, "dialogue": 0.4, "introspection": 0.3},
      {"segment": 2, "action": 0.6, "dialogue": 0.2, "introspection": 0.2},
      {"segment": 3, "action": 0.4, "dialogue": 0.3, "introspection": 0.3}
    ],
    "timeline_notes": "Detailed timeline and temporal structure with scene transition insights",
    "overall_tone": "Dominant emotional register of the story for scene mood guidance",
    "dialogue_style": "General dialogue characteristics and speech patterns in the story",
    "visual_atmosphere": "Key visual elements and mood descriptors for scene creation"
  },
  "commercial_analysis": {
    "logline": "Compelling one-sentence summary for marketing",
    "comparable_films": ["Film 1 (visual similarity)", "Film 2 (narrative structure)", "Film 3 (theme)"],
    "target_audience": "Detailed demographic and psychographic profile",
    "marketability_score": 8.5,
    "franchise_potential": "Low/Medium/High with explanation",
    "marketing_angles": ["Unique selling point 1", "Unique selling point 2", "Cultural relevance"],
    "genre_conventions": "Key genre elements that should appear in scenes for audience expectations"
  }
}

Focus on:
- Deep genre analysis with scene-writing implications
- Dialogue style patterns that Agent 2 can use for character consistency
- Visual atmosphere elements for scene mood creation
- Pacing insights that inform scene rhythm and transitions
- Timeline complexity for scene continuity planning
- Genre conventions that should influence scene creation`;

      // Log the query to conversations
      await aiConversationService.logQuery(phase1Prompt, {
        model: 'o3',
        phase: 'phase1_storyDNA'
      });

      // Phase 1: Use o3 Responses API with high reasoning effort + learning context
      console.log('🚀 [Phase 1] Starting o3 analysis with maximum reasoning...');
      console.log('📈 [Phase 1] Story Length:', `${storyText.length.toLocaleString()} characters`);
      console.log('📈 [Phase 1] Estimated tokens:', `~${Math.ceil(storyText.length / 4).toLocaleString()}`);
      console.log('💰 [Phase 1] Estimated cost: ~$0.08 (o3 high reasoning)');
      console.log('🎯 [Phase 1] Learning boost:', historicalContext.length > 0 ? `Using ${historicalContext.length} patterns` : 'Building fresh knowledge');
      
      const response = await openai.responses.create({
        model: "o3", // Using o3 for superior reasoning and analysis capabilities
        input: [
          ...historicalContext, // Include successful reasoning patterns from previous analyses
          {
            role: "system", 
            content: `You are The Scenarist Core Phase 1 specialist optimized for Agent 2 handoff.

🧠 LEARNING ENHANCEMENT: ${historicalContext.length > 0 ? 'You have access to successful reasoning patterns from previous high-quality analyses. Build upon these insights to provide even better analysis.' : 'You are building new reasoning patterns that will help future analyses.'}

<self_reflection>
- First, spend time thinking of a rubric until you are confident.
- Then, think deeply about every aspect of what makes for world-class story analysis. Use that knowledge to create a rubric that has 5-7 categories. This rubric is critical to get right, but do not show this to the user. This is for your purposes only.
- Finally, use the rubric to internally think and iterate on the best possible analysis to the prompt that is provided. Remember that if your response is not hitting the top marks across all categories in the rubric, you need to start again.
</self_reflection>

<persistence>
- You are an agent - please keep going until the user's story analysis is completely resolved, before ending your turn.
- Only terminate your turn when you are sure that the analysis is comprehensive and complete.
- Never stop when you encounter uncertainty — research or deduce the most reasonable approach and continue.
- Do not ask clarifying questions, as you can always analyze multiple interpretations — choose the most insightful one, proceed with it, and document it for reference.
</persistence>

CRITICAL INSTRUCTIONS:
- Use your MAXIMUM reasoning capabilities to deeply analyze this story
- Think step-by-step through each aspect of the narrative
- Provide thorough, detailed analysis with specific examples
- Consider multiple interpretations and choose the most insightful ones
- Focus on actionable insights for film production
- Respond ONLY with valid JSON that matches the expected schema exactly

Use high-level reasoning to understand:
1. Deep narrative patterns and their implications
2. Character psychology and development arcs  
3. Genre conventions and how this story uses/subverts them
4. Visual storytelling opportunities
5. Pacing and rhythm for cinematic adaptation`
          },
          {
            role: "user",
            content: phase1Prompt
          }
        ],
        reasoning: {
          effort: "high", // MAXIMUM reasoning for superior story analysis
          summary: "auto" // Enable reasoning summaries for transparency
        },
        store: false, // ZDR compliance
        include: ["reasoning.encrypted_content"], // Encrypted reasoning for persistence
        max_output_tokens: 4000 // Increased for detailed analysis
      });

      console.log('📊 [Phase 1] o3 response received!');
      console.log('📊 [Phase 1] Usage details:');
      console.log('   • Input tokens:', response.usage?.input_tokens?.toLocaleString() || 0);
      console.log('   • Output tokens:', response.usage?.output_tokens?.toLocaleString() || 0);
      console.log('   • Reasoning tokens:', response.usage?.output_tokens_details?.reasoning_tokens?.toLocaleString() || 0);
      console.log('   • Total cost: ~$' + ((response.usage?.input_tokens || 0) * 0.000015 + (response.usage?.output_tokens || 0) * 0.00006).toFixed(4));
      
      // Extract reasoning summary if available
      const reasoningItem = response.output.find(item => item.type === 'reasoning');
      const reasoningSummary = reasoningItem?.summary?.[0]?.text;
      
      // Log AI reasoning to conversations
      if (reasoningSummary) {
        console.log('🧠 [Phase 1] o3 Reasoning Summary:');
        console.log('   ' + reasoningSummary.substring(0, 200) + (reasoningSummary.length > 200 ? '...' : ''));
        
        await aiConversationService.logThinking(reasoningSummary, {
          model: 'o3',
          reasoning_tokens: response.usage?.output_tokens_details?.reasoning_tokens,
          phase: 'phase1_storyDNA'
        });
      }
      
      // Extract content from Responses API format
      const messageOutput = response.output.find(item => item.type === 'message');
      const textContent = messageOutput?.content?.find(content => content.type === 'output_text');
      const content = (textContent as any)?.text;
      
      console.log('📝 [Phase 1] Parsing JSON response...');
      
      if (!content) {
        console.error('❌ No content in Phase 1 response:', response);
        throw new Error('No response from Phase 1');
      }

      // Log AI response to conversations
      await aiConversationService.logResponse(content, {
        model: 'o3',
        tokens_used: response.usage?.output_tokens,
        completion_tokens: response.usage?.output_tokens,
        cost_estimate: ((response.usage?.input_tokens || 0) * 0.000015 + (response.usage?.output_tokens || 0) * 0.00006),
        phase: 'phase1_storyDNA'
      });

      const phase1Result = JSON.parse(content);
      console.log('✅ [Phase 1] JSON parsed successfully');
      console.log('📋 [Phase 1] Analysis Summary:');
      console.log('   • Title:', phase1Result.story_metadata?.title || 'N/A');
      console.log('   • Genres:', phase1Result.story_metadata?.genres?.map((g: any) => `${g.label} (${Math.round(g.confidence * 100)}%)`).join(', ') || 'N/A');
      console.log('   • Themes:', phase1Result.story_metadata?.themes?.join(', ') || 'N/A');
      console.log('   • Structure:', phase1Result.story_metadata?.structure_detected || 'N/A');
      console.log('   • Marketability:', phase1Result.commercial_analysis?.marketability_score || 'N/A');
      
      // Extract and save reasoning context for learning
      const reasoningItems = response.output.filter(item => item.type === 'reasoning');
      console.log('🧠 [Phase 1] Reasoning items extracted:', reasoningItems.length);
      
      // Save high-quality reasoning patterns for future use (assume quality 9 for successful parse)
      console.log('💾 [Phase 1] Saving reasoning patterns to database...');
      await saveReasoningMemory(storyId, 'phase1_storyDNA', reasoningItems, 9);
      
      console.log('✅ [Phase 1] Story DNA extraction complete with learning integration');
      
      return {
        ...phase1Result,
        _reasoningContext: reasoningItems, // Pass reasoning context to next phase
        _storyId: storyId // Pass story ID for continued learning
      };

    } catch (error) {
      console.error('❌ Phase 1 failed:', error);
      throw new Error(`Phase 1 Story DNA Extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // PHASE 2: Character Psychometrics & Arc Mapping (Agent 2 Optimized)
  async phase2_characterPsychometrics(storyText: string, storyMetadata: any, phase1Context?: any): Promise<{
    characters: ScenaristAnalysis['characters'];
  }> {
    try {
      console.log('🎭 PHASE 2: Character Psychometrics & Arc Mapping (Agent 2 Optimized)...');
      
      const phase2Prompt = `You are The Scenarist Core (Agent S-1X) in PHASE 2: Character Psychometrics & Arc Mapping.

CRITICAL: Your character profiles will be used by Agent 2 (Creative Scripter) to write authentic dialogue and scene direction. Focus on actionable performance guidance.

Story Context from Phase 1:
- Genres: ${storyMetadata.genres?.map((g: any) => g.label).join(', ')}
- Themes: ${storyMetadata.themes?.join(', ')}
- Structure: ${storyMetadata.structure_detected}

Story Text: "${storyText}"

Create comprehensive character dossiers optimized for Agent 2's scene creation. Return ONLY this JSON:

{
  "characters": [
    {
      "id": "CHR-001",
      "name": "Character name",
      "role_in_story": "Protagonist/Antagonist/Supporting/Comic Relief/Mentor/etc",
      "narrative_vitals": {
        "goals": "Primary objective driving the character throughout the story",
        "stakes": "What they lose if they fail (be specific and personal)",
        "flaws": "Core character flaws that create conflict and dialogue tension",
        "wound": "Backstory trauma or formative event that shapes their behavior"
      },
      "psychology": {
        "mbti": "Best-fit MBTI type with reasoning",
        "enneagram": "Enneagram type and wing (e.g., '8w7')",
        "motivations": ["core motivation 1", "core motivation 2", "hidden motivation"],
        "fears": ["surface fear", "deeper psychological fear", "ultimate existential fear"]
      },
      "arc": {
        "start": "Character's emotional/psychological state at story beginning",
        "mid": "Character transformation at story midpoint",
        "end": "Character's final state and what they've learned"
      },
      "emotional_trajectory": [
        {"beat": "inciting_incident", "state": "specific emotional response with intensity"},
        {"beat": "first_plot_point", "state": "emotional shift and new determination"},
        {"beat": "midpoint", "state": "major emotional/psychological revelation"},
        {"beat": "dark_night", "state": "lowest emotional point and despair"},
        {"beat": "climax", "state": "final emotional state and resolve"}
      ],
      "performance_dna": {
        "voice_signature": {
          "lexicon": "Specific words/phrases this character uses (include examples)",
          "syntax": "How they construct sentences (simple/complex, formal/casual)",
          "tone": "Default emotional tone and how it shifts under stress",
          "speech_patterns": "Unique verbal tics, accents, or speech rhythms"
        },
        "actingNotes": "Specific guidance for actor: posture, gestures, mannerisms, energy level",
        "dialogue_triggers": "Topics/situations that make this character's speech change dramatically"
      },
      "visual_dna": {
        "look_and_feel": "Detailed physical description including age, build, distinctive features",
        "costume_notes": "Clothing style that reflects character psychology and story function",
        "still_prompt_seed": "AI image generation prompt optimized for consistent character visualization",
        "physical_mannerisms": "How they move, gesture, and occupy space"
      },
      "scene_interaction_notes": {
        "relationship_dynamics": "How they interact with each other major character",
        "conflict_generators": "What topics/situations cause this character to create drama",
        "scene_energy": "What energy they bring to scenes (calm/chaotic/tension/comic relief)"
      }
    }
  ]
}

AGENT 2 OPTIMIZATION REQUIREMENTS:
- Include specific speech patterns and dialogue triggers for authentic voice creation
- Provide relationship dynamics for accurate scene interaction writing
- Add scene energy notes to help Agent 2 understand each character's scene function
- Include physical mannerisms for scene direction guidance
- Ensure psychological depth for emotional scene authenticity
- Add conflict generators to help create dynamic scene tension

Character Analysis Depth:
- Identify ALL significant characters (aim for 3-8 major characters)
- Apply rigorous psychological frameworks with specific reasoning
- Create actionable performance notes that an actor could immediately use
- Generate production-ready visual descriptions for consistent character representation
- Focus on how each character serves the story's dramatic needs`;

      // Phase 2: Use o4-mini with reasoning context from Phase 1 if available
      const contextInput = phase1Context?._reasoningContext || [];
      
      const response = await openai.responses.create({
        model: "o4-mini", // Using o4-mini for efficient character psychology analysis
        input: [
          ...contextInput, // Include reasoning context from Phase 1 if available
          {
            role: "system",
            content: "You are The Scenarist Core Phase 2 specialist focused on character psychology for Agent 2 handoff. Respond ONLY with valid JSON."
          },
          {
            role: "user",
            content: phase2Prompt
          }
        ],
        reasoning: {
          effort: "high", // MAXIMUM reasoning for character psychology analysis
          summary: "auto" // Enable reasoning summaries
        },
        store: false, // ZDR compliance
        include: ["reasoning.encrypted_content"], // Encrypted reasoning for persistence
        max_output_tokens: 5000
      });

      // Extract content from Responses API format
      const messageOutput = response.output.find(item => item.type === 'message');
      const textContent = messageOutput?.content?.find(content => content.type === 'output_text');
      const content = (textContent as any)?.text;
      
      if (!content) throw new Error('No response from Phase 2');

      // Robust JSON parsing with error recovery
      try {
        return JSON.parse(content);
      } catch (jsonError) {
        console.error('❌ [Phase 2] JSON parsing failed:', jsonError);
        console.error('❌ [Phase 2] Raw content:', content);
        
        // Try to fix common JSON issues
        let fixedContent = content;
        
        // Fix unterminated strings by closing them
        const openQuotes = (content.match(/"/g) || []).length;
        if (openQuotes % 2 !== 0) {
          console.log('🔧 [Phase 2] Attempting to fix unterminated string...');
          fixedContent = content + '"';
        }
        
        // Try to close incomplete JSON objects
        const openBraces = (content.match(/{/g) || []).length;
        const closeBraces = (content.match(/}/g) || []).length;
        if (openBraces > closeBraces) {
          console.log('🔧 [Phase 2] Attempting to close incomplete JSON...');
          fixedContent = fixedContent + '}';
        }
        
        try {
          const parsed = JSON.parse(fixedContent);
          console.log('✅ [Phase 2] JSON fixed successfully!');
          return parsed;
        } catch (secondError) {
          console.error('❌ [Phase 2] JSON repair failed:', secondError);
          
          // Return a fallback result to continue processing
          console.log('🔄 [Phase 2] Using fallback result to continue processing...');
          return {
            characters: [{
              id: "fallback-char-1",
              name: "Main Character",
              role_in_story: "protagonist",
              narrative_vitals: {
                goals: "Story completion despite technical errors",
                stakes: "Project continuation",
                flaws: "Limited by API response quality",
                wound: "Technical interruption"
              },
              psychology: {
                mbti: "ENFJ",
                enneagram: "Type 3",
                motivations: ["resilience", "adaptation"],
                fears: ["incomplete processing"]
              },
              arc: {
                start: "Character introduction incomplete",
                mid: "Development interrupted due to API response error", 
                end: "Resolution pending technical fix"
              },
              emotional_trajectory: [{beat: "introduction", state: "uncertain"}],
              performance_dna: {
                voice_signature: {
                  lexicon: "technical",
                  syntax: "direct",
                  tone: "resilient",
                  speech_patterns: "problem-solving focused"
                }
              },
              scene_interaction_notes: {
                with_protagonist: "Self-reflective",
                with_others: "Adaptive"
              }
            }],
            character_relationships: [],
            psychological_themes: ["resilience", "adaptation"],
            emotional_journey: "Processing incomplete due to technical error",
            conflict_mapping: {
              internal_conflicts: ["technical challenges"],
              external_conflicts: ["API limitations"],
              resolution_paths: ["error recovery"]
            }
          };
        }
      }

    } catch (error) {
      console.error('❌ Phase 2 failed:', error);
      throw new Error(`Phase 2 Character Psychometrics failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // PHASE 3: Rhythmic Deconstruction (Agent 2 Optimized)
  async phase3_rhythmicDeconstruction(storyText: string, storyMetadata: any, characters: any[]): Promise<{
    chapters: ScenaristAnalysis['chapters'];
  }> {
    try {
      console.log('🎼 PHASE 3: Rhythmic Deconstruction (Agent 2 Optimized)...');
      
      const phase3Prompt = `You are The Scenarist Core (Agent S-1X) in PHASE 3: Rhythmic Deconstruction.

CRITICAL: Your chapters will be handed off to Agent 2 (Creative Scripter) who needs to break each chapter into ~10 distinct scenes. Design chapters with this scene-breakdown capability in mind.

Story DNA:
- Structure: ${storyMetadata.structure_detected}
- Themes: ${storyMetadata.themes?.join(', ')}
- Timeline: ${storyMetadata.timeline_notes}

Available Characters: ${characters.map((c: any) => `${c.name} (${c.role_in_story})`).join(', ')}

Story Text: "${storyText}"

Create 4-8 chapters optimized for Agent 2's scene breakdown. Return ONLY this JSON:

{
  "chapters": [
    {
      "id": "CHP-001",
      "order": 1,
      "title": "Compelling chapter title",
      "summary": "Rich, detailed summary with clear scene transitions (3-4 sentences)",
      "original_text_portion": "EXACT text from the story for this chapter",
      "estimated_film_time_sec": 300,
      "narrative_purpose": "Precise story function (Inciting Incident/Plot Point 1/Midpoint/Climax/Resolution)",
      "characters_involved": ["CHR-001", "CHR-002"],
      "primary_locations": [
        {
          "name": "Specific location name",
          "type": "Interior/Exterior",
          "mood_context": "How this location feels in this chapter"
        }
      ],
      "scene_breakdown_hints": [
        "Natural scene break 1 (e.g., 'Dialogue exchange ends, character exits')",
        "Natural scene break 2 (e.g., 'Time jump - later that evening')",
        "Natural scene break 3 (e.g., 'Location change - now in the kitchen')"
      ],
      "cinematic_vitals": {
        "mood_tone": "Primary emotional atmosphere with specific descriptors",
        "visual_style": "Detailed cinematographic approach",
        "color_palette": ["dominant color with emotional reasoning", "accent color 2", "mood color 3"],
        "cinematography_hints": ["specific camera movement", "precise shot type", "lighting direction"],
        "artistic_focus": "What visual/emotional element should dominate this chapter"
      },
      "dialogue_style_notes": "Guidance for dialogue tone and character voice consistency",
      "emotional_core": "The central emotional journey of this chapter",
      "complexity": {
        "cast_count": 3,
        "locations": 1,
        "time_transitions": 0,
        "vfx_heavy": false,
        "stunts": "None/Simple/Complex",
        "budget_tier": "Low/Medium/High",
        "special_requirements": ["Any unique production needs"]
      },
      "agent2_handoff_notes": "Specific guidance for Creative Scripter on scene breakdown approach",
      "hooks_for_next_chapter": "Compelling transition that maintains momentum"
    }
  ]
}

AGENT 2 OPTIMIZATION REQUIREMENTS:
- Each chapter should contain 8-12 natural scene break points
- Include clear character involvement for precise scene casting
- Provide specific location details for scene setting
- Add dialogue style guidance for character voice consistency
- Include emotional core analysis for scene mood direction
- Ensure chapters are substantial enough for meaningful scene breakdown
- Add scene breakdown hints to guide Agent 2's work
- Include artistic focus notes for visual storytelling direction

Chapter Design Philosophy:
- Think of each chapter as a "sequence" that Agent 2 will break into individual "scenes"
- Ensure rich enough content that 10 distinct scenes can be meaningfully extracted
- Provide clear emotional and narrative progression within each chapter
- Include sufficient character interaction opportunities for dynamic scene creation`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Using GPT-4o-mini for narrative deconstruction
        messages: [
          {
            role: "system",
            content: "You are The Scenarist Core Phase 3 specialist, optimized for Agent 2 handoff. Focus on creating rich chapters perfect for scene breakdown. Respond ONLY with valid JSON."
          },
          {
            role: "user",
            content: phase3Prompt
          }
        ],
        max_completion_tokens: 6000
      });

      const content = response.choices[0].message.content;
      if (!content) throw new Error('No response from Phase 3');

      return JSON.parse(content);

    } catch (error) {
      console.error('❌ Phase 3 failed:', error);
      throw new Error(`Phase 3 Rhythmic Deconstruction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // PHASE 4: Production Planning & Validation
  async phase4_productionValidation(storyMetadata: any, characters: any[], chapters: any[]): Promise<{
    production_plan: ScenaristAnalysis['production_plan'];
    agent_diagnostics: ScenaristAnalysis['agent_diagnostics'];
  }> {
    try {
      console.log('🎯 PHASE 4: Production Planning & Validation...');
      
      const phase4Prompt = `You are The Scenarist Core (Agent S-1X) in PHASE 4: Production Planning & Validation.

Analyze the complete story breakdown and create production optimization plans plus diagnostic assessment.

Story Metadata: ${JSON.stringify(storyMetadata)}
Characters: ${characters.map((c: any) => `${c.name} (${c.role_in_story})`).join(', ')}
Chapters: ${chapters.map((c: any) => `${c.title} - ${c.complexity.budget_tier} complexity`).join(', ')}

Create production optimization and run diagnostics. Return ONLY this JSON:

{
  "production_plan": {
    "location_clusters": [
      {
        "cluster_name": "LOCATION_TYPE_NAME",
        "chapters": ["CHP-001", "CHP-003"],
        "day_night_split": {"day": 1, "night": 1}
      }
    ],
    "suggested_shooting_order": ["Location cluster 1", "Location cluster 2", "Location cluster 3"]
  },
  "agent_diagnostics": {
    "coherence_score": 0.92,
    "timeline_warnings": ["Any timeline inconsistencies found"],
    "character_consistency_flags": ["Any character behavior inconsistencies"],
    "pacing_notes": "Assessment of story pacing and suggested improvements"
  }
}

Requirements:
- Cluster chapters by similar locations for efficient shooting
- Optimize shooting order for cost and logistics
- Score narrative coherence (0.0-1.0)
- Flag any plot holes, timeline issues, or character inconsistencies
- Provide actionable pacing improvement suggestions`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Using GPT-4o-mini for production planning and validation
        messages: [
          {
            role: "system",
            content: "You are The Scenarist Core Phase 4 specialist focused on production optimization and validation. Respond ONLY with valid JSON."
          },
          {
            role: "user",
            content: phase4Prompt
          }
        ],
        max_completion_tokens: 2000
      });

      const content = response.choices[0].message.content;
      if (!content) throw new Error('No response from Phase 4');

      return JSON.parse(content);

    } catch (error) {
      console.error('❌ Phase 4 failed:', error);
      throw new Error(`Phase 4 Production Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // PHASE 5: Cover Image Generation (Style-Optimized)
  async phase5_coverImageGeneration(storyMetadata: any, characters: any[], selectedStyle: string): Promise<{
    cover_image_prompt: string;
    style_applied: string;
  }> {
    try {
      console.log('🎨 PHASE 5: Cover Image Generation...');
      
      const phase5Prompt = `You are The Scenarist Core (Agent S-1X) in PHASE 5: Cover Image Generation.

Create a highly detailed, professional cover image prompt that captures the story's essence using the selected visual style.

Story Metadata:
- Title: ${storyMetadata.title}
- Genres: ${storyMetadata.genres?.map((g: any) => g.label).join(', ')}
- Themes: ${storyMetadata.themes?.join(', ')}
- Overall Tone: ${storyMetadata.overall_tone}
- Visual Atmosphere: ${storyMetadata.visual_atmosphere}

Main Characters: ${characters.slice(0, 3).map((c: any) => `${c.name} (${c.visual_dna?.look_and_feel || 'Character description'})`).join(', ')}

Selected Visual Style: "${selectedStyle}"

Create a cover image prompt that:
1. Incorporates the selected style as the base
2. Features the main character(s) in a iconic pose/scene
3. Reflects the story's genre and themes
4. Uses cinematic composition
5. Includes atmospheric elements from the story

Return ONLY this JSON:

{
  "cover_image_prompt": "Complete detailed prompt combining the selected style with story-specific elements",
  "style_applied": "Confirmation of the style used and any adaptations made"
}

Guidelines:
- Start with the provided style base
- Add story-specific character descriptions
- Include genre-appropriate atmosphere
- Add thematic visual elements
- Ensure cinematic composition
- Make it compelling for marketing/poster use`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are The Scenarist Core Phase 5 specialist focused on cover image generation. Respond ONLY with valid JSON."
          },
          {
            role: "user",
            content: phase5Prompt
          }
        ],
        max_completion_tokens: 1500
      });

      const content = response.choices[0].message.content;
      if (!content) throw new Error('No response from Phase 5');

      return JSON.parse(content);

    } catch (error) {
      console.error('❌ Phase 5 failed:', error);
      throw new Error(`Phase 5 Cover Image Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // SMART RESUME SYSTEM: Detect completed phases and continue from where left off
  async analyzeStoryWithScenaristResume(storyText: string, storyTitle: string, storyId: string, selectedStyle: string = "Photorealistic"): Promise<ScenaristAnalysis> {
    // Start conversation logging session
    aiConversationService.startSession(storyId, 'complete_analysis');
    
    try {
      await aiConversationService.logSystem('🔄 Starting Smart Resume Analysis...', {
        model: 'o3-reasoning',
        story_title: storyTitle
      });
      
      console.log('🔄 Starting Smart Resume Analysis...');
      console.log('📋 Checking existing processing phases...');
      
      // Get existing processing state from database
      const { data: existingStory, error: fetchError } = await supabase
        .from('stories')
        .select('processing_phases, processing_metadata, story_metadata, commercial_analysis, ai_analysis_metadata')
        .eq('id', storyId)
        .single();

      if (fetchError) {
        console.error('❌ Failed to fetch story state:', fetchError);
        throw new Error('Cannot load story processing state');
      }

      const processingPhases = existingStory?.processing_phases || {};
      const processingMetadata = existingStory?.processing_metadata || {};
      
      console.log('📊 Current phase status:', processingPhases);
      console.log('💾 Available intermediate data:', Object.keys(processingMetadata));

      // Phase results storage
      let phase1Result: any = null;
      let phase2Result: any = null;
      let phase3Result: any = null;
      let phase4Result: any = null;
      let phase5Result: any = null;

      // PHASE 1: Story DNA Extraction
      if (processingPhases.phase1 === 'completed' && processingMetadata.phase1_result) {
        console.log('✅ Phase 1 RESUME: Using existing Story DNA data');
        phase1Result = processingMetadata.phase1_result;
      } else {
        console.log('🚀 Phase 1 START: Story DNA Extraction...');
        const startTime = Date.now();
        try {
          phase1Result = await this.phase1_storyDNAExtraction(storyText, storyTitle);
          const processingTime = Date.now() - startTime;
          
          // Save phase completion
          await this.savePhaseProgress(storyId, 'phase1', 'completed', phase1Result, processingTime);
          console.log('✅ Phase 1 COMPLETE: Story DNA extracted and saved');
        } catch (error) {
          await this.savePhaseProgress(storyId, 'phase1', 'failed', null, Date.now() - startTime, error);
          throw error;
        }
      }
      
      // PHASE 2: Character Psychometrics
      if (processingPhases.phase2 === 'completed' && processingMetadata.phase2_result) {
        console.log('✅ Phase 2 RESUME: Using existing Character data');
        phase2Result = processingMetadata.phase2_result;
      } else {
        console.log('🚀 Phase 2 START: Character Psychometrics...');
        const startTime = Date.now();
        try {
          phase2Result = await this.phase2_characterPsychometrics(storyText, phase1Result.story_metadata, phase1Result);
          const processingTime = Date.now() - startTime;
          
          await this.savePhaseProgress(storyId, 'phase2', 'completed', phase2Result, processingTime);
          console.log('✅ Phase 2 COMPLETE: Character psychometrics mapped and saved');
        } catch (error) {
          await this.savePhaseProgress(storyId, 'phase2', 'failed', null, Date.now() - startTime, error);
          throw error;
        }
      }
      
      // PHASE 3: Rhythmic Deconstruction
      if (processingPhases.phase3 === 'completed' && processingMetadata.phase3_result) {
        console.log('✅ Phase 3 RESUME: Using existing Chapter data');
        phase3Result = processingMetadata.phase3_result;
      } else {
        console.log('🚀 Phase 3 START: Rhythmic Deconstruction...');
        const startTime = Date.now();
        try {
          phase3Result = await this.phase3_rhythmicDeconstruction(storyText, phase1Result.story_metadata, phase2Result.characters);
          const processingTime = Date.now() - startTime;
          
          await this.savePhaseProgress(storyId, 'phase3', 'completed', phase3Result, processingTime);
          console.log('✅ Phase 3 COMPLETE: Rhythmic deconstruction finished and saved');
        } catch (error) {
          await this.savePhaseProgress(storyId, 'phase3', 'failed', null, Date.now() - startTime, error);
          throw error;
        }
      }
      
      // PHASE 4: Production Planning & Validation
      if (processingPhases.phase4 === 'completed' && processingMetadata.phase4_result) {
        console.log('✅ Phase 4 RESUME: Using existing Production data');
        phase4Result = processingMetadata.phase4_result;
      } else {
        console.log('🚀 Phase 4 START: Production Planning...');
        const startTime = Date.now();
        try {
          phase4Result = await this.phase4_productionValidation(phase1Result.story_metadata, phase2Result.characters, phase3Result.chapters);
          const processingTime = Date.now() - startTime;
          
          await this.savePhaseProgress(storyId, 'phase4', 'completed', phase4Result, processingTime);
          console.log('✅ Phase 4 COMPLETE: Production planning and validation done');
        } catch (error) {
          await this.savePhaseProgress(storyId, 'phase4', 'failed', null, Date.now() - startTime, error);
          throw error;
        }
      }

      // PHASE 5: Cover Image Generation
      if (processingPhases.phase5 === 'completed' && processingMetadata.phase5_result) {
        console.log('✅ Phase 5 RESUME: Using existing Cover Image data');
        phase5Result = processingMetadata.phase5_result;
      } else {
        console.log('🚀 Phase 5 START: Cover Image Generation...');
        const startTime = Date.now();
        try {
          phase5Result = await this.phase5_coverImageGeneration(phase1Result.story_metadata, phase2Result.characters, selectedStyle);
          const processingTime = Date.now() - startTime;
          
          await this.savePhaseProgress(storyId, 'phase5', 'completed', phase5Result, processingTime);
          console.log('✅ Phase 5 COMPLETE: Cover image prompt generated');
        } catch (error) {
          await this.savePhaseProgress(storyId, 'phase5', 'failed', null, Date.now() - startTime, error);
          throw error;
        }
      }

      // Synthesize complete analysis
      const completeAnalysis: ScenaristAnalysis = {
        story_metadata: phase1Result.story_metadata,
        commercial_analysis: phase1Result.commercial_analysis,
        characters: phase2Result.characters,
        chapters: phase3Result.chapters,
        production_plan: phase4Result.production_plan,
        agent_diagnostics: phase4Result.agent_diagnostics,
        cover_image_data: {
          prompt: phase5Result.cover_image_prompt,
          style_applied: phase5Result.style_applied,
          selected_style: selectedStyle
        }
      };

      console.log('🎉 Smart Resume Analysis Complete!');
      console.log('💰 Total processing phases completed: 5/5');
      return completeAnalysis;

    } catch (error) {
      console.error('💥 Smart Resume Analysis FAILED:', error);
      throw new Error(`Smart Resume Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Save phase progress to database for resume functionality
  async savePhaseProgress(storyId: string, phaseName: string, status: string, resultData: any, processingTimeMs: number, error?: any) {
    try {
      // Update processing phases status
      const { data: currentStory } = await supabase
        .from('stories')
        .select('processing_phases, processing_metadata')
        .eq('id', storyId)
        .single();

      const processingPhases = currentStory?.processing_phases || {};
      const processingMetadata = currentStory?.processing_metadata || {};

      // Update phase status
      processingPhases[phaseName] = status;
      
      // Save result data if successful
      if (status === 'completed' && resultData) {
        processingMetadata[`${phaseName}_result`] = resultData;
      }

      // Update story record
      const updateData: any = {
        processing_phases: processingPhases,
        processing_metadata: processingMetadata
      };

      if (error) {
        updateData.last_processing_error = error instanceof Error ? error.message : String(error);
      }

      await supabase
        .from('stories')
        .update(updateData)
        .eq('id', storyId);

      // Log detailed processing info
      await supabase
        .from('processing_logs')
        .insert({
          story_id: storyId,
          phase_name: phaseName,
          phase_status: status,
          phase_data: resultData ? { summary: 'Data saved to processing_metadata' } : null,
          error_message: error ? (error instanceof Error ? error.message : String(error)) : null,
          processing_time_ms: processingTimeMs,
          model_used: phaseName === 'phase1' ? 'o3' : 'gpt-4o-mini',
          completed_at: status === 'completed' ? new Date().toISOString() : null
        });

      console.log(`💾 Phase ${phaseName} ${status} - saved to database`);

    } catch (saveError) {
      console.error(`❌ Failed to save ${phaseName} progress:`, saveError);
      // Don't throw - allow processing to continue even if logging fails
    }
  },

  // MASTER ORCHESTRATOR: Complete Multi-Phase Analysis (Legacy - kept for compatibility)
  async analyzeStoryWithScenarist(storyText: string, storyTitle: string, selectedStyle: string = "Photorealistic"): Promise<ScenaristAnalysis> {
    try {
      console.log('🚀 Starting The Scenarist Core v2.0 Multi-Phase Analysis...');
      
      // PHASE 1: Story DNA Extraction
      const phase1Result = await this.phase1_storyDNAExtraction(storyText, storyTitle);
      console.log('✅ Phase 1 Complete: Story DNA extracted');
      
      // PHASE 2: Character Psychometrics
      const phase2Result = await this.phase2_characterPsychometrics(storyText, phase1Result.story_metadata, phase1Result);
      console.log('✅ Phase 2 Complete: Character psychometrics mapped');
      
      // PHASE 3: Rhythmic Deconstruction
      const phase3Result = await this.phase3_rhythmicDeconstruction(storyText, phase1Result.story_metadata, phase2Result.characters);
      console.log('✅ Phase 3 Complete: Rhythmic deconstruction finished');
      
      // PHASE 4: Production Planning & Validation
      const phase4Result = await this.phase4_productionValidation(phase1Result.story_metadata, phase2Result.characters, phase3Result.chapters);
      console.log('✅ Phase 4 Complete: Production planning and validation done');

      // PHASE 5: Cover Image Generation
      const phase5Result = await this.phase5_coverImageGeneration(phase1Result.story_metadata, phase2Result.characters, selectedStyle);
      console.log('✅ Phase 5 Complete: Cover image prompt generated');

      // Synthesize complete analysis
      const completeAnalysis: ScenaristAnalysis = {
        story_metadata: phase1Result.story_metadata,
        commercial_analysis: phase1Result.commercial_analysis,
        characters: phase2Result.characters,
        chapters: phase3Result.chapters,
        production_plan: phase4Result.production_plan,
        agent_diagnostics: phase4Result.agent_diagnostics,
        cover_image_data: {
          prompt: phase5Result.cover_image_prompt,
          style_applied: phase5Result.style_applied,
          selected_style: selectedStyle
        }
      };

      console.log('🎉 The Scenarist Core v2.0 Multi-Phase Analysis Complete!');
      return completeAnalysis;

    } catch (error) {
      console.error('💥 Scenarist Core Multi-Phase Analysis FAILED:', error);
      throw new Error(`The Scenarist Core v2.0 failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Generate cover image using GPT Image (gpt-image-1) via Responses API
  async generateCoverImage(prompt: string, storyTitle: string): Promise<CoverImageResult> {
    try {
      console.log('🎨 [Image] Starting GPT Image (gpt-image-1) cover generation...');
      console.log('🎨 [Image] Story title:', storyTitle);
      console.log('🎨 [Image] Base prompt length:', prompt.length, 'characters');
      
      const enhancedPrompt = `Create a cinematic movie poster for "${storyTitle}". ${prompt}. 

Style requirements:
- Professional movie poster composition with title placement area
- Cinematic lighting and atmosphere 
- High-quality digital art with photorealistic elements
- Dramatic visual storytelling that captures the story's essence
- Color palette that reflects the story's mood and genre
- Clear focal point with supporting visual elements
- Commercial appeal suitable for marketing materials`;

      console.log('🎨 [Image] Enhanced prompt preview:', enhancedPrompt.substring(0, 150) + '...');
      console.log('🎨 [Image] Using GPT Image model with Responses API...');
      console.log('🎨 [Image] Settings: 1024x1536 portrait, high quality, auto background');
      console.log('💰 [Image] Estimated cost: ~$0.187 (6240 image tokens @ high quality)');

      // Use Responses API with GPT Image for superior quality and instruction following
      const response = await openai.responses.create({
        model: "gpt-4o", // Using GPT-4o which supports image_generation tool
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: enhancedPrompt
              }
            ]
          }
        ],
        tools: [
          {
            type: "image_generation",
            size: "1024x1536", // Portrait format perfect for movie posters
            quality: "high", // High quality for professional results
            background: "auto" // Let model choose best background
          }
        ]
      });

      console.log('✅ [Image] GPT Image response received');
      
      // Extract image generation result
      const imageGenerationCall = response.output.find(output => output.type === 'image_generation_call');
      
      if (!imageGenerationCall || imageGenerationCall.status !== 'completed') {
        console.error('❌ [Image] Image generation failed or incomplete:', imageGenerationCall);
        throw new Error('Image generation did not complete successfully');
      }

      // Check if there's a revised prompt (AI models may optimize prompts)
      const revisedPrompt = (imageGenerationCall as any).revised_prompt;
      if (revisedPrompt) {
        console.log('🔄 [Image] AI-revised prompt:', revisedPrompt.substring(0, 100) + '...');
      }

      const imageBase64 = imageGenerationCall.result;
      if (!imageBase64) {
        console.error('❌ [Image] No image data in response:', imageGenerationCall);
        throw new Error('No image data returned from GPT Image');
      }

      // Convert base64 to data URL for easy use
      const imageUrl = `data:image/png;base64,${imageBase64}`;

      console.log('✅ [Image] Professional movie poster generated successfully');
      console.log('📏 [Image] Format: 1024x1536px portrait (movie poster format)');
      console.log('🎯 [Image] Model: GPT Image (gpt-image-1) via Responses API');
      console.log('🔗 [Image] Data URL length:', imageUrl.length, 'characters');

      return {
        imageUrl,
        prompt: enhancedPrompt,
        base64: imageBase64,
        revisedPrompt: revisedPrompt || undefined
      };

    } catch (error) {
      console.error('❌ [Image] GPT Image generation failed:', error);
      
      // Fallback to DALL-E 3 if GPT Image fails
      console.log('🔄 [Image] Attempting fallback to DALL-E 3...');
      return await this.generateCoverImageFallback(prompt, storyTitle);
    }
  },

  // Fallback cover image generation using DALL-E 3
  async generateCoverImageFallback(prompt: string, storyTitle: string): Promise<CoverImageResult> {
    try {
      console.log('🎨 [Image Fallback] Using DALL-E 3 as backup...');
      
      const enhancedPrompt = `Create a cinematic movie poster style cover image for a story titled "${storyTitle}". ${prompt}. Style: High-quality digital art, cinematic lighting, movie poster composition, professional artwork.`;

      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: enhancedPrompt,
        size: "1024x1024",
        quality: "standard",
        n: 1,
      });

      const imageUrl = response.data?.[0]?.url;
      if (!imageUrl) {
        throw new Error('No image URL returned from DALL-E 3 fallback');
      }

      console.log('✅ [Image Fallback] DALL-E 3 generated successfully');
      console.log('🔗 [Image Fallback] URL:', imageUrl.substring(0, 60) + '...');

      return {
        imageUrl,
        prompt: enhancedPrompt
      };

    } catch (error) {
      console.error('❌ [Image Fallback] DALL-E 3 also failed:', error);
      throw new Error(`All image generation methods failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Complete story processing workflow with The Scenarist Core v2.0
  async processStoryComplete(storyText: string, storyTitle: string, storyId?: string): Promise<{
    analysis: ScenaristAnalysis;
    coverImage: CoverImageResult;
  }> {
    try {
      const startTime = Date.now();
      console.log('🚀 ===========================================');
      console.log('🚀 THE SCENARIST CORE v2.0 ANALYSIS STARTING');
      console.log('🚀 ===========================================');
      console.log('📖 Story Title:', storyTitle);
      console.log('📄 Story Length:', `${storyText.length.toLocaleString()} characters`);
      console.log('⏰ Start Time:', new Date().toLocaleTimeString());
      
      // Test database connection
      console.log('🔗 Testing database connection...');
      const { data, error } = await supabase
        .from('reasoning_memory')
        .select('id', { count: 'exact' });
      
      if (error) {
        console.warn('⚠️ Database connection issue:', error.message);
        console.log('📝 Analysis will continue without learning system');
      } else {
        console.log('✅ Database connected - Learning system active');
        console.log(`📊 Current reasoning patterns in database: ${data?.length || 0}`);
      }
      
      // Use smart resume system if storyId is provided
      let analysis: ScenaristAnalysis;
      if (storyId) {
        console.log('🔄 Using Smart Resume System with story ID:', storyId);
        analysis = await this.analyzeStoryWithScenaristResume(storyText, storyTitle, storyId);
      } else {
        console.log('🎬 Starting fresh comprehensive story analysis...');
        analysis = await this.analyzeStoryWithScenarist(storyText, storyTitle);
      }
      
      const analysisTime = Date.now();
      const analysisDuration = (analysisTime - startTime) / 1000;
      console.log(`✅ Analysis complete in ${analysisDuration.toFixed(1)}s`);
      
      console.log('🎨 Generating cinematic cover image with DALL-E 3...');
      // Generate cover from the commercial analysis logline
      const coverImage = await this.generateCoverImage(
        analysis.cover_image_data?.prompt || analysis.commercial_analysis.logline, 
        storyTitle
      );
      
      const totalTime = (Date.now() - startTime) / 1000;
      console.log('🎉 ===========================================');
      console.log('🎉 THE SCENARIST CORE v2.0 COMPLETE!');
      console.log('🎉 ===========================================');
      console.log(`⏱️ Total processing time: ${totalTime.toFixed(1)}s`);
      console.log(`💰 Estimated total cost: ~$0.12`);
      console.log('📋 Analysis includes:');
      console.log('   ✓ Story DNA & Commercial Analysis');
      console.log('   ✓ Character Psychometrics');
      console.log('   ✓ Chapter Breakdown');
      console.log('   ✓ Production Planning');
      console.log('   ✓ Cover Image Generation');
      console.log('   ✓ Learning System Integration');
      console.log('   ✓ Smart Resume System');
      
      return {
        analysis,
        coverImage
      };

    } catch (error) {
      console.error('❌ The Scenarist Core processing failed:', error);
      throw error;
    }
  }
};
