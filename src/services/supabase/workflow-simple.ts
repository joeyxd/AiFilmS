import { supabase } from './client';

export interface WorkflowStep {
  id: string;
  content_type: string;
  step_name: string;
  step_order: number;
  step_title: string;
  step_description: string;
  agent_prompt: string;
  is_enabled: boolean;
}

export interface UserWorkflowCustomization {
  user_id: string;
  content_type: string;
  step_name: string;
  is_enabled: boolean;
  custom_prompt?: string;
  custom_title?: string;
  custom_description?: string;
}

export interface StoryWorkflowOverride {
  story_id: string;
  step_name: string;
  is_enabled: boolean;
  agent_prompt?: string;
  custom_title?: string;
  custom_description?: string;
}

class WorkflowService {
  // Get all default workflow steps for a content type
  async getDefaultWorkflowSteps(contentType: string = 'film'): Promise<WorkflowStep[]> {
    try {
      const { data, error } = await (supabase as any)
        .from('default_workflow_steps')
        .select('*')
        .eq('content_type', contentType)
        .eq('is_active', true)
        .order('step_order');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching default workflow steps:', error);
      return [];
    }
  }

  // Get user's workflow customizations
  async getUserWorkflowCustomizations(userId: string, contentType: string = 'film'): Promise<UserWorkflowCustomization[]> {
    try {
      const { data, error } = await (supabase as any)
        .from('user_workflow_customizations')
        .select('*')
        .eq('user_id', userId)
        .eq('content_type', contentType)
        .order('step_order');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user workflow customizations:', error);
      return [];
    }
  }

  // Get story-specific workflow overrides
  async getStoryWorkflowOverrides(storyId: string): Promise<StoryWorkflowOverride[]> {
    try {
      const { data, error } = await (supabase as any)
        .from('story_workflow_overrides')
        .select('*')
        .eq('story_id', storyId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching story workflow overrides:', error);
      return [];
    }
  }

  // Save user workflow customization
  async saveUserWorkflowCustomization(customization: UserWorkflowCustomization): Promise<void> {
    try {
      const { error } = await (supabase as any)
        .from('user_workflow_customizations')
        .upsert(customization, {
          onConflict: 'user_id,content_type,step_name'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving user workflow customization:', error);
      throw error;
    }
  }

  // Save story workflow override
  async saveStoryWorkflowOverride(override: StoryWorkflowOverride): Promise<void> {
    try {
      const { error } = await (supabase as any)
        .from('story_workflow_overrides')
        .upsert(override, {
          onConflict: 'story_id,step_name'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving story workflow override:', error);
      throw error;
    }
  }

  // Get all available content types
  async getAvailableContentTypes(): Promise<string[]> {
    try {
      const { data, error } = await (supabase as any)
        .from('default_workflow_steps')
        .select('content_type')
        .eq('is_active', true);

      if (error) throw error;
      const contentTypes = [...new Set((data || []).map((row: any) => row.content_type))] as string[];
      return contentTypes;
    } catch (error) {
      console.error('Error fetching content types:', error);
      return ['film', 'cartoon', 'faceless_youtube', 'social_media', 'shorts'];
    }
  }
}

export const workflowService = new WorkflowService();
