# FilmStudio AI Platform - AI Agent Implementation

This document provides a detailed implementation guide for the AI agents used in the FilmStudio AI Platform.

## AI Agent Architecture

The AI agents in our platform follow a structured architecture designed for modularity, reusability, and maintainability:

```
services/ai/
├── agents/                   # AI agent implementations
│   ├── BaseAgent.ts          # Base abstract class for all agents
│   ├── StoryDeconstructor.ts # Story analysis agent
│   ├── CharacterExtractor.ts # Character identification agent
│   ├── SceneDesigner.ts      # Scene creation agent
│   ├── ShotDesigner.ts       # Shot design agent
│   ├── ImagePromptEngine.ts  # Image prompt creation agent
│   └── VideoFlowDesigner.ts  # Video motion design agent
├── openai/                   # OpenAI API integration
│   ├── client.ts             # OpenAI client configuration
│   └── prompts.ts            # Reusable prompts and templates
├── stability/                # Stability AI integration for image generation
│   └── client.ts             # Stability AI client
├── videoGen/                 # Video generation integrations
│   ├── runwayml.ts           # RunwayML API integration
│   └── pikalabs.ts           # Pika Labs API integration
└── utils/                    # AI utility functions
    ├── promptBuilder.ts      # Helper for creating structured prompts
    ├── outputParser.ts       # Parsing and validating AI responses
    └── contextBuilder.ts     # Building context for AI requests
```

## Base Agent Implementation

All AI agents inherit from a common base class that provides core functionality:

```typescript
// src/services/ai/agents/BaseAgent.ts
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

export type ProcessingStatus = 'idle' | 'processing' | 'success' | 'error';

export interface AgentRequest<T> {
  id: string;
  input: T;
  timestamp: Date;
}

export interface AgentResponse<T> {
  id: string;
  requestId: string;
  output: T;
  timestamp: Date;
  processingTime: number;
  status: ProcessingStatus;
  error?: string;
}

export abstract class BaseAgent<TInput, TOutput> {
  protected name: string;
  protected status: ProcessingStatus = 'idle';
  protected validationSchema?: z.ZodType<TOutput>;
  
  constructor(name: string, validationSchema?: z.ZodType<TOutput>) {
    this.name = name;
    this.validationSchema = validationSchema;
  }
  
  async execute(input: TInput): Promise<AgentResponse<TOutput>> {
    const requestId = uuidv4();
    const request: AgentRequest<TInput> = {
      id: requestId,
      input,
      timestamp: new Date()
    };
    
    const startTime = Date.now();
    this.status = 'processing';
    
    try {
      const output = await this.process(input);
      
      // Validate output if schema is provided
      if (this.validationSchema) {
        try {
          this.validationSchema.parse(output);
        } catch (validationError) {
          throw new Error(`Output validation failed: ${validationError.message}`);
        }
      }
      
      this.status = 'success';
      
      return {
        id: uuidv4(),
        requestId,
        output,
        timestamp: new Date(),
        processingTime: Date.now() - startTime,
        status: this.status
      };
    } catch (error) {
      this.status = 'error';
      
      return {
        id: uuidv4(),
        requestId,
        output: {} as TOutput,
        timestamp: new Date(),
        processingTime: Date.now() - startTime,
        status: this.status,
        error: error.message
      };
    }
  }
  
  getStatus(): ProcessingStatus {
    return this.status;
  }
  
  abstract process(input: TInput): Promise<TOutput>;
}
```

## Story Deconstructor Agent

The Story Deconstructor agent analyzes a story text and breaks it down into logical chapters:

```typescript
// src/services/ai/agents/StoryDeconstructor.ts
import { z } from 'zod';
import { BaseAgent } from './BaseAgent';
import { buildPrompt } from '../utils/promptBuilder';
import openai from '../openai/client';

// Input and output type definitions
export interface StoryDeconstructorInput {
  storyText: string;
  title: string;
  targetChapters?: number; // Optional target number of chapters
}

export const ChapterSchema = z.object({
  chapterNumber: z.number(),
  chapterTitle: z.string(),
  summary: z.string(),
  originalTextPortion: z.string()
});

export type Chapter = z.infer<typeof ChapterSchema>;

export const StoryDeconstructorOutputSchema = z.object({
  chapters: z.array(ChapterSchema),
  overallTheme: z.string(),
  suggestedStyle: z.string().optional()
});

export type StoryDeconstructorOutput = z.infer<typeof StoryDeconstructorOutputSchema>;

export class StoryDeconstructor extends BaseAgent<StoryDeconstructorInput, StoryDeconstructorOutput> {
  constructor() {
    super('Story Deconstructor', StoryDeconstructorOutputSchema);
  }
  
  async process(input: StoryDeconstructorInput): Promise<StoryDeconstructorOutput> {
    const targetChapters = input.targetChapters || 'appropriate';
    
    const prompt = buildPrompt([
      {
        role: 'system',
        content: `You are a professional story analyst and script developer. 
          Your task is to break down a story into logical chapters. 
          For each chapter, provide a title, summary, and the exact text portion from the original story.
          Aim to create ${targetChapters} chapters that make narrative sense, 
          focusing on plot progression and maintaining coherent scene continuity.`
      },
      {
        role: 'user',
        content: `Title: ${input.title}
          
          Story:
          ${input.storyText}
          
          Please break this story into logical chapters. For each chapter provide:
          1. Chapter number
          2. A compelling chapter title
          3. A summary of key events (100-150 words)
          4. The exact text portion from the original story
          
          Also provide:
          - An overall theme analysis
          - A suggested visual style for adaptation`
      }
    ]);
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: prompt,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });
    
    try {
      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('Empty response from OpenAI');
      }
      
      const parsedResponse = JSON.parse(content);
      return parsedResponse;
    } catch (error) {
      throw new Error(`Failed to parse AI response: ${error.message}`);
    }
  }
}
```

## Character Extractor Agent

The Character Extractor agent identifies and analyzes characters within a story:

```typescript
// src/services/ai/agents/CharacterExtractor.ts
import { z } from 'zod';
import { BaseAgent } from './BaseAgent';
import { buildPrompt } from '../utils/promptBuilder';
import openai from '../openai/client';

// Input and output type definitions
export interface CharacterExtractorInput {
  storyText: string;
  storyTitle: string;
}

export const CharacterSchema = z.object({
  characterName: z.string(),
  roleInStory: z.string(), // Protagonist, Antagonist, Supporting, etc.
  backstory: z.string(),
  physicalDescription: z.string(),
  personality: z.string(),
  motivation: z.string(),
  archetype: z.string().optional(),
  suggestedLookDescription: z.string()
});

export type Character = z.infer<typeof CharacterSchema>;

export const CharacterExtractorOutputSchema = z.object({
  characters: z.array(CharacterSchema),
  relationships: z.array(z.object({
    character1: z.string(),
    character2: z.string(),
    relationshipType: z.string(),
    description: z.string()
  })).optional()
});

export type CharacterExtractorOutput = z.infer<typeof CharacterExtractorOutputSchema>;

export class CharacterExtractor extends BaseAgent<CharacterExtractorInput, CharacterExtractorOutput> {
  constructor() {
    super('Character Extractor', CharacterExtractorOutputSchema);
  }
  
  async process(input: CharacterExtractorInput): Promise<CharacterExtractorOutput> {
    const prompt = buildPrompt([
      {
        role: 'system',
        content: `You are a professional character analyst and designer for film and media. 
          Your task is to identify and analyze all characters in a story, 
          providing detailed information about each character including their appearance, 
          personality, role in the story, and relationships with other characters.`
      },
      {
        role: 'user',
        content: `Title: ${input.storyTitle}
          
          Story:
          ${input.storyText}
          
          Please identify all characters in this story. For each character provide:
          1. Character name
          2. Role in the story (Protagonist, Antagonist, Supporting, etc.)
          3. Brief backstory based on the text
          4. Physical appearance description
          5. Personality traits
          6. Primary motivation
          7. Character archetype (if applicable)
          8. A detailed description of how they might look (for visual concept creation)
          
          Also provide information about relationships between characters where relevant.`
      }
    ]);
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: prompt,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });
    
    try {
      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('Empty response from OpenAI');
      }
      
      const parsedResponse = JSON.parse(content);
      return parsedResponse;
    } catch (error) {
      throw new Error(`Failed to parse AI response: ${error.message}`);
    }
  }
}
```

## Scene Designer Agent

The Scene Designer agent creates detailed scene descriptions from chapter content:

```typescript
// src/services/ai/agents/SceneDesigner.ts
import { z } from 'zod';
import { BaseAgent } from './BaseAgent';
import { buildPrompt } from '../utils/promptBuilder';
import openai from '../openai/client';
import { Character } from './CharacterExtractor';

// Input and output type definitions
export interface SceneDesignerInput {
  chapterText: string;
  chapterTitle: string;
  chapterSummary: string;
  characters: Character[];
  visualStyle?: string;
}

export const SceneSchema = z.object({
  sceneNumber: z.string(),
  location: z.string(),
  timeOfDay: z.string(),
  moodFeel: z.string(),
  artisticFocus: z.string(),
  sceneDescription: z.string(),
  characterIds: z.array(z.string())
});

export type Scene = z.infer<typeof SceneSchema>;

export const SceneDesignerOutputSchema = z.object({
  scenes: z.array(SceneSchema)
});

export type SceneDesignerOutput = z.infer<typeof SceneDesignerOutputSchema>;

export class SceneDesigner extends BaseAgent<SceneDesignerInput, SceneDesignerOutput> {
  constructor() {
    super('Scene Designer', SceneDesignerOutputSchema);
  }
  
  async process(input: SceneDesignerInput): Promise<SceneDesignerOutput> {
    const characterInfo = input.characters.map(c => 
      `${c.characterName}: ${c.roleInStory}`).join('\n');
    
    const prompt = buildPrompt([
      {
        role: 'system',
        content: `You are a professional screenwriter and scene designer. 
          Your task is to break down a chapter into distinct cinematic scenes.
          For each scene, provide location, time of day, mood, artistic focus,
          and a detailed description of what happens in the scene.
          Think cinematically and focus on visual storytelling.`
      },
      {
        role: 'user',
        content: `Chapter Title: ${input.chapterTitle}
          
          Chapter Summary: ${input.chapterSummary}
          
          Chapter Text:
          ${input.chapterText}
          
          Characters:
          ${characterInfo}
          
          ${input.visualStyle ? `Suggested Visual Style: ${input.visualStyle}` : ''}
          
          Please break this chapter into 5-10 distinct cinematic scenes. For each scene provide:
          1. Scene number (e.g., 1.1, 1.2 for Chapter 1 Scene 1, Scene 2)
          2. Location (be specific and visual)
          3. Time of day
          4. Overall mood/feel
          5. Artistic focus (what visual elements to emphasize)
          6. A detailed scene description (what happens, key actions, dialogue hints)
          7. Characters present in the scene (use their exact names as provided)`
      }
    ]);
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: prompt,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });
    
    try {
      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('Empty response from OpenAI');
      }
      
      const parsedResponse = JSON.parse(content);
      
      // Map character names to character IDs
      const characterMap = new Map(input.characters.map(c => [c.characterName, c.characterName]));
      
      parsedResponse.scenes = parsedResponse.scenes.map(scene => {
        const characterIds = (scene.characters || [])
          .map(name => characterMap.get(name))
          .filter(Boolean);
        
        return {
          ...scene,
          characterIds
        };
      });
      
      return parsedResponse;
    } catch (error) {
      throw new Error(`Failed to parse AI response: ${error.message}`);
    }
  }
}
```

## Shot Designer Agent

The Shot Designer agent creates detailed camera shots for each scene:

```typescript
// src/services/ai/agents/ShotDesigner.ts
import { z } from 'zod';
import { BaseAgent } from './BaseAgent';
import { buildPrompt } from '../utils/promptBuilder';
import openai from '../openai/client';
import { Character } from './CharacterExtractor';

// Input and output type definitions
export interface ShotDesignerInput {
  sceneDescription: string;
  location: string;
  timeOfDay: string;
  moodFeel: string;
  artisticFocus: string;
  characters: Character[];
}

export const ShotSchema = z.object({
  shotNumber: z.number(),
  shotDescription: z.string(),
  cameraShotType: z.string(),
  cameraMovement: z.string(),
  lensChoiceSuggestion: z.string(),
  lightingDescription: z.string(),
  colorPaletteFocus: z.string(),
  artisticIntent: z.string(),
  estimatedDuration: z.number(),
  charactersInShot: z.array(z.string()).optional()
});

export type Shot = z.infer<typeof ShotSchema>;

export const ShotDesignerOutputSchema = z.object({
  shots: z.array(ShotSchema)
});

export type ShotDesignerOutput = z.infer<typeof ShotDesignerOutputSchema>;

export class ShotDesigner extends BaseAgent<ShotDesignerInput, ShotDesignerOutput> {
  constructor() {
    super('Shot Designer', ShotDesignerOutputSchema);
  }
  
  async process(input: ShotDesignerInput): Promise<ShotDesignerOutput> {
    const characterInfo = input.characters.map(c => 
      `${c.characterName}: ${c.physicalDescription}`).join('\n');
    
    const prompt = buildPrompt([
      {
        role: 'system',
        content: `You are a professional cinematographer and shot designer.
          Your task is to break down a scene into distinct camera shots.
          For each shot, provide detailed technical and artistic information
          including camera shot type, movement, lighting, and artistic intent.
          Think like a film director and cinematographer working together.`
      },
      {
        role: 'user',
        content: `Scene Description: ${input.sceneDescription}
          
          Location: ${input.location}
          Time of Day: ${input.timeOfDay}
          Mood/Feel: ${input.moodFeel}
          Artistic Focus: ${input.artisticFocus}
          
          Characters:
          ${characterInfo}
          
          Please break this scene into 3-7 distinct camera shots. For each shot provide:
          1. Shot number
          2. Shot description (what this shot captures specifically)
          3. Camera shot type (e.g., Extreme Close-Up, Medium Shot, Wide Shot)
          4. Camera movement (e.g., Static, Pan, Dolly, Steadicam)
          5. Lens choice suggestion (e.g., Wide Angle, Telephoto)
          6. Lighting description (key light, fill light, practical sources)
          7. Color palette focus
          8. Artistic intent (why this shot is important, what it conveys)
          9. Estimated duration in seconds (between 1-30)
          10. Characters visible in this shot (use their exact names as provided)`
      }
    ]);
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: prompt,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });
    
    try {
      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('Empty response from OpenAI');
      }
      
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to parse AI response: ${error.message}`);
    }
  }
}
```

## Image Prompt Engineer Agent

The Image Prompt Engineer creates detailed prompts for image generation:

```typescript
// src/services/ai/agents/ImagePromptEngineer.ts
import { z } from 'zod';
import { BaseAgent } from './BaseAgent';
import { buildPrompt } from '../utils/promptBuilder';
import openai from '../openai/client';
import { Character } from './CharacterExtractor';
import { Shot } from './ShotDesigner';

// Input and output type definitions
export interface ImagePromptInput {
  shot: Shot;
  characters: Character[];
  visualStyle?: string;
  additionalInstructions?: string;
}

export const ImagePromptOutputSchema = z.object({
  prompt: z.string(),
  negativePrompt: z.string().optional(),
  styleKeywords: z.array(z.string()),
  recommendedAspectRatio: z.string(),
  styleReferences: z.array(z.string()).optional()
});

export type ImagePromptOutput = z.infer<typeof ImagePromptOutputSchema>;

export class ImagePromptEngineer extends BaseAgent<ImagePromptInput, ImagePromptOutput> {
  constructor() {
    super('Image Prompt Engineer', ImagePromptOutputSchema);
  }
  
  async process(input: ImagePromptInput): Promise<ImagePromptOutput> {
    const characterDescriptions = input.characters
      .filter(c => input.shot.charactersInShot?.includes(c.characterName))
      .map(c => `${c.characterName}: ${c.physicalDescription}`)
      .join('\n');
    
    const prompt = buildPrompt([
      {
        role: 'system',
        content: `You are a professional AI image prompt engineer.
          Your task is to create detailed, technical prompts for AI image generators
          that will produce high-quality, cinematic still images based on film shot descriptions.
          Your prompts should incorporate camera angles, lighting, color palette,
          and detailed scene elements to create visually stunning and appropriate images.`
      },
      {
        role: 'user',
        content: `Shot Description: ${input.shot.shotDescription}
          
          Technical Details:
          - Camera: ${input.shot.cameraShotType}
          - Movement: ${input.shot.cameraMovement}
          - Lens: ${input.shot.lensChoiceSuggestion}
          - Lighting: ${input.shot.lightingDescription}
          - Color Palette: ${input.shot.colorPaletteFocus}
          - Artistic Intent: ${input.shot.artisticIntent}
          
          Characters:
          ${characterDescriptions}
          
          ${input.visualStyle ? `Visual Style: ${input.visualStyle}` : ''}
          ${input.additionalInstructions ? `Additional Instructions: ${input.additionalInstructions}` : ''}
          
          Please create:
          1. A detailed image generation prompt (optimized for Stable Diffusion or Midjourney)
          2. A negative prompt (elements to avoid)
          3. 5-7 style keywords that capture the essence of this shot
          4. Recommended aspect ratio for this shot
          5. Optional: specific artist or film references that would enhance this style`
      }
    ]);
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: prompt,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });
    
    try {
      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('Empty response from OpenAI');
      }
      
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to parse AI response: ${error.message}`);
    }
  }
  
  async generateImage(prompt: string, negativePrompt?: string) {
    // Implementation for calling Stability API to generate image
    // Would be implemented in a separate stability service
  }
}
```

## Video Flow Designer Agent

The Video Flow Designer creates detailed prompts for video generation:

```typescript
// src/services/ai/agents/VideoFlowDesigner.ts
import { z } from 'zod';
import { BaseAgent } from './BaseAgent';
import { buildPrompt } from '../utils/promptBuilder';
import openai from '../openai/client';
import { Shot } from './ShotDesigner';

// Input and output type definitions
export interface VideoFlowInput {
  shot: Shot;
  stillImageUrl: string;
  stillImagePrompt: string;
}

export const VideoFlowOutputSchema = z.object({
  videoShotFlowDescription: z.string(),
  videoGenerationPrompt: z.string(),
  motionKeywords: z.array(z.string()),
  cameraInstructions: z.string(),
  durationInSeconds: z.number().min(1).max(30),
  audioSuggestions: z.string().optional()
});

export type VideoFlowOutput = z.infer<typeof VideoFlowOutputSchema>;

export class VideoFlowDesigner extends BaseAgent<VideoFlowInput, VideoFlowOutput> {
  constructor() {
    super('Video Flow Designer', VideoFlowOutputSchema);
  }
  
  async process(input: VideoFlowInput): Promise<VideoFlowOutput> {
    const prompt = buildPrompt([
      {
        role: 'system',
        content: `You are a professional cinematographer and motion designer.
          Your task is to create detailed instructions for generating short video clips
          from still images. For each shot, describe how the video should flow,
          what movements should occur, and provide technical details for video generation.
          Think in terms of subtle, cinematic movement and atmosphere.`
      },
      {
        role: 'user',
        content: `Shot Description: ${input.shot.shotDescription}
          
          Technical Details:
          - Camera: ${input.shot.cameraShotType}
          - Movement: ${input.shot.cameraMovement}
          - Lighting: ${input.shot.lightingDescription}
          - Color Palette: ${input.shot.colorPaletteFocus}
          - Artistic Intent: ${input.shot.artisticIntent}
          - Estimated Duration: ${input.shot.estimatedDuration} seconds
          
          Still Image: ${input.stillImageUrl}
          
          Original Still Image Prompt: ${input.stillImagePrompt}
          
          Please create:
          1. A detailed description of how this shot should flow as a video (what moves, how it moves)
          2. A technical prompt for video generation that builds on the still image
          3. 5-7 motion keywords that describe the movement quality
          4. Specific camera instructions (e.g., "slow zoom in", "gentle pan right")
          5. Recommended duration in seconds (between 1-30)
          6. Optional audio suggestions that would complement this shot`
      }
    ]);
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: prompt,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });
    
    try {
      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('Empty response from OpenAI');
      }
      
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to parse AI response: ${error.message}`);
    }
  }
  
  async generateVideo(prompt: string, initImageUrl: string) {
    // Implementation for calling video generation API
    // Would be implemented in a separate videoGen service
  }
}
```

## Utility Functions

Supporting utilities for working with AI agents:

```typescript
// src/services/ai/utils/promptBuilder.ts
export interface MessagePart {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export function buildPrompt(parts: MessagePart[]): MessagePart[] {
  return parts;
}
```

```typescript
// src/services/ai/utils/outputParser.ts
import { z } from 'zod';

export class OutputParser {
  static parseJSON<T>(text: string, schema?: z.ZodType<T>): T {
    try {
      // Try to extract JSON if it's embedded in other text
      let jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        text = jsonMatch[1];
      } else {
        // Try to find JSON between curly braces if not in code block
        jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          text = jsonMatch[0];
        }
      }
      
      const parsed = JSON.parse(text);
      
      if (schema) {
        return schema.parse(parsed);
      }
      
      return parsed;
    } catch (error) {
      throw new Error(`Failed to parse output: ${error.message}`);
    }
  }
}
```

## Integration Examples

### Integrating AI Agents with React Components

Here's an example of how to integrate the AI agents with React components:

```tsx
// src/components/story/StoryAnalysisPanel.tsx
import React, { useState } from 'react';
import { StoryDeconstructor, StoryDeconstructorInput, Chapter } from '../../services/ai/agents/StoryDeconstructor';
import { CharacterExtractor, Character } from '../../services/ai/agents/CharacterExtractor';
import { Button, CircularProgress, Alert } from '@mui/material';

interface StoryAnalysisPanelProps {
  storyId: string;
  storyText: string;
  storyTitle: string;
  onChaptersGenerated: (chapters: Chapter[]) => void;
  onCharactersGenerated: (characters: Character[]) => void;
}

export default function StoryAnalysisPanel({
  storyId,
  storyText,
  storyTitle,
  onChaptersGenerated,
  onCharactersGenerated
}: StoryAnalysisPanelProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const storyDeconstructor = new StoryDeconstructor();
  const characterExtractor = new CharacterExtractor();
  
  const analyzeStory = async () => {
    setIsAnalyzing(true);
    setProgress(0);
    setError(null);
    
    try {
      // Analyze chapters
      setProgress(10);
      const chapterInput: StoryDeconstructorInput = {
        storyText,
        title: storyTitle
      };
      
      const chapterResponse = await storyDeconstructor.execute(chapterInput);
      setProgress(50);
      
      if (chapterResponse.status === 'error') {
        throw new Error(chapterResponse.error);
      }
      
      // Extract characters
      const characterResponse = await characterExtractor.execute({
        storyText,
        storyTitle
      });
      setProgress(90);
      
      if (characterResponse.status === 'error') {
        throw new Error(characterResponse.error);
      }
      
      // Send results to parent component
      onChaptersGenerated(chapterResponse.output.chapters);
      onCharactersGenerated(characterResponse.output.characters);
      
      setProgress(100);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  return (
    <div className="story-analysis-panel">
      <h3>Story Analysis</h3>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Button
        variant="contained"
        color="primary"
        onClick={analyzeStory}
        disabled={isAnalyzing}
        startIcon={isAnalyzing && <CircularProgress size={20} color="inherit" />}
      >
        {isAnalyzing ? `Analyzing... ${progress}%` : 'Analyze Story'}
      </Button>
      
      <p className="help-text">
        This will break down your story into chapters and identify characters.
      </p>
    </div>
  );
}
```

### Saving AI Agent Results to Supabase

Here's an example of how to save AI agent results to the Supabase database:

```tsx
// src/services/supabase/storyService.ts
import { supabase } from './client';
import { Chapter } from '../ai/agents/StoryDeconstructor';
import { Character } from '../ai/agents/CharacterExtractor';
import { Scene } from '../ai/agents/SceneDesigner';
import { Shot } from '../ai/agents/ShotDesigner';

export async function saveChapters(storyId: string, chapters: Chapter[]) {
  const chapterData = chapters.map((chapter, index) => ({
    story_id: storyId,
    chapter_number: chapter.chapterNumber,
    chapter_title: chapter.chapterTitle,
    original_story_text_portion: chapter.originalTextPortion,
    chapter_summary_ai: chapter.summary,
    estimated_film_time: 0, // Placeholder, would be calculated
    status: 'pending_scenes',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));
  
  const { data, error } = await supabase
    .from('chapters')
    .insert(chapterData)
    .select();
    
  if (error) {
    throw new Error(`Error saving chapters: ${error.message}`);
  }
  
  return data;
}

export async function saveCharacters(storyId: string, characters: Character[]) {
  const characterData = characters.map(character => ({
    story_id: storyId,
    character_name: character.characterName,
    role_in_story: character.roleInStory,
    backstory_ai: character.backstory,
    look_feel_ai: character.suggestedLookDescription,
    status: 'identified',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));
  
  const { data, error } = await supabase
    .from('characters')
    .insert(characterData)
    .select();
    
  if (error) {
    throw new Error(`Error saving characters: ${error.message}`);
  }
  
  return data;
}

export async function saveScenes(chapterId: string, scenes: Scene[]) {
  const sceneData = scenes.map(scene => ({
    chapter_id: chapterId,
    scene_number: scene.sceneNumber,
    location_ai: scene.location,
    time_of_day_ai: scene.timeOfDay,
    overall_mood_feel_ai: scene.moodFeel,
    artistic_focus_ai: scene.artisticFocus,
    scene_description_ai: scene.sceneDescription,
    status: 'pending_shots',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));
  
  const { data, error } = await supabase
    .from('scenes')
    .insert(sceneData)
    .select();
    
  if (error) {
    throw new Error(`Error saving scenes: ${error.message}`);
  }
  
  // Save character associations
  for (const scene of scenes) {
    if (scene.characterIds && scene.characterIds.length > 0) {
      const sceneId = data.find(s => s.scene_number === scene.sceneNumber)?.id;
      
      if (sceneId) {
        const characterAssociations = scene.characterIds.map(characterId => ({
          scene_id: sceneId,
          character_id: characterId
        }));
        
        const { error: assocError } = await supabase
          .from('scene_characters')
          .insert(characterAssociations);
          
        if (assocError) {
          console.error(`Error saving character associations: ${assocError.message}`);
        }
      }
    }
  }
  
  return data;
}

export async function saveShots(sceneId: string, shots: Shot[]) {
  const shotData = shots.map(shot => ({
    scene_id: sceneId,
    shot_number_in_scene: shot.shotNumber,
    shot_description_ai: shot.shotDescription,
    camera_shot_type_ai: shot.cameraShotType,
    camera_movement_ai: shot.cameraMovement,
    lens_choice_suggestion_ai: shot.lensChoiceSuggestion,
    lighting_description_ai: shot.lightingDescription,
    color_palette_focus_ai: shot.colorPaletteFocus,
    artistic_intent_ai: shot.artisticIntent,
    estimated_duration_ai: shot.estimatedDuration,
    status: 'pending_still_prompt',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));
  
  const { data, error } = await supabase
    .from('shots')
    .insert(shotData)
    .select();
    
  if (error) {
    throw new Error(`Error saving shots: ${error.message}`);
  }
  
  return data;
}
```

## State Management for AI Processing

Here's an example of a Redux slice for managing AI processing state:

```typescript
// src/store/slices/aiProcessingSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { StoryDeconstructor, StoryDeconstructorInput } from '../../services/ai/agents/StoryDeconstructor';
import { CharacterExtractor } from '../../services/ai/agents/CharacterExtractor';
import { saveChapters, saveCharacters } from '../../services/supabase/storyService';

export const analyzeStory = createAsyncThunk(
  'aiProcessing/analyzeStory',
  async ({ storyId, storyText, storyTitle }: { storyId: string, storyText: string, storyTitle: string }, { rejectWithValue }) => {
    try {
      const storyDeconstructor = new StoryDeconstructor();
      const characterExtractor = new CharacterExtractor();
      
      // Analyze chapters
      const chapterInput: StoryDeconstructorInput = {
        storyText,
        title: storyTitle
      };
      
      const chapterResponse = await storyDeconstructor.execute(chapterInput);
      
      if (chapterResponse.status === 'error') {
        throw new Error(chapterResponse.error);
      }
      
      // Extract characters
      const characterResponse = await characterExtractor.execute({
        storyText,
        storyTitle
      });
      
      if (characterResponse.status === 'error') {
        throw new Error(characterResponse.error);
      }
      
      // Save results to database
      const savedChapters = await saveChapters(storyId, chapterResponse.output.chapters);
      const savedCharacters = await saveCharacters(storyId, characterResponse.output.characters);
      
      return {
        chapters: savedChapters,
        characters: savedCharacters,
        overallTheme: chapterResponse.output.overallTheme,
        suggestedStyle: chapterResponse.output.suggestedStyle
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const aiProcessingSlice = createSlice({
  name: 'aiProcessing',
  initialState: {
    isProcessing: false,
    currentTask: null,
    progress: 0,
    error: null,
    lastResults: null
  },
  reducers: {
    setProgress: (state, action) => {
      state.progress = action.payload;
    },
    resetProcessing: (state) => {
      state.isProcessing = false;
      state.currentTask = null;
      state.progress = 0;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(analyzeStory.pending, (state) => {
        state.isProcessing = true;
        state.currentTask = 'story_analysis';
        state.progress = 0;
        state.error = null;
      })
      .addCase(analyzeStory.fulfilled, (state, action) => {
        state.isProcessing = false;
        state.progress = 100;
        state.lastResults = action.payload;
      })
      .addCase(analyzeStory.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.payload as string;
      });
  }
});

export const { setProgress, resetProcessing } = aiProcessingSlice.actions;
export default aiProcessingSlice.reducer;
```

## Conclusion

This AI agent architecture provides a flexible, modular system for implementing the various AI-powered features of the FilmStudio AI Platform. The architecture allows for:

1. **Standardized Input/Output:** Each agent has clearly defined input and output types with validation
2. **Error Handling:** Robust error handling throughout the processing pipeline
3. **Modularity:** Each agent handles a specific task and can be used independently
4. **Extensibility:** New agents can be added by extending the BaseAgent class
5. **Type Safety:** TypeScript ensures type safety throughout the system

As the platform evolves, this architecture can be extended to include more specialized agents, different AI providers, and additional media processing capabilities.
