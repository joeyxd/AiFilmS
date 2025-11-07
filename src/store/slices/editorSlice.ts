import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '../../services/supabase/client';
import { Timeline, Track, Clip, MediaAsset } from '../../types/database';

interface EditorState {
  timeline: Timeline | null;
  tracks: Track[];
  clips: Clip[];
  mediaAssets: MediaAsset[];
  selectedClipId: string | null;
  playhead: number; // Position in seconds
  isPlaying: boolean;
  zoom: number; // Zoom level 0.5 to 2
  isLoading: boolean;
  error: string | null;
}

const initialState: EditorState = {
  timeline: null,
  tracks: [],
  clips: [],
  mediaAssets: [],
  selectedClipId: null,
  playhead: 0,
  isPlaying: false,
  zoom: 1,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchTimeline = createAsyncThunk(
  'editor/fetchTimeline',
  async (timelineId: string, { rejectWithValue }) => {
    try {
      // Fetch timeline
      const { data: timeline, error: timelineError } = await supabase
        .from('timelines')
        .select('*')
        .eq('id', timelineId)
        .single();

      if (timelineError) throw timelineError;

      // Fetch tracks
      const { data: tracks, error: tracksError } = await supabase
        .from('tracks')
        .select('*')
        .eq('timeline_id', timelineId)
        .order('position', { ascending: true });

      if (tracksError) throw tracksError;

      // Fetch clips
      const trackIds = tracks.map((track: Track) => track.id);
      const { data: clips, error: clipsError } = await supabase
        .from('clips')
        .select('*')
        .in('track_id', trackIds)
        .order('start_time', { ascending: true });

      if (clipsError) throw clipsError;

      // Fetch media assets used in clips
      const mediaAssetIds = clips
        .filter((clip: any) => clip.media_asset_id != null)
        .map((clip: any) => clip.media_asset_id)
        .filter((id): id is string => typeof id === 'string');

      const { data: mediaAssets, error: mediaAssetsError } = await supabase
        .from('media_assets')
        .select('*')
        .in('id', mediaAssetIds);

      if (mediaAssetsError) throw mediaAssetsError;

      return {
        timeline,
        tracks,
        clips,
        mediaAssets,
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createTrack = createAsyncThunk(
  'editor/createTrack',
  async (
    { timelineId, name, type }: { timelineId: string; name: string; type: 'video' | 'audio' | 'text' | 'effects' }, 
    { rejectWithValue, getState }
  ) => {
    const state: any = getState();
    const currentTracksCount = state.editor.tracks.length;
    
    try {
      const { data, error } = await supabase
        .from('tracks')
        .insert([{
          timeline_id: timelineId,
          name,
          type,
          position: currentTracksCount, // Position is the order in the timeline
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .select('*')
        .single();

      if (error) throw error;
      return data as Track;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createClip = createAsyncThunk(
  'editor/createClip',
  async (
    { 
      trackId, 
      mediaAssetId, 
      startTime,
      duration,
      mediaStartTime,
      properties 
    }: { 
      trackId: string; 
      mediaAssetId: string | null; 
      startTime: number;
      duration: number;
      mediaStartTime: number;
      properties: Record<string, any>;
    }, 
    { rejectWithValue }
  ) => {
    try {
      const { data, error } = await supabase
        .from('clips')
        .insert([{
          track_id: trackId,
          media_asset_id: mediaAssetId,
          start_time: startTime,
          duration,
          media_start_time: mediaStartTime,
          properties,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .select('*')
        .single();

      if (error) throw error;
      return data as Clip;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateClip = createAsyncThunk(
  'editor/updateClip',
  async (
    { 
      clipId, 
      clipData 
    }: { 
      clipId: string; 
      clipData: Partial<Clip> 
    }, 
    { rejectWithValue }
  ) => {
    try {
      const { data, error } = await supabase
        .from('clips')
        .update({
          ...clipData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', clipId)
        .select('*')
        .single();

      if (error) throw error;
      return data as Clip;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteClip = createAsyncThunk(
  'editor/deleteClip',
  async (clipId: string, { rejectWithValue }) => {
    try {
      const { error } = await supabase
        .from('clips')
        .delete()
        .eq('id', clipId);

      if (error) throw error;
      return clipId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    setSelectedClip: (state, action: PayloadAction<string | null>) => {
      state.selectedClipId = action.payload;
    },
    setPlayhead: (state, action: PayloadAction<number>) => {
      state.playhead = action.payload;
    },
    setIsPlaying: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload;
    },
    setZoom: (state, action: PayloadAction<number>) => {
      state.zoom = action.payload;
    },
    clearEditorError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Timeline
      .addCase(fetchTimeline.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTimeline.fulfilled, (state, action) => {
        state.isLoading = false;
        state.timeline = action.payload.timeline;
        state.tracks = action.payload.tracks;
        state.clips = action.payload.clips as any;
        state.mediaAssets = action.payload.mediaAssets as any;
      })
      .addCase(fetchTimeline.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create Track
      .addCase(createTrack.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTrack.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tracks.push(action.payload);
      })
      .addCase(createTrack.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create Clip
      .addCase(createClip.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createClip.fulfilled, (state, action) => {
        state.isLoading = false;
        (state.clips as any).push(action.payload);
      })
      .addCase(createClip.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update Clip
      .addCase(updateClip.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateClip.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = (state.clips as any).findIndex((c: any) => c.id === action.payload.id);
        if (index !== -1) {
          (state.clips as any)[index] = action.payload;
        }
      })
      .addCase(updateClip.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete Clip
      .addCase(deleteClip.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteClip.fulfilled, (state, action) => {
        state.isLoading = false;
        state.clips = (state.clips as any).filter((c: any) => c.id !== action.payload);
        if (state.selectedClipId === action.payload) {
          state.selectedClipId = null;
        }
      })
      .addCase(deleteClip.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  setSelectedClip, 
  setPlayhead, 
  setIsPlaying, 
  setZoom,
  clearEditorError
} = editorSlice.actions;
export default editorSlice.reducer;
