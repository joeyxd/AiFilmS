import React, { useState } from 'react';
import { ChevronDown, Cpu, Zap, Bot } from 'lucide-react';
import { OPENROUTER_MODELS, OpenRouterModel } from '../services/openrouter';

interface ModelSelectorProps {
  selectedModel?: string;
  onModelChange: (modelId: string) => void;
  modelType?: 'text' | 'image';
  className?: string;
  label?: string;
  showDefault?: boolean;
  defaultModel?: string;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  onModelChange,
  modelType = 'text',
  className = '',
  label = 'Select Model',
  showDefault = true,
  defaultModel = 'openai-gpt-4'
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Get available models based on type
  const availableModels = OPENROUTER_MODELS.filter(model => model.type === modelType);
  
  // Add default OpenAI options if showDefault is true
  const allModels: OpenRouterModel[] = showDefault ? [
    {
      id: defaultModel,
      name: modelType === 'text' ? 'OpenAI GPT-4 (Default)' : 'DALL-E 3 (Default)',
      type: modelType,
      description: 'Default OpenAI model - high quality, reliable',
      maxTokens: modelType === 'text' ? 128000 : 4096
    },
    ...availableModels
  ] : availableModels;

  const selectedModelData = allModels.find(m => m.id === selectedModel);

  const getModelIcon = (model: OpenRouterModel) => {
    if (model.id.includes('openai') || model.id === defaultModel) {
      return <Bot className="w-4 h-4 text-green-400" />;
    }
    if (model.id.includes('gemini')) {
      return <Zap className="w-4 h-4 text-blue-400" />;
    }
    return <Cpu className="w-4 h-4 text-purple-400" />;
  };

  const getProviderBadge = (modelId: string) => {
    if (modelId.includes('openai') || modelId === defaultModel) {
      return <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded">OpenAI</span>;
    }
    if (modelId.includes('deepseek')) {
      return <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded">DeepSeek</span>;
    }
    if (modelId.includes('llama')) {
      return <span className="px-2 py-1 bg-orange-500/20 text-orange-300 text-xs rounded">Meta</span>;
    }
    if (modelId.includes('gemini')) {
      return <span className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded">Google</span>;
    }
    if (modelId.includes('qwen')) {
      return <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 text-xs rounded">Alibaba</span>;
    }
    if (modelId.includes('mistral')) {
      return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded">Mistral</span>;
    }
    if (modelId.includes('nvidia')) {
      return <span className="px-2 py-1 bg-green-400/20 text-green-300 text-xs rounded">NVIDIA</span>;
    }
    return <span className="px-2 py-1 bg-gray-500/20 text-gray-300 text-xs rounded">Other</span>;
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-left text-white hover:bg-gray-700 transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {selectedModelData && getModelIcon(selectedModelData)}
              <span className="truncate">
                {selectedModelData?.name || 'Select a model'}
              </span>
              {selectedModelData && getProviderBadge(selectedModelData.id)}
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            {allModels.map((model) => (
              <button
                key={model.id}
                type="button"
                onClick={() => {
                  onModelChange(model.id);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors duration-200 border-b border-gray-700 last:border-b-0 ${
                  selectedModel === model.id ? 'bg-blue-600/20 text-blue-300' : 'text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    {getModelIcon(model)}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{model.name}</div>
                      <div className="text-xs text-gray-400 truncate mt-1">
                        {model.description}
                      </div>
                    </div>
                  </div>
                  <div className="ml-2 flex-shrink-0">
                    {getProviderBadge(model.id)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ModelSelector;
