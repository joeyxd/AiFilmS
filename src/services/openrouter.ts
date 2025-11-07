// Supabase client is available if needed for future enhancements
// import { supabase } from './supabase/client'
import { imageUtils, ImageSaveResult } from './imageUtils'

// OpenRouter API configuration
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1'
const OPENROUTER_API_KEY = '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'

// Available free models from OpenRouter
export interface OpenRouterModel {
  id: string
  name: string
  type: 'text' | 'image'
  description: string
  maxTokens?: number
}

export const OPENROUTER_MODELS: OpenRouterModel[] = [
  // Text models
  {
    id: 'deepseek/deepseek-chat-v3-0324',
    name: 'DeepSeek Chat v3',
    type: 'text',
    description: 'Advanced reasoning and coding model',
    maxTokens: 32768
  },
  {
    id: 'meta-llama/llama-4-maverick',
    name: 'Llama 4 Maverick',
    type: 'text',
    description: 'Latest Llama 4 variant with improved reasoning',
    maxTokens: 32768
  },
  {
    id: 'qwen/qwen3-235b-a22b',
    name: 'Qwen 3 235B',
    type: 'text',
    description: 'Large scale Chinese-English model',
    maxTokens: 32768
  },
  {
    id: 'qwen/qwq-32b',
    name: 'QwQ 32B',
    type: 'text',
    description: 'Question-answering specialized model',
    maxTokens: 32768
  },
  {
    id: 'google/gemini-2.0-flash-exp',
    name: 'Gemini 2.0 Flash Experimental',
    type: 'text',
    description: 'Google\'s latest experimental model (updated ID)',
    maxTokens: 1000000
  },
  {
    id: 'meta-llama/llama-4-scout',
    name: 'Llama 4 Scout',
    type: 'text',
    description: 'Optimized for exploration and discovery tasks',
    maxTokens: 32768
  },
  {
    id: 'nvidia/llama-3.1-nemotron-ultra-253b-v1',
    name: 'Nemotron Ultra 253B',
    type: 'text',
    description: 'NVIDIA\'s ultra-large language model',
    maxTokens: 32768
  },
  {
    id: 'mistralai/mistral-small-3.1-24b-instruct',
    name: 'Mistral Small 3.1',
    type: 'text',
    description: 'Efficient instruction-following model',
    maxTokens: 32768
  },
  {
    id: 'moonshotai/kimi-vl-a3b-thinking',
    name: 'Kimi VL Thinking',
    type: 'text',
    description: 'Vision-language model with reasoning',
    maxTokens: 32768
  },
  // Image models
  {
    id: 'google/gemini-2.5-flash-image-preview',
    name: 'Gemini 2.5 Flash Image',
    type: 'image',
    description: 'Fast image generation and editing (paid)',
    maxTokens: 8192
  }
]

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface OpenRouterRequest {
  model: string
  messages: OpenRouterMessage[]
  max_tokens?: number
  temperature?: number
  top_p?: number
  frequency_penalty?: number
  presence_penalty?: number
  stream?: boolean
}

export interface OpenRouterImageResult {
  success: boolean
  content: string
  imageData?: string[]
  downloadResults?: ImageSaveResult[]
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface OpenRouterResponse {
  id: string
  object: string
  created: number
  model: string
  choices: {
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }[]
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

class OpenRouterService {
  private apiKey: string
  private baseUrl: string

  constructor() {
    this.apiKey = OPENROUTER_API_KEY
    this.baseUrl = OPENROUTER_API_URL
  }

  async generateText(
    modelId: string,
    messages: OpenRouterMessage[],
    options: {
      maxTokens?: number
      temperature?: number
      topP?: number
    } = {}
  ): Promise<string> {
    try {
      const model = OPENROUTER_MODELS.find(m => m.id === modelId)
      if (!model || model.type !== 'text') {
        throw new Error(`Model ${modelId} not found or not a text model`)
      }

      const request: OpenRouterRequest = {
        model: modelId,
        messages,
        max_tokens: options.maxTokens || model.maxTokens || 4096,
        temperature: options.temperature || 0.7,
        top_p: options.topP || 1.0,
        frequency_penalty: 0,
        presence_penalty: 0,
        stream: false
      }

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Auracle Film Studio'
        },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('OpenRouter API Error:', errorData)
        throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`)
      }

      const data: OpenRouterResponse = await response.json()
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response from OpenRouter API')
      }

      // Log usage for tracking
      console.log(`OpenRouter Usage - Model: ${modelId}, Tokens: ${data.usage?.total_tokens || 'unknown'}`)

      return data.choices[0].message.content
    } catch (error) {
      console.error('Error calling OpenRouter API:', error)
      throw error
    }
  }

  async generateImage(
    prompt: string,
    options: {
      model?: string
      size?: string
      quality?: string
      autoDownload?: boolean
      fileName?: string
      inputImage?: string
    } = {}
  ): Promise<OpenRouterImageResult> {
    try {
      const modelId = options.model || 'google/gemini-2.5-flash-image-preview'
      
      console.log(`🎨 Generating image with ${modelId}...`)
      console.log(`📝 Prompt: "${prompt}"`)
      
      // Handle different model providers
      if (modelId.startsWith('openai/')) {
        return await this.generateOpenAIImage(prompt, options)
      } else if (modelId.startsWith('google/')) {
        return await this.generateGeminiImage(prompt, options)
      } else {
        throw new Error(`Unsupported model: ${modelId}`)
      }
    } catch (error) {
      console.error('Error generating image:', error)
      throw error
    }
  }

  private async generateOpenAIImage(
    prompt: string,
    options: {
      model?: string
      size?: string
      quality?: string
      autoDownload?: boolean
      fileName?: string
      inputImage?: string
    } = {}
  ): Promise<OpenRouterImageResult> {
    const modelId = options.model || 'openai/dall-e-3'
    const openaiModel = modelId.replace('openai/', '') // Remove prefix for OpenAI API
    
    console.log(`🤖 Using OpenAI model: ${openaiModel}`)

    // Use OpenAI Image API format
    const requestBody: any = {
      model: openaiModel,
      prompt: prompt,
      n: 1,
      size: options.size || "1024x1024",
      response_format: "b64_json"
    }

    // Add quality for DALL-E 3
    if (openaiModel === 'dall-e-3') {
      requestBody.quality = options.quality || "standard"
    }

    const response = await fetch(`${this.baseUrl}/images/generations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Auracle Film Studio'
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('OpenAI Image API Error:', errorData)
      throw new Error(`OpenAI Image API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    if (!data.data || data.data.length === 0) {
      throw new Error('No images generated by OpenAI API')
    }

    // Convert OpenAI response to our format
    const imageData = data.data.map((item: any) => {
      if (item.b64_json) {
        return `data:image/png;base64,${item.b64_json}`
      }
      return item.url
    })

    console.log(`✅ OpenAI generated ${imageData.length} image(s)`)

    return {
      success: true,
      imageData,
      usage: {
        prompt_tokens: prompt.length / 4, // Rough estimate
        completion_tokens: 0,
        total_tokens: prompt.length / 4
      },
      content: `Generated ${imageData.length} image(s) with ${openaiModel}`
    }
  }

  private async generateGeminiImage(
    prompt: string,
    options: {
      model?: string
      size?: string
      quality?: string
      autoDownload?: boolean
      fileName?: string
      inputImage?: string
    } = {}
  ): Promise<OpenRouterImageResult> {
    const modelId = options.model || 'google/gemini-2.5-flash-image-preview'
    
    console.log(`🤖 Using Gemini model: ${modelId}`)

    // Use chat/completions for Gemini image generation
    const messages: OpenRouterMessage[] = [
      {
        role: 'system',
        content: 'You are an AI image generator. Generate a detailed image based on the user\'s prompt.'
      },
      {
        role: 'user',
        content: options.inputImage 
          ? `Generate an image based on this reference image and prompt: ${prompt}` 
          : `Generate an image: ${prompt}`
      }
    ]

    const request: OpenRouterRequest = {
      model: modelId,
      messages,
      max_tokens: 8192,
      temperature: 0.8,
      top_p: 1.0
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Auracle Film Studio'
      },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Gemini Image API Error:', errorData)
      throw new Error(`Gemini Image API error: ${response.status} ${response.statusText}`)
    }

    const data: OpenRouterResponse = await response.json()
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response from Gemini Image API')
    }

    console.log(`✅ Gemini response received`)
    console.log(`📊 Usage - Tokens: ${data.usage?.total_tokens || 'unknown'}`)

    const responseContent = data.choices[0].message.content

    // Try to extract base64 image data from the response
    const base64DataArray = imageUtils.extractBase64FromResponse(data)
      
    let downloadResults: ImageSaveResult[] = []

    if (base64DataArray.length > 0) {
      console.log(`🖼️ Found ${base64DataArray.length} base64 image(s) in response`)
      
      if (options.autoDownload !== false) { // Default to true
        console.log(`⬇️ Auto-downloading ${base64DataArray.length} image(s)...`)
        
        for (let i = 0; i < base64DataArray.length; i++) {
          const base64Data = base64DataArray[i];
          if (imageUtils.isValidBase64Image(base64Data)) {
            const fileName = base64DataArray.length > 1 
              ? `${options.fileName || 'openrouter-image'}-${i + 1}`
              : options.fileName;
            
            const downloadResult = await imageUtils.downloadBase64Image(
              base64Data,
              fileName,
              { prefix: 'openrouter-image', showProgress: true }
            )
            
            downloadResults.push(downloadResult);
            
            if (downloadResult.success) {
              console.log(`✅ Image ${i + 1} saved: ${downloadResult.fileName}`)
            } else {
              console.error(`❌ Failed to save image ${i + 1}: ${downloadResult.error}`)
            }
          }
        }
      }

      return {
        success: true,
        content: responseContent,
        imageData: base64DataArray,
        downloadResults,
        usage: data.usage
      }
    } else {
      console.log(`📝 No base64 image data found in response`)
      return {
        success: true,
        content: responseContent,
        usage: data.usage
      }
    }
  }

  getAvailableModels(type?: 'text' | 'image'): OpenRouterModel[] {
    if (type) {
      return OPENROUTER_MODELS.filter(model => model.type === type)
    }
    return OPENROUTER_MODELS
  }

  getModelById(id: string): OpenRouterModel | undefined {
    return OPENROUTER_MODELS.find(model => model.id === id)
  }
}

export const openRouterService = new OpenRouterService()
export default openRouterService
