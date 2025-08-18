# Redux Store and Slices Explanation - FilmStudio AI

## Our Redux Store Structure

```
FilmStudio AI Store
├── auth (slice)        - User authentication & profile
├── projects (slice)    - Video projects management  
├── editor (slice)      - Video timeline editing
└── ui (slice)         - User interface state
```

## 1. Auth Slice - User Authentication

**Purpose**: Manages user login, registration, and profile data

**State includes**:
```typescript
{
  user: {
    id: "user123",
    email: "creator@filmstudio.ai", 
    username: "VideoCreator",
    subscription_tier: "pro"
  },
  isLoading: false,
  error: null
}
```

**Actions (what you can do)**:
- `signIn()` - Log in user
- `signUp()` - Register new user  
- `signOut()` - Log out user
- `updateProfile()` - Update user info

**Real example**:
```typescript
// When user clicks "Sign In" button
dispatch(signIn({ email: "user@email.com", password: "password123" }))

// Redux automatically:
// 1. Sets isLoading = true
// 2. Calls Supabase API
// 3. If successful: stores user data
// 4. If failed: stores error message
```

## 2. Projects Slice - Video Projects

**Purpose**: Manages all video creation projects

**State includes**:
```typescript
{
  projects: [
    {
      id: "proj1",
      title: "Space Adventure Film",
      description: "Epic sci-fi story",
      project_type: "film",
      status: "in_progress"
    },
    {
      id: "proj2", 
      title: "Cooking Tutorial",
      project_type: "faceless_youtube",
      status: "completed"
    }
  ],
  currentProject: { /* currently open project */ },
  isLoading: false,
  error: null
}
```

**Actions**:
- `fetchProjects()` - Load all user's projects
- `createProject()` - Create new video project
- `updateProject()` - Edit project details
- `deleteProject()` - Remove project

**Real example**:
```typescript
// User creates new project
dispatch(createProject({
  title: "My New Film",
  description: "Adventure story",
  project_type: "film",
  user_id: "user123"
}))
```

## 3. Editor Slice - Video Timeline

**Purpose**: Manages the video editing timeline, tracks, and clips

**State includes**:
```typescript
{
  timeline: {
    id: "timeline1",
    project_id: "proj1",
    duration: 120 // 2 minutes
  },
  tracks: [
    { id: "track1", name: "Video Track 1", type: "video" },
    { id: "track2", name: "Audio Track 1", type: "audio" }
  ],
  clips: [
    {
      id: "clip1",
      track_id: "track1", 
      start_time: 0,
      duration: 30,
      media_asset_id: "video123"
    }
  ],
  playhead: 15.5, // Current playback position
  isPlaying: false,
  zoom: 1.0
}
```

**Actions**:
- `fetchTimeline()` - Load timeline data
- `createClip()` - Add video/audio clip
- `updateClip()` - Move or trim clips
- `setPlayhead()` - Change playback position

## 4. UI Slice - Interface State

**Purpose**: Manages user interface state (not business data)

**State includes**:
```typescript
{
  sidebarOpen: true,
  darkMode: true,
  notification: {
    show: false,
    message: "",
    severity: "info"
  },
  loading: {
    global: false,
    operations: {
      "uploading-video": true,
      "generating-ai-story": false
    }
  }
}
```

## How Components Use Redux

### Reading State (useAppSelector)
```typescript
function Dashboard() {
  // Get projects from Redux store
  const { projects, isLoading } = useAppSelector(state => state.projects)
  const { user } = useAppSelector(state => state.auth)
  
  return (
    <div>
      <h1>Welcome {user?.username}</h1>
      {isLoading ? (
        <Spinner />
      ) : (
        <ProjectList projects={projects} />
      )}
    </div>
  )
}
```

### Updating State (useAppDispatch)
```typescript
function CreateProjectButton() {
  const dispatch = useAppDispatch()
  
  const handleCreateProject = () => {
    dispatch(createProject({
      title: "New Project",
      project_type: "film",
      description: "My awesome video"
    }))
  }
  
  return <button onClick={handleCreateProject}>Create Project</button>
}
```

## Why Use Redux for FilmStudio AI?

### 1. **Complex State Management**
Video editing involves lots of interconnected data:
- Projects → Stories → Chapters → Scenes → Shots
- Timeline → Tracks → Clips → Media Assets

### 2. **Cross-Component Communication**
- Timeline editor needs project data
- Media library affects video editor
- AI processing updates multiple components

### 3. **Undo/Redo Functionality**
Redux makes it easy to implement undo/redo for video editing

### 4. **Real-time Updates**
When AI generates new video clips, multiple components need to update

### 5. **Offline Support**
Redux can cache data for offline video editing

## Data Flow Example

```
1. User clicks "Analyze Story" button
   ↓
2. Component dispatches AI action
   dispatch(analyzeStoryWithAI(storyText))
   ↓
3. Redux slice processes action
   - Sets loading = true
   - Calls OpenAI API
   - Stores results in state
   ↓
4. All components re-render with new data
   - Story view shows chapters
   - Character list updates
   - Progress indicator hides
```

## Redux vs Local State

**Use Redux for**:
- User authentication
- Project data
- Video timeline state
- AI processing results
- Cross-component shared data

**Use Local State for**:
- Form inputs
- Modal open/closed
- Temporary UI state
- Component-specific data

This architecture makes our FilmStudio AI platform scalable and maintainable as we add more AI features and video editing capabilities!
