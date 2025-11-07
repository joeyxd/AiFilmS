import React, { useState } from 'react'
import { openRouterService, OpenRouterImageResult } from '../services/openrouter'

export const ImageGenerationTest: React.FC = () => {
  const [prompt, setPrompt] = useState('A cute robot painting a landscape')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<OpenRouterImageResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      console.log('🎨 Starting image generation...')
      const imageResult = await openRouterService.generateImage(prompt, {
        autoDownload: true,
        fileName: `custom-${Date.now()}.png`
      })

      console.log('📊 Generation result:', imageResult)
      setResult(imageResult)

      if (!imageResult.success) {
        setError(imageResult.content)
      }

    } catch (err) {
      console.error('❌ Image generation error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🎨 OpenRouter Image Generation Test</h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium mb-2">
            Image Prompt:
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg resize-none h-20"
            placeholder="Describe the image you want to generate..."
          />
        </div>

        <button
          onClick={handleGenerateImage}
          disabled={loading || !prompt.trim()}
          className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
            loading || !prompt.trim()
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Generating Image...</span>
            </div>
          ) : (
            'Generate Image'
          )}
        </button>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="font-medium text-red-800 mb-2">Error:</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2">✅ Generation Complete!</h3>
              
              {result.usage && (
                <div className="text-sm text-green-700 mb-2">
                  <strong>Usage:</strong> {result.usage.total_tokens} tokens 
                  ({result.usage.prompt_tokens} prompt + {result.usage.completion_tokens} completion)
                </div>
              )}

              {result.downloadResult && (
                <div className="text-sm text-green-700 mb-2">
                  <strong>Download:</strong> {result.downloadResult.success 
                    ? `✅ Saved as ${result.downloadResult.fileName} (${((result.downloadResult.size || 0) / 1024).toFixed(1)} KB)`
                    : `❌ Failed: ${result.downloadResult.error}`
                  }
                </div>
              )}
            </div>

            {result.imageData && (
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium mb-2">🖼️ Generated Image Preview:</h4>
                <img
                  src={result.imageData}
                  alt="Generated"
                  className="max-w-full h-auto rounded border"
                  onError={(e) => {
                    console.error('Failed to load image preview')
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
            )}

            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium mb-2">📝 Response Content:</h4>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-2 rounded max-h-40 overflow-y-auto">
                {result.content}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ImageGenerationTest
