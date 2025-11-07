import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Paper,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Tooltip,
  Divider,
  Avatar,
} from '@mui/material';
import {
  Image as ImageIcon,
  Close,
  Download,
  Public,
  Lock,
  Palette,
  AutoAwesome,
  FlashOn,
  CloudUpload,
  Delete,
  PhotoLibrary,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase/client';
import { openRouterService } from '../services/openrouter';

// Available models for image generation
const IMAGE_MODELS = [
  {
    id: 'google/gemini-2.5-flash-image-preview',
    name: 'Gemini 2.5 Flash (NanoBanana)',
    description: 'Fast, high-quality image generation',
    icon: '⚡',
    color: '#4285f4',
  },
  {
    id: 'openai/gpt-image-1',
    name: 'OpenAI GPT Image',
    description: 'Superior instruction following and text rendering',
    icon: '🎨',
    color: '#00a67e',
  },
  {
    id: 'openai/dall-e-3',
    name: 'DALL·E 3',
    description: 'High-quality image generation with large resolutions',
    icon: '🖼️',
    color: '#00a67e',
  },
  {
    id: 'openai/dall-e-2',
    name: 'DALL·E 2',
    description: 'Lower cost, supports edits and variations',
    icon: '🎭',
    color: '#00a67e',
  },
];

// Styled components
const StyledCard = styled(Card)(() => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '16px',
  '&:hover': {
    transform: 'translateY(-2px)',
    transition: 'all 0.3s ease',
  },
}));

const GenerateButton = styled(Button)(() => ({
  background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
  border: 0,
  borderRadius: '25px',
  boxShadow: '0 3px 15px 2px rgba(255, 107, 107, .3)',
  color: 'white',
  height: 48,
  padding: '0 30px',
  fontSize: '16px',
  fontWeight: 'bold',
  '&:hover': {
    background: 'linear-gradient(45deg, #FF5252, #26C6DA)',
    transform: 'translateY(-2px)',
  },
  '&:disabled': {
    background: 'rgba(255, 255, 255, 0.1)',
    color: 'rgba(255, 255, 255, 0.3)',
  },
}));

const ImageCard = styled(Card)(() => ({
  position: 'relative',
  overflow: 'hidden',
  borderRadius: '12px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
  },
}));

interface GeneratedImage {
  id: string;
  prompt: string;
  model: string;
  image_url: string;
  file_path?: string;
  image_width?: number;
  image_height?: number;
  file_size?: number;
  mime_type: string;
  base64_data?: string;
  is_public: boolean;
  is_featured: boolean;
  generation_metadata?: any;
  tags?: string[];
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface ShowcaseImage {
  id: string;
  title?: string;
  description?: string;
  prompt: string;
  model: string;
  image_url: string;
  creator_username?: string;
  featured_order: number;
  is_active: boolean;
  view_count: number;
  like_count: number;
  tags?: string[];
  created_at: string;
}

const ImageGenerationTab: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  console.log('🖼️ ImageGenerationTab render - isActive:', isActive);
  
  // Don't render anything if not active
  if (!isActive) {
    return null;
  }
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState(IMAGE_MODELS[0].id);
  const [inputImage, setInputImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<any>(null);
  const [userImages, setUserImages] = useState<GeneratedImage[]>([]);
  const [showcaseImages, setShowcaseImages] = useState<ShowcaseImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | ShowcaseImage | null>(null);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prompt suggestions
  const promptSuggestions = [
    "A futuristic cyberpunk city at night with neon lights",
    "A magical forest with glowing mushrooms and fairies",
    "A cute robot painting a landscape in watercolor style",
    "An ancient dragon flying over snow-capped mountains",
    "A steampunk airship floating above Victorian London",
    "A serene Japanese garden with cherry blossoms",
    "A space station orbiting a colorful nebula",
    "A cozy library filled with floating books and warm light",
  ];

  // Load user images and showcase images
  useEffect(() => {
    console.log('🖼️ ImageTab: useEffect triggered - isActive:', isActive, 'user:', !!user, 'userId:', user?.id);
    if (isActive && user) {
      loadUserImages();
      loadShowcaseImages();
    }
  }, [isActive, user]);

  const loadUserImages = async () => {
    try {
      setIsLoading(true);
      console.log('🖼️ ImageTab: Loading user images for user:', user?.id);
      console.log('🖼️ ImageTab: User object:', user);
      
      const { data, error } = await supabase
        .from('user_generated_images' as any)
        .select('*')
        .eq('user_id', user?.id || '')
        .order('created_at', { ascending: false });

      console.log('🖼️ ImageTab: Query result:', { data: data?.length, error });
      
      if (error) throw error;
      setUserImages((data as any[]) || []);
      console.log('🖼️ ImageTab: Set userImages:', (data as any[])?.map(img => ({ id: img.id, url: img.image_url, prompt: img.prompt.substring(0, 30) })));
    } catch (err) {
      console.error('❌ ImageTab: Error loading user images:', err);
      setError('Failed to load your images');
    } finally {
      setIsLoading(false);
    }
  };

  const loadShowcaseImages = async () => {
    try {
      console.log('🌟 ImageTab: Loading showcase images...');
      const { data, error } = await supabase
        .from('showcase_images' as any)
        .select('*')
        .eq('is_active', true)
        .order('featured_order', { ascending: true });

      console.log('🌟 ImageTab: Showcase query result:', { data: data?.length, error });
      
      if (error) throw error;
      setShowcaseImages((data as any[]) || []);
    } catch (err) {
      console.error('❌ ImageTab: Error loading showcase images:', err);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || !user) return;

    try {
      setIsGenerating(true);
      setError(null);

      const selectedModelData = IMAGE_MODELS.find(m => m.id === selectedModel);
      
      // Prepare generation options
      const generationOptions: any = {
        model: selectedModel,
        autoDownload: false, // We'll handle storage ourselves
      };

      // If there's an input image, include it in the generation
      if (inputImage) {
        generationOptions.inputImage = inputImage;
      }
      
      const result = await openRouterService.generateImage(prompt, generationOptions);

      setGenerationResult(result);

      if (result.success && result.imageData && result.imageData.length > 0) {
        // Take the first generated image
        const imageData = result.imageData[0];
        
        // Extract image dimensions if available
        let imageWidth, imageHeight;
        if (typeof imageData === 'string' && imageData.startsWith('data:image')) {
          try {
            const img = new Image();
            img.onload = () => {
              imageWidth = img.width;
              imageHeight = img.height;
            };
            img.src = imageData;
          } catch (e) {
            console.warn('Could not extract image dimensions');
          }
        }

        // Calculate approximate file size for base64 data
        const estimatedFileSize = imageData ? Math.round((imageData.length * 3) / 4) : 0;

        // Save to database with enhanced metadata
        const { data, error } = await supabase
          .from('user_generated_images' as any)
          .insert({
            user_id: user.id,
            prompt: prompt,
            model: selectedModel,
            image_url: imageData, // Base64 data URL
            image_width: imageWidth,
            image_height: imageHeight,
            file_size: estimatedFileSize,
            mime_type: 'image/png',
            base64_data: imageData,
            generation_metadata: {
              usage: result.usage,
              model_name: selectedModelData?.name,
              timestamp: new Date().toISOString(),
              input_image_used: !!inputImage,
              generation_type: inputImage ? 'image-to-image' : 'text-to-image',
            },
            tags: extractTagsFromPrompt(prompt),
          })
          .select()
          .single();

        if (error) throw error;

        // Add to user images list at the beginning
        setUserImages(prev => [(data as any) as GeneratedImage, ...prev]);

        // Clear form
        setPrompt('');
        setInputImage(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (err) {
      console.error('Error generating image:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper function to extract tags from prompt
  const extractTagsFromPrompt = (prompt: string): string[] => {
    const words = prompt.toLowerCase().split(/\s+/);
    const commonTags = ['art', 'digital', 'painting', 'portrait', 'landscape', 'abstract', 'realistic', 'fantasy', 'sci-fi', 'nature', 'city', 'person', 'animal'];
    return words.filter(word => commonTags.includes(word) || word.length > 4).slice(0, 5);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image file must be less than 10MB');
      return;
    }

    // Convert to base64 for preview and API
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setInputImage(result);
    };
    reader.readAsDataURL(file);
  };

  const removeInputImage = () => {
    setInputImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageClick = (image: GeneratedImage | ShowcaseImage) => {
    setSelectedImage(image);
    setIsImageDialogOpen(true);
  };

  const handleTogglePublic = async (imageId: string, isPublic: boolean) => {
    try {
      const { error } = await supabase
        .from('user_generated_images' as any)
        .update({ is_public: !isPublic })
        .eq('id', imageId)
        .eq('user_id', user?.id || '');

      if (error) throw error;

      // Update local state
      setUserImages(prev =>
        prev.map(img =>
          img.id === imageId ? { ...img, is_public: !isPublic } : img
        )
      );
    } catch (err) {
      console.error('Error updating image visibility:', err);
    }
  };

  const downloadImage = (imageUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderGenerationSection = () => (
    <Box sx={{ mb: 4 }}>
      <StyledCard>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <AutoAwesome sx={{ mr: 2, color: '#FFD700' }} />
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
              Create Amazing Images with AI
            </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              {/* Input Image Section */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ color: 'white', mb: 2, display: 'flex', alignItems: 'center' }}>
                  <PhotoLibrary sx={{ mr: 1 }} />
                  Input Image (Optional)
                </Typography>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />

                {!inputImage ? (
                  <Button
                    variant="outlined"
                    onClick={() => fileInputRef.current?.click()}
                    startIcon={<CloudUpload />}
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      '&:hover': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      },
                    }}
                  >
                    Upload Reference Image
                  </Button>
                ) : (
                  <Box sx={{ position: 'relative', display: 'inline-block' }}>
                    <Avatar
                      src={inputImage}
                      sx={{
                        width: 120,
                        height: 120,
                        borderRadius: 2,
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                      }}
                      variant="rounded"
                    />
                    <IconButton
                      onClick={removeInputImage}
                      sx={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        backgroundColor: 'rgba(255, 0, 0, 0.8)',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 0, 0, 1)',
                        },
                      }}
                      size="small"
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                )}
              </Box>

              <Divider sx={{ my: 2, backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />

              <TextField
                fullWidth
                multiline
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={inputImage 
                  ? "Describe how to modify the uploaded image..." 
                  : "Describe your image in detail..."
                }
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                    },
                  },
                }}
              />

              <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {(inputImage ? [
                  "Make it more artistic",
                  "Add cyberpunk style",
                  "Convert to oil painting",
                  "Add magical elements"
                ] : promptSuggestions.slice(0, 4)).map((suggestion, index) => (
                  <Chip
                    key={index}
                    label={suggestion}
                    onClick={() => setPrompt(suggestion)}
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      },
                    }}
                  />
                ))}
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  AI Model
                </InputLabel>
                <Select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  sx={{
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '& .MuiSvgIcon-root': {
                      color: 'white',
                    },
                  }}
                >
                  {IMAGE_MODELS.map((model) => (
                    <MenuItem key={model.id} value={model.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography sx={{ mr: 1 }}>{model.icon}</Typography>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {model.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {model.description}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2, display: 'block' }}>
                {inputImage ? 'Image-to-Image Generation' : 'Text-to-Image Generation'}
              </Typography>

              <GenerateButton
                fullWidth
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                startIcon={isGenerating ? <CircularProgress size={20} /> : <FlashOn />}
              >
                {isGenerating ? 'Generating...' : (inputImage ? 'Transform Image' : 'Generate Image')}
              </GenerateButton>
            </Grid>
          </Grid>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {generationResult && !generationResult.success && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              {generationResult.content}
            </Alert>
          )}
        </CardContent>
      </StyledCard>
    </Box>
  );

  const renderImageGrid = (images: (GeneratedImage | ShowcaseImage)[], title: string) => {
    console.log(`🖼️ ImageTab: Rendering ${title} with ${images.length} images:`, images.map(img => ({ id: img.id, url: img.image_url })));
    return (
    <Box sx={{ mb: 4 }}>
      <Typography
        variant="h6"
        sx={{
          mb: 2,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <ImageIcon sx={{ mr: 1 }} />
        {title}
      </Typography>

      {images.length === 0 ? (
        <Paper
          sx={{
            p: 4,
            textAlign: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            color: 'rgba(255, 255, 255, 0.7)',
          }}
        >
          <Palette sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
          <Typography>
            {title === 'Your Images' ? 'Start creating your first AI image!' : 'Coming soon...'}
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ 
          overflow: 'visible',
          '& .MuiImageList-root': {
            overflow: 'visible !important'
          }
        }}>
          <ImageList variant="masonry" cols={3} gap={16}>
            {images.map((image) => (
              <ImageListItem key={image.id}>
                <ImageCard>
                  <img
                    src={image.image_url}
                    alt={image.prompt}
                    style={{
                      width: '100%',
                      height: 'auto',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleImageClick(image)}
                    onError={() => {
                      console.error('Image failed to load:', image.image_url);
                    }}
                  />
                  <ImageListItemBar
                    title={
                      <Typography variant="subtitle2" sx={{ fontSize: '0.9em' }}>
                        {image.prompt.substring(0, 50)}
                        {image.prompt.length > 50 ? '...' : ''}
                      </Typography>
                    }
                    subtitle={
                      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', mt: 0.5 }}>
                        <Typography variant="caption" sx={{ mr: 1 }}>
                          {IMAGE_MODELS.find(m => m.id === image.model)?.name || image.model}
                        </Typography>
                        
                        {/* Show generation type if available */}
                        {'generation_metadata' in image && image.generation_metadata?.generation_type && (
                          <Chip
                            label={image.generation_metadata.generation_type === 'image-to-image' ? 'I2I' : 'T2I'}
                            size="small"
                            sx={{ 
                              fontSize: '0.7em', 
                              height: 16, 
                              mr: 1,
                              backgroundColor: image.generation_metadata.generation_type === 'image-to-image' ? 'rgba(255, 193, 7, 0.3)' : 'rgba(76, 175, 80, 0.3)'
                            }}
                          />
                        )}
                        
                        {/* Show image dimensions if available */}
                        {'image_width' in image && image.image_width && image.image_height && (
                          <Typography variant="caption" sx={{ mr: 1, fontSize: '0.7em' }}>
                            {image.image_width}×{image.image_height}
                          </Typography>
                        )}
                        
                        {'is_public' in image && (
                          <Tooltip title={image.is_public ? 'Public' : 'Private'}>
                            {image.is_public ? (
                              <Public sx={{ fontSize: 16 }} />
                            ) : (
                              <Lock sx={{ fontSize: 16 }} />
                            )}
                          </Tooltip>
                        )}
                      </Box>
                    }
                    actionIcon={
                      <Box>
                        {'is_public' in image && image.user_id === user?.id && (
                          <Tooltip title="Toggle public/private">
                            <IconButton
                              sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTogglePublic(image.id, image.is_public);
                              }}
                            >
                              {image.is_public ? <Public /> : <Lock />}
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Download">
                          <IconButton
                            sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadImage(
                                image.image_url,
                                `ai-image-${image.id}.png`
                              );
                            }}
                          >
                            <Download />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    }
                  />
                </ImageCard>
              </ImageListItem>
            ))}
          </ImageList>
        </Box>
      )}
    </Box>
    );
  };

  const renderImageDialog = () => (
    <Dialog
      open={isImageDialogOpen}
      onClose={() => setIsImageDialogOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Image Details</Typography>
          <IconButton onClick={() => setIsImageDialogOpen(false)}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {selectedImage && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <img
                src={selectedImage.image_url}
                alt={selectedImage.prompt}
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '8px',
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Prompt
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {selectedImage.prompt}
              </Typography>

              <Typography variant="h6" gutterBottom>
                Model
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {IMAGE_MODELS.find(m => m.id === selectedImage.model)?.name || selectedImage.model}
              </Typography>

              {/* Show generation metadata if available */}
              {'generation_metadata' in selectedImage && selectedImage.generation_metadata && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Generation Details
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    {selectedImage.generation_metadata.generation_type && (
                      <Chip
                        label={selectedImage.generation_metadata.generation_type === 'image-to-image' ? 'Image-to-Image' : 'Text-to-Image'}
                        size="small"
                        sx={{ 
                          mr: 1, mb: 1,
                          backgroundColor: selectedImage.generation_metadata.generation_type === 'image-to-image' ? 'rgba(255, 193, 7, 0.3)' : 'rgba(76, 175, 80, 0.3)'
                        }}
                      />
                    )}
                    {selectedImage.generation_metadata.input_image_used && (
                      <Chip
                        label="Reference Image Used"
                        size="small"
                        sx={{ mb: 1, backgroundColor: 'rgba(33, 150, 243, 0.3)' }}
                      />
                    )}
                  </Box>
                </>
              )}

              {/* Show image dimensions and file info */}
              {'image_width' in selectedImage && selectedImage.image_width && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Image Info
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Dimensions: {selectedImage.image_width} × {selectedImage.image_height}
                  </Typography>
                  {selectedImage.file_size && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      File Size: {(selectedImage.file_size / 1024 / 1024).toFixed(2)} MB
                    </Typography>
                  )}
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Format: {selectedImage.mime_type || 'image/png'}
                  </Typography>
                </>
              )}

              {/* Show tags if available */}
              {'tags' in selectedImage && selectedImage.tags && selectedImage.tags.length > 0 && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Tags
                  </Typography>
                  <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selectedImage.tags.map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </>
              )}

              <Typography variant="h6" gutterBottom>
                Created
              </Typography>
              <Typography variant="body2" sx={{ mb: 3 }}>
                {new Date(selectedImage.created_at).toLocaleDateString()} at {new Date(selectedImage.created_at).toLocaleTimeString()}
              </Typography>

              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={() =>
                  downloadImage(
                    selectedImage.image_url,
                    `ai-image-${selectedImage.id}.png`
                  )
                }
                fullWidth
              >
                Download Image
              </Button>
            </Grid>
          </Grid>
        )}
      </DialogContent>
    </Dialog>
  );

  if (!isActive) return null;

  return (
    <>
      {/* Full overlay to block any background elements */}
      <Box 
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#101418', // Completely opaque dark background
          zIndex: 9, // Reasonable z-index
          pointerEvents: 'none', // Allow clicks through to our content
        }}
      />
      
      <Box 
        sx={{ 
          p: 3, 
          minHeight: '100vh',
          position: 'relative',
          zIndex: 10, // Higher than overlay but reasonable
          backgroundColor: '#101418', // Solid background matching overlay
        }}
        onWheel={(e) => {
          // Prevent wheel events from bubbling to background showcase
          e.stopPropagation();
        }}
        onScroll={(e) => {
          // Prevent scroll events from bubbling
          e.stopPropagation();
        }}
      >
      <Typography
        variant="h4"
        sx={{
          mb: 4,
          background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
          fontWeight: 'bold',
        }}
      >
        AI Image Generation Studio
      </Typography>

      {renderGenerationSection()}

      <Tabs
        value={currentTab}
        onChange={(_, newValue) => setCurrentTab(newValue)}
        sx={{
          mb: 3,
          '& .MuiTab-root': {
            color: 'rgba(255, 255, 255, 0.7)',
            '&.Mui-selected': {
              color: '#4ECDC4',
            },
          },
        }}
      >
        <Tab label="Your Images" />
        <Tab label="Featured Gallery" />
      </Tabs>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress sx={{ color: '#4ECDC4' }} />
        </Box>
      )}

      {currentTab === 0 && renderImageGrid(userImages, 'Your Images')}
      {currentTab === 1 && renderImageGrid(showcaseImages, 'Featured Gallery')}

      {renderImageDialog()}
    </Box>
    </>
  );
};

export default ImageGenerationTab;
