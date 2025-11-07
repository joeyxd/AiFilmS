import { supabase } from '../supabase/client';
import { storyAnalyzerService } from '../openai/storyAnalyzer';

export interface ProcessingPhaseStatus {
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

export const processingResumeService = {
  /**
   * Get current processing status for a story
   */
  async getProcessingStatus(storyId: string): Promise<{
    phases: Record<string, ProcessingPhaseStatus>;
    story: any;
    canResume: boolean;
  }> {
    try {
      // Get story with processing data
      const { data: story, error: storyError } = await supabase
        .from('stories')
        .select('*')
        .eq('id', storyId)
        .single();

      if (storyError) throw storyError;

      // Get processing logs
      const { data: logs, error: logsError } = await supabase
        .from('processing_logs')
        .select('*')
        .eq('story_id', storyId)
        .order('created_at', { ascending: false });

      if (logsError) throw logsError;

      // Parse processing phases from story and logs
      const processingPhases = story.processing_phases || {};
      const phases: Record<string, ProcessingPhaseStatus> = {};

      // Map phases based on logs and existing data
      const phaseOrder = ['phase1_storyDNA', 'phase2_characters', 'phase3_narrative', 'phase4_production', 'phase5_coverImage'];

      for (const phaseName of phaseOrder) {
        const phaseLog = logs?.find(log => log.phase_name === phaseName);
        const phaseStatus = processingPhases[phaseName];

        phases[phaseName] = {
          phase: phaseName,
          status: phaseStatus || (phaseLog?.phase_status as any) || 'pending',
          data: phaseLog?.phase_data,
          error: phaseLog?.error_message,
          timestamp: phaseLog?.completed_at,
          cost: phaseLog?.cost_usd ? parseFloat(phaseLog.cost_usd) : undefined,
          tokens: phaseLog?.tokens_used
        };
      }

      // Determine if we can resume
      const canResume = story.status === 'analyzing' || 
                       Object.values(phases).some(p => p.status === 'failed' || p.status === 'pending');

      return {
        phases,
        story,
        canResume
      };

    } catch (error) {
      console.error('❌ Failed to get processing status:', error);
      throw error;
    }
  },

  /**
   * Resume processing from a specific phase
   */
  async resumeProcessing(
    storyId: string, 
    fromPhase: string,
    onProgress?: (message: string, type: 'info' | 'success' | 'error' | 'processing') => void
  ): Promise<{ success: boolean; error?: string }> {
    try {
      onProgress?.('🔄 Resuming processing...', 'info');

      // Get story data
      const { data: story, error: storyError } = await supabase
        .from('stories')
        .select('*')
        .eq('id', storyId)
        .single();

      if (storyError) throw storyError;

      onProgress?.(`📖 Resuming from ${fromPhase} for "${story.title}"`, 'info');

      // Update story status to processing
      await supabase
        .from('stories')
        .update({ 
          status: 'analyzing',
          processing_resumed_count: (story.processing_resumed_count || 0) + 1
        })
        .eq('id', storyId);

      // Log resume attempt
      await supabase
        .from('processing_logs')
        .insert({
          story_id: storyId,
          phase_name: 'resume',
          phase_status: 'started',
          phase_data: { resumed_from: fromPhase, attempt: story.processing_resumed_count + 1 }
        });

      onProgress?.('🚀 Starting AI processing...', 'processing');

      // Call the resume-capable analyzer
      const result = await storyAnalyzerService.resumeStoryProcessing(
        storyId,
        story.content,
        story.title,
        fromPhase,
        (msg, type, icon) => {
          onProgress?.(msg, type);
        }
      );

      if (result.success) {
        onProgress?.('✅ Processing completed successfully!', 'success');
        
        // Update story status
        await supabase
          .from('stories')
          .update({ 
            status: 'completed',
            ai_analysis_metadata: result.analysis?.ai_analysis_metadata,
            cover_image_url: result.coverImage?.imageUrl
          })
          .eq('id', storyId);

        return { success: true };
      } else {
        onProgress?.(`❌ Processing failed: ${result.error}`, 'error');
        return { success: false, error: result.error };
      }

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      onProgress?.(`💥 Resume failed: ${errorMsg}`, 'error');
      
      // Log failure
      await supabase
        .from('processing_logs')
        .insert({
          story_id: storyId,
          phase_name: 'resume',
          phase_status: 'failed',
          error_message: errorMsg
        });

      return { success: false, error: errorMsg };
    }
  },

  /**
   * Get processing logs for debugging
   */
  async getProcessingLogs(storyId: string) {
    const { data, error } = await supabase
      .from('processing_logs')
      .select('*')
      .eq('story_id', storyId)
      .order('created_at', { ascending: true });

    return { logs: data || [], error };
  },

  /**
   * Clear processing state and restart from beginning
   */
  async resetProcessing(storyId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Clear processing phases
      await supabase
        .from('stories')
        .update({ 
          processing_phases: {},
          processing_metadata: {},
          status: 'new',
          processing_resumed_count: 0
        })
        .eq('id', storyId);

      // Clear processing logs (optional - keep for history)
      // await supabase
      //   .from('processing_logs')
      //   .delete()
      //   .eq('story_id', storyId);

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
};
