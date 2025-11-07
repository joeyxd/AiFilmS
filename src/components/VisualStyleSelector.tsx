import React, { useState } from 'react';
import { VISUAL_STYLES, VisualStyle } from '../types/visualStyles';

interface VisualStyleSelectorProps {
  selectedStyleId: string;
  onStyleChange: (styleId: string) => void;
  className?: string;
}

export const VisualStyleSelector: React.FC<VisualStyleSelectorProps> = ({
  selectedStyleId,
  onStyleChange,
  className = ''
}) => {
  const [selectedCategory, setSelectedCategory] = useState<VisualStyle['category']>('photorealistic');

  const categorizedStyles = {
    photorealistic: VISUAL_STYLES.filter(s => s.category === 'photorealistic'),
    anime: VISUAL_STYLES.filter(s => s.category === 'anime'),
    cartoon: VISUAL_STYLES.filter(s => s.category === 'cartoon'),
    artistic: VISUAL_STYLES.filter(s => s.category === 'artistic'),
    cinematic: VISUAL_STYLES.filter(s => s.category === 'cinematic'),
  };

  const categoryLabels = {
    photorealistic: '📸 Photorealistic',
    anime: '🎌 Anime',
    cartoon: '🎨 Cartoon',
    artistic: '🖼️ Artistic',
    cinematic: '🎬 Cinematic'
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Visual Style</h3>
        <p className="text-sm text-gray-400">Choose the visual style for your story's cover image and scene generation</p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(categoryLabels).map(([category, label]) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category as VisualStyle['category'])}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedCategory === category
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Style Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categorizedStyles[selectedCategory].map((style) => (
          <div
            key={style.id}
            onClick={() => onStyleChange(style.id)}
            className={`relative group cursor-pointer rounded-lg overflow-hidden transition-all duration-300 ${
              selectedStyleId === style.id
                ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-900'
                : 'hover:ring-1 hover:ring-gray-500'
            }`}
          >
            {/* Style Preview Card */}
            <div className="bg-gray-800 p-4 h-full">
              {/* Thumbnail Placeholder */}
              <div className="w-full h-24 bg-gradient-to-br from-gray-700 to-gray-600 rounded-lg mb-3 flex items-center justify-center">
                <span className="text-2xl">
                  {style.category === 'photorealistic' && '📸'}
                  {style.category === 'anime' && '🎌'}
                  {style.category === 'cartoon' && '🎨'}
                  {style.category === 'artistic' && '🖼️'}
                  {style.category === 'cinematic' && '🎬'}
                </span>
              </div>

              {/* Style Info */}
              <div>
                <h4 className="font-semibold text-white text-sm mb-1 group-hover:text-blue-400 transition-colors">
                  {style.name}
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {style.description}
                </p>
              </div>

              {/* Selected Indicator */}
              {selectedStyleId === style.id && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Selected Style Info */}
      {selectedStyleId && (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <h4 className="font-medium text-white mb-1">
                Selected: {VISUAL_STYLES.find(s => s.id === selectedStyleId)?.name}
              </h4>
              <p className="text-sm text-gray-400 mb-2">
                {VISUAL_STYLES.find(s => s.id === selectedStyleId)?.description}
              </p>
              <div className="text-xs text-gray-500 bg-gray-900 rounded p-2 font-mono">
                {VISUAL_STYLES.find(s => s.id === selectedStyleId)?.promptBase.substring(0, 100)}...
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
