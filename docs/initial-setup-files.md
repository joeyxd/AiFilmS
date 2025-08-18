# FilmStudio AI Platform - Initial Setup Files

This document provides the initial setup files needed to start developing the FilmStudio AI Platform.

## Project Initialization

### package.json

```json
{
  "name": "filmstudio-ai",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview",
    "setup-db": "node scripts/setup-db.js",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui"
  },
  "dependencies": {
    "@emotion/react": "^11.11.1",
    "@emotion/styled": "^11.11.0",
    "@ffmpeg/ffmpeg": "^0.12.7",
    "@ffmpeg/util": "^0.12.1",
    "@mui/icons-material": "^5.14.19",
    "@mui/material": "^5.14.19",
    "@reduxjs/toolkit": "^2.0.1",
    "@supabase/supabase-js": "^2.38.4",
    "axios": "^1.6.2",
    "date-fns": "^2.30.0",
    "formik": "^2.4.5",
    "openai": "^4.20.1",
    "react": "^18.2.0",
    "react-beautiful-dnd": "^13.1.1",
    "react-dom": "^18.2.0",
    "react-dropzone": "^14.2.3",
    "react-redux": "^9.0.1",
    "react-router-dom": "^6.20.0",
    "uuid": "^9.0.1",
    "wavesurfer.js": "^7.4.5",
    "yup": "^1.3.2",
    "zod": "^3.22.4",
    "zustand": "^4.4.6"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.1.4",
    "@testing-library/react": "^14.1.2",
    "@testing-library/user-event": "^14.5.1",
    "@types/node": "^20.10.0",
    "@types/react": "^18.2.37",
    "@types/react-beautiful-dnd": "^13.1.7",
    "@types/react-dom": "^18.2.15",
    "@types/uuid": "^9.0.7",
    "@typescript-eslint/eslint-plugin": "^6.13.1",
    "@typescript-eslint/parser": "^6.13.1",
    "@vitejs/plugin-react": "^4.2.0",
    "eslint": "^8.54.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.4",
    "husky": "^8.0.3",
    "jsdom": "^23.0.0",
    "lint-staged": "^15.1.0",
    "prettier": "^3.1.0",
    "typescript": "^5.3.2",
    "vite": "^5.0.2",
    "vitest": "^0.34.6"
  }
}
```

### vite.config.ts

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    cors: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
  },
})
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    
    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    
    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    
    /* Paths */
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### tsconfig.node.json

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

### .env.example

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_STABILITY_API_KEY=your_stability_api_key
```

### index.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>FilmStudio AI</title>
    <meta name="description" content="AI-powered video creation platform" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

## Core Files

### src/main.tsx

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { Provider } from 'react-redux'
import { store } from './store'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import theme from './theme'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App />
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
)
```

### src/App.tsx

```typescript
import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { initializeAuth } from './store/slices/authSlice'
import ProtectedRoute from './components/auth/ProtectedRoute'
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import Dashboard from './pages/dashboard/Dashboard'
import ProjectList from './pages/projects/ProjectList'
import ProjectDetail from './pages/projects/ProjectDetail'
import Editor from './pages/editor/Editor'
import Settings from './pages/settings/Settings'
import NotFound from './pages/NotFound'

function App() {
  const dispatch = useDispatch()
  const { initialized } = useSelector((state: any) => state.auth)

  useEffect(() => {
    dispatch(initializeAuth())
  }, [dispatch])

  if (!initialized) {
    return <div>Loading...</div>
  }

  return (
    <Routes>
      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
      </Route>
      
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="projects" element={<ProjectList />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          <Route path="editor/:id" element={<Editor />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
```

### src/theme.ts

```typescript
import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6C5CE7',
    },
    secondary: {
      main: '#00B894',
    },
    background: {
      default: '#121212',
      paper: '#1E1E1E',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundColor: '#1A1A1A',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1A1A1A',
          borderRight: '1px solid rgba(255, 255, 255, 0.12)',
        },
      },
    },
  },
  shape: {
    borderRadius: 8,
  },
})

export default theme
```

### src/index.css

```css
:root {
  --max-width: 1200px;
  --border-radius: 8px;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  --foreground-rgb: 255, 255, 255;
  --background-rgb: 18, 18, 18;
}

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

html,
body {
  max-width: 100vw;
  overflow-x: hidden;
  height: 100%;
}

body {
  color: rgb(var(--foreground-rgb));
  background: rgb(var(--background-rgb));
  font-family: 'Inter', sans-serif;
}

#root {
  height: 100%;
}

a {
  color: inherit;
  text-decoration: none;
}

.page-container {
  padding: 24px;
  max-width: var(--max-width);
  margin: 0 auto;
  width: 100%;
}

.page-title {
  margin-bottom: 24px;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
```

## Supabase Client

### src/services/supabase/client.ts

```typescript
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
```

## Redux Store Setup

### src/store/index.ts

```typescript
import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import projectsReducer from './slices/projectsSlice'
import timelineReducer from './slices/timelineSlice'
import aiProcessingReducer from './slices/aiProcessingSlice'
import exportReducer from './slices/exportSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectsReducer,
    timeline: timelineReducer,
    aiProcessing: aiProcessingReducer,
    export: exportReducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['export/startExport'],
        // Ignore these paths in the state
        ignoredPaths: ['export.callbacks'],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
```

### src/store/slices/authSlice.ts

```typescript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabase } from '@/services/supabase/client'
import { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  initialized: boolean
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  initialized: false,
  loading: false,
  error: null,
}

export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        throw error
      }
      
      return data.session?.user || null
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const signIn = createAsyncThunk(
  'auth/signIn',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        throw error
      }
      
      return data.user
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const signUp = createAsyncThunk(
  'auth/signUp',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      
      if (error) {
        throw error
      }
      
      return data.user
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const signOut = createAsyncThunk(
  'auth/signOut',
  async (_, { rejectWithValue }) => {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        throw error
      }
      
      return null
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.user = action.payload
        state.initialized = true
        state.loading = false
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.error = action.payload as string
        state.initialized = true
        state.loading = false
      })
      .addCase(signIn.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.user = action.payload
        state.loading = false
      })
      .addCase(signIn.rejected, (state, action) => {
        state.error = action.payload as string
        state.loading = false
      })
      .addCase(signUp.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.user = action.payload
        state.loading = false
      })
      .addCase(signUp.rejected, (state, action) => {
        state.error = action.payload as string
        state.loading = false
      })
      .addCase(signOut.fulfilled, (state) => {
        state.user = null
      })
  },
})

export const { clearError } = authSlice.actions

export default authSlice.reducer
```

## Layout Components

### src/layouts/MainLayout.tsx

```tsx
import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Box, AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText, Avatar, Menu, MenuItem, Divider } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useSelector, useDispatch } from 'react-redux'
import { signOut } from '@/store/slices/authSlice'
import { Menu as MenuIcon, Dashboard, VideoLibrary, Settings, ChevronLeft, Person, Logout } from '@mui/icons-material'
import { Link } from 'react-router-dom'

const drawerWidth = 240

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: 0,
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}))

export default function MainLayout() {
  const dispatch = useDispatch()
  const location = useLocation()
  const { user } = useSelector((state: any) => state.auth)
  
  const [drawerOpen, setDrawerOpen] = useState(true)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const menuOpen = Boolean(anchorEl)
  
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen)
  }
  
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }
  
  const handleMenuClose = () => {
    setAnchorEl(null)
  }
  
  const handleSignOut = () => {
    dispatch(signOut())
    handleMenuClose()
  }
  
  const getPageTitle = () => {
    const path = location.pathname
    if (path.startsWith('/dashboard')) return 'Dashboard'
    if (path.startsWith('/projects') && path.split('/').length > 2) return 'Project Details'
    if (path.startsWith('/projects')) return 'Projects'
    if (path.startsWith('/editor')) return 'Video Editor'
    if (path.startsWith('/settings')) return 'Settings'
    return 'FilmStudio AI'
  }
  
  const isActive = (path: string) => {
    return location.pathname.startsWith(path)
  }
  
  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Projects', icon: <VideoLibrary />, path: '/projects' },
    { text: 'Settings', icon: <Settings />, path: '/settings' },
  ]
  
  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      <AppBar
        position="fixed"
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'background.paper',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ mr: 2 }}
          >
            {drawerOpen ? <ChevronLeft /> : <MenuIcon />}
          </IconButton>
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {getPageTitle()}
          </Typography>
          
          <IconButton
            onClick={handleProfileMenuOpen}
            size="small"
            sx={{ ml: 2 }}
            aria-controls={menuOpen ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={menuOpen ? 'true' : undefined}
          >
            <Avatar sx={{ width: 32, height: 32 }}>
              {user?.email?.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={menuOpen}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleMenuClose} component={Link} to="/settings">
              <ListItemIcon>
                <Person fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleSignOut}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Sign Out
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      
      <Drawer
        variant="persistent"
        anchor="left"
        open={drawerOpen}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            top: '64px',
            height: 'calc(100% - 64px)',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', mt: 2 }}>
          <List>
            {menuItems.map((item) => (
              <ListItem 
                key={item.text}
                component={Link}
                to={item.path}
                sx={{ 
                  borderRadius: '8px',
                  margin: '4px 8px',
                  backgroundColor: isActive(item.path) ? 'rgba(108, 92, 231, 0.1)' : 'transparent',
                  color: isActive(item.path) ? 'primary.main' : 'inherit',
                  '&:hover': {
                    backgroundColor: isActive(item.path) 
                      ? 'rgba(108, 92, 231, 0.2)' 
                      : 'rgba(255, 255, 255, 0.05)',
                  }
                }}
              >
                <ListItemIcon sx={{ color: isActive(item.path) ? 'primary.main' : 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      
      <Main open={drawerOpen}>
        <Toolbar />
        <Box sx={{ height: 'calc(100% - 64px)', overflow: 'auto' }}>
          <Outlet />
        </Box>
      </Main>
    </Box>
  )
}
```

### src/layouts/AuthLayout.tsx

```tsx
import { Outlet } from 'react-router-dom'
import { Container, Box, Paper, Typography } from '@mui/material'

export default function AuthLayout() {
  return (
    <Container component="main" maxWidth="xs" sx={{ height: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            borderRadius: 2,
          }}
        >
          <Typography
            component="h1"
            variant="h4"
            align="center"
            sx={{ mb: 4, color: 'primary.main', fontWeight: 'bold' }}
          >
            FilmStudio AI
          </Typography>
          <Outlet />
        </Paper>
      </Box>
    </Container>
  )
}
```

## Basic Auth Components

### src/components/auth/ProtectedRoute.tsx

```tsx
import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'

export default function ProtectedRoute() {
  const { user, initialized } = useSelector((state: any) => state.auth)

  // Wait until auth is initialized
  if (!initialized) {
    return null
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/auth/login" replace />
  }

  return <Outlet />
}
```

## Setup Scripts

### scripts/setup-db.js

```javascript
// This script sets up the initial database schema in Supabase
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
const dotenvPath = path.resolve(__dirname, '../.env')
const envConfig = fs.readFileSync(dotenvPath, 'utf8')
  .split('\n')
  .filter(Boolean)
  .map(line => line.trim())
  .filter(line => !line.startsWith('#'))
  .reduce((acc, line) => {
    const [key, value] = line.split('=')
    acc[key] = value
    return acc
  }, {})

const supabaseUrl = envConfig.VITE_SUPABASE_URL
const supabaseServiceKey = envConfig.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

// Initialize Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Read SQL schema
const schemaPath = path.resolve(__dirname, './schema.sql')
const schema = fs.readFileSync(schemaPath, 'utf8')

async function setupDatabase() {
  console.log('Setting up database schema...')
  
  try {
    // Execute SQL script
    const { error } = await supabase.rpc('exec_sql', { sql_query: schema })
    
    if (error) {
      throw error
    }
    
    console.log('Database schema created successfully')
  } catch (error) {
    console.error('Error setting up database:', error.message)
    process.exit(1)
  }
}

setupDatabase()
```

### scripts/schema.sql

```sql
-- Create users table extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  project_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create stories table
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  logline TEXT,
  full_story_text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chapters table
CREATE TABLE IF NOT EXISTS chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE NOT NULL,
  chapter_number INTEGER NOT NULL,
  chapter_title TEXT NOT NULL,
  original_story_text_portion TEXT NOT NULL,
  chapter_summary_ai TEXT,
  estimated_film_time INTEGER,
  status TEXT NOT NULL DEFAULT 'pending_scenes',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create characters table
CREATE TABLE IF NOT EXISTS characters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE NOT NULL,
  character_name TEXT NOT NULL,
  role_in_story TEXT,
  backstory_ai TEXT,
  look_feel_ai TEXT,
  still_image_prompt TEXT,
  generated_character_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'identified',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create scenes table
CREATE TABLE IF NOT EXISTS scenes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE NOT NULL,
  scene_number TEXT NOT NULL,
  location_ai TEXT,
  time_of_day_ai TEXT,
  overall_mood_feel_ai TEXT,
  artistic_focus_ai TEXT,
  scene_description_ai TEXT,
  status TEXT NOT NULL DEFAULT 'pending_shots',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create scene_characters junction table
CREATE TABLE IF NOT EXISTS scene_characters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scene_id UUID REFERENCES scenes(id) ON DELETE CASCADE NOT NULL,
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(scene_id, character_id)
);

-- Create shots table
CREATE TABLE IF NOT EXISTS shots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scene_id UUID REFERENCES scenes(id) ON DELETE CASCADE NOT NULL,
  shot_number_in_scene INTEGER NOT NULL,
  shot_description_ai TEXT,
  camera_shot_type_ai TEXT,
  camera_movement_ai TEXT,
  lens_choice_suggestion_ai TEXT,
  lighting_description_ai TEXT,
  color_palette_focus_ai TEXT,
  artistic_intent_ai TEXT,
  still_image_prompt_technical_ai TEXT,
  generated_still_image_url TEXT,
  video_shot_flow_description_ai TEXT,
  video_generation_prompt_technical_ai TEXT,
  estimated_duration_ai INTEGER,
  generated_video_clip_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending_still_prompt',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create media_library table
CREATE TABLE IF NOT EXISTS media_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER,
  tags TEXT[],
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create export_configs table
CREATE TABLE IF NOT EXISTS export_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL,
  settings JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up RLS policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE scene_characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE shots ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_configs ENABLE ROW LEVEL SECURITY;

-- Projects RLS policies
CREATE POLICY "Users can view their own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- Stories RLS policies (via project relationship)
CREATE POLICY "Users can view stories of their own projects" ON stories
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = stories.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert stories to their own projects" ON stories
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = stories.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update stories of their own projects" ON stories
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = stories.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete stories of their own projects" ON stories
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = stories.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Media library RLS policies
CREATE POLICY "Users can view their own media" ON media_library
  FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert their own media" ON media_library
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own media" ON media_library
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own media" ON media_library
  FOR DELETE USING (auth.uid() = user_id);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('generated_images', 'generated_images', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('generated_videos', 'generated_videos', false);

-- Set up storage policies
CREATE POLICY "Users can view their own media files" ON storage.objects
  FOR SELECT USING (
    auth.uid() = (
      SELECT user_id FROM media_library
      WHERE url LIKE '%' || storage.objects.name
    )
  );

CREATE POLICY "Users can upload their own media files" ON storage.objects
  FOR INSERT WITH CHECK (
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own media files" ON storage.objects
  FOR UPDATE USING (
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own media files" ON storage.objects
  FOR DELETE USING (
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

These initial setup files provide a solid foundation for starting the FilmStudio AI Platform development. The next step would be to implement the core components for project management, AI integration, and video editing as outlined in the implementation plan.
