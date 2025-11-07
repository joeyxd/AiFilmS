import { useState, useEffect } from 'react';
import { X, Calendar, Trash2, AlertTriangle, PlayCircle, RotateCcw, MessageCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { storiesService } from '../services/supabase/stories';
import ProcessingTerminal, { useProcessingTerminal } from './ProcessingTerminal';
import ProcessingPhases from './ProcessingPhases';
import AIConversationViewer from './AIConversationViewer';
import AuracleLogo from './AuracleLogo';

interface StoryDetailModalProps {
  storyId: string;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (storyId: string) => void;
}

interface StoryDetails {
  id: string;
  title: string;
  logline?: string;
  genre?: string;
  status: string;
  cover_image_url?: string;
  created_at: string;
  updated_at?: string;
  full_story_text?: string; // Add this for processing
  target_audience?: string; // Add this for processing
  processing_phases?: Record<string, any>;
  processing_metadata?: any;
  last_processing_error?: string;
  processing_resumed_count?: number;
  
  // Phase 1: Story DNA & Commercial Analysis
  story_metadata?: {
    title?: string;
    language?: string;
    structure_detected?: string;
    genres?: Array<{ label: string; confidence: number }>;
    themes?: string[];
    motifs?: string[];
    pacing_curve?: Array<{ segment: number; action: number; dialogue: number; introspection: number }>;
    timeline_notes?: string;
    overall_tone?: string;
    dialogue_style?: string;
    visual_atmosphere?: string;
  };
  commercial_analysis?: {
    logline?: string;
    comparable_films?: string[];
    target_audience?: string;
    marketability_score?: number;
    franchise_potential?: string;
    marketing_angles?: string[];
    genre_conventions?: string;
  };
  
  // Phase 2: Character Analysis
  characters_analysis?: {
    main_characters?: any[];
    character_dynamics?: any;
    character_arcs?: any[];
  };
  
  // Phase 3: Narrative Architecture  
  narrative_architecture?: {
    act_structure?: any;
    pacing_analysis?: any;
    conflict_resolution?: any;
    plot_cohesion_score?: number;
  };
  
  // Phase 4: Production Planning
  production_blueprint?: {
    estimated_duration?: string;
    scene_count?: number;
    location_count?: number;
    production_complexity?: string;
    budget_tier?: string;
  };
  
  ai_analysis_metadata?: {
    chapters_count?: number;
    characters_count?: number;
    agent_version?: string;
    processed_at?: string;
    cover_image_prompt?: string;
    style_applied?: string;
  };
  chapters: Array<{
    id: string;
    chapter_title: string;
    chapter_summary: string;
    estimated_film_time: number;
    mood_tone: string;
  }>;
  characters: Array<{
    id: string;
    character_name: string;
    role_in_story: string;
    physical_description: string;
  }>;
}

export default function StoryDetailModal({ storyId, isOpen, onClose, onDelete }: StoryDetailModalProps) {
  const [story, setStory] = useState<StoryDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'processing' | 'conversations' | 'data'>('overview');
  
  // Expandable sections state
  const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>({});
  
  const handleClose = () => {
    // Restore body scroll before closing
    document.body.style.overflow = 'unset';
    document.body.style.paddingRight = '';
    onClose();
  };

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleWheelEvent = (e: React.WheelEvent) => {
    // Prevent wheel events from propagating to background
    e.stopPropagation();
  };

  const togglePhaseExpansion = (phaseKey: string) => {
    setExpandedPhases(prev => ({
      ...prev,
      [phaseKey]: !prev[phaseKey]
    }));
  };
  
  // Processing terminal state
  const {
    messages,
    isProcessing,
    addMessage,
    clearMessages,
    startProcessing,
    stopProcessing,
    completeProcessing,
    errorProcessing
  } = useProcessingTerminal();

  useEffect(() => {
    if (isOpen && storyId) {
      loadStoryDetails();
      
      // Lock body scroll when modal opens
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '17px'; // Compensate for scrollbar width
      
      // Return cleanup function
      return () => {
        document.body.style.overflow = originalStyle;
        document.body.style.paddingRight = '';
      };
    } else if (!isOpen) {
      // Restore body scroll when modal closes
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '';
    }
  }, [isOpen, storyId]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Lock body scroll
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Restore body scroll when modal closes
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  const loadStoryDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get story details
      const { data: storyData, error: storyError } = await storiesService.getStoryById(storyId);
      if (storyError) throw storyError;

      // Get chapters
      const { data: chaptersData, error: chaptersError } = await storiesService.getStoryChapters(storyId);
      if (chaptersError) throw chaptersError;

      // Get characters  
      const { data: charactersData, error: charactersError } = await storiesService.getStoryCharacters(storyId);
      if (charactersError) throw charactersError;

      setStory({
        ...storyData,
        chapters: chaptersData || [],
        characters: charactersData || []
      } as StoryDetails);

      // Debug: Log what data we actually received
      console.log('📊 Story Data Loaded:', {
        story: storyData,
        chapters: chaptersData?.length || 0,
        characters: charactersData?.length || 0,
        processing_phases: storyData?.processing_phases,
        ai_analysis_metadata: storyData?.ai_analysis_metadata,
        status: storyData?.status,
        story_metadata: !!storyData?.story_metadata,
        commercial_analysis: !!storyData?.commercial_analysis,
        story_metadata_keys: storyData?.story_metadata ? Object.keys(storyData.story_metadata) : [],
        commercial_analysis_keys: storyData?.commercial_analysis ? Object.keys(storyData.commercial_analysis) : []
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load story details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!story) return;
    
    setDeleting(true);
    try {
      const result = await storiesService.deleteStoryComplete(story.id);
      
      if (result.success) {
        console.log('🎉 Story deleted:', result.deletedData);
        onDelete?.(story.id);
        handleClose(); // Use handleClose to restore scroll
      } else {
        setError(result.error?.message || 'Failed to delete story');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete story');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleResumeProcessing = async (fromPhase?: string) => {
    if (!story) return;

    startProcessing();
    clearMessages();
    
    try {
      addMessage('info', `🔄 Resuming processing for "${story.title}"${fromPhase ? ` from ${fromPhase}` : ''}...`);
      addMessage('info', '💰 Estimated cost: ~$0.08-0.12 depending on phases needed');
      addMessage('info', '🛡️ AI Conversation logging ACTIVE - all interactions will be captured');
      
      // REAL PROCESSING - Call the actual story analyzer service
      addMessage('processing', '🚀 Starting AI analysis with conversation logging...', '🚀');
      
      // Import and call the real story service
      const { storiesService } = await import('../services/supabase/stories');
      
      if (!story.full_story_text) {
        addMessage('error', '❌ No story text found - cannot process', '❌');
        completeProcessing();
        return;
      }
      
      addMessage('processing', '🧠 Initializing The Scenarist Core v2.0...', '🚀');
      
      // Use the existing createStoryWithAI method but for resuming
      // This will trigger real OpenAI calls with conversation logging
      const result = await storiesService.createStoryWithAI({
        title: story.title,
        full_story_text: story.full_story_text,
        logline: story.logline || undefined,
        genre: story.genre || undefined,
        target_audience: story.target_audience || undefined
      });
      
      if (result.error) {
        addMessage('error', `❌ Processing failed: ${result.error.message}`, '❌');
        addMessage('info', '🛡️ Check browser console for conversation logs even if processing failed');
      } else {
        addMessage('success', '✅ Processing completed successfully!', '✨');
        addMessage('success', `📊 Generated ${result.chapters?.length || 0} chapters`, '📖');
        addMessage('success', `🎭 Analyzed ${result.characters?.length || 0} characters`, '🎭');
        if (result.coverImageUrl) {
          addMessage('success', '🎨 Cover image generated', '🖼️');
        }
        addMessage('info', '💬 Check AI Conversations tab to see all OpenAI interactions');
      }
      
      completeProcessing();
      
      // Reload story data to show updated results
      loadStoryDetails();

    } catch (err) {
      errorProcessing(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleExecutePhase = async (phaseKey: string) => {
    if (!story) return;

    startProcessing();
    clearMessages();
    
    try {
      addMessage('info', `🎯 Executing ${phaseKey} for "${story.title}"...`);
      
      // Import the story analyzer directly for individual phase execution
      const { openaiService } = await import('../services/openai/storyAnalyzer');
      
      if (!story.full_story_text) {
        addMessage('error', '❌ No story text found - cannot process phase', '❌');
        completeProcessing();
        return;
      }

      let result;
      
      switch (phaseKey) {
        case 'phase1_storyDNA':
          addMessage('processing', '🧬 Executing Phase 1: Story DNA Extraction...', '🧬');
          result = await openaiService.analyzeStoryWithScenarist(story.full_story_text, story.title);
          break;
          
        case 'phase2_commercial':
          addMessage('processing', '📊 Executing Phase 2: Commercial Viability Analysis...', '📊');
          if (!story.story_metadata) {
            addMessage('error', '❌ Phase 1 data required for Phase 2', '❌');
            completeProcessing();
            return;
          }
          // Implementation needed: call commercial analysis service
          addMessage('info', '⚠️ Phase 2 individual execution needs implementation', '⚠️');
          addMessage('info', 'Use "Resume Processing" to run all phases together', '💡');
          break;
          
        case 'phase3_characters':
          addMessage('processing', '🎭 Executing Phase 3: Character Development...', '🎭');
          if (!story.story_metadata) {
            addMessage('error', '❌ Phase 1 data required for Phase 3', '❌');
            completeProcessing();
            return;
          }
          result = await openaiService.phase2_characterPsychometrics(
            story.full_story_text, 
            story.story_metadata,
            story.commercial_analysis // Pass phase 1 context
          );
          break;
          
        case 'phase4_narrative':
          addMessage('processing', '�️ Executing Phase 4: Narrative Architecture...', '�️');
          if (!story.story_metadata || !story.characters) {
            addMessage('error', '❌ Phase 1 & 3 data required for Phase 4', '❌');
            completeProcessing();
            return;
          }
          result = await openaiService.phase3_rhythmicDeconstruction(
            story.full_story_text,
            story.story_metadata,
            story.characters
          );
          break;
          
        case 'phase5_production':
          addMessage('processing', '� Executing Phase 5: Production Planning...', '�');
          if (!story.story_metadata || !story.characters || !story.chapters) {
            addMessage('error', '❌ Phase 1, 3 & 4 data required for Phase 5', '❌');
            completeProcessing();
            return;
          }
          result = await openaiService.phase4_productionValidation(
            story.story_metadata,
            story.characters,
            story.chapters
          );
          break;
          
        case 'phase6_cover':
          addMessage('processing', '🎨 Executing Phase 6: Cover Image Generation...', '🎨');
          if (!story.commercial_analysis?.logline) {
            addMessage('error', '❌ Phase 1 logline required for cover image generation', '❌');
            completeProcessing();
            return;
          }
          result = await openaiService.generateCoverImage(story.commercial_analysis.logline, story.title);
          if (result) {
            addMessage('success', '🎨 Cover image generated successfully!', '🖼️');
            addMessage('info', 'Refresh the page to see the new cover image', '🔄');
          }
          break;
          
        default:
          addMessage('error', `❌ Unknown phase: ${phaseKey}`, '❌');
          completeProcessing();
          return;
      }
      
      if (result && phaseKey === 'phase1_storyDNA') {
        addMessage('success', `✅ ${phaseKey} completed successfully!`, '✨');
        addMessage('success', 'Phase 1 data is now available in AI Conversations tab', '💬');
        addMessage('info', 'Note: Database save may need manual completion', '⚠️');
      } else if (result) {
        addMessage('success', `✅ ${phaseKey} completed successfully!`, '✨');
      }
      
      completeProcessing();
      
      // Reload story data to show updated results
      setTimeout(() => {
        loadStoryDetails();
      }, 1000);

    } catch (err) {
      errorProcessing(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleStopProcessing = () => {
    stopProcessing();
    addMessage('warning', '⏹️ Processing stopped by user');
  };

  const getProcessingPhases = () => {
    // If we have explicit processing_phases data from database, use it
    if (story?.processing_phases && Object.keys(story.processing_phases).length > 0) {
      console.log('📋 Using explicit processing phases:', story.processing_phases);
      return story.processing_phases;
    }
    
    // Otherwise, determine phases based on story status and existing data
    const phases: Record<string, any> = {};
    
    // Phase 1: Story DNA Extraction - Check for comprehensive Phase 1 data
    const hasPhase1Data = story?.story_metadata || story?.commercial_analysis;
    const phase1Complete = story?.story_metadata && story?.commercial_analysis;
    
    phases.phase1_storyDNA = { 
      phase: 'phase1_storyDNA', 
      status: phase1Complete ? 'completed' : 
              hasPhase1Data ? 'in-progress' :
              (story?.status === 'analyzing') ? 'in-progress' : 'pending',
      completed_at: phase1Complete ? story.updated_at || story.created_at : undefined,
      data: hasPhase1Data ? {
        story_metadata: story?.story_metadata,
        commercial_analysis: story?.commercial_analysis
      } : undefined,
      cost: phase1Complete ? 0.2040 : undefined, // Actual cost from browser log
      tokens: phase1Complete ? { input: 3567, output: 2508, reasoning: 1600 } : undefined
    };
    
    // Phase 2: Character Analysis
    const hasPhase2Data = story?.characters_analysis || (story?.characters && story.characters.length > 0);
    phases.phase2_characters = { 
      phase: 'phase2_characters', 
      status: story?.characters_analysis ? 'completed' : 
              hasPhase2Data ? 'completed' : 'pending',
      data: story?.characters_analysis || story?.characters,
      cost: story?.characters_analysis ? 0.02 : undefined,
      completed_at: story?.characters_analysis ? story.updated_at : undefined
    };
    
    // Phase 3: Narrative Architecture  
    const hasPhase3Data = story?.narrative_architecture || (story?.chapters && story.chapters.length > 0);
    phases.phase3_narrative = { 
      phase: 'phase3_narrative', 
      status: story?.narrative_architecture ? 'completed' :
              hasPhase3Data ? 'completed' : 'pending',
      data: story?.narrative_architecture || story?.chapters,
      cost: story?.narrative_architecture ? 0.02 : undefined,
      completed_at: story?.narrative_architecture ? story.updated_at : undefined
    };
    
    // Phase 4: Production Planning
    phases.phase4_production = { 
      phase: 'phase4_production', 
      status: story?.production_blueprint ? 'completed' : 'pending',
      data: story?.production_blueprint,
      cost: story?.production_blueprint ? 0.01 : undefined,
      completed_at: story?.production_blueprint ? story.updated_at : undefined
    };
    
    // Phase 5: Cover Image Generation
    phases.phase5_coverImage = { 
      phase: 'phase5_coverImage', 
      status: story?.cover_image_url ? 'completed' : 'pending',
      data: story?.cover_image_url ? { 
        url: story.cover_image_url, 
        prompt: story.ai_analysis_metadata?.cover_image_prompt 
      } : undefined,
      cost: story?.cover_image_url ? 0.187 : undefined,
      completed_at: story?.cover_image_url ? story.updated_at : undefined
    };
    
    console.log('📋 Computed processing phases:', phases);
    console.log('📊 Phase 1 Status:', {
      hasStoryMetadata: !!story?.story_metadata,
      hasCommercialAnalysis: !!story?.commercial_analysis,
      phase1Complete,
      storyStatus: story?.status
    });
    
    return phases;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'chapterized': return 'text-blue-400';
      case 'analyzing': return 'text-yellow-400';
      case 'new': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[10000] flex items-center justify-center p-4"
      onWheel={handleWheelEvent}
      onClick={handleBackgroundClick}
    >
      <div 
        className="bg-gray-900 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-white">Story Details</h2>
            {story?.status === 'analyzing' && (
              <div className="flex items-center gap-2 bg-yellow-500/10 px-3 py-1 rounded-full">
                <div className="animate-pulse w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span className="text-yellow-400 text-sm font-medium">Processing</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {story?.status === 'analyzing' && !isProcessing && (
              <button
                onClick={() => handleResumeProcessing()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <PlayCircle size={16} />
                Resume Processing
              </button>
            )}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
              title="Delete Story"
            >
              <Trash2 size={20} />
            </button>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'overview'
                ? 'text-blue-400 border-blue-400'
                : 'text-gray-400 border-transparent hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('processing')}
            className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'processing'
                ? 'text-blue-400 border-blue-400'
                : 'text-gray-400 border-transparent hover:text-white'
            }`}
          >
            <RotateCcw size={16} />
            Processing
            {story?.status === 'analyzing' && (
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('conversations')}
            className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'conversations'
                ? 'text-blue-400 border-blue-400'
                : 'text-gray-400 border-transparent hover:text-white'
            }`}
          >
            <MessageCircle size={16} />
            AI Conversations
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'data'
                ? 'text-blue-400 border-blue-400'
                : 'text-gray-400 border-transparent hover:text-white'
            }`}
          >
            Raw Data
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)] overscroll-contain">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12">
              <AuracleLogo size="medium" />
              <div className="mt-4 text-white text-sm opacity-80">
                Loading story details...
              </div>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <p className="text-red-400">{error}</p>
              <button 
                onClick={loadStoryDetails}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : story ? (
            <div className="p-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Story Header */}
                  <div className="flex gap-6">
                    {story.cover_image_url && (
                      <div className="flex-shrink-0">
                        <img 
                          src={story.cover_image_url} 
                          alt={story.title}
                          className="w-32 h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}
                    <div className="flex-1 space-y-3">
                      <h1 className="text-3xl font-bold text-white">{story.title}</h1>
                      {story.logline && (
                        <p className="text-gray-300 text-lg italic">"{story.logline}"</p>
                      )}
                      <div className="flex flex-wrap gap-4 text-sm">
                        <span className={`px-3 py-1 rounded-full bg-gray-800 ${getStatusColor(story.status)}`}>
                          {story.status.charAt(0).toUpperCase() + story.status.slice(1)}
                        </span>
                        {story.genre && (
                          <span className="px-3 py-1 rounded-full bg-purple-600/20 text-purple-300">
                            {story.genre}
                          </span>
                        )}
                        <span className="px-3 py-1 rounded-full bg-gray-800 text-gray-300">
                          <Calendar size={14} className="inline mr-1" />
                          {new Date(story.created_at).toLocaleDateString()}
                        </span>
                        {story.processing_resumed_count && story.processing_resumed_count > 0 && (
                          <span className="px-3 py-1 rounded-full bg-yellow-600/20 text-yellow-300">
                            Resumed {story.processing_resumed_count}x
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Error Display */}
                  {story.last_processing_error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                      <h3 className="text-red-400 font-medium mb-2">Last Processing Error</h3>
                      <p className="text-red-300 text-sm">{story.last_processing_error}</p>
                    </div>
                  )}

                  {/* Processing Phases Overview */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white mb-4">Analysis Phases</h3>
                    
                    {/* Phase 1: Story DNA Analysis */}
                    <div className="border border-gray-700 rounded-lg overflow-hidden">
                      <div className={`p-4 ${story.story_metadata ? 'bg-green-500/10 border-green-500/20' : 'bg-gray-800/30'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${story.story_metadata ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                            <h4 className={`font-medium ${story.story_metadata ? 'text-green-400' : 'text-gray-400'}`}>
                              Phase 1: Story DNA Analysis
                            </h4>
                            {story.story_metadata && <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">COMPLETED</span>}
                          </div>
                          {story.story_metadata && (
                            <button
                              onClick={() => togglePhaseExpansion('phase1')}
                              className="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors"
                            >
                              <span className="text-sm">View Data</span>
                              {expandedPhases.phase1 ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </button>
                          )}
                        </div>
                        
                        {/* Expandable Phase 1 Data */}
                        {story.story_metadata && expandedPhases.phase1 && (
                          <div className="mt-4 space-y-3 text-sm">
                            {/* Story Metadata */}
                            <div className="bg-gray-900/50 rounded-lg p-3 font-mono text-xs">
                              <h5 className="text-white font-semibold mb-2">Story Metadata:</h5>
                              <div className="text-gray-300 space-y-1 max-h-40 overflow-y-auto select-text">
                                <div><span className="text-blue-300">Title:</span> {story.story_metadata.title}</div>
                                <div><span className="text-blue-300">Structure:</span> {story.story_metadata.structure_detected}</div>
                                <div><span className="text-blue-300">Tone:</span> {story.story_metadata.overall_tone}</div>
                                {story.story_metadata.genres && (
                                  <div>
                                    <span className="text-blue-300">Genres:</span> 
                                    {story.story_metadata.genres.map((g: any) => 
                                      ` ${g.label} (${Math.round(g.confidence * 100)}%)`
                                    ).join(', ')}
                                  </div>
                                )}
                                {story.story_metadata.themes && (
                                  <div>
                                    <span className="text-blue-300">Themes:</span> {story.story_metadata.themes.join(', ')}
                                  </div>
                                )}
                                {story.story_metadata.visual_atmosphere && (
                                  <div>
                                    <span className="text-blue-300">Visual Style:</span> {story.story_metadata.visual_atmosphere.substring(0, 120)}...
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Commercial Analysis */}
                            {story.commercial_analysis && (
                              <div className="bg-gray-900/50 rounded-lg p-3 font-mono text-xs">
                                <h5 className="text-white font-semibold mb-2">Commercial Analysis:</h5>
                                <div className="text-gray-300 space-y-1 max-h-40 overflow-y-auto select-text">
                                  <div><span className="text-blue-300">Logline:</span> {story.commercial_analysis.logline}</div>
                                  <div><span className="text-blue-300">Marketability:</span> {story.commercial_analysis.marketability_score}/10</div>
                                  <div><span className="text-blue-300">Target Audience:</span> {story.commercial_analysis.target_audience}</div>
                                  {story.commercial_analysis.comparable_films && (
                                    <div>
                                      <span className="text-blue-300">Comparable Films:</span> {story.commercial_analysis.comparable_films.join(', ')}
                                    </div>
                                  )}
                                  {story.commercial_analysis.marketing_angles && (
                                    <div>
                                      <span className="text-blue-300">Marketing Angles:</span> {story.commercial_analysis.marketing_angles.slice(0, 2).join('; ')}...
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Phase 2: Character Analysis */}
                    <div className="border border-gray-700 rounded-lg overflow-hidden">
                      <div className={`p-4 ${story.characters_analysis ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${story.characters_analysis ? 'bg-green-400' : 'bg-red-400'}`}></div>
                          <h4 className={`font-medium ${story.characters_analysis ? 'text-green-400' : 'text-red-400'}`}>
                            Phase 2: Character Psychometrics
                          </h4>
                          {story.characters_analysis ? (
                            <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">COMPLETED</span>
                          ) : (
                            <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">PENDING</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Phase 3: Narrative Architecture */}
                    <div className="border border-gray-700 rounded-lg overflow-hidden">
                      <div className={`p-4 ${story.narrative_architecture ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${story.narrative_architecture ? 'bg-green-400' : 'bg-red-400'}`}></div>
                          <h4 className={`font-medium ${story.narrative_architecture ? 'text-green-400' : 'text-red-400'}`}>
                            Phase 3: Narrative Architecture
                          </h4>
                          {story.narrative_architecture ? (
                            <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">COMPLETED</span>
                          ) : (
                            <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">PENDING</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Phase 4: Production Planning */}
                    <div className="border border-gray-700 rounded-lg overflow-hidden">
                      <div className={`p-4 ${story.production_blueprint ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${story.production_blueprint ? 'bg-green-400' : 'bg-red-400'}`}></div>
                          <h4 className={`font-medium ${story.production_blueprint ? 'text-green-400' : 'text-red-400'}`}>
                            Phase 4: Production Planning
                          </h4>
                          {story.production_blueprint ? (
                            <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">COMPLETED</span>
                          ) : (
                            <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">PENDING</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Phase 5: Cover Image */}
                    <div className="border border-gray-700 rounded-lg overflow-hidden">
                      <div className={`p-4 ${story.cover_image_url ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${story.cover_image_url ? 'bg-green-400' : 'bg-red-400'}`}></div>
                          <h4 className={`font-medium ${story.cover_image_url ? 'text-green-400' : 'text-red-400'}`}>
                            Phase 5: Cover Image Generation
                          </h4>
                          {story.cover_image_url ? (
                            <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">COMPLETED</span>
                          ) : (
                            <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">PENDING</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Traditional Analysis Results (if available) */}
                  {(story.ai_analysis_metadata || story.chapters.length > 0 || story.characters.length > 0) && (
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-white mb-3">Additional Analysis Results</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="text-center">
                          <div className="mx-auto mb-1 text-blue-400 text-2xl">📚</div>
                          <div className="text-white font-medium">{story.ai_analysis_metadata?.chapters_count || story.chapters.length}</div>
                          <div className="text-gray-400">Chapters</div>
                        </div>
                        <div className="text-center">
                          <div className="mx-auto mb-1 text-green-400 text-2xl">👥</div>
                          <div className="text-white font-medium">{story.ai_analysis_metadata?.characters_count || story.characters.length}</div>
                          <div className="text-gray-400">Characters</div>
                        </div>
                        <div className="text-center">
                          <div className="mx-auto mb-1 text-purple-400 text-2xl">🎬</div>
                          <div className="text-white font-medium">
                            {story.chapters.reduce((total, chapter) => total + (chapter.estimated_film_time || 0), 0)}m
                          </div>
                          <div className="text-gray-400">Est. Duration</div>
                        </div>
                        <div className="text-center">
                          <div className="mx-auto mb-1 text-yellow-400 text-2xl">🤖</div>
                          <div className="text-white font-medium">{story.ai_analysis_metadata?.agent_version || 'S-2X'}</div>
                          <div className="text-gray-400">AI Agent</div>
                        </div>
                      </div>
                      {story.ai_analysis_metadata?.style_applied && (
                        <div className="mt-3 text-sm text-gray-300">
                          <strong>Visual Style:</strong> {story.ai_analysis_metadata.style_applied}
                        </div>
                      )}
                      {story.ai_analysis_metadata?.processed_at && (
                        <div className="mt-2 text-xs text-gray-400">
                          Processed: {new Date(story.ai_analysis_metadata.processed_at).toLocaleString()}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Chapters (if available) */}
                  {story.chapters.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Chapters ({story.chapters.length})</h3>
                      <div className="space-y-3">
                        {story.chapters.map((chapter, index) => (
                          <div key={chapter.id} className="bg-gray-800/30 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-white">
                                Chapter {index + 1}: {chapter.chapter_title}
                              </h4>
                              <div className="text-sm text-gray-400">
                                {chapter.estimated_film_time}m
                              </div>
                            </div>
                            <p className="text-gray-300 text-sm mb-2">{chapter.chapter_summary}</p>
                            <div className="text-xs text-gray-400">
                              Mood: <span className="text-blue-300">{chapter.mood_tone}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Characters (if available) */}
                  {story.characters.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Characters ({story.characters.length})</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {story.characters.map((character) => (
                          <div key={character.id} className="bg-gray-800/30 rounded-lg p-4">
                            <h4 className="font-medium text-white mb-1">{character.character_name}</h4>
                            <p className="text-sm text-blue-300 mb-2">{character.role_in_story}</p>
                            <p className="text-xs text-gray-400">{character.physical_description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Processing Tab */}
              {activeTab === 'processing' && (
                <div className="space-y-6">
                  <ProcessingPhases
                    phases={getProcessingPhases()}
                    currentPhase={isProcessing ? 'phase2_characters' : undefined}
                    onResumeFromPhase={handleExecutePhase}
                    storyId={storyId}
                    storyTitle={story.title}
                    storyText={story.full_story_text}
                  />
                  
                  <ProcessingTerminal
                    isProcessing={isProcessing}
                    onStartProcessing={() => handleResumeProcessing()}
                    onStopProcessing={handleStopProcessing}
                    messages={messages}
                    className="mt-6"
                  />
                </div>
              )}

              {/* AI Conversations Tab */}
              {activeTab === 'conversations' && (
                <div className="h-[600px]">
                  <AIConversationViewer storyId={storyId} />
                </div>
              )}

              {/* Raw Data Tab */}
              {activeTab === 'data' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white">Raw Story Data</h3>
                  
                  {/* Phase 1 Data */}
                  {story.story_metadata && (
                    <div className="space-y-3">
                      <h4 className="text-md font-medium text-green-400">Phase 1: Story DNA Analysis</h4>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-300 block mb-2">Story Metadata:</label>
                          <div className="bg-gray-900/50 rounded-lg p-4 text-xs text-gray-300 font-mono max-h-96 overflow-y-auto select-text">
                            <pre className="whitespace-pre-wrap">{JSON.stringify(story.story_metadata, null, 2)}</pre>
                          </div>
                        </div>
                        
                        {story.commercial_analysis && (
                          <div>
                            <label className="text-sm font-medium text-gray-300 block mb-2">Commercial Analysis:</label>
                            <div className="bg-gray-900/50 rounded-lg p-4 text-xs text-gray-300 font-mono max-h-96 overflow-y-auto select-text">
                              <pre className="whitespace-pre-wrap">{JSON.stringify(story.commercial_analysis, null, 2)}</pre>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Additional Phase Data */}
                  {story.characters_analysis && (
                    <div>
                      <h4 className="text-md font-medium text-green-400">Phase 2: Character Analysis</h4>
                      <div className="bg-gray-900/50 rounded-lg p-4 text-xs text-gray-300 font-mono max-h-96 overflow-y-auto select-text">
                        <pre className="whitespace-pre-wrap">{JSON.stringify(story.characters_analysis, null, 2)}</pre>
                      </div>
                    </div>
                  )}
                  
                  {story.narrative_architecture && (
                    <div>
                      <h4 className="text-md font-medium text-green-400">Phase 3: Narrative Architecture</h4>
                      <div className="bg-gray-900/50 rounded-lg p-4 text-xs text-gray-300 font-mono max-h-96 overflow-y-auto select-text">
                        <pre className="whitespace-pre-wrap">{JSON.stringify(story.narrative_architecture, null, 2)}</pre>
                      </div>
                    </div>
                  )}
                  
                  {story.production_blueprint && (
                    <div>
                      <h4 className="text-md font-medium text-green-400">Phase 4: Production Blueprint</h4>
                      <div className="bg-gray-900/50 rounded-lg p-4 text-xs text-gray-300 font-mono max-h-96 overflow-y-auto select-text">
                        <pre className="whitespace-pre-wrap">{JSON.stringify(story.production_blueprint, null, 2)}</pre>
                      </div>
                    </div>
                  )}
                  
                  {/* Complete Story Object */}
                  <div>
                    <h4 className="text-md font-medium text-gray-400">Complete Story Object</h4>
                    <div className="bg-gray-900/50 rounded-lg p-4 text-xs text-gray-300 font-mono max-h-96 overflow-y-auto select-text">
                      <pre className="whitespace-pre-wrap">{JSON.stringify(story, null, 2)}</pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[10001] flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full border border-red-500/20">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="text-red-400" size={24} />
                <h3 className="text-xl font-bold text-white">Delete Story</h3>
              </div>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete "{story?.title}"? This will permanently remove:
              </p>
              <ul className="text-sm text-gray-400 mb-6 space-y-1">
                <li>• The story and all its content</li>
                <li>• {story?.chapters.length || 0} chapters</li>
                <li>• {story?.characters.length || 0} characters</li>
                <li>• All related scenes and shots</li>
                <li>• Cover image and metadata</li>
              </ul>
              <p className="text-red-400 text-sm font-medium mb-6">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Delete Forever
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
