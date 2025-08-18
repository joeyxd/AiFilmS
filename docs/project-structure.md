# FilmStudio AI Platform - Project Structure

This document outlines the proposed structure for the FilmStudio AI Platform, a React TypeScript application with Supabase backend.

## Project Structure

```
filmstudio-ai/
├── .github/
│   └── workflows/              # CI/CD pipelines
├── public/                     # Static files
├── src/
│   ├── assets/                 # Images, icons, etc.
│   ├── components/             # React components
│   │   ├── common/             # Reusable UI components
│   │   ├── dashboard/          # Dashboard related components
│   │   ├── editor/             # Video editor components
│   │   │   ├── timeline/       # Timeline related components
│   │   │   ├── preview/        # Video preview components
│   │   │   └── controls/       # Editor control components
│   │   ├── projects/           # Project management components
│   │   ├── mediaLibrary/       # Media library components
│   │   └── aiAgents/           # AI agent related components
│   ├── context/                # React context providers
│   ├── hooks/                  # Custom React hooks
│   ├── layouts/                # Layout components
│   ├── pages/                  # Page components
│   │   ├── auth/               # Authentication pages
│   │   ├── dashboard/          # Dashboard pages
│   │   ├── editor/             # Video editor pages
│   │   ├── projects/           # Project management pages
│   │   └── settings/           # User settings pages
│   ├── services/               # Service layer
│   │   ├── api/                # API service
│   │   ├── supabase/           # Supabase client and services
│   │   ├── ai/                 # AI services integration
│   │   │   ├── agents/         # AI agent implementations
│   │   │   ├── openai/         # OpenAI integration
│   │   │   ├── stability/      # Stability AI integration
│   │   │   └── videoGen/       # Video generation services
│   │   └── ffmpeg/             # FFmpeg service for video processing
│   ├── store/                  # State management
│   │   ├── slices/             # Redux slices
│   │   └── index.ts            # Store configuration
│   ├── types/                  # TypeScript type definitions
│   ├── utils/                  # Utility functions
│   ├── App.tsx                 # Main App component
│   ├── index.tsx               # Entry point
│   └── routes.tsx              # Application routes
├── .env.example                # Example environment variables
├── .eslintrc.js                # ESLint configuration
├── .gitignore                  # Git ignore file
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
└── vite.config.ts              # Vite configuration
```

## Key Libraries and Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.0",
    "@supabase/supabase-js": "^2.39.0",
    "@ffmpeg/ffmpeg": "^0.12.0",
    "@ffmpeg/util": "^0.12.0",
    "@reduxjs/toolkit": "^2.0.0",
    "react-redux": "^9.0.0",
    "openai": "^4.24.0",
    "axios": "^1.6.0",
    "date-fns": "^3.0.0",
    "uuid": "^9.0.0",
    "@mui/material": "^5.15.0",
    "@mui/icons-material": "^5.15.0",
    "formik": "^2.4.0",
    "yup": "^1.3.0",
    "react-beautiful-dnd": "^13.1.0",
    "wavesurfer.js": "^7.5.0",
    "zustand": "^4.4.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/node": "^20.10.0",
    "@typescript-eslint/eslint-plugin": "^6.15.0",
    "@typescript-eslint/parser": "^6.15.0",
    "eslint": "^8.56.0",
    "eslint-plugin-react": "^7.33.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "prettier": "^3.1.0",
    "husky": "^8.0.3",
    "lint-staged": "^15.2.0"
  }
}
```

## Database Tables and Relationships

The following diagram illustrates the database schema for the application:

```
users
  | id (PK)
  | email
  | username
  | avatar_url
  | subscription_tier
  |
  |---- projects
        | id (PK)
        | user_id (FK -> users.id)
        | title
        | description
        | project_type
        | status
        |
        |---- stories
              | id (PK)
              | project_id (FK -> projects.id)
              | title
              | logline
              | full_story_text
              | status
              |
              |---- chapters
                    | id (PK)
                    | story_id (FK -> stories.id)
                    | chapter_number
                    | chapter_title
                    | original_story_text_portion
                    | chapter_summary_ai
                    | estimated_film_time
                    | status
                    |
                    |---- scenes
                          | id (PK)
                          | chapter_id (FK -> chapters.id)
                          | scene_number
                          | location_ai
                          | time_of_day_ai
                          | overall_mood_feel_ai
                          | artistic_focus_ai
                          | scene_description_ai
                          | status
                          |
                          |---- shots
                                | id (PK)
                                | scene_id (FK -> scenes.id)
                                | shot_number_in_scene
                                | shot_description_ai
                                | camera_shot_type_ai
                                | camera_movement_ai
                                | lens_choice_suggestion_ai
                                | lighting_description_ai
                                | color_palette_focus_ai
                                | artistic_intent_ai
                                | still_image_prompt_technical_ai
                                | generated_still_image_url
                                | video_shot_flow_description_ai
                                | video_generation_prompt_technical_ai
                                | estimated_duration_ai
                                | generated_video_clip_url
                                | status
              |
              |---- characters
                    | id (PK)
                    | story_id (FK -> stories.id)
                    | character_name
                    | role_in_story
                    | backstory_ai
                    | look_feel_ai
                    | still_image_prompt
                    | generated_character_image_url
                    | status
                    |
                    |---- scene_characters (junction table)
                          | id (PK)
                          | scene_id (FK -> scenes.id)
                          | character_id (FK -> characters.id)
  |
  |---- media_library
        | id (PK)
        | user_id (FK -> users.id)
        | type
        | url
        | name
        | description
        | duration
        | tags
        | is_public
  |
  |---- export_configs
        | id (PK)
        | project_id (FK -> projects.id)
        | platform
        | settings
```

## API Endpoints

The application will use Supabase for most database operations, but here are some custom API endpoints we'll need:

### Authentication
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/user

### Projects
- GET /api/projects
- GET /api/projects/:id
- POST /api/projects
- PUT /api/projects/:id
- DELETE /api/projects/:id

### AI Processing
- POST /api/ai/story-analysis
- POST /api/ai/character-extraction
- POST /api/ai/scene-design
- POST /api/ai/shot-design
- POST /api/ai/image-prompt
- POST /api/ai/video-prompt

### Media Processing
- POST /api/media/upload
- POST /api/media/process
- POST /api/media/transcode
- POST /api/export/platform

## Integration Points

1. **Supabase Integration**
   - Authentication
   - Database operations
   - Storage for media files
   - Realtime updates

2. **AI Service Integration**
   - OpenAI for text processing and analysis
   - Stability AI for image generation
   - Video generation services (RunwayML, etc.)

3. **FFmpeg Integration**
   - Video editing and processing
   - Audio mixing
   - Format conversion
   - Video effects

4. **External Platform Integration**
   - YouTube API
   - TikTok API
   - Instagram API

## Development Process

1. **Setup Phase**
   - Create React app with TypeScript
   - Set up Supabase project
   - Configure authentication
   - Set up basic routing

2. **Core Features Development**
   - User management
   - Project management
   - Database schema implementation
   - Basic UI components

3. **AI Integration Phase**
   - Implement AI agents
   - Set up OpenAI integration
   - Develop image generation pipeline
   - Create video generation workflow

4. **Video Editing Phase**
   - Implement FFmpeg integration
   - Build timeline editor
   - Develop media library
   - Create export functionality

5. **Testing and Refinement**
   - User testing
   - Performance optimization
   - Bug fixes
   - Feature refinement

6. **Deployment**
   - Set up CI/CD pipeline
   - Configure production environment
   - Deploy to hosting service

## Next Steps

1. Set up the basic React TypeScript project
2. Create Supabase project and configure authentication
3. Implement basic UI components and routing
4. Start building the core database schema
5. Begin AI agent implementation

This project structure provides a solid foundation for building the FilmStudio AI Platform using React, TypeScript, and Supabase.
