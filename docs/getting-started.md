# FilmStudio AI Platform - Getting Started

This guide will help you set up and start developing the FilmStudio AI Platform using React, TypeScript, and Supabase.

## Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Git
- A Supabase account
- OpenAI API key (for AI features)
- Stability AI API key (for image generation)

## Project Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/filmstudio-ai.git
cd filmstudio-ai
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory with the following variables:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_STABILITY_API_KEY=your_stability_api_key
```

### 4. Supabase Setup

1. Create a new Supabase project
2. Execute the database schema creation script from the `scripts/setup-db.sql` file
3. Configure storage buckets for media files
4. Set up authentication providers

### 5. Start Development Server

```bash
npm run dev
```

## Project Structure

```
filmstudio-ai/
├── public/              # Static assets
├── src/
│   ├── assets/          # Images, fonts, etc.
│   ├── components/      # React components
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Page components
│   ├── services/        # API and business logic
│   ├── store/           # State management
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   ├── App.tsx          # Root component
│   ├── main.tsx         # Entry point
│   └── vite-env.d.ts    # Vite types
├── .env                 # Environment variables
├── .gitignore           # Git ignore file
├── index.html           # HTML entry point
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── vite.config.ts       # Vite configuration
```

## Key Features Overview

1. **User Authentication**
   - Email/password login
   - Social login (Google, GitHub)
   - Profile management

2. **Project Management**
   - Create and manage video projects
   - Different project types (film, cartoon, faceless YouTube)
   - Project dashboard

3. **AI Story Processing**
   - Story analysis
   - Character extraction
   - Scene design
   - Shot planning

4. **Media Management**
   - Upload and organize media files
   - Create and manage a media library
   - AI-assisted tagging and organization

5. **Video Editing**
   - Timeline-based editor
   - Multiple tracks (video, audio, text)
   - Effects and transitions
   - Real-time preview

6. **Export and Publishing**
   - Various export formats and qualities
   - Platform-specific exports (YouTube, TikTok, etc.)
   - Publishing directly to platforms

## Development Workflow

1. **Feature Development**
   - Create a new branch for each feature
   - Implement the feature
   - Create tests for the feature
   - Submit a pull request

2. **Testing**
   - Unit tests with Jest
   - Component tests with React Testing Library
   - End-to-end tests with Cypress

3. **Deployment**
   - Continuous integration with GitHub Actions
   - Staging deployment for testing
   - Production deployment

## First Steps

1. Set up the basic React app structure
2. Implement user authentication with Supabase
3. Create the project management UI
4. Set up the initial AI agent infrastructure
5. Develop the media library components

## Documentation

For detailed documentation on specific components and features, see:

- [Project Structure](./project-structure.md)
- [Implementation Plan](./implementation-plan.md)
- [AI Agent Implementation](./ai-agent-implementation.md)
- [Video Editing Implementation](./video-editing-implementation.md)

## Contributing

Please see the [CONTRIBUTING.md](./CONTRIBUTING.md) file for details on how to contribute to this project.

## License

This project is licensed under the MIT License.
