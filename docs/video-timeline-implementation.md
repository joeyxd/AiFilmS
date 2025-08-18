# FilmStudio AI - Video Timeline Editor Implementation

This file provides the implementation details for the video timeline editor component, which is a core part of the FilmStudio AI Platform.

## Timeline Component Structure

```tsx
// src/video/timeline/Timeline.tsx
import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Box, Typography, IconButton, Slider, styled } from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  ContentCut as SplitIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon
} from '@mui/icons-material';
import { 
  addTrack, 
  removeTrack, 
  moveClip,
  selectTrack,
  selectClip,
  updateZoom,
  setCurrentTime,
  selectTimeline 
} from '@/store/slices/timelineSlice';
import Track from './Track';
import TimelineRuler from './TimelineRuler';
import { TimelineClip } from '@/types/timeline';

const TimelineContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  backgroundColor: '#1A1A1A',
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden'
}));

const TimelineHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1, 2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: '#252525'
}));

const TimelineControls = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginLeft: 'auto'
}));

const TracksContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  overflowY: 'auto',
  overflowX: 'hidden'
});

const ZoomControls = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(0, 2),
  borderTop: `1px solid ${theme.palette.divider}`,
  backgroundColor: '#252525',
  height: 48
}));

export default function Timeline() {
  const dispatch = useDispatch();
  const timelineState = useSelector(selectTimeline);
  const { tracks, selectedTrackId, selectedClipId, zoom, duration, currentTime } = timelineState;
  
  const timelineRef = useRef<HTMLDivElement>(null);
  const [scrollLeft, setScrollLeft] = useState(0);
  
  // Sync scrolling between ruler and tracks
  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLDivElement;
      setScrollLeft(target.scrollLeft);
    };
    
    const tracksEl = timelineRef.current;
    if (tracksEl) {
      tracksEl.addEventListener('scroll', handleScroll);
    }
    
    return () => {
      if (tracksEl) {
        tracksEl.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);
  
  const handleAddTrack = () => {
    dispatch(addTrack());
  };
  
  const handleRemoveTrack = (trackId: string) => {
    dispatch(removeTrack(trackId));
  };
  
  const handleTrackSelect = (trackId: string) => {
    dispatch(selectTrack(trackId));
  };
  
  const handleClipSelect = (trackId: string, clipId: string) => {
    dispatch(selectClip({ trackId, clipId }));
  };
  
  const handleDragEnd = (result: any) => {
    const { source, destination, draggableId } = result;
    
    // Dropped outside the list
    if (!destination) return;
    
    const clipId = draggableId.split('-')[1];
    const sourceTrackId = source.droppableId;
    const destinationTrackId = destination.droppableId;
    const sourceIndex = source.index;
    const destinationIndex = destination.index;
    
    dispatch(moveClip({
      clipId,
      sourceTrackId,
      destinationTrackId,
      sourceIndex,
      destinationIndex
    }));
  };
  
  const handleZoomChange = (_: Event, newValue: number | number[]) => {
    dispatch(updateZoom(newValue as number));
  };
  
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left + timelineRef.current.scrollLeft;
    const newTime = (offsetX / (rect.width * zoom)) * duration;
    
    dispatch(setCurrentTime(Math.max(0, Math.min(newTime, duration))));
  };
  
  return (
    <TimelineContainer>
      <TimelineHeader>
        <Typography variant="subtitle1" fontWeight="medium">Timeline</Typography>
        <TimelineControls>
          <IconButton size="small" onClick={handleAddTrack}>
            <AddIcon fontSize="small" />
          </IconButton>
          <IconButton 
            size="small" 
            disabled={!selectedTrackId}
            onClick={() => selectedTrackId && handleRemoveTrack(selectedTrackId)}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" disabled={!selectedClipId}>
            <SplitIcon fontSize="small" />
          </IconButton>
        </TimelineControls>
      </TimelineHeader>
      
      <TimelineRuler 
        duration={duration}
        zoom={zoom}
        currentTime={currentTime}
        scrollLeft={scrollLeft}
      />
      
      <TracksContainer ref={timelineRef} onClick={handleTimelineClick}>
        <DragDropContext onDragEnd={handleDragEnd}>
          {tracks.map((track) => (
            <Track
              key={track.id}
              track={track}
              zoom={zoom}
              duration={duration}
              currentTime={currentTime}
              isSelected={track.id === selectedTrackId}
              onSelect={() => handleTrackSelect(track.id)}
              onClipSelect={(clipId) => handleClipSelect(track.id, clipId)}
              selectedClipId={selectedClipId}
            />
          ))}
        </DragDropContext>
      </TracksContainer>
      
      <ZoomControls>
        <IconButton size="small" onClick={() => dispatch(updateZoom(Math.max(0.1, zoom - 0.1)))}>
          <ZoomOutIcon fontSize="small" />
        </IconButton>
        
        <Slider
          size="small"
          min={0.1}
          max={2}
          step={0.1}
          value={zoom}
          onChange={handleZoomChange}
          sx={{ width: 100 }}
        />
        
        <IconButton size="small" onClick={() => dispatch(updateZoom(Math.min(2, zoom + 0.1)))}>
          <ZoomInIcon fontSize="small" />
        </IconButton>
        
        <Typography variant="caption" sx={{ ml: 1 }}>
          {`${Math.round(currentTime * 100) / 100}s / ${duration}s`}
        </Typography>
      </ZoomControls>
    </TimelineContainer>
  );
}
```

## Track Component

```tsx
// src/video/timeline/Track.tsx
import { memo } from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { Box, Typography, styled } from '@mui/material';
import Clip from './Clip';
import { Track as TrackType } from '@/types/timeline';

interface TrackProps {
  track: TrackType;
  zoom: number;
  duration: number;
  currentTime: number;
  isSelected: boolean;
  selectedClipId: string | null;
  onSelect: () => void;
  onClipSelect: (clipId: string) => void;
}

const TrackContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isSelected'
})<{ isSelected: boolean }>(({ theme, isSelected }) => ({
  display: 'flex',
  height: 80,
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: isSelected ? 'rgba(108, 92, 231, 0.1)' : 'transparent',
  '&:hover': {
    backgroundColor: isSelected ? 'rgba(108, 92, 231, 0.15)' : 'rgba(255, 255, 255, 0.03)'
  }
}));

const TrackHeader = styled(Box)(({ theme }) => ({
  width: 150,
  flexShrink: 0,
  borderRight: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(1, 2),
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center'
}));

const ClipsContainer = styled(Box)<{ zoom: number, duration: number }>(({ zoom, duration }) => ({
  flex: 1,
  position: 'relative',
  height: '100%',
  width: `${duration * 100 * zoom}px`, // 100px per second * zoom level
  minWidth: '100%'
}));

const PlayheadLine = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  bottom: 0,
  width: 2,
  backgroundColor: theme.palette.primary.main,
  zIndex: 2,
  pointerEvents: 'none'
}));

const Track = memo(function Track({
  track,
  zoom,
  duration,
  currentTime,
  isSelected,
  selectedClipId,
  onSelect,
  onClipSelect
}: TrackProps) {
  const playheadPosition = `${(currentTime / duration) * 100}%`;
  
  return (
    <TrackContainer isSelected={isSelected} onClick={onSelect}>
      <TrackHeader>
        <Typography variant="body2" fontWeight="medium" noWrap>
          {track.name}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap>
          {track.type}
        </Typography>
      </TrackHeader>
      
      <Droppable droppableId={track.id} direction="horizontal">
        {(provided) => (
          <ClipsContainer
            ref={provided.innerRef}
            zoom={zoom}
            duration={duration}
            {...provided.droppableProps}
          >
            <PlayheadLine style={{ left: playheadPosition }} />
            
            {track.clips.map((clip, index) => (
              <Draggable 
                key={clip.id} 
                draggableId={`clip-${clip.id}`} 
                index={index}
              >
                {(provided, snapshot) => (
                  <Clip
                    clip={clip}
                    isSelected={clip.id === selectedClipId}
                    isDragging={snapshot.isDragging}
                    trackType={track.type}
                    provided={provided}
                    onSelect={() => onClipSelect(clip.id)}
                    duration={duration}
                  />
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </ClipsContainer>
        )}
      </Droppable>
    </TrackContainer>
  );
});

export default Track;
```

## Clip Component

```tsx
// src/video/timeline/Clip.tsx
import { memo } from 'react';
import { Box, Typography, styled } from '@mui/material';
import { VideoFile, AudioFile, TextFields } from '@mui/icons-material';
import { Clip as ClipType } from '@/types/timeline';

interface ClipProps {
  clip: ClipType;
  isSelected: boolean;
  isDragging: boolean;
  trackType: string;
  provided: any;
  onSelect: () => void;
  duration: number;
}

const ClipContainer = styled(Box, {
  shouldForwardProp: (prop) => !['isSelected', 'isDragging', 'clipColor'].includes(prop as string)
})<{ 
  isSelected: boolean; 
  isDragging: boolean;
  clipColor: string;
}>(({ theme, isSelected, isDragging, clipColor }) => ({
  position: 'absolute',
  height: 'calc(100% - 8px)',
  top: 4,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: clipColor,
  border: `2px solid ${isSelected 
    ? theme.palette.primary.main 
    : isDragging 
      ? theme.palette.secondary.main 
      : 'transparent'
  }`,
  boxShadow: isDragging 
    ? '0 5px 10px rgba(0,0,0,0.2)' 
    : isSelected 
      ? '0 0 0 2px rgba(108, 92, 231, 0.3)'
      : 'none',
  overflow: 'hidden',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(0.5, 1),
  zIndex: isSelected ? 1 : 0,
  transition: 'box-shadow 0.2s ease',
  '&:hover': {
    boxShadow: isSelected 
      ? '0 0 0 2px rgba(108, 92, 231, 0.5)'
      : '0 0 0 1px rgba(255, 255, 255, 0.3)'
  }
}));

const ClipHeader = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  height: 20
});

const ClipContent = styled(Box)({
  flex: 1,
  overflow: 'hidden'
});

const ClipThumbnail = styled(Box)({
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
});

// Helper to determine clip color based on type
const getClipColor = (type: string) => {
  switch (type) {
    case 'video':
      return 'rgba(25, 118, 210, 0.7)';
    case 'audio':
      return 'rgba(46, 125, 50, 0.7)';
    case 'text':
      return 'rgba(237, 108, 2, 0.7)';
    default:
      return 'rgba(108, 92, 231, 0.7)';
  }
};

// Helper to get icon based on clip type
const getClipIcon = (type: string) => {
  switch (type) {
    case 'video':
      return <VideoFile fontSize="small" />;
    case 'audio':
      return <AudioFile fontSize="small" />;
    case 'text':
      return <TextFields fontSize="small" />;
    default:
      return null;
  }
};

const Clip = memo(function Clip({
  clip,
  isSelected,
  isDragging,
  trackType,
  provided,
  onSelect,
  duration
}: ClipProps) {
  const clipColor = getClipColor(trackType);
  const clipWidth = `${(clip.duration / duration) * 100}%`;
  const clipLeft = `${(clip.startTime / duration) * 100}%`;
  
  return (
    <ClipContainer
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      style={{
        ...provided.draggableProps.style,
        width: clipWidth,
        left: clipLeft
      }}
      isSelected={isSelected}
      isDragging={isDragging}
      clipColor={clipColor}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <ClipHeader>
        {getClipIcon(trackType)}
        <Typography variant="caption" fontWeight="medium" noWrap>
          {clip.name}
        </Typography>
      </ClipHeader>
      
      <ClipContent>
        {trackType === 'video' && clip.thumbnailUrl && (
          <ClipThumbnail>
            <img 
              src={clip.thumbnailUrl} 
              alt={clip.name} 
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            />
          </ClipThumbnail>
        )}
      </ClipContent>
    </ClipContainer>
  );
});

export default Clip;
```

## Timeline Ruler Component

```tsx
// src/video/timeline/TimelineRuler.tsx
import { memo } from 'react';
import { Box, styled } from '@mui/material';

interface TimelineRulerProps {
  duration: number;
  zoom: number;
  currentTime: number;
  scrollLeft: number;
}

const RulerContainer = styled(Box)(({ theme }) => ({
  height: 24,
  backgroundColor: '#252525',
  borderBottom: `1px solid ${theme.palette.divider}`,
  position: 'relative',
  overflow: 'hidden'
}));

const RulerContent = styled(Box)<{ zoom: number, duration: number }>(({ zoom, duration }) => ({
  height: '100%',
  width: `${duration * 100 * zoom}px`, // 100px per second * zoom level
  minWidth: '100%',
  position: 'relative'
}));

const RulerTick = styled(Box)<{ major?: boolean }>(({ theme, major }) => ({
  position: 'absolute',
  top: major ? 0 : 12,
  height: major ? '100%' : '50%',
  width: 1,
  backgroundColor: major 
    ? theme.palette.text.secondary
    : theme.palette.text.disabled
}));

const RulerLabel = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 2,
  fontSize: 10,
  color: theme.palette.text.secondary,
  transform: 'translateX(-50%)'
}));

const PlayheadMarker = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  width: 0,
  height: 0,
  borderLeft: '6px solid transparent',
  borderRight: '6px solid transparent',
  borderTop: `6px solid ${theme.palette.primary.main}`,
  transform: 'translateX(-6px)',
  zIndex: 2
}));

const TimelineRuler = memo(function TimelineRuler({
  duration,
  zoom,
  currentTime,
  scrollLeft
}: TimelineRulerProps) {
  // Calculate tick intervals based on zoom level
  const getTickInterval = () => {
    if (zoom <= 0.25) return 5; // Every 5 seconds
    if (zoom <= 0.5) return 2;  // Every 2 seconds
    if (zoom <= 1) return 1;    // Every second
    if (zoom <= 2) return 0.5;  // Every 0.5 seconds
    return 0.25;                // Every 0.25 seconds
  };
  
  const tickInterval = getTickInterval();
  const minorTickInterval = tickInterval / 4;
  
  // Generate ruler ticks
  const ticks = [];
  const numTicks = Math.ceil(duration / minorTickInterval);
  
  for (let i = 0; i <= numTicks; i++) {
    const time = i * minorTickInterval;
    const isMajor = time % tickInterval === 0;
    const position = (time / duration) * 100;
    
    ticks.push(
      <RulerTick 
        key={`tick-${i}`}
        major={isMajor} 
        style={{ left: `${position}%` }} 
      />
    );
    
    if (isMajor) {
      ticks.push(
        <RulerLabel 
          key={`label-${i}`}
          style={{ left: `${position}%` }}
        >
          {formatTime(time)}
        </RulerLabel>
      );
    }
  }
  
  const playheadPosition = `${(currentTime / duration) * 100}%`;
  
  return (
    <RulerContainer>
      <RulerContent 
        zoom={zoom} 
        duration={duration}
        style={{ transform: `translateX(-${scrollLeft}px)` }}
      >
        {ticks}
        <PlayheadMarker style={{ left: playheadPosition }} />
      </RulerContent>
    </RulerContainer>
  );
});

// Helper to format time (e.g., 75.5 -> 1:15.5)
function formatTime(timeInSeconds: number): string {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = timeInSeconds % 60;
  
  if (minutes === 0) {
    return seconds.toFixed(seconds % 1 === 0 ? 0 : 1);
  }
  
  return `${minutes}:${seconds.toFixed(0).padStart(2, '0')}`;
}

export default TimelineRuler;
```

## Redux Store for Timeline

```typescript
// src/store/slices/timelineSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import { RootState } from '@/store';
import { Timeline, Track, Clip, TrackType } from '@/types/timeline';

const initialState: Timeline = {
  id: uuidv4(),
  projectId: null,
  name: 'New Timeline',
  duration: 60, // seconds
  tracks: [
    {
      id: uuidv4(),
      name: 'Video Track',
      type: 'video',
      clips: [],
      isMuted: false,
      isLocked: false,
      isVisible: true
    },
    {
      id: uuidv4(),
      name: 'Audio Track',
      type: 'audio',
      clips: [],
      isMuted: false,
      isLocked: false,
      isVisible: true
    },
    {
      id: uuidv4(),
      name: 'Text Track',
      type: 'text',
      clips: [],
      isMuted: false,
      isLocked: false,
      isVisible: true
    }
  ],
  currentTime: 0,
  zoom: 1,
  selectedTrackId: null,
  selectedClipId: null,
  playbackStatus: 'stopped'
};

export const timelineSlice = createSlice({
  name: 'timeline',
  initialState,
  reducers: {
    // Timeline actions
    setProjectId: (state, action: PayloadAction<string>) => {
      state.projectId = action.payload;
    },
    setTimelineName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },
    setDuration: (state, action: PayloadAction<number>) => {
      state.duration = action.payload;
    },
    setCurrentTime: (state, action: PayloadAction<number>) => {
      state.currentTime = action.payload;
    },
    updateZoom: (state, action: PayloadAction<number>) => {
      state.zoom = action.payload;
    },
    setPlaybackStatus: (state, action: PayloadAction<'playing' | 'paused' | 'stopped'>) => {
      state.playbackStatus = action.payload;
    },
    
    // Track actions
    addTrack: (state, action: PayloadAction<Partial<Track> | undefined> = {}) => {
      const trackType: TrackType = action.payload?.type || 'video';
      const newTrack: Track = {
        id: uuidv4(),
        name: action.payload?.name || `${trackType.charAt(0).toUpperCase() + trackType.slice(1)} Track ${state.tracks.filter(t => t.type === trackType).length + 1}`,
        type: trackType,
        clips: [],
        isMuted: false,
        isLocked: false,
        isVisible: true,
        ...action.payload
      };
      
      state.tracks.push(newTrack);
      state.selectedTrackId = newTrack.id;
    },
    removeTrack: (state, action: PayloadAction<string>) => {
      const index = state.tracks.findIndex(track => track.id === action.payload);
      if (index !== -1) {
        state.tracks.splice(index, 1);
        
        // Update selection if needed
        if (state.selectedTrackId === action.payload) {
          state.selectedTrackId = state.tracks.length > 0 ? state.tracks[0].id : null;
          state.selectedClipId = null;
        }
      }
    },
    selectTrack: (state, action: PayloadAction<string | null>) => {
      state.selectedTrackId = action.payload;
      state.selectedClipId = null;
    },
    toggleTrackMute: (state, action: PayloadAction<string>) => {
      const track = state.tracks.find(t => t.id === action.payload);
      if (track) {
        track.isMuted = !track.isMuted;
      }
    },
    toggleTrackLock: (state, action: PayloadAction<string>) => {
      const track = state.tracks.find(t => t.id === action.payload);
      if (track) {
        track.isLocked = !track.isLocked;
      }
    },
    toggleTrackVisibility: (state, action: PayloadAction<string>) => {
      const track = state.tracks.find(t => t.id === action.payload);
      if (track) {
        track.isVisible = !track.isVisible;
      }
    },
    
    // Clip actions
    addClip: (state, action: PayloadAction<{trackId: string, clip: Partial<Clip>}>) => {
      const { trackId, clip } = action.payload;
      const track = state.tracks.find(t => t.id === trackId);
      
      if (track) {
        const newClip: Clip = {
          id: uuidv4(),
          name: clip.name || 'New Clip',
          startTime: clip.startTime || state.currentTime,
          duration: clip.duration || 5,
          source: clip.source || { type: 'media', mediaId: null },
          thumbnailUrl: clip.thumbnailUrl || null,
          ...clip
        };
        
        track.clips.push(newClip);
        state.selectedTrackId = trackId;
        state.selectedClipId = newClip.id;
      }
    },
    removeClip: (state, action: PayloadAction<{trackId: string, clipId: string}>) => {
      const { trackId, clipId } = action.payload;
      const track = state.tracks.find(t => t.id === trackId);
      
      if (track) {
        const index = track.clips.findIndex(clip => clip.id === clipId);
        if (index !== -1) {
          track.clips.splice(index, 1);
          
          // Update selection if needed
          if (state.selectedClipId === clipId) {
            state.selectedClipId = null;
          }
        }
      }
    },
    updateClip: (state, action: PayloadAction<{
      trackId: string,
      clipId: string,
      changes: Partial<Clip>
    }>) => {
      const { trackId, clipId, changes } = action.payload;
      const track = state.tracks.find(t => t.id === trackId);
      
      if (track) {
        const clip = track.clips.find(c => c.id === clipId);
        if (clip) {
          Object.assign(clip, changes);
        }
      }
    },
    selectClip: (state, action: PayloadAction<{trackId: string, clipId: string} | null>) => {
      if (action.payload) {
        state.selectedTrackId = action.payload.trackId;
        state.selectedClipId = action.payload.clipId;
      } else {
        state.selectedClipId = null;
      }
    },
    splitClip: (state, action: PayloadAction<{
      trackId: string,
      clipId: string,
      splitTime?: number
    }>) => {
      const { trackId, clipId, splitTime } = action.payload;
      const splitAt = splitTime !== undefined ? splitTime : state.currentTime;
      
      const track = state.tracks.find(t => t.id === trackId);
      if (!track) return;
      
      const clipIndex = track.clips.findIndex(c => c.id === clipId);
      if (clipIndex === -1) return;
      
      const clip = track.clips[clipIndex];
      
      // Calculate clip boundaries
      const clipStart = clip.startTime;
      const clipEnd = clip.startTime + clip.duration;
      
      // Only split if split point is inside the clip
      if (splitAt <= clipStart || splitAt >= clipEnd) return;
      
      // Create two new clips
      const firstClipDuration = splitAt - clipStart;
      const secondClipDuration = clipEnd - splitAt;
      
      // Update first clip (original)
      track.clips[clipIndex] = {
        ...clip,
        duration: firstClipDuration
      };
      
      // Create second clip
      const newClip: Clip = {
        ...clip,
        id: uuidv4(),
        startTime: splitAt,
        duration: secondClipDuration
      };
      
      // Insert second clip after the original
      track.clips.splice(clipIndex + 1, 0, newClip);
    },
    moveClip: (state, action: PayloadAction<{
      clipId: string,
      sourceTrackId: string,
      destinationTrackId: string,
      sourceIndex: number,
      destinationIndex: number
    }>) => {
      const { clipId, sourceTrackId, destinationTrackId, sourceIndex, destinationIndex } = action.payload;
      
      const sourceTrack = state.tracks.find(t => t.id === sourceTrackId);
      const destinationTrack = state.tracks.find(t => t.id === destinationTrackId);
      
      if (!sourceTrack || !destinationTrack) return;
      
      // Same track move
      if (sourceTrackId === destinationTrackId) {
        const [removed] = sourceTrack.clips.splice(sourceIndex, 1);
        sourceTrack.clips.splice(destinationIndex, 0, removed);
      } else {
        // Different track move
        const [removed] = sourceTrack.clips.splice(sourceIndex, 1);
        destinationTrack.clips.splice(destinationIndex, 0, removed);
      }
    }
  }
});

// Export actions
export const {
  setProjectId,
  setTimelineName,
  setDuration,
  setCurrentTime,
  updateZoom,
  setPlaybackStatus,
  addTrack,
  removeTrack,
  selectTrack,
  toggleTrackMute,
  toggleTrackLock,
  toggleTrackVisibility,
  addClip,
  removeClip,
  updateClip,
  selectClip,
  splitClip,
  moveClip
} = timelineSlice.actions;

// Selectors
export const selectTimeline = (state: RootState) => state.timeline;

export default timelineSlice.reducer;
```

## Types for Timeline

```typescript
// src/types/timeline.ts
export type TrackType = 'video' | 'audio' | 'text' | 'effects';

export interface Clip {
  id: string;
  name: string;
  startTime: number; // seconds from start of timeline
  duration: number;  // seconds
  source: {
    type: 'media' | 'generated' | 'text';
    mediaId: string | null;
    url?: string;
    content?: string; // For text
  };
  thumbnailUrl: string | null;
  effects?: Effect[];
  transitions?: Transition[];
}

export interface Effect {
  id: string;
  type: string;
  params: Record<string, any>;
  startTime: number; // relative to clip start
  duration: number;
}

export interface Transition {
  id: string;
  type: string;
  duration: number;
  params: Record<string, any>;
}

export interface Track {
  id: string;
  name: string;
  type: TrackType;
  clips: Clip[];
  isMuted: boolean;
  isLocked: boolean;
  isVisible: boolean;
}

export interface Timeline {
  id: string;
  projectId: string | null;
  name: string;
  duration: number; // total timeline duration in seconds
  tracks: Track[];
  currentTime: number;
  zoom: number;
  selectedTrackId: string | null;
  selectedClipId: string | null;
  playbackStatus: 'playing' | 'paused' | 'stopped';
}
```

## Preview Player Component

```tsx
// src/video/player/PreviewPlayer.tsx
import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, IconButton, Slider, Typography, styled } from '@mui/material';
import {
  PlayArrow,
  Pause,
  SkipNext,
  SkipPrevious,
  VolumeUp,
  VolumeOff
} from '@mui/icons-material';
import { 
  setCurrentTime, 
  setPlaybackStatus,
  selectTimeline 
} from '@/store/slices/timelineSlice';
import { renderTimelineFrame } from '@/services/video/renderer';

const PlayerContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#0A0A0A',
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden'
}));

const VideoContainer = styled(Box)({
  width: '100%',
  height: 0,
  paddingBottom: '56.25%', // 16:9 aspect ratio
  position: 'relative',
  backgroundColor: 'black'
});

const VideoElement = styled('video')({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  objectFit: 'contain'
});

const CanvasElement = styled('canvas')({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%'
});

const ControlsContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  backgroundColor: '#1A1A1A'
}));

export default function PreviewPlayer() {
  const dispatch = useDispatch();
  const { tracks, currentTime, duration, playbackStatus } = useSelector(selectTimeline);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(null);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  
  // Setup canvas size
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);
  
  // Handle playback
  useEffect(() => {
    const startPlayback = () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      const startTime = performance.now() - (currentTime * 1000);
      
      const animate = (now: number) => {
        const elapsed = now - startTime;
        const newTime = elapsed / 1000;
        
        if (newTime >= duration) {
          dispatch(setCurrentTime(duration));
          dispatch(setPlaybackStatus('stopped'));
          return;
        }
        
        dispatch(setCurrentTime(newTime));
        renderFrame(newTime);
        animationRef.current = requestAnimationFrame(animate);
      };
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    const stopPlayback = () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
    
    if (playbackStatus === 'playing') {
      startPlayback();
    } else {
      stopPlayback();
    }
    
    return () => {
      stopPlayback();
    };
  }, [playbackStatus, duration, dispatch]);
  
  // Render current frame
  useEffect(() => {
    renderFrame(currentTime);
  }, [currentTime, tracks]);
  
  // Render frame at specific time
  const renderFrame = (time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Render timeline content
    renderTimelineFrame(ctx, tracks, time, {
      width: canvas.width,
      height: canvas.height
    });
  };
  
  const handlePlayPause = () => {
    if (playbackStatus === 'playing') {
      dispatch(setPlaybackStatus('paused'));
    } else {
      dispatch(setPlaybackStatus('playing'));
    }
  };
  
  const handleSeek = (_: Event, newValue: number | number[]) => {
    dispatch(setCurrentTime(newValue as number));
  };
  
  const handleVolumeChange = (_: Event, newValue: number | number[]) => {
    setVolume(newValue as number);
    setIsMuted(newValue as number === 0);
    
    if (videoRef.current) {
      videoRef.current.volume = newValue as number;
    }
  };
  
  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };
  
  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <PlayerContainer>
      <VideoContainer>
        <VideoElement
          ref={videoRef}
          muted={isMuted}
        />
        <CanvasElement ref={canvasRef} />
      </VideoContainer>
      
      <ControlsContainer>
        <IconButton size="small" onClick={handlePlayPause}>
          {playbackStatus === 'playing' ? <Pause /> : <PlayArrow />}
        </IconButton>
        
        <Typography variant="caption" sx={{ width: 60 }}>
          {formatTime(currentTime)}
        </Typography>
        
        <Slider
          size="small"
          value={currentTime}
          max={duration}
          onChange={handleSeek}
          sx={{ mx: 1, flex: 1 }}
        />
        
        <Typography variant="caption" sx={{ width: 60, textAlign: 'right' }}>
          {formatTime(duration)}
        </Typography>
        
        <IconButton size="small" onClick={handleMuteToggle}>
          {isMuted ? <VolumeOff fontSize="small" /> : <VolumeUp fontSize="small" />}
        </IconButton>
        
        <Slider
          size="small"
          value={volume}
          max={1}
          min={0}
          step={0.01}
          onChange={handleVolumeChange}
          sx={{ width: 80 }}
        />
      </ControlsContainer>
    </PlayerContainer>
  );
}
```

## FFmpeg Integration

```typescript
// src/services/video/ffmpeg.ts
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

class FFmpegService {
  private ffmpeg: any;
  private loaded: boolean = false;
  
  constructor() {
    this.ffmpeg = createFFmpeg({
      log: process.env.NODE_ENV === 'development',
      corePath: '/ffmpeg/ffmpeg-core.js'
    });
  }
  
  async load() {
    if (!this.loaded) {
      await this.ffmpeg.load();
      this.loaded = true;
    }
    return this.ffmpeg;
  }
  
  async getVideoInfo(file: File): Promise<{
    duration: number;
    width: number;
    height: number;
    fps: number;
  }> {
    await this.load();
    
    const name = 'input.mp4';
    this.ffmpeg.FS('writeFile', name, await fetchFile(file));
    
    // Extract video metadata using ffprobe
    await this.ffmpeg.run(
      '-i', name,
      '-v', 'error',
      '-select_streams', 'v:0',
      '-show_entries', 'stream=duration,width,height,r_frame_rate',
      '-of', 'json',
      'output.json'
    );
    
    // Read the output
    const data = this.ffmpeg.FS('readFile', 'output.json');
    const info = JSON.parse(new TextDecoder().decode(data));
    
    // Clean up
    this.ffmpeg.FS('unlink', name);
    this.ffmpeg.FS('unlink', 'output.json');
    
    // Parse framerate (typically returned as '24/1')
    let fps = 30;
    if (info.streams && info.streams[0] && info.streams[0].r_frame_rate) {
      const fpsStr = info.streams[0].r_frame_rate.split('/');
      if (fpsStr.length === 2) {
        fps = parseInt(fpsStr[0]) / parseInt(fpsStr[1]);
      }
    }
    
    return {
      duration: parseFloat(info.streams[0].duration || '0'),
      width: info.streams[0].width || 1920,
      height: info.streams[0].height || 1080,
      fps
    };
  }
  
  async extractThumbnail(file: File, time: number = 0): Promise<string> {
    await this.load();
    
    const name = 'input.mp4';
    this.ffmpeg.FS('writeFile', name, await fetchFile(file));
    
    // Extract a frame at the specified time
    await this.ffmpeg.run(
      '-ss', time.toString(),
      '-i', name,
      '-vframes', '1',
      '-vf', 'scale=320:-1',
      '-q:v', '5',
      'thumbnail.jpg'
    );
    
    // Read the output
    const data = this.ffmpeg.FS('readFile', 'thumbnail.jpg');
    
    // Clean up
    this.ffmpeg.FS('unlink', name);
    this.ffmpeg.FS('unlink', 'thumbnail.jpg');
    
    // Create a blob URL for the thumbnail
    const blob = new Blob([data.buffer], { type: 'image/jpeg' });
    return URL.createObjectURL(blob);
  }
  
  async trimVideo(file: File, start: number, duration: number): Promise<Blob> {
    await this.load();
    
    const name = 'input.mp4';
    this.ffmpeg.FS('writeFile', name, await fetchFile(file));
    
    // Trim the video
    await this.ffmpeg.run(
      '-ss', start.toString(),
      '-i', name,
      '-t', duration.toString(),
      '-c', 'copy',
      'output.mp4'
    );
    
    // Read the output
    const data = this.ffmpeg.FS('readFile', 'output.mp4');
    
    // Clean up
    this.ffmpeg.FS('unlink', name);
    this.ffmpeg.FS('unlink', 'output.mp4');
    
    // Create a blob for the trimmed video
    return new Blob([data.buffer], { type: 'video/mp4' });
  }
  
  async exportTimeline(
    clips: any[], 
    outputFormat: 'mp4' | 'webm' | 'gif' = 'mp4',
    outputOptions = {
      width: 1920,
      height: 1080,
      fps: 30,
      videoBitrate: '4M',
      audioBitrate: '128k'
    }
  ): Promise<Blob> {
    await this.load();
    
    // Create a list file for concatenation
    let listFileContent = '';
    
    // Process each clip
    for (let i = 0; i < clips.length; i++) {
      const clip = clips[i];
      const inputName = `input${i}.mp4`;
      
      // Write file to memory
      this.ffmpeg.FS('writeFile', inputName, await fetchFile(clip.file));
      
      // Add entry to list file
      listFileContent += `file '${inputName}'\n`;
      listFileContent += `duration ${clip.duration}\n`;
    }
    
    // Write the list file
    this.ffmpeg.FS('writeFile', 'list.txt', listFileContent);
    
    const outputName = `output.${outputFormat}`;
    
    // Concat and process the videos
    await this.ffmpeg.run(
      '-f', 'concat',
      '-safe', '0',
      '-i', 'list.txt',
      '-vf', `scale=${outputOptions.width}:${outputOptions.height},fps=${outputOptions.fps}`,
      '-b:v', outputOptions.videoBitrate,
      '-b:a', outputOptions.audioBitrate,
      outputName
    );
    
    // Read the output
    const data = this.ffmpeg.FS('readFile', outputName);
    
    // Clean up
    for (let i = 0; i < clips.length; i++) {
      this.ffmpeg.FS('unlink', `input${i}.mp4`);
    }
    this.ffmpeg.FS('unlink', 'list.txt');
    this.ffmpeg.FS('unlink', outputName);
    
    // Create a blob for the exported video
    const mimeType = outputFormat === 'mp4' 
      ? 'video/mp4'
      : outputFormat === 'webm'
        ? 'video/webm'
        : 'image/gif';
    
    return new Blob([data.buffer], { type: mimeType });
  }
}

// Create a singleton instance
const ffmpegService = new FFmpegService();
export default ffmpegService;
```

## Video Editor Integration Example

```tsx
// src/pages/editor/Editor.tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Grid, Paper, Tabs, Tab, Button, CircularProgress } from '@mui/material';
import { CloudUpload, Save } from '@mui/icons-material';
import { setProjectId, selectTimeline } from '@/store/slices/timelineSlice';
import { fetchProjectDetails } from '@/services/project/projectService';
import Timeline from '@/video/timeline/Timeline';
import PreviewPlayer from '@/video/player/PreviewPlayer';
import MediaLibrary from '@/components/media/MediaLibrary';
import ClipProperties from '@/components/editor/ClipProperties';
import EffectsPanel from '@/components/editor/EffectsPanel';
import ExportDialog from '@/components/editor/ExportDialog';

export default function Editor() {
  const { id: projectId } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const timelineState = useSelector(selectTimeline);
  const { selectedTrackId, selectedClipId } = timelineState;
  
  const [activeTab, setActiveTab] = useState(0);
  const [projectDetails, setProjectDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  
  useEffect(() => {
    if (projectId) {
      dispatch(setProjectId(projectId));
      loadProjectData();
    }
  }, [projectId, dispatch]);
  
  const loadProjectData = async () => {
    try {
      setIsLoading(true);
      const details = await fetchProjectDetails(projectId);
      setProjectDetails(details);
    } catch (error) {
      console.error('Failed to load project:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">{projectDetails?.title || 'Video Editor'}</Typography>
        
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<Save />}
            sx={{ mr: 1 }}
          >
            Save Project
          </Button>
          <Button 
            variant="contained" 
            startIcon={<CloudUpload />}
            onClick={() => setIsExportDialogOpen(true)}
          >
            Export
          </Button>
        </Box>
      </Box>
      
      <Grid container spacing={2} sx={{ flex: 1, minHeight: 0 }}>
        {/* Left panel - Preview and properties */}
        <Grid item xs={8} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Paper sx={{ mb: 2, flex: '0 0 auto' }}>
            <PreviewPlayer />
          </Paper>
          
          <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Timeline />
          </Paper>
        </Grid>
        
        {/* Right panel - Media, properties, effects */}
        <Grid item xs={4} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={activeTab} onChange={handleTabChange}>
                <Tab label="Media" />
                <Tab label="Properties" disabled={!selectedClipId} />
                <Tab label="Effects" disabled={!selectedClipId} />
              </Tabs>
            </Box>
            
            <Box sx={{ p: 2, flex: 1, overflow: 'auto' }}>
              {activeTab === 0 && <MediaLibrary projectId={projectId} />}
              {activeTab === 1 && selectedTrackId && selectedClipId && (
                <ClipProperties trackId={selectedTrackId} clipId={selectedClipId} />
              )}
              {activeTab === 2 && selectedTrackId && selectedClipId && (
                <EffectsPanel trackId={selectedTrackId} clipId={selectedClipId} />
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      <ExportDialog
        open={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        projectId={projectId}
      />
    </Box>
  );
}
```

This implementation provides a robust foundation for the video editing capabilities of the FilmStudio AI Platform. The timeline editor is a complex component that integrates with Redux for state management and offers features like:

1. Multiple track support (video, audio, text)
2. Clip management with drag and drop
3. Timeline ruler with time markers
4. Zoom controls
5. FFmpeg integration for video processing

The architecture follows React best practices with proper component separation and reuse. The Redux store handles the complex state management required for video editing, making it easier to implement features like undo/redo in the future.

FFmpeg is used both client-side (with ffmpeg.wasm) and potentially server-side for more complex operations, providing a powerful foundation for video manipulation capabilities.
