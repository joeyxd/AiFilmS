/**
 * Image utility service for handling base64 conversion and file operations
 */

export interface ImageSaveResult {
  success: boolean
  filePath?: string
  fileName?: string
  size?: number
  error?: string
}

export class ImageUtilsService {
  private static instance: ImageUtilsService
  private downloadFolder: string = 'downloaded-images'

  constructor() {
    // Initialize download folder in browser environment
    if (typeof window !== 'undefined') {
      this.initializeDownloadFolder()
    }
  }

  static getInstance(): ImageUtilsService {
    if (!ImageUtilsService.instance) {
      ImageUtilsService.instance = new ImageUtilsService()
    }
    return ImageUtilsService.instance
  }

  private initializeDownloadFolder(): void {
    // In browser environment, we'll use downloads folder or create a virtual one
    this.downloadFolder = 'downloaded-images'
  }

  /**
   * Extracts base64 image data from various formats including OpenRouter response
   */
  extractBase64FromResponse(response: any): string[] {
    const base64Images: string[] = [];
    
    try {
    // Method 1: Check for OpenRouter specific format (message.images array)
    if (response && typeof response === 'object') {
      // Handle OpenRouter response format
      if (response.choices && response.choices[0] && response.choices[0].message && response.choices[0].message.images) {
        const images = response.choices[0].message.images;
        for (const image of images) {
          if (image.image_url && image.image_url.url) {
            const dataUrlMatch = image.image_url.url.match(/data:image\/[^;]+;base64,([A-Za-z0-9+/=]+)/);
            if (dataUrlMatch) {
              base64Images.push(image.image_url.url); // Return full data URL
            }
          }
        }
        if (base64Images.length > 0) {
          return base64Images;
        }
      }
      
      // Handle direct images array format
      if (response.images && Array.isArray(response.images)) {
        for (const image of response.images) {
          if (image.image_url && image.image_url.url) {
            const dataUrlMatch = image.image_url.url.match(/data:image\/[^;]+;base64,([A-Za-z0-9+/=]+)/);
            if (dataUrlMatch) {
              base64Images.push(image.image_url.url);
            }
          }
        }
        if (base64Images.length > 0) {
          return base64Images;
        }
      }
    }      const responseContent = typeof response === 'string' ? response : JSON.stringify(response);

      // Method 2: Look for data:image/ URLs
      const dataUrlMatch = responseContent.match(/data:image\/[^;]+;base64,([A-Za-z0-9+/=]+)/g)
      if (dataUrlMatch && dataUrlMatch.length > 0) {
        return dataUrlMatch; // Return all data URLs found
      }

      // Method 3: Look for base64 strings (without data: prefix)
      const base64Match = responseContent.match(/([A-Za-z0-9+/]{100,}={0,2})/g)
      if (base64Match && base64Match.length > 0) {
        // Find matches that are likely image data
        for (const match of base64Match) {
          if (match.length > 1000) { // Reasonable size for image data
            base64Images.push(`data:image/png;base64,${match}`);
          }
        }
        if (base64Images.length > 0) {
          return base64Images;
        }
      }

      // Method 4: Look for markdown image syntax
      const markdownImageMatch = responseContent.match(/!\[.*?\]\(data:image\/[^)]+\)/g)
      if (markdownImageMatch) {
        for (const match of markdownImageMatch) {
          const urlMatch = match.match(/data:image\/[^)]+/)
          if (urlMatch) {
            base64Images.push(urlMatch[0]);
          }
        }
      }

      return base64Images;
    } catch (error) {
      console.error('Error extracting base64 from response:', error)
      return [];
    }
  }

  /**
   * Determines image format from base64 data URL
   */
  getImageFormat(base64Data: string): string {
    const formatMatch = base64Data.match(/data:image\/([^;]+)/)
    return formatMatch ? formatMatch[1] : 'png'
  }

  /**
   * Generates a unique filename for the image
   */
  generateFileName(prefix: string = 'openrouter-image', format: string = 'png'): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    return `${prefix}-${timestamp}.${format}`
  }

  /**
   * Downloads base64 image data as a file in the browser
   */
  async downloadBase64Image(
    base64Data: string,
    fileName?: string,
    options: {
      prefix?: string
      showProgress?: boolean
    } = {}
  ): Promise<ImageSaveResult> {
    try {
      if (typeof window === 'undefined') {
        throw new Error('Download functionality only available in browser environment')
      }

      // Clean base64 data
      let cleanBase64 = base64Data
      if (base64Data.includes(',')) {
        cleanBase64 = base64Data.split(',')[1]
      }

      // Get image format
      const format = this.getImageFormat(base64Data)
      
      // Generate filename if not provided
      const finalFileName = fileName || this.generateFileName(options.prefix || 'openrouter-image', format)

      // Convert base64 to blob
      const byteCharacters = atob(cleanBase64)
      const byteNumbers = new Array(byteCharacters.length)
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: `image/${format}` })

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = finalFileName
      
      // Trigger download
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Clean up
      window.URL.revokeObjectURL(url)

      console.log(`✅ Image downloaded: ${finalFileName}`)
      console.log(`📦 Size: ${(blob.size / 1024).toFixed(1)} KB`)

      return {
        success: true,
        fileName: finalFileName,
        size: blob.size,
        filePath: `Downloads/${finalFileName}` // Typical browser download path
      }

    } catch (error) {
      console.error('Error downloading base64 image:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Creates a preview URL for base64 image data
   */
  createPreviewUrl(base64Data: string): string | null {
    try {
      if (base64Data.startsWith('data:image/')) {
        return base64Data // Already a data URL
      }
      
      // Assume PNG if no format specified
      return `data:image/png;base64,${base64Data}`
    } catch (error) {
      console.error('Error creating preview URL:', error)
      return null
    }
  }

  /**
   * Validates if a string contains valid base64 image data
   */
  isValidBase64Image(data: string): boolean {
    try {
      // Check if it's a data URL
      if (data.startsWith('data:image/')) {
        const base64Part = data.split(',')[1]
        if (!base64Part) return false
        
        // Try to decode
        atob(base64Part)
        return true
      }
      
      // Check if it's raw base64
      if (data.length > 100 && /^[A-Za-z0-9+/]+={0,2}$/.test(data)) {
        atob(data)
        return true
      }
      
      return false
    } catch (error) {
      return false
    }
  }
}

export const imageUtils = ImageUtilsService.getInstance()
export default imageUtils
