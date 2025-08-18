import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '../../services/supabase/client';
import { Project } from '../../types/database';

interface ProjectsState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ProjectsState = {
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchProjects = createAsyncThunk(
  'projects/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as Project[];
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchProjectById = createAsyncThunk(
  'projects/fetchById',
  async (projectId: string, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) throw error;
      return data as Project;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createProject = createAsyncThunk(
  'projects/create',
  async (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          ...project,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .select('*')
        .single();

      if (error) throw error;
      return data as Project;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateProject = createAsyncThunk(
  'projects/update',
  async (
    { id, project }: { id: string; project: Partial<Project> },
    { rejectWithValue }
  ) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update({
          ...project,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;
      return data as Project;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteProject = createAsyncThunk(
  'projects/delete',
  async (projectId: string, { rejectWithValue }) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
      return projectId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    clearCurrentProject: (state) => {
      state.currentProject = null;
    },
    clearProjectsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Projects
      .addCase(fetchProjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action: PayloadAction<Project[]>) => {
        state.isLoading = false;
        state.projects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Project By ID
      .addCase(fetchProjectById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjectById.fulfilled, (state, action: PayloadAction<Project>) => {
        state.isLoading = false;
        state.currentProject = action.payload;
      })
      .addCase(fetchProjectById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create Project
      .addCase(createProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action: PayloadAction<Project>) => {
        state.isLoading = false;
        state.projects.unshift(action.payload);
        state.currentProject = action.payload;
      })
      .addCase(createProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update Project
      .addCase(updateProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProject.fulfilled, (state, action: PayloadAction<Project>) => {
        state.isLoading = false;
        const index = state.projects.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
        if (state.currentProject?.id === action.payload.id) {
          state.currentProject = action.payload;
        }
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete Project
      .addCase(deleteProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteProject.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.projects = state.projects.filter(p => p.id !== action.payload);
        if (state.currentProject?.id === action.payload) {
          state.currentProject = null;
        }
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentProject, clearProjectsError } = projectsSlice.actions;
export default projectsSlice.reducer;
