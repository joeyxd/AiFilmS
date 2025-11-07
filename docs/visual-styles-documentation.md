# Visual Styles Documentation

This document describes the visual styles system for The Scenarist Core v2.0 cover image generation.

## Architecture

### Phase 5: Cover Image Generation
- **Input**: Story metadata, characters, selected visual style
- **Process**: Generates style-specific prompts for cover image creation
- **Output**: Complete image generation prompt with style integration

### Visual Style System
- **Base Styles**: Predefined artistic styles with prompt bases
- **Categories**: Organized by visual approach (photorealistic, anime, cartoon, etc.)
- **Integration**: Seamlessly merged with story elements for custom prompts

## Available Styles

### Photorealistic Styles

#### Steve McCurry Style
- **Description**: Iconic photojournalism with rich colors and human emotion
- **Best For**: Drama, human stories, emotional narratives
- **Prompt Base**: `by Steve McCurry, 35mm, F/2.8, insanely detailed and intricate, character, hypermaximalist, elegant, ornate, beautiful, exotic, revealing, appealing, attractive, amative, hyper-realistic, super detailed, popular on Flickr`

#### War Photography
- **Description**: Dramatic photojournalism with intense atmosphere
- **Best For**: Action, thriller, war stories, intense drama
- **Prompt Base**: `photojournalism, war photography, adobe, canon, nikon, flickr contest winner, neo-expressionism, art photography, busy background, hyperrealism, chiaroscuro, anamorphic lens flare, elegant, shallow depth of field, haze, volumetric lighting, photo taken with provia, 24mm, f1.8, by Filip Hodas, by Andrew Do`

### Cinematic Styles

#### Golden Hour Cinematic
- **Description**: Warm, cinematic lighting with professional film quality
- **Best For**: Romance, adventure, feel-good stories
- **Prompt Base**: `warm golden hour lighting, soft natural lighting, chiaroscuro, specular lighting, soft bounced lighting, cinematic composition, anamorphic lens, 35mm film, professional color grading, shallow depth of field, bokeh`

#### Neon Noir
- **Description**: Dark atmospheric with bright neon accents
- **Best For**: Cyberpunk, noir, thriller, sci-fi
- **Prompt Base**: `bright neon lighting, hard shadows, chiaroscuro, silhouetted against the bright window, cyberpunk aesthetic, moody atmosphere, volumetric lighting, cinematic noir, urban nightscape, neon reflections`

### Anime Styles

#### Makoto Shinkai Anime
- **Description**: Beautiful anime style with detailed backgrounds and lighting
- **Best For**: Fantasy, romance, emotional stories
- **Prompt Base**: `Masterpiece, best quality, amazing quality, newest, very aesthetic, absurdres, (scenery:1.4), 8k, good anatomy, good shading, ultra detailed, refined details, high resolution, HD, masterwork, XUER guangying, CRYOS2, Dark_Niji_Style. (artist:makoto-shinkai:0.65)...`

#### Studio Ghibli
- **Description**: Whimsical anime with nature and fantasy elements
- **Best For**: Family stories, fantasy, adventure
- **Prompt Base**: `studio ghibli style, miyazaki hayao, anime, hand-drawn animation, watercolor background, soft pastels, whimsical, nature elements, magical atmosphere, detailed scenery, organic shapes, warm lighting`

### Cartoon Styles

#### Pixar 3D
- **Description**: Modern 3D animation with vibrant colors and character focus
- **Best For**: Family entertainment, comedy, adventure
- **Prompt Base**: `pixar style, 3d animation, vibrant colors, character-focused, clean lighting, smooth surfaces, expressive features, family-friendly, high quality 3d render, subsurface scattering`

#### Classic Disney 2D
- **Description**: Traditional hand-drawn Disney animation style
- **Best For**: Classic stories, musicals, fairy tales
- **Prompt Base**: `disney animation style, hand-drawn, traditional animation, cel shading, vibrant colors, expressive characters, clean line art, classic disney proportions`

### Artistic Styles

#### Renaissance Oil Painting
- **Description**: Classical oil painting with rich textures and dramatic lighting
- **Best For**: Historical drama, classical stories, epic tales
- **Prompt Base**: `oil painting, renaissance style, chiaroscuro lighting, rich textures, classical composition, dramatic shadows, warm color palette, masterpiece quality, baroque influence`

#### Game Concept Art
- **Description**: Digital concept art style for games and films
- **Best For**: Fantasy, sci-fi, action, adventure
- **Prompt Base**: `concept art, digital painting, matte painting, cinematic lighting, detailed environment, atmospheric perspective, professional concept art, game art style, film concept`

## Lighting Modifiers

The system includes sophisticated lighting options that can be dynamically added to any style:

### Atmospheric Lighting
- `backlight`, `candlelight`, `soft bounced lighting`
- `chiaroscuro`, `specular lighting`, `strong side key lights`
- `soft diffused lighting`, `soft fill lighting`

### Creative Lighting
- `radiant god rays`, `luminescence`, `warm golden hour lighting`
- `bright neon lighting`, `hard shadows`, `glowy luminescence`
- `iridescent light`, `bioluminescent details`, `translucency`

### Technical Lighting
- `direct flash photography`, `ektachrome`, `kodachrome`
- `silhouetted against the bright window`

## Integration with Story Elements

### Phase 5 Process
1. **Style Base**: Apply selected visual style prompt base
2. **Character Integration**: Add main character descriptions
3. **Atmosphere**: Include story mood and visual atmosphere
4. **Genre Elements**: Apply genre-appropriate visual conventions
5. **Thematic Enhancement**: Add symbolic visual elements
6. **Composition**: Ensure cinematic poster-worthy composition

### Example Output
For a cyberpunk thriller with Neon Noir style:
```
bright neon lighting, hard shadows, chiaroscuro, cyberpunk aesthetic, moody atmosphere, volumetric lighting, cinematic noir, urban nightscape, neon reflections, [protagonist description], standing in a rain-soaked street, neon signs reflecting in puddles, dramatic pose suggesting inner conflict, dark atmosphere with splashes of electric blue and hot pink, film poster composition, professional photography
```

## Future Enhancements

### Planned Features
- **LoRA Integration**: Custom model checkpoints for specific styles
- **VAE Support**: Enhanced image generation quality
- **Style Mixing**: Blend multiple styles for unique looks
- **Dynamic Thumbnails**: Real-time preview generation
- **User Custom Styles**: Allow users to create and save custom styles

### Model Checkpoints & LoRA
Future versions will support:
- **Stable Diffusion Models**: Specialized checkpoints for each style category
- **LoRA Weights**: Fine-tuned models for character consistency
- **VAE Models**: Enhanced color and detail rendering
- **ControlNet**: Precise composition and pose control

This creates a comprehensive foundation for professional-quality cover image generation that grows with advancing AI image generation technology.
