# AI Agents Implementation - Story Deconstructor

This file provides the implementation details for the StoryDeconstructor AI agent, which is responsible for breaking down a user's story into chapters, scenes, and narrative elements.

## Agent Architecture

```typescript
// src/ai/agents/BaseAgent.ts
import { z } from 'zod';
import OpenAI from 'openai';
import { AgentConfig } from '@/types/ai';

/**
 * Base class for all AI agents in the system.
 * Provides common functionality for interacting with AI services.
 */
export abstract class BaseAgent<InputType, OutputType> {
  protected openai: OpenAI;
  protected config: AgentConfig;
  
  // Input and output schemas for validation
  protected abstract inputSchema: z.ZodType<InputType>;
  protected abstract outputSchema: z.ZodType<OutputType>;
  
  constructor(config: AgentConfig) {
    this.config = config;
    this.openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    });
  }
  
  /**
   * Validate input using the agent's schema
   */
  protected validateInput(input: unknown): InputType {
    try {
      return this.inputSchema.parse(input);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Invalid input: ${JSON.stringify(error.errors)}`);
      }
      throw error;
    }
  }
  
  /**
   * Validate output using the agent's schema
   */
  protected validateOutput(output: unknown): OutputType {
    try {
      return this.outputSchema.parse(output);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Invalid AI output: ${JSON.stringify(error.errors)}`);
      }
      throw error;
    }
  }
  
  /**
   * Generate a prompt for the AI based on the input
   */
  protected abstract generatePrompt(input: InputType): string;
  
  /**
   * Process the AI response into the expected output format
   */
  protected abstract processResponse(response: string): OutputType;
  
  /**
   * Execute the agent with the given input
   */
  async execute(input: unknown): Promise<OutputType> {
    // Validate input
    const validatedInput = this.validateInput(input);
    
    // Generate prompt
    const prompt = this.generatePrompt(validatedInput);
    
    // Call OpenAI
    const response = await this.openai.chat.completions.create({
      model: this.config.model || "gpt-4",
      messages: [
        { role: "system", content: this.config.systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: this.config.temperature || 0.7,
      max_tokens: this.config.maxTokens || 2000,
    });
    
    // Process and validate response
    const responseContent = response.choices[0].message.content || '';
    const processedResponse = this.processResponse(responseContent);
    return this.validateOutput(processedResponse);
  }
  
  /**
   * Stream results from the agent
   */
  async *stream(input: unknown): AsyncGenerator<Partial<OutputType>> {
    // Validate input
    const validatedInput = this.validateInput(input);
    
    // Generate prompt
    const prompt = this.generatePrompt(validatedInput);
    
    // Call OpenAI with streaming
    const stream = await this.openai.chat.completions.create({
      model: this.config.model || "gpt-4",
      messages: [
        { role: "system", content: this.config.systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: this.config.temperature || 0.7,
      max_tokens: this.config.maxTokens || 2000,
      stream: true,
    });
    
    let accumulatedResponse = '';
    
    for await (const part of stream) {
      const content = part.choices[0]?.delta?.content || '';
      accumulatedResponse += content;
      
      try {
        // Try to parse the accumulated response so far
        const partialOutput = this.processResponse(accumulatedResponse);
        yield partialOutput;
      } catch (error) {
        // If we can't parse yet, just continue accumulating
        continue;
      }
    }
    
    // Final output
    const finalOutput = this.processResponse(accumulatedResponse);
    yield this.validateOutput(finalOutput);
  }
}
```

## Story Deconstructor Implementation

```typescript
// src/ai/agents/StoryDeconstructor.ts
import { z } from 'zod';
import { BaseAgent } from './BaseAgent';
import { AgentConfig } from '@/types/ai';

// Input schema definition
const StoryDeconstructorInputSchema = z.object({
  storyText: z.string().min(100, "Story must be at least 100 characters"),
  title: z.string().optional(),
  targetChapters: z.number().int().positive().default(5).optional(),
  style: z.enum(['film', 'cartoon', 'youtube']).default('film'),
});

// Output schema definition for a chapter
const ChapterSchema = z.object({
  chapterNumber: z.number().int().positive(),
  title: z.string(),
  summary: z.string(),
  originalTextPortion: z.string(),
  estimatedFilmTime: z.number().int().positive(),
});

// Output schema definition for the entire story
const StoryDeconstructorOutputSchema = z.object({
  title: z.string(),
  logline: z.string(),
  style: z.enum(['film', 'cartoon', 'youtube']),
  chapters: z.array(ChapterSchema),
  totalEstimatedFilmTime: z.number().int().positive(),
});

// Input and output types
type StoryDeconstructorInput = z.infer<typeof StoryDeconstructorInputSchema>;
type StoryDeconstructorOutput = z.infer<typeof StoryDeconstructorOutputSchema>;

/**
 * Story Deconstructor Agent
 * 
 * Responsible for breaking down a story into chapters,
 * creating a logline, and estimating film time.
 */
export class StoryDeconstructor extends BaseAgent<StoryDeconstructorInput, StoryDeconstructorOutput> {
  protected inputSchema = StoryDeconstructorInputSchema;
  protected outputSchema = StoryDeconstructorOutputSchema;

  constructor(config?: Partial<AgentConfig>) {
    super({
      systemPrompt: 
        "You are a professional story deconstructor for film production. " +
        "Your job is to break down a story into logical chapters for filming, " +
        "create a compelling logline, and estimate how long each chapter would " +
        "be when filmed. Adapt your approach based on the style: film (cinematic), " +
        "cartoon (animated), or youtube (engaging for social media).",
      model: "gpt-4",
      temperature: 0.7,
      maxTokens: 2000,
      ...config
    });
  }

  protected generatePrompt(input: StoryDeconstructorInput): string {
    const { storyText, title, targetChapters, style } = input;
    
    return `
      Story Title: ${title || "Untitled"}
      Target Style: ${style}
      
      Please deconstruct the following story into ${targetChapters || 5} logical chapters 
      for a ${style} adaptation. For each chapter:
      
      1. Provide a title
      2. Create a brief summary
      3. Include the portion of the original text it covers
      4. Estimate how many minutes of screen time it would take
      
      Also create a compelling logline (1-2 sentences) for the entire story.
      
      Story:
      ${storyText}
      
      Respond in JSON format with the following structure:
      {
        "title": "Story Title",
        "logline": "Compelling logline here",
        "style": "${style}",
        "chapters": [
          {
            "chapterNumber": 1,
            "title": "Chapter Title",
            "summary": "Brief summary",
            "originalTextPortion": "Text from original story",
            "estimatedFilmTime": 5 // minutes
          }
        ],
        "totalEstimatedFilmTime": 30 // total minutes
      }
    `;
  }

  protected processResponse(response: string): StoryDeconstructorOutput {
    try {
      // Extract JSON from the response (in case there's additional text)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No valid JSON found in response");
      }
      
      const jsonResponse = JSON.parse(jsonMatch[0]);
      return jsonResponse;
    } catch (error) {
      throw new Error(`Failed to parse AI response: ${error}`);
    }
  }
}
```

## Usage Example

```typescript
// src/services/ai/storyService.ts
import { StoryDeconstructor } from '@/ai/agents/StoryDeconstructor';
import { supabase } from '@/services/supabase/client';

export async function processStory(projectId: string, storyText: string, title: string, style: 'film' | 'cartoon' | 'youtube') {
  try {
    // Initialize the story deconstructor agent
    const storyDeconstructor = new StoryDeconstructor();
    
    // Process the story
    const result = await storyDeconstructor.execute({
      storyText,
      title,
      style,
      targetChapters: style === 'youtube' ? 3 : 5, // Fewer chapters for YouTube style
    });
    
    // Store the story in the database
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .insert({
        project_id: projectId,
        title: result.title,
        logline: result.logline,
        full_story_text: storyText,
        status: 'processed'
      })
      .select('id')
      .single();
    
    if (storyError || !story) {
      throw new Error(`Failed to save story: ${storyError?.message}`);
    }
    
    // Store chapters in the database
    const chaptersToInsert = result.chapters.map((chapter) => ({
      story_id: story.id,
      chapter_number: chapter.chapterNumber,
      chapter_title: chapter.title,
      original_story_text_portion: chapter.originalTextPortion,
      chapter_summary_ai: chapter.summary,
      estimated_film_time: chapter.estimatedFilmTime,
      status: 'pending_scenes'
    }));
    
    const { error: chaptersError } = await supabase
      .from('chapters')
      .insert(chaptersToInsert);
    
    if (chaptersError) {
      throw new Error(`Failed to save chapters: ${chaptersError.message}`);
    }
    
    return {
      storyId: story.id,
      title: result.title,
      logline: result.logline,
      chapterCount: result.chapters.length,
      totalEstimatedTime: result.totalEstimatedFilmTime
    };
  } catch (error: any) {
    console.error('Error in story processing:', error);
    throw new Error(`Story processing failed: ${error.message}`);
  }
}

// Example React component usage
export function useStoryProcessing() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const processUserStory = async (projectId: string, storyText: string, title: string, style: 'film' | 'cartoon' | 'youtube') => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await processStory(projectId, storyText, title, style);
      return result;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  return { processUserStory, loading, error };
}
```

## UI Integration

```tsx
// src/pages/projects/StoryInput.tsx
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Button, TextField, Typography, MenuItem, Paper } from '@mui/material';
import { useStoryProcessing } from '@/services/ai/storyService';

export default function StoryInput() {
  const { projectId } = useParams<{ projectId: string }>();
  const [title, setTitle] = useState('');
  const [storyText, setStoryText] = useState('');
  const [style, setStyle] = useState<'film' | 'cartoon' | 'youtube'>('film');
  const { processUserStory, loading, error } = useStoryProcessing();
  const [result, setResult] = useState<any>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectId) return;
    
    const result = await processUserStory(projectId, storyText, title, style);
    if (result) {
      setResult(result);
    }
  };
  
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Create Your Story
      </Typography>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Story Title"
            fullWidth
            margin="normal"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          
          <TextField
            select
            label="Style"
            fullWidth
            margin="normal"
            value={style}
            onChange={(e) => setStyle(e.target.value as 'film' | 'cartoon' | 'youtube')}
          >
            <MenuItem value="film">Film (Cinematic)</MenuItem>
            <MenuItem value="cartoon">Cartoon (Animated)</MenuItem>
            <MenuItem value="youtube">YouTube (Social Media)</MenuItem>
          </TextField>
          
          <TextField
            label="Your Story"
            multiline
            rows={10}
            fullWidth
            margin="normal"
            value={storyText}
            onChange={(e) => setStoryText(e.target.value)}
            required
            placeholder="Enter your story text here. The AI will help break it down into chapters and scenes for your video project."
            helperText="Minimum 100 characters required"
          />
          
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            size="large"
            disabled={loading || storyText.length < 100}
            sx={{ mt: 2 }}
          >
            {loading ? 'Processing...' : 'Process Story'}
          </Button>
          
          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
        </form>
      </Paper>
      
      {result && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Story Processed!
          </Typography>
          
          <Typography variant="subtitle1" fontWeight="bold">
            {result.title}
          </Typography>
          
          <Typography variant="body1" paragraph>
            {result.logline}
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Typography>
              Chapters: {result.chapterCount}
            </Typography>
            <Typography>
              Estimated Length: {result.totalEstimatedTime} minutes
            </Typography>
          </Box>
          
          <Button 
            variant="contained" 
            color="secondary"
            fullWidth
            sx={{ mt: 2 }}
            component={Link}
            to={`/projects/${projectId}/chapters`}
          >
            View Chapters
          </Button>
        </Paper>
      )}
    </Box>
  );
}
```

## Types Definition

```typescript
// src/types/ai.ts
export interface AgentConfig {
  systemPrompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
  [key: string]: any;
}

// src/types/supabase.ts
export type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          project_type: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          project_type: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          project_type?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      stories: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          logline: string | null;
          full_story_text: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          logline?: string | null;
          full_story_text: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          title?: string;
          logline?: string | null;
          full_story_text?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      chapters: {
        Row: {
          id: string;
          story_id: string;
          chapter_number: number;
          chapter_title: string;
          original_story_text_portion: string;
          chapter_summary_ai: string | null;
          estimated_film_time: number | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          story_id: string;
          chapter_number: number;
          chapter_title: string;
          original_story_text_portion: string;
          chapter_summary_ai?: string | null;
          estimated_film_time?: number | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          story_id?: string;
          chapter_number?: number;
          chapter_title?: string;
          original_story_text_portion?: string;
          chapter_summary_ai?: string | null;
          estimated_film_time?: number | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      // Other tables omitted for brevity
    };
  };
};
```

This implementation provides a robust foundation for the story deconstruction process in the FilmStudio AI Platform. The StoryDeconstructor agent takes a user's narrative text and breaks it down into filmable chapters, assigning estimated screen time and creating a compelling logline.

The agent architecture follows best practices:
1. Uses TypeScript for strong typing
2. Implements Zod schemas for runtime validation
3. Follows the Open/Closed principle with an extensible base class
4. Provides both standard and streaming execution modes
5. Integrates with Supabase for data persistence

Additional AI agents (CharacterExtractor, SceneDesigner, ShotDesigner, etc.) would follow the same pattern but with specialized functionality for their particular tasks.
