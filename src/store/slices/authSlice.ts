import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '../../services/supabase/client';
import { User } from '../../types/database';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isLoading: true,
  error: null,
};

// Async thunks
export const signIn = createAsyncThunk(
  'auth/signIn',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Get additional user data from profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      return {
        id: data.user.id,
        email: data.user.email!,
        username: profile?.username || data.user.email!.split('@')[0],
        avatar_url: profile?.avatar_url,
        subscription_tier: profile?.subscription_tier || 'free',
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const signUp = createAsyncThunk(
  'auth/signUp',
  async ({ email, password, username }: { email: string; password: string; username: string }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      
      // Create profile entry
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          { 
            id: data.user!.id, 
            username, 
            subscription_tier: 'free',
            updated_at: new Date().toISOString()
          }
        ]);

      if (profileError) throw profileError;

      return {
        id: data.user!.id,
        email,
        username,
        avatar_url: null,
        subscription_tier: 'free',
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const signOut = createAsyncThunk(
  'auth/signOut',
  async (_, { rejectWithValue }) => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const checkSession = createAsyncThunk(
  'auth/checkSession',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      if (!data.session) return null;
      
      // Get additional user data from profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.session.user.id)
        .single();

      return {
        id: data.session.user.id,
        email: data.session.user.email!,
        username: profile?.username || data.session.user.email!.split('@')[0],
        avatar_url: profile?.avatar_url,
        subscription_tier: profile?.subscription_tier || 'free',
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData: Partial<User>, { rejectWithValue, getState }) => {
    const state: any = getState();
    const currentUser = state.auth.user;
    
    if (!currentUser) {
      return rejectWithValue('No authenticated user');
    }
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentUser.id);

      if (error) throw error;
      
      return {
        ...currentUser,
        ...profileData,
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Sign In
      .addCase(signIn.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Sign Up
      .addCase(signUp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(signUp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Sign Out
      .addCase(signOut.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(signOut.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
      })
      .addCase(signOut.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Check Session
      .addCase(checkSession.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(checkSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.user = null;
      })
      
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setAuthLoading, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
