import { useState, useEffect } from 'react';
import { X, Settings, ChevronDown, ChevronRight, Edit, Save, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { workflowService, type WorkflowStep, type UserWorkflowCustomization } from '../services/supabase/workflow';
import { useAuth } from '../context/AuthContext';

interface AgentSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ContentTypeData {
  contentType: string;
  steps: WorkflowStep[];
  customizations: Record<string, UserWorkflowCustomization>;
}

export default function AgentSettingsModal({ isOpen, onClose }: AgentSettingsModalProps) {
  const [contentTypes, setContentTypes] = useState<string[]>([]);
  const [selectedContentType, setSelectedContentType] = useState<string>('film');
  const [contentTypeData, setContentTypeData] = useState<ContentTypeData | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});
  const [editingStep, setEditingStep] = useState<string | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const { user } = useAuth();

  // Load content types on mount
  useEffect(() => {
    if (isOpen) {
      loadContentTypes();
    }
  }, [isOpen]);

  // Load workflow data when content type changes
  useEffect(() => {
    if (isOpen && selectedContentType && user) {
      loadWorkflowData(selectedContentType);
    }
  }, [isOpen, selectedContentType, user]);

  const loadContentTypes = async () => {
    try {
      setLoading(true);
      const types = await workflowService.getAvailableContentTypes();
      setContentTypes(types);
      if (types.length > 0 && !types.includes(selectedContentType)) {
        setSelectedContentType(types[0]);
      }
    } catch (error) {
      console.error('Error loading content types:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWorkflowData = async (contentType: string) => {
    if (!user) return;
    
    try {
      setLoading(true);
      const [steps, customizations] = await Promise.all([
        workflowService.getDefaultWorkflowSteps(contentType),
        workflowService.getUserWorkflowCustomizations(user.id, contentType)
      ]);

      const customizationsMap: Record<string, UserWorkflowCustomization> = {};
      customizations.forEach(c => {
        customizationsMap[c.step_name] = c;
      });

      setContentTypeData({
        contentType,
        steps,
        customizations: customizationsMap
      });
    } catch (error) {
      console.error('Error loading workflow data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStepExpansion = (stepName: string) => {
    setExpandedSteps(prev => ({
      ...prev,
      [stepName]: !prev[stepName]
    }));
  };

  const startEditingPrompt = (stepName: string, currentPrompt: string) => {
    setEditingStep(stepName);
    setEditingPrompt(currentPrompt);
  };

  const cancelEditingPrompt = () => {
    setEditingStep(null);
    setEditingPrompt('');
  };

  const savePromptCustomization = async (stepName: string) => {
    if (!user || !contentTypeData) return;

    try {
      setSaving(true);
      
      const customization: UserWorkflowCustomization = {
        user_id: user.id,
        content_type: contentTypeData.contentType,
        step_name: stepName,
        agent_prompt: editingPrompt,
        is_enabled: true
      };

      await workflowService.saveUserWorkflowCustomization(customization);
      
      // Update local state
      setContentTypeData(prev => prev ? {
        ...prev,
        customizations: {
          ...prev.customizations,
          [stepName]: customization
        }
      } : null);

      setEditingStep(null);
      setEditingPrompt('');
    } catch (error) {
      console.error('Error saving prompt customization:', error);
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = async (stepName: string) => {
    if (!user || !contentTypeData) return;

    try {
      setSaving(true);
      
      const customization: UserWorkflowCustomization = {
        user_id: user.id,
        content_type: contentTypeData.contentType,
        step_name: stepName,
        is_enabled: true // Reset to default means removing customizations
      };

      await workflowService.saveUserWorkflowCustomization(customization);
      
      // Update local state
      setContentTypeData(prev => prev ? {
        ...prev,
        customizations: {
          ...prev.customizations,
          [stepName]: customization
        }
      } : null);
    } catch (error) {
      console.error('Error resetting to default:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleStepEnabled = async (stepName: string, enabled: boolean) => {
    if (!user || !contentTypeData) return;

    try {
      setSaving(true);
      
      const existingCustomization = contentTypeData.customizations[stepName];
      const customization: UserWorkflowCustomization = {
        user_id: user.id,
        content_type: contentTypeData.contentType,
        step_name: stepName,
        agent_prompt: existingCustomization?.agent_prompt,
        is_enabled: enabled
      };

      await workflowService.saveUserWorkflowCustomization(customization);
      
      // Update local state
      setContentTypeData(prev => prev ? {
        ...prev,
        customizations: {
          ...prev.customizations,
          [stepName]: customization
        }
      } : null);
    } catch (error) {
      console.error('Error toggling step:', error);
    } finally {
      setSaving(false);
    }
  };

  const getEffectivePrompt = (step: WorkflowStep) => {
    const customization = contentTypeData?.customizations[step.step_name];
    return customization?.agent_prompt || step.agent_prompt;
  };

  const isStepEnabled = (step: WorkflowStep) => {
    const customization = contentTypeData?.customizations[step.step_name];
    return customization?.is_enabled !== false; // Default to true
  };

  const isStepCustomized = (step: WorkflowStep) => {
    const customization = contentTypeData?.customizations[step.step_name];
    return customization?.agent_prompt !== undefined && customization.agent_prompt !== step.agent_prompt;
  };

  const formatContentTypeName = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[10] flex items-center justify-center p-4"
      onWheel={(e) => e.stopPropagation()}
    >
      <div className="bg-gray-900 rounded-xl max-w-6xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Settings className="text-blue-400" size={24} />
            <div>
              <h2 className="text-xl font-bold text-white">Agent Workflow Settings</h2>
              <p className="text-sm text-gray-400">Customize your default agent prompts and workflow steps</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex h-[calc(95vh-88px)]">
          {/* Sidebar - Content Types */}
          <div className="w-64 border-r border-gray-700 p-4 overflow-y-auto">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Content Types</h3>
            {loading && contentTypes.length === 0 ? (
              <div className="animate-pulse space-y-2">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="h-8 bg-gray-800 rounded"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {contentTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => setSelectedContentType(type)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                      selectedContentType === type
                        ? 'bg-blue-600/20 text-blue-300 border border-blue-600/30'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    {formatContentTypeName(type)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Main Content */}
          <div 
            className="flex-1 overflow-y-auto overscroll-contain"
            onWheel={(e) => e.stopPropagation()}
          >
            {loading ? (
              <div className="p-6 space-y-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="border border-gray-700 rounded-lg p-4">
                    <div className="animate-pulse">
                      <div className="h-6 bg-gray-800 rounded w-1/3 mb-2"></div>
                      <div className="h-4 bg-gray-800 rounded w-2/3 mb-4"></div>
                      <div className="h-32 bg-gray-800 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : contentTypeData ? (
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">
                    {formatContentTypeName(contentTypeData.contentType)} Workflow Steps
                  </h3>
                  <div className="text-sm text-gray-400">
                    {contentTypeData.steps.length} steps configured
                  </div>
                </div>

                {contentTypeData.steps.map(step => {
                  const isExpanded = expandedSteps[step.step_name];
                  const effectivePrompt = getEffectivePrompt(step);
                  const stepEnabled = isStepEnabled(step);
                  const stepCustomized = isStepCustomized(step);

                  return (
                    <div
                      key={step.step_name}
                      className={`border rounded-lg transition-colors ${
                        stepEnabled 
                          ? 'border-gray-700 bg-gray-800/30'
                          : 'border-gray-800 bg-gray-800/10'
                      }`}
                    >
                      {/* Step Header */}
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3 flex-1">
                          <button
                            onClick={() => toggleStepExpansion(step.step_name)}
                            className="text-gray-400 hover:text-white"
                          >
                            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                          </button>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-lg">📋</span>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className={`font-medium ${stepEnabled ? 'text-white' : 'text-gray-500'}`}>
                                  {step.step_title}
                                </h4>
                                {stepCustomized && (
                                  <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded text-xs">
                                    Customized
                                  </span>
                                )}
                              </div>
                              <p className={`text-sm ${stepEnabled ? 'text-gray-400' : 'text-gray-600'}`}>
                                {step.step_description}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleStepEnabled(step.step_name, !stepEnabled)}
                            disabled={saving}
                            className={`p-2 rounded-lg transition-colors ${
                              stepEnabled
                                ? 'text-green-400 hover:bg-green-400/10'
                                : 'text-gray-600 hover:text-gray-400 hover:bg-gray-800'
                            }`}
                            title={stepEnabled ? 'Disable step' : 'Enable step'}
                          >
                            {stepEnabled ? <Eye size={16} /> : <EyeOff size={16} />}
                          </button>

                          {stepCustomized && (
                            <button
                              onClick={() => resetToDefault(step.step_name)}
                              disabled={saving}
                              className="p-2 rounded-lg text-orange-400 hover:bg-orange-400/10 transition-colors"
                              title="Reset to default"
                            >
                              <RotateCcw size={16} />
                            </button>
                          )}

                          <button
                            onClick={() => startEditingPrompt(step.step_name, effectivePrompt)}
                            disabled={saving}
                            className="p-2 rounded-lg text-blue-400 hover:bg-blue-400/10 transition-colors"
                            title="Edit prompt"
                          >
                            <Edit size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="px-4 pb-4 border-t border-gray-700">
                          <div className="mt-4 space-y-3">
                            <div>
                              <label className="text-sm font-medium text-gray-300 mb-2 block">
                                Agent Prompt
                                {stepCustomized && (
                                  <span className="ml-2 text-xs text-blue-400">(Customized)</span>
                                )}
                              </label>
                              <div className="bg-gray-800 rounded-lg p-3 font-mono text-sm text-gray-300 max-h-64 overflow-y-auto">
                                <pre className="whitespace-pre-wrap">{effectivePrompt}</pre>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-400">
                Select a content type to view workflow steps
              </div>
            )}
          </div>
        </div>

        {/* Prompt Editor Modal */}
        {editingStep && (
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[12] flex items-center justify-center p-4"
            onWheel={(e) => e.stopPropagation()}
          >
            <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <div className="flex items-center gap-2">
                  <Edit size={20} className="text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">Edit Agent Prompt</h3>
                  <span className="text-sm text-gray-400">
                    - {contentTypeData?.steps.find(s => s.step_name === editingStep)?.step_title}
                  </span>
                </div>
                <button
                  onClick={cancelEditingPrompt}
                  className="text-gray-400 hover:text-white p-1 rounded transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div 
                className="p-4 space-y-4 max-h-[calc(90vh-120px)] overflow-y-auto overscroll-contain"
                onWheel={(e) => e.stopPropagation()}
              >
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Agent Prompt (Your default customization for all {formatContentTypeName(selectedContentType)} projects)
                  </label>
                  <textarea
                    value={editingPrompt}
                    onChange={(e) => setEditingPrompt(e.target.value)}
                    className="w-full h-80 bg-gray-800 border border-gray-600 rounded-lg p-3 text-sm text-gray-300 font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your custom agent prompt..."
                  />
                </div>
                
                <div className="text-xs text-gray-500 bg-gray-800/50 p-2 rounded">
                  <strong>Note:</strong> This customization will become your default for all new {formatContentTypeName(selectedContentType)} projects. 
                  You can still override this per-story in the story details.
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-700">
                <button
                  onClick={cancelEditingPrompt}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  onClick={() => savePromptCustomization(editingStep)}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Default
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
