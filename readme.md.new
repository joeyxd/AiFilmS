# FilmStudio AI Platform

## **Core Philosophy:**

- **Granularity:** Break down the creative process into the smallest meaningful steps. This makes AI prompting more focused and results more predictable.
- **Supabase as the Single Source of Truth:** Everything gets stored and linked in Supabase. This allows agents to pick up where others left off and provides a clear audit trail.
- **Iterative Processing:** One agent's output becomes the input for the next, building up the final product piece by piece.
- **User-Driven Creation:** Empower users to create various video types (film-style, cartoon, faceless YouTube videos) with an intuitive interface.
- **AI-Powered Automation:** Leverage AI agents to handle complex video creation tasks automatically.

## **Overview**

FilmStudio AI is a comprehensive platform for creating high-quality videos using AI-assisted workflows. The platform combines the power of AI with intuitive video editing tools to streamline the creation process. Users can generate videos from text stories, create storyboards, design characters, and produce professional-quality video content without extensive technical expertise.

### **Key Features**

- **Multi-Style Video Creation:** Support for film-style videos, cartoons, and faceless YouTube content
- **AI Agents:** Specialized AI components that handle specific tasks in the video creation pipeline
- **Interactive Timeline Editor:** Professional-grade video editing with an intuitive interface
- **Media Management:** Organized library for all assets used in projects
- **Export Options:** Multiple formats and quality settings for various platforms

## **Technology Stack**

- **Frontend:** React with TypeScript
- **UI Components:** Material UI
- **State Management:** Redux Toolkit
- **Backend:** Supabase (database, authentication, storage)
- **Video Processing:** FFmpeg (client-side with WebAssembly, server-side for complex operations)
- **AI Integration:** OpenAI API, Stability AI, RunwayML, Pika Labs

## **Core Components**

### **1. Project Management**

Projects are the top-level organizational unit, containing all elements needed for a video:

- Stories and their breakdowns
- Character designs and descriptions
- Scene and shot details
- Media assets (generated and uploaded)
- Timeline data
- Export configurations

### **2. AI Agent System**

The platform includes specialized AI agents that handle different aspects of the video creation process:

- **Story Deconstructor:** Breaks down text into chapters, scenes, and narrative elements
- **Character Extractor:** Identifies and develops characters from the story
- **Scene Designer:** Creates detailed scene descriptions with mood, setting, and artistic direction
- **Shot Designer:** Develops individual shots with camera movements, framing, and technical details
- **Visual Prompt Generator:** Creates optimized prompts for image and video generation services

### **3. Video Editing**

The platform provides a professional-grade video editor with:

- Multi-track timeline for video, audio, and text
- Clip manipulation (trim, split, merge)
- Effects and transitions
- Real-time preview
- Advanced export options

### **4. Media Library**

An organized system for managing all assets:

- AI-generated images and videos
- Uploaded media files
- Audio tracks and sound effects
- Text overlays and titles

## **Database Structure**

The platform uses Supabase for data storage with a comprehensive schema that includes:

- Projects table for top-level organization
- Stories, chapters, scenes, and shots tables for narrative breakdowns
- Characters table for persona management
- Media library for asset organization
- Timelines for editor state management
- Export configurations for publishing settings

For detailed database schema information, see [database-schema.md](./database-schema.md).

## **Implementation Details**

For more information about specific components and implementation details, please refer to:

- [Getting Started Guide](./getting-started.md)
- [Project Structure](./project-structure.md)
- [Implementation Plan](./implementation-plan.md)
- [AI Agent Implementation](./ai-agent-implementation.md)
- [Video Editing Implementation](./video-editing-implementation.md)
- [Story Deconstructor Implementation](./story-deconstructor-implementation.md)
- [Video Timeline Implementation](./video-timeline-implementation.md)
- [Initial Setup Files](./initial-setup-files.md)

## **Next Steps**

To start working with the FilmStudio AI Platform:

1. Follow the [Getting Started Guide](./getting-started.md) to set up your development environment
2. Review the [Implementation Plan](./implementation-plan.md) for a phased approach to building the platform
3. Explore the detailed implementation files for specific components
4. Begin with the [Initial Setup Files](./initial-setup-files.md) to create the project structure
