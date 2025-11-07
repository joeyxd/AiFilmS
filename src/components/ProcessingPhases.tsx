import { CheckCircle, Clock, XCircle, AlertCircle, Play, RotateCcw, ChevronDown, ChevronRight, Edit, Save, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { workflowService, type StoryWorkflowOverride } from '../services/supabase/workflow';
import ModelSelector from './ModelSelector';

interface PhaseStatus {
  phase: string;
  status: 'completed' | 'failed' | 'in-progress' | 'pending' | 'skipped';
  data?: any;
  error?: string;
  timestamp?: string;
  cost?: number;
  tokens?: {
    input: number;
    output: number;
    reasoning?: number;
  };
}

interface ProcessingPhasesProps {
  phases: Record<string, PhaseStatus>;
  currentPhase?: string;
  onResumeFromPhase?: (phase: string) => void;
  className?: string;
  storyId?: string;
  storyTitle?: string;
  storyText?: string;
}

const PHASE_INFO = {
  phase1_storyDNA: {
    title: 'Story DNA Extraction',
    description: 'Core story analysis with o3 reasoning',
    icon: '🧬',
    estimatedCost: 0.08,
    detailedDescription: 'This phase extracts the fundamental DNA of your story through deep analysis. It identifies genres, themes, narrative structure, pacing patterns, dialogue style, and visual atmosphere. The AI agent analyzes the entire story holistically to create a foundation for all subsequent creative phases.',
    agentName: 'The Scenarist Core (Agent S-1X)',
    defaultPrompt: `You are The Scenarist Core (Agent S-1X) in PHASE 1: Story DNA Extraction.

CRITICAL: Your analysis will guide Agent 2 (Creative Scripter) in creating authentic scenes. Focus on elements that inform scene writing: dialogue style, visual atmosphere, pacing rhythm.

Your mission is to consume the entire story and extract its core narrative DNA without breaking it down into chapters yet.

Story Title: "{storyTitle}"
Story Text: "{storyText}"

Analyze the story holistically and return ONLY this JSON structure:

{
  "story_metadata": {
    "title": "{storyTitle}",
    "estimated_runtime_minutes": 90,
    "target_audience": "Young Adult",
    "content_rating": "PG-13",
    "genre_primary": "Adventure",
    "genre_secondary": "Fantasy",
    "themes": ["friendship", "courage", "self-discovery"],
    "setting_time_period": "Contemporary",
    "setting_location": "Urban Fantasy World",
    "narrative_perspective": "Third Person Limited",
    "tone": "Optimistic with dramatic moments"
  },
  "character_analysis": {
    "main_characters": [
      {
        "name": "Character Name",
        "role": "Protagonist",
        "age_range": "16-18",
        "personality_traits": ["brave", "curious", "loyal"],
        "character_arc": "Growth from uncertainty to confidence",
        "motivations": "Primary driving force",
        "conflicts": "Internal and external challenges"
      }
    ],
    "character_dynamics": "How characters interact and influence each other"
  },
  "narrative_structure": {
    "story_structure": "Three-Act Structure",
    "pacing_rhythm": "Fast-paced with contemplative moments",
    "dialogue_style": "Natural, character-specific",
    "narrative_techniques": ["Show don't tell", "Emotional beats"],
    "visual_atmosphere": "Vivid, cinematic descriptions"
  },
  "creative_elements": {
    "unique_selling_points": ["What makes this story special"],
    "memorable_moments": ["Key scenes that define the story"],
    "emotional_beats": ["Joy", "Tension", "Resolution"],
    "visual_motifs": ["Recurring visual elements"]
  }
}`
  },
  phase2_commercial: {
    title: 'Commercial Viability Analysis',
    description: 'Market assessment and audience targeting',
    icon: '📊',
    estimatedCost: 0.05,
    detailedDescription: 'This phase evaluates the commercial potential of your story in the current market. It analyzes comparable films, identifies target demographics, assesses marketability factors, and provides strategic recommendations for positioning and promotion.',
    agentName: 'Market Analytics Engine (Agent M-2A)',
    defaultPrompt: `You are the Market Analytics Engine (Agent M-2A) in PHASE 2: Commercial Viability Analysis.

Based on the Story DNA from Phase 1, analyze the commercial potential and market positioning.

Story Title: "{storyTitle}"
Story DNA: {phase1Data}

Return ONLY this JSON structure:

{
  "commercial_assessment": {
    "marketability_score": 8.5,
    "target_audience": {
      "primary": "Young Adults (16-25)",
      "secondary": "Fantasy enthusiasts",
      "demographics": "Global audience with strong appeal in North America and Europe"
    },
    "comparable_films": [
      {
        "title": "Similar Movie",
        "year": 2023,
        "box_office": "$500M worldwide",
        "similarities": "Themes, tone, target audience"
      }
    ],
    "market_positioning": "Unique blend of adventure and fantasy",
    "revenue_potential": "High commercial appeal with franchise potential",
    "distribution_strategy": "Wide theatrical release with streaming follow-up"
  },
  "competitive_analysis": {
    "strengths": ["Unique premise", "Strong characters"],
    "market_gaps": "Opportunities this story fills",
    "differentiation": "What sets it apart from competitors"
  },
  "marketing_recommendations": {
    "key_selling_points": ["Main marketing angles"],
    "promotional_strategies": ["Social media", "Partnerships"],
    "merchandising_potential": "High - characters and world-building"
  }
}`
  },
  phase3_characters: {
    title: 'Character Development',
    description: 'Deep character psychology and development arcs',
    icon: '👥',
    estimatedCost: 0.07,
    detailedDescription: 'This phase creates comprehensive psychological profiles for all major characters. It defines their backstories, motivations, character arcs, relationships, and specific dialogue patterns that will guide the scriptwriting process.',
    agentName: 'Character Psychology Specialist (Agent C-3P)',
    defaultPrompt: `You are the Character Psychology Specialist (Agent C-3P) in PHASE 3: Character Development.

Using the Story DNA analysis, create detailed psychological profiles and development arcs.

Story Title: "{storyTitle}"
Previous Analysis: {previousData}

Return ONLY this JSON structure:

{
  "character_profiles": [
    {
      "name": "Character Name",
      "role": "Protagonist/Antagonist/Supporting",
      "psychological_profile": {
        "personality_type": "MBTI or description",
        "core_traits": ["trait1", "trait2", "trait3"],
        "fears": ["primary fear", "secondary fears"],
        "desires": ["what they want", "what they need"],
        "flaws": ["character flaws that create conflict"],
        "strengths": ["abilities and positive traits"]
      },
      "backstory": {
        "background": "Key background information",
        "formative_events": ["events that shaped them"],
        "relationships": "Important relationships"
      },
      "character_arc": {
        "starting_point": "Where they begin",
        "transformation": "How they change",
        "ending_point": "Where they end up",
        "key_moments": ["pivotal character moments"]
      },
      "dialogue_style": {
        "speech_patterns": "How they speak",
        "vocabulary": "Word choice and complexity",
        "emotional_range": "How they express emotions"
      }
    }
  ],
  "character_relationships": {
    "dynamics": "How characters interact",
    "conflicts": "Interpersonal tensions",
    "alliances": "Bonds and partnerships",
    "romantic_elements": "If applicable"
  }
}`
  },
  phase4_narrative: {
    title: 'Narrative Architecture',
    description: 'Detailed story structure and scene breakdown',
    icon: '🏗️',
    estimatedCost: 0.09,
    detailedDescription: 'This phase constructs the detailed narrative architecture of your story. It breaks down the story into acts, sequences, and individual scenes with specific purposes, conflicts, and character development moments.',
    agentName: 'Narrative Architect (Agent N-4A)',
    defaultPrompt: `You are the Narrative Architect (Agent N-4A) in PHASE 4: Narrative Architecture.

Create a detailed scene-by-scene breakdown based on all previous analyses.

Story Title: "{storyTitle}"
All Previous Data: {allPreviousData}

Return ONLY this JSON structure:

{
  "narrative_structure": {
    "total_scenes": 45,
    "estimated_runtime": "90-105 minutes",
    "acts": [
      {
        "act_number": 1,
        "act_title": "Setup",
        "duration_minutes": "25-30",
        "purpose": "Establish world, characters, and inciting incident",
        "key_scenes": [
          {
            "scene_number": 1,
            "scene_title": "Opening Scene",
            "location": "Setting description",
            "time_of_day": "Morning/Afternoon/Night",
            "characters": ["Character 1", "Character 2"],
            "purpose": "What this scene accomplishes",
            "conflict": "Scene conflict or tension",
            "emotional_tone": "Mood/feeling",
            "key_events": ["Event 1", "Event 2"],
            "dialogue_focus": "What kind of dialogue",
            "visual_elements": "Key visual components",
            "runtime_estimate": "2-3 minutes"
          }
        ]
      }
    ]
  },
  "pacing_analysis": {
    "rhythm": "Overall pacing strategy",
    "tension_peaks": ["Scene numbers with high tension"],
    "quiet_moments": ["Character development scenes"],
    "climax_positioning": "Where the climax occurs"
  }
}`
  },
  phase5_production: {
    title: 'Production Planning',
    description: 'Technical production requirements and logistics',
    icon: '🎬',
    estimatedCost: 0.06,
    detailedDescription: 'This phase translates the creative vision into practical production requirements. It includes location scouting needs, technical specifications, budget considerations, and filming logistics.',
    agentName: 'Production Coordinator (Agent P-5C)',
    defaultPrompt: `You are the Production Coordinator (Agent P-5C) in PHASE 5: Production Planning.

Translate the narrative architecture into production requirements.

Story Title: "{storyTitle}"
Narrative Architecture: {narrativeData}

Return ONLY this JSON structure:

{
  "production_requirements": {
    "locations": [
      {
        "location_type": "Interior/Exterior",
        "description": "Detailed location description",
        "scenes": ["Scene numbers using this location"],
        "technical_requirements": ["Special equipment needed"],
        "logistical_notes": "Access, permits, challenges"
      }
    ],
    "technical_specs": {
      "camera_style": "Handheld/Steadicam/Static",
      "lighting_style": "Natural/Dramatic/Soft",
      "color_palette": "Warm/Cool/Neutral tones",
      "visual_effects": ["VFX requirements"],
      "special_equipment": ["Drones", "Cranes", "etc."]
    },
    "schedule_considerations": {
      "total_shoot_days": 25,
      "location_grouping": "How to group scenes efficiently",
      "weather_dependencies": ["Outdoor scenes requiring specific weather"],
      "actor_availability": "Key scheduling considerations"
    }
  },
  "budget_breakdown": {
    "estimated_total": "$2.5M - $4M",
    "major_categories": {
      "above_line": "Director, actors, producers",
      "below_line": "Crew, equipment, locations",
      "post_production": "Editing, VFX, sound",
      "contingency": "10-15% buffer"
    }
  }
}`
  },
  phase6_cover: {
    title: 'Cover Image Generation',
    description: 'AI-generated promotional cover artwork',
    icon: '🎨',
    estimatedCost: 0.03,
    detailedDescription: 'This final phase creates compelling cover artwork that captures the essence of your story. Using all the analysis from previous phases, it generates professional-quality promotional images suitable for posters, thumbnails, and marketing materials.',
    agentName: 'Visual Design Engine (Agent V-6D)',
    defaultPrompt: `You are the Visual Design Engine (Agent V-6D) in PHASE 6: Cover Image Generation.

Create compelling cover image prompts based on all story analysis.

Story Title: "{storyTitle}"
Complete Story Analysis: {allData}

Return a detailed image generation prompt that will create a compelling cover image.`
  }
};

export default function ProcessingPhases({ 
  phases, 
  currentPhase, 
  onResumeFromPhase,
  className = '',
  storyId,
  storyTitle,
  storyText 
}: ProcessingPhasesProps) {
  const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>({});
  const [editingPrompt, setEditingPrompt] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [phaseModels, setPhaseModels] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Load existing phase models when component mounts or storyId changes
  useEffect(() => {
    const loadPhaseModels = async () => {
      if (!storyId) return;
      
      try {
        const overrides = await workflowService.getStoryWorkflowOverrides(storyId);
        const modelMap: Record<string, string> = {};
        
        overrides.forEach(override => {
          if (override.selected_model) {
            modelMap[override.step_name] = override.selected_model;
          }
        });
        
        setPhaseModels(modelMap);
        console.log('Loaded phase models:', modelMap);
      } catch (error) {
        console.error('Error loading phase models:', error);
      }
    };

    loadPhaseModels();
  }, [storyId]);

  const togglePhaseExpansion = (phaseKey: string) => {
    setExpandedPhases(prev => ({
      ...prev,
      [phaseKey]: !prev[phaseKey]
    }));
  };

  const getStatusIcon = (status: string, isCurrentPhase: boolean) => {
    if (isCurrentPhase && status !== 'completed') {
      return <Clock className="animate-spin text-blue-400" size={20} />;
    }
    
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-400" size={20} />;
      case 'failed':
        return <XCircle className="text-red-400" size={20} />;
      case 'in-progress':
        return <Clock className="animate-spin text-blue-400" size={20} />;
      case 'skipped':
        return <AlertCircle className="text-yellow-400" size={20} />;
      default:
        return <Clock className="text-gray-400" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-green-500/30 bg-green-500/5';
      case 'failed':
        return 'border-red-500/30 bg-red-500/5';
      case 'in-progress':
        return 'border-blue-500/30 bg-blue-500/5';
      case 'skipped':
        return 'border-yellow-500/30 bg-yellow-500/5';
      default:
        return 'border-gray-600/30 bg-gray-800/20';
    }
  };

  const formatCost = (cost: number) => {
    return `$${cost.toFixed(3)}`;
  };

  const formatTokens = (tokens: { input: number; output: number; reasoning?: number }) => {
    const total = tokens.input + tokens.output + (tokens.reasoning || 0);
    return {
      total: total.toLocaleString(),
      breakdown: `${tokens.input.toLocaleString()} in + ${tokens.output.toLocaleString()} out${tokens.reasoning ? ` + ${tokens.reasoning.toLocaleString()} reasoning` : ''}`
    };
  };

  const handleEditPrompt = async (phaseKey: string) => {
    console.log('handleEditPrompt called with phaseKey:', phaseKey);
    if (!storyId) {
      console.log('No storyId available');
      return;
    }
    
    try {
      const overrides = await workflowService.getStoryWorkflowOverrides(storyId);
      const phaseOverride = overrides.find(o => o.step_name === phaseKey);
      
      setCustomPrompt(phaseOverride?.agent_prompt || (PHASE_INFO as any)[phaseKey]?.defaultPrompt || '');
      setSelectedModel(phaseOverride?.selected_model || '');
      setEditingPrompt(phaseKey);
      console.log('Edit prompt modal should open for phase:', phaseKey);
    } catch (error) {
      console.error('Error loading workflow overrides:', error);
    }
  };

  const handleSavePrompt = async () => {
    if (!editingPrompt || !storyId) return;
    
    setSaving(true);
    try {
      const override: StoryWorkflowOverride = {
        story_id: storyId,
        step_name: editingPrompt,
        agent_prompt: customPrompt,
        selected_model: selectedModel || undefined,
        is_enabled: true
      };
      
      await workflowService.saveStoryWorkflowOverride(override);
      setEditingPrompt(null);
      setSelectedModel('');
      console.log('Prompt and model saved successfully for phase:', editingPrompt);
    } catch (error) {
      console.error('Error saving workflow override:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSavePhaseModel = async (phaseKey: string, modelId: string) => {
    if (!storyId) return;
    
    try {
      const override: StoryWorkflowOverride = {
        story_id: storyId,
        step_name: phaseKey,
        agent_prompt: '', // Keep existing prompt
        selected_model: modelId || undefined,
        is_enabled: true
      };
      
      await workflowService.saveStoryWorkflowOverride(override);
      console.log('Model saved for phase:', phaseKey, 'Model:', modelId);
    } catch (error) {
      console.error('Error saving phase model:', error);
    }
  };

  const renderPhaseData = (phaseKey: string, data: any) => {
    if (!data) return null;

    // Handle different data structures based on phase
    switch (phaseKey) {
      case 'phase1_storyDNA':
        return (
          <div className="space-y-4">
            {/* Story Metadata */}
            {data.story_metadata && (
              <div>
                <h6 className="text-sm font-medium text-blue-300 mb-2">Story Metadata</h6>
                <div className="bg-gray-800/30 rounded-lg p-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-400">Runtime:</span> <span className="text-white">{data.story_metadata.estimated_runtime_minutes || 'N/A'} min</span></div>
                    <div><span className="text-gray-400">Rating:</span> <span className="text-white">{data.story_metadata.content_rating || 'N/A'}</span></div>
                    <div><span className="text-gray-400">Primary Genre:</span> <span className="text-white">{data.story_metadata.genre_primary || 'N/A'}</span></div>
                    <div><span className="text-gray-400">Secondary Genre:</span> <span className="text-white">{data.story_metadata.genre_secondary || 'N/A'}</span></div>
                  </div>
                  {data.story_metadata.themes && (
                    <div>
                      <span className="text-gray-400 text-sm">Themes:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {data.story_metadata.themes.map((theme: string, index: number) => (
                          <span key={index} className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs">
                            {theme}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Character Analysis */}
            {data.character_analysis && (
              <div>
                <h6 className="text-sm font-medium text-blue-300 mb-2">Character Analysis</h6>
                <div className="bg-gray-800/30 rounded-lg p-3">
                  {data.character_analysis.main_characters && data.character_analysis.main_characters.length > 0 ? (
                    <div className="space-y-2">
                      {data.character_analysis.main_characters.slice(0, 3).map((char: any, index: number) => (
                        <div key={index} className="border-l-2 border-blue-500/30 pl-3">
                          <div className="text-sm font-medium text-white">{char.name}</div>
                          <div className="text-xs text-gray-400">{char.role} • {char.age_range}</div>
                          {char.personality_traits && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {char.personality_traits.slice(0, 3).map((trait: string, i: number) => (
                                <span key={i} className="bg-green-500/20 text-green-300 px-1 py-0.5 rounded text-xs">
                                  {trait}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400">No character data available</div>
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case 'phase2_commercial':
        return (
          <div className="space-y-4">
            {/* Commercial Assessment */}
            {data.commercial_assessment && (
              <div>
                <h6 className="text-sm font-medium text-blue-300 mb-2">Commercial Assessment</h6>
                <div className="bg-gray-800/30 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Marketability Score:</span>
                    <span className="text-white font-medium">{data.commercial_assessment.marketability_score}/10</span>
                  </div>
                  {data.commercial_assessment.target_audience && (
                    <div>
                      <span className="text-gray-400 text-sm">Target Audience:</span>
                      <div className="text-white text-sm mt-1">{data.commercial_assessment.target_audience.primary}</div>
                    </div>
                  )}
                  {data.commercial_assessment.comparable_films && (
                    <div>
                      <span className="text-gray-400 text-sm">Comparable Films:</span>
                      <div className="space-y-1 mt-1">
                        {data.commercial_assessment.comparable_films.slice(0, 2).map((film: any, index: number) => (
                          <div key={index} className="text-sm text-white">
                            • {film.title} ({film.year})
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case 'phase3_characters':
        return (
          <div className="space-y-4">
            {/* Character Profiles */}
            {data.character_profiles && (
              <div>
                <h6 className="text-sm font-medium text-blue-300 mb-2">Character Profiles</h6>
                <div className="space-y-3">
                  {data.character_profiles.slice(0, 3).map((char: any, index: number) => (
                    <div key={index} className="bg-gray-800/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium text-white">{char.name}</div>
                        <div className="text-xs text-gray-400">{char.role}</div>
                      </div>
                      {char.psychological_profile && (
                        <div className="space-y-1">
                          <div className="text-xs text-gray-400">Core Traits:</div>
                          {char.psychological_profile.core_traits && (
                            <div className="flex flex-wrap gap-1">
                              {char.psychological_profile.core_traits.slice(0, 3).map((trait: string, i: number) => (
                                <span key={i} className="bg-indigo-500/20 text-indigo-300 px-1 py-0.5 rounded text-xs">
                                  {trait}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'phase4_narrative':
        return (
          <div className="space-y-4">
            {/* Narrative Structure */}
            {data.narrative_structure && (
              <div>
                <h6 className="text-sm font-medium text-blue-300 mb-2">Narrative Structure</h6>
                <div className="bg-gray-800/30 rounded-lg p-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-400">Total Scenes:</span> <span className="text-white">{data.narrative_structure.total_scenes || 'N/A'}</span></div>
                    <div><span className="text-gray-400">Runtime:</span> <span className="text-white">{data.narrative_structure.estimated_runtime || 'N/A'}</span></div>
                  </div>
                  {data.narrative_structure.acts && data.narrative_structure.acts.length > 0 && (
                    <div>
                      <span className="text-gray-400 text-sm">Act Structure:</span>
                      <div className="space-y-1 mt-1">
                        {data.narrative_structure.acts.slice(0, 3).map((act: any, index: number) => (
                          <div key={index} className="text-sm">
                            <span className="text-white">Act {act.act_number}: {act.act_title}</span>
                            <span className="text-gray-400 ml-2">({act.duration_minutes})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case 'phase5_production':
        return (
          <div className="space-y-4">
            {/* Production Requirements */}
            {data.production_requirements && (
              <div>
                <h6 className="text-sm font-medium text-blue-300 mb-2">Production Requirements</h6>
                <div className="bg-gray-800/30 rounded-lg p-3 space-y-2">
                  {data.production_requirements.locations && (
                    <div>
                      <span className="text-gray-400 text-sm">Key Locations:</span>
                      <div className="space-y-1 mt-1">
                        {data.production_requirements.locations.slice(0, 3).map((loc: any, index: number) => (
                          <div key={index} className="text-sm text-white">
                            • {loc.location_type}: {loc.description}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {data.budget_breakdown && (
                    <div>
                      <span className="text-gray-400 text-sm">Estimated Budget:</span>
                      <div className="text-white text-sm mt-1">{data.budget_breakdown.estimated_total}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case 'phase6_cover':
        return (
          <div className="space-y-4">
            {/* Cover Image Details */}
            {data.image_url && (
              <div>
                <h6 className="text-sm font-medium text-blue-300 mb-2">Generated Cover Image</h6>
                <div className="bg-gray-800/30 rounded-lg p-3">
                  <img src={data.image_url} alt="Story Cover" className="w-full max-w-xs rounded-lg" />
                </div>
              </div>
            )}
            {data.prompt && (
              <div>
                <h6 className="text-sm font-medium text-blue-300 mb-2">Image Generation Prompt</h6>
                <div className="bg-gray-800/30 rounded-lg p-3">
                  <div className="text-sm text-gray-300 font-mono">{data.prompt}</div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        // Fallback for any unhandled data structure
        return (
          <div className="bg-gray-800/30 rounded-lg p-3">
            <pre className="text-xs text-gray-300 overflow-auto max-h-40">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        );
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <RotateCcw size={20} className="text-blue-400" />
        Processing Phases
      </h3>

      {Object.entries(PHASE_INFO).map(([phaseKey, info]) => {
        const phase = phases[phaseKey];
        const isCurrentPhase = currentPhase === phaseKey;
        const status = phase?.status || 'pending';

        return (
          <div
            key={phaseKey}
            className={`
              border rounded-lg p-4 transition-all duration-200
              ${getStatusColor(status)}
              ${isCurrentPhase ? 'ring-2 ring-blue-400/50' : ''}
            `}
          >
            {/* Phase Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{info.icon}</div>
                <div>
                  <h4 className="text-white font-medium flex items-center gap-2">
                    {info.title}
                    {getStatusIcon(status, isCurrentPhase)}
                  </h4>
                  <p className="text-sm text-gray-300">{info.description}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Cost and tokens display */}
                {phase?.cost && (
                  <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded">
                    {formatCost(phase.cost)}
                  </span>
                )}
                {phase?.tokens && (
                  <span className="text-xs text-blue-400 bg-blue-400/10 px-2 py-1 rounded">
                    {formatTokens(phase.tokens).total} tokens
                  </span>
                )}
                
                {/* Expand/Collapse button */}
                <button
                  onClick={() => togglePhaseExpansion(phaseKey)}
                  className="p-1 hover:bg-gray-700/50 rounded transition-colors"
                >
                  {expandedPhases[phaseKey] ? 
                    <ChevronDown size={16} className="text-gray-400" /> :
                    <ChevronRight size={16} className="text-gray-400" />
                  }
                </button>
              </div>
            </div>

            {/* Error display */}
            {phase?.error && (
              <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="text-red-400 text-sm font-medium mb-1">Error:</div>
                <div className="text-red-300 text-sm">{phase.error}</div>
              </div>
            )}

            {/* Resume button for failed/pending phases */}
            {onResumeFromPhase && (status === 'failed' || status === 'pending') && (
              <div className="mt-3">
                <button
                  onClick={() => onResumeFromPhase(phaseKey)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors flex items-center gap-1"
                >
                  <Play size={14} />
                  {status === 'failed' ? 'Retry Phase' : 'Start Phase'}
                </button>
              </div>
            )}

            {/* Expanded Phase Details */}
            {expandedPhases[phaseKey] && (
              <div className="mt-4 pt-4 border-t border-gray-700/50">
                {/* Detailed Description */}
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-white mb-2">What This Phase Does:</h5>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {info.detailedDescription}
                  </p>
                </div>

                {/* Agent Information */}
                {info.agentName && (
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-white mb-2">AI Agent:</h5>
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-300 font-medium">{info.agentName}</span>
                        <button
                          onClick={() => handleEditPrompt(phaseKey)}
                          className="text-xs text-gray-400 hover:text-white flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-700/50 transition-colors"
                        >
                          <Edit size={12} />
                          Customize Agent
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Model Selection */}
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-white mb-2">Model Selection:</h5>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <ModelSelector 
                      selectedModel={phaseModels[phaseKey] || ''}
                      onModelChange={(model) => {
                        setPhaseModels(prev => ({ ...prev, [phaseKey]: model }));
                        handleSavePhaseModel(phaseKey, model);
                      }}
                      label="Select Model for this Phase"
                      className="w-full"
                      showDefault={true}
                    />
                  </div>
                </div>

                {/* Processing Flow */}
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-white mb-2">Processing Flow:</h5>
                  <div className="bg-gray-800/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">Input</span>
                      <span>Story Text</span>
                      <span className="text-gray-500">→</span>
                      <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs">{info.agentName || 'AI Agent'}</span>
                      <span className="text-gray-500">→</span>
                      <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs">Structured Output</span>
                    </div>
                  </div>
                </div>

                {/* Phase Data Display */}
                {phase?.data && (
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-white mb-2">Analysis Results:</h5>
                    {renderPhaseData(phaseKey, phase.data)}
                  </div>
                )}

                {/* Performance Metrics */}
                {(phase?.cost || phase?.tokens || phase?.timestamp) && (
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-white mb-2">Performance Metrics:</h5>
                    <div className="bg-gray-800/30 rounded-lg p-3 grid grid-cols-2 gap-2 text-sm">
                      {phase.cost && (
                        <div>
                          <span className="text-gray-400">Cost:</span>
                          <span className="text-green-400 ml-2">{formatCost(phase.cost)}</span>
                        </div>
                      )}
                      {phase.tokens && (
                        <div>
                          <span className="text-gray-400">Tokens:</span>
                          <span className="text-blue-400 ml-2">{formatTokens(phase.tokens).total}</span>
                        </div>
                      )}
                      {phase.timestamp && (
                        <div className="col-span-2">
                          <span className="text-gray-400">Completed:</span>
                          <span className="text-white ml-2">{new Date(phase.timestamp).toLocaleString()}</span>
                        </div>
                      )}
                      {phase.tokens && (
                        <div className="col-span-2 text-xs text-gray-500">
                          {formatTokens(phase.tokens).breakdown}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Prompt Editing Modal */}
            {editingPrompt === phaseKey && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                <div className="bg-gray-900 rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">
                      Customize Agent Prompt - {info.title}
                    </h3>
                    <button
                      onClick={() => setEditingPrompt(null)}
                      className="p-2 hover:bg-gray-700/50 rounded transition-colors"
                    >
                      <X size={20} className="text-gray-400" />
                    </button>
                  </div>
                  
                  <div className="mb-4">
                    <ModelSelector 
                      selectedModel={selectedModel}
                      onModelChange={setSelectedModel}
                      label="Model Override (Optional)"
                      className="mb-4"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-white mb-2">
                      Custom Prompt:
                    </label>
                    <textarea
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      rows={15}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm font-mono resize-none"
                      placeholder="Enter your custom prompt..."
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingPrompt(null)}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSavePrompt}
                      disabled={saving}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Save size={16} />
                      {saving ? 'Saving...' : 'Save Custom Prompt'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Resume All Button */}
      {onResumeFromPhase && Object.values(phases).some(p => p.status === 'failed' || p.status === 'pending') && (
        <button
          onClick={() => {
            // Find first failed or pending phase
            const nextPhase = Object.entries(phases).find(([_, phase]) => 
              phase.status === 'failed' || phase.status === 'pending'
            );
            if (nextPhase) {
              onResumeFromPhase(nextPhase[0]);
            }
          }}
          className="w-full mt-4 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Play size={16} />
          Resume Processing from Next Pending Phase
        </button>
      )}
      
      {/* Complete All Phases Button */}
      {onResumeFromPhase && Object.values(phases).every(p => p.status === 'pending') && (
        <button
          onClick={() => {
            // Start from phase 1
            onResumeFromPhase('phase1_storyDNA');
          }}
          className="w-full mt-4 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Play size={16} />
          Execute All Phases (Complete Analysis)
        </button>
      )}
    </div>
  );
}