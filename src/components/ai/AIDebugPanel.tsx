import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase/client';

interface StoryAnalysis {
  id: string;
  title: string;
  ai_analysis_metadata: any;
  cover_image_url: string | null;
  created_at: string;
  status: string;
  full_story_text: string;
  story_metadata?: any;
  commercial_analysis?: any;
}

export const AIDebugPanel: React.FC = () => {
  const [storyAnalyses, setStoryAnalyses] = useState<StoryAnalysis[]>([]);
  const [selectedStory, setSelectedStory] = useState<StoryAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [reasoningPatterns, setReasoningPatterns] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load reasoning patterns using direct table access
      try {
        const { data: patterns, error: patternsError } = await supabase
          .from('reasoning_memory' as any)
          .select('*')
          .order('created_at', { ascending: false });
        
        if (!patternsError && patterns) {
          setReasoningPatterns(patterns);
        }
      } catch (e) {
        // If table doesn't exist, show 0 patterns
        console.log('Reasoning patterns table not accessible yet, will show 0 patterns');
        setReasoningPatterns([]);
      }

      // Load story analyses - using existing columns only
      const { data: stories, error: storiesError } = await supabase
        .from('stories')
        .select('id, title, created_at, status, full_story_text')
        .order('created_at', { ascending: false })
        .limit(10);

      if (storiesError) {
        console.error('Error loading stories:', storiesError);
      } else {
        // Transform to match our interface with available data
        const transformedStories = (stories || []).map(story => ({
          id: story.id,
          title: story.title,
          full_story_text: story.full_story_text,
          created_at: story.created_at,
          status: story.status,
          cover_image_url: null, // Not available in current schema
          story_metadata: null,
          commercial_analysis: null,
          ai_analysis_metadata: null
        }));
        setStoryAnalyses(transformedStories);
      }

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };



  const formatJSON = (obj: any) => {
    if (!obj) return 'No data';
    return JSON.stringify(obj, null, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading AI data...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">🧠 AI Debug Panel - Scenarist Core v2.0</h1>
      
      {/* System Stats */}
      <div className="mb-6 p-4 bg-blue-50 rounded">
        <h3 className="font-semibold mb-2">📊 System Stats</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Total Stories Analyzed:</strong> {storyAnalyses.length}
          </div>
          <div>
            <strong>Reasoning Patterns:</strong> {reasoningPatterns.length} (Learning system active)
          </div>
          <div>
            <strong>Latest Analysis:</strong> {
              storyAnalyses.length > 0 
                ? formatDate(storyAnalyses[0].created_at).split(',')[0]
                : 'None yet'
            }
          </div>
          <div>
            <strong>Success Rate:</strong> {
              storyAnalyses.length > 0 
                ? Math.round((storyAnalyses.filter(s => s.status === 'chapterized').length / storyAnalyses.length) * 100) + '%'
                : 'N/A'
            }
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Story Analyses with AI Data</h2>
        
        {storyAnalyses.length === 0 ? (
          <div className="text-gray-500 p-4 border rounded">
            No story analyses found. Create a story to see AI analysis data here.
          </div>
        ) : (
          <div className="grid gap-4">
            {storyAnalyses.map((story) => (
              <div key={story.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold">{story.title}</h3>
                  <span className={`px-2 py-1 rounded text-sm ${
                    story.status === 'chapterized' ? 'bg-green-100 text-green-800' : 
                    story.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {story.status}
                  </span>
                </div>
                
                <div className="text-sm text-gray-600 mb-3">
                  Created: {formatDate(story.created_at)} | Story length: {story.full_story_text?.length.toLocaleString() || 0} chars
                </div>

                {story.cover_image_url && (
                  <div className="mb-3">
                    <img 
                      src={story.cover_image_url} 
                      alt={story.title}
                      className="w-32 h-32 object-cover rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}

                <div className="space-y-2 text-sm">
                  {story.ai_analysis_metadata && (
                    <>
                      <div>
                        <strong>Analysis Info:</strong> {story.ai_analysis_metadata.chapters_count || 0} chapters, {story.ai_analysis_metadata.characters_count || 0} characters
                      </div>
                      <div>
                        <strong>Agent Version:</strong> {story.ai_analysis_metadata.agent_version || 'N/A'}
                      </div>
                      <div>
                        <strong>Image Storage:</strong> {story.ai_analysis_metadata.image_storage?.stored_permanently ? '✅ Permanent' : '⚠️ Temporary'}
                      </div>
                    </>
                  )}
                </div>

                <button
                  onClick={() => setSelectedStory(selectedStory?.id === story.id ? null : story)}
                  className="mt-3 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                >
                  {selectedStory?.id === story.id ? 'Hide Details' : 'Show Full AI Analysis'}
                </button>

                {selectedStory?.id === story.id && (
                  <div className="mt-4 p-4 bg-gray-50 rounded">
                    <h4 className="font-semibold mb-2">Complete AI Analysis Metadata:</h4>
                    
                    <div className="space-y-4 text-xs">
                      <div>
                        <h5 className="font-medium">Full AI Analysis Metadata:</h5>
                        <pre className="bg-white p-2 rounded overflow-auto max-h-60">
                          {formatJSON(story.ai_analysis_metadata)}
                        </pre>
                      </div>

                      {story.ai_analysis_metadata?.cover_image_prompt && (
                        <div>
                          <h5 className="font-medium">Cover Image Prompt:</h5>
                          <div className="bg-white p-2 rounded">
                            {story.ai_analysis_metadata.cover_image_prompt}
                          </div>
                        </div>
                      )}

                      {story.ai_analysis_metadata?.cover_image_enhanced_prompt && (
                        <div>
                          <h5 className="font-medium">Enhanced DALL-E Prompt:</h5>
                          <div className="bg-white p-2 rounded">
                            {story.ai_analysis_metadata.cover_image_enhanced_prompt}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 p-4 bg-green-50 rounded">
        <h3 className="font-semibold mb-2">🎯 Access Instructions</h3>
        <div className="text-sm space-y-1">
          <div><strong>View this panel:</strong> Go to /ai-debug in your browser</div>
          <div><strong>Learning System:</strong> {reasoningPatterns.length > 0 ? '✅ Active with patterns' : '📝 Building patterns from new analyses'}</div>
          <div><strong>Enhanced Output:</strong> Check browser console for real-time o3 reasoning logs</div>
          <div><strong>Database:</strong> Analysis data is automatically saved and viewable here</div>
        </div>
      </div>
    </div>
  );
};

export default AIDebugPanel;
