-- Migration: Add selected_model column to workflow tables
-- Date: 2025-09-09
-- Description: Add model selection support for workflow customization

-- Add selected_model to default_workflow_steps
ALTER TABLE default_workflow_steps 
ADD COLUMN selected_model VARCHAR(255) DEFAULT NULL;

-- Add selected_model to user_workflow_customizations
ALTER TABLE user_workflow_customizations 
ADD COLUMN selected_model VARCHAR(255) DEFAULT NULL;

-- Add selected_model to story_workflow_overrides
ALTER TABLE story_workflow_overrides 
ADD COLUMN selected_model VARCHAR(255) DEFAULT NULL;

-- Add comments to explain the new column
COMMENT ON COLUMN default_workflow_steps.selected_model IS 'AI model ID to use for this workflow step (e.g., openai-gpt-4, deepseek/deepseek-chat-v3-0324)';
COMMENT ON COLUMN user_workflow_customizations.selected_model IS 'User-customized AI model ID for this workflow step';
COMMENT ON COLUMN story_workflow_overrides.selected_model IS 'Story-specific AI model ID override for this workflow step';

-- Update the updated_at trigger to include the new column
-- This ensures the updated_at field is automatically updated when selected_model changes
