"use client"

import type React from "react"

import { useState } from "react"
import { storiesService } from "../services/supabase/stories"
import ModelSelector from "./ModelSelector"

interface CreateHistoryFormProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function CreateHistoryForm({ onClose, onSuccess }: CreateHistoryFormProps) {
  const [story, setStory] = useState("")
  const [title, setTitle] = useState("")
  const [selectedStyle, setSelectedStyle] = useState("steve-mccurry") // Default style
  const [selectedModel, setSelectedModel] = useState("openai-gpt-4") // Default model
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!story.trim()) {
      alert('Please enter a story')
      return
    }

    setIsSubmitting(true)
    
    try {
      console.log('🎬 Starting REAL AI-powered story creation...');
      console.log(`📝 Title: "${title.trim() || 'Untitled Story'}"`);
      console.log(`📊 Story length: ${story.trim().length} characters`);
      
      const { story: createdStory, chapters, characters, coverImagePrompt, coverImageUrl, error } = await storiesService.createStoryWithAI({
        title: title.trim() || 'Untitled Story',
        full_story_text: story.trim(),
        visual_style: selectedStyle,
        selected_model: selectedModel
      })

      if (error) {
        console.error('❌ Real story creation failed:', error)
        alert(`Failed to create story: ${error.message || error}`)
      } else {
        console.log('✅ Story created successfully with REAL AI analysis!', {
          story: createdStory,
          chapters: chapters?.length || 0,
          characters: characters?.length || 0,
          coverImagePrompt: coverImagePrompt ? 'Generated' : 'None',
          coverImageUrl: coverImageUrl ? 'Generated' : 'None'
        })
        
        // Reset form completely
        setStory('')
        setTitle('')
        setSelectedStyle('steve-mccurry')
        
        // Trigger portfolio refresh and close modal
        if (onSuccess) onSuccess()
        if (onClose) onClose()
        
        alert('✅ Story created successfully! Check your portfolio to see the real results.')
      }
    } catch (error) {
      console.error('❌ Unexpected error during REAL story creation:', error)
      alert('An unexpected error occurred during story creation. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }



  return (
    <>
      <style>{`
            @import url("https://fonts.googleapis.com/css2?family=Quicksand:wght@300&display=swap");
            
            /* Reset any default styling */
            * {
              box-sizing: border-box;
            }
            
            .ring {
              position: relative;
              width: 600px;
              height: 600px;
              display: flex;
              justify-content: center;
              align-items: center;
              background: transparent !important;
              border: none !important;
              outline: none !important;
              box-shadow: none !important;
            }
            
            .ring i {
              position: absolute;
              inset: 0;
              border: none;
              transition: 0.5s;
            }
            
            .ring i:nth-child(1) {
              border: 2px solid #fff;
              border-radius: 38% 62% 63% 37% / 41% 44% 56% 59%;
              animation: animate 6s linear infinite;
            }
            
            .ring i:nth-child(2) {
              border: 2px solid #fff;
              border-radius: 41% 44% 56% 59%/38% 62% 63% 37%;
              animation: animate 4s linear infinite;
            }
            
            .ring i:nth-child(3) {
              border: 2px solid #fff;
              border-radius: 41% 44% 56% 59%/38% 62% 63% 37%;
              animation: animate2 10s linear infinite;
            }
            
            .ring:hover i {
              border: 6px solid var(--clr);
              filter: drop-shadow(0 0 20px var(--clr));
            }
            
            @keyframes animate {
              0% {
                transform: rotate(0deg);
              }
              100% {
                transform: rotate(360deg);
              }
            }
            
            @keyframes animate2 {
              0% {
                transform: rotate(360deg);
              }
              100% {
                transform: rotate(0deg);
              }
            }
            
            .login {
              position: absolute;
              width: 400px;
              height: 100%;
              display: flex;
              justify-content: center;
              align-items: center;
              flex-direction: column;
              gap: 20px;
              font-family: "Quicksand", sans-serif;
              background: transparent;
              border: none;
              outline: none;
            }
            
            .login h2 {
              font-size: 2em;
              color: #fff;
              margin: 0;
            }
            
            .login .inputBx {
              position: relative;
              width: 100%;
            }
            
            .login .inputBx input {
              position: relative;
              width: 100%;
              padding: 12px 20px;
              background: transparent;
              border: 2px solid #fff;
              border-radius: 40px;
              font-size: 1.2em;
              color: #fff;
              box-shadow: none;
              outline: none;
              font-family: "Quicksand", sans-serif;
            }
            
            .login .inputBx textarea {
              position: relative;
              width: 100%;
              padding: 20px;
              background: transparent;
              border: 2px solid #fff;
              border-radius: 20px;
              font-size: 1.2em;
              color: #fff;
              box-shadow: none;
              outline: none;
              font-family: "Quicksand", sans-serif;
              resize: vertical;
              min-height: 120px;
            }
            
            .login .inputBx textarea::placeholder {
              color: rgba(255, 255, 255, 0.75);
            }
            
            .login .inputBx input[type="submit"] {
              width: 100%;
              background: linear-gradient(45deg, #ff357a, #fff172);
              border: none;
              cursor: pointer;
            }
            
            .login .inputBx input::placeholder {
              color: rgba(255, 255, 255, 0.75);
            }
          `}</style>

          <div className="ring">
            <i style={{ "--clr": "#00ff0a" } as React.CSSProperties}></i>
            <i style={{ "--clr": "#ff0057" } as React.CSSProperties}></i>
            <i style={{ "--clr": "#fffd44" } as React.CSSProperties}></i>
            <div className="login">
              <h2>Create Story</h2>
              <form onSubmit={handleSubmit}>
                <div className="inputBx">
                  <input
                    type="text"
                    placeholder="Story title (optional)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="inputBx">
                  <textarea
                    placeholder="Write your story here..."
                    value={story}
                    onChange={(e) => setStory(e.target.value)}
                    required
                  />
                </div>
                
                {/* Model Selection */}
                <div className="inputBx" style={{ border: 'none', padding: 0, background: 'transparent' }}>
                  <ModelSelector
                    selectedModel={selectedModel}
                    onModelChange={setSelectedModel}
                    label="AI Model for Story Creation"
                    showDefault={true}
                    defaultModel="openai-gpt-4"
                    className="w-full"
                  />
                </div>
                
                <div className="inputBx">
                  <input 
                    type="submit" 
                    value={isSubmitting ? "Creating Story..." : "Submit"} 
                    disabled={isSubmitting}
                  />
                </div>
              </form>
            </div>
          </div>
    </>
  )
}
