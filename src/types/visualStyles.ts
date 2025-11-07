// Visual Style Definitions for Story Cover Generation

export interface VisualStyle {
  id: string;
  name: string;
  description: string;
  promptBase: string;
  category: 'photorealistic' | 'anime' | 'cartoon' | 'artistic' | 'cinematic';
  thumbnailUrl?: string;
}

export const VISUAL_STYLES: VisualStyle[] = [
  // PHOTOREALISTIC STYLES
  {
    id: 'steve-mccurry',
    name: 'Steve McCurry Style',
    description: 'Iconic photojournalism with rich colors and human emotion',
    category: 'photorealistic',
    promptBase: 'by Steve McCurry, 35mm, F/2.8, insanely detailed and intricate, character, hypermaximalist, elegant, ornate, beautiful, exotic, revealing, appealing, attractive, amative, hyper-realistic, super detailed, popular on Flickr'
  },
  {
    id: 'war-photography',
    name: 'War Photography',
    description: 'Dramatic photojournalism with intense atmosphere',
    category: 'photorealistic',
    promptBase: 'photojournalism, war photography, adobe, canon, nikon, flickr contest winner, neo-expressionism, art photography, busy background, hyperrealism, chiaroscuro, anamorphic lens flare, elegant, shallow depth of field, haze, volumetric lighting, photo taken with provia, 24mm, f1.8, by Filip Hodas, by Andrew Do'
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour Cinematic',
    description: 'Warm, cinematic lighting with professional film quality',
    category: 'cinematic',
    promptBase: 'warm golden hour lighting, soft natural lighting, chiaroscuro, specular lighting, soft bounced lighting, cinematic composition, anamorphic lens, 35mm film, professional color grading, shallow depth of field, bokeh'
  },
  {
    id: 'neon-noir',
    name: 'Neon Noir',
    description: 'Dark atmospheric with bright neon accents',
    category: 'cinematic',
    promptBase: 'bright neon lighting, hard shadows, chiaroscuro, silhouetted against the bright window, cyberpunk aesthetic, moody atmosphere, volumetric lighting, cinematic noir, urban nightscape, neon reflections'
  },

  // ANIME STYLES
  {
    id: 'makoto-shinkai',
    name: 'Makoto Shinkai Anime',
    description: 'Beautiful anime style with detailed backgrounds and lighting',
    category: 'anime',
    promptBase: 'Masterpiece, best quality, amazing quality, newest, very aesthetic, absurdres, (scenery:1.4), 8k, good anatomy, good shading, ultra detailed, refined details, high resolution, HD, masterwork, XUER guangying, CRYOS2, Dark_Niji_Style. (artist:makoto-shinkai:0.65), (artist:mazjojo:0.83), (artist:pigeon666:0.67), (artist:zawar379:0.77), (artist:remsrar:0.65), (artist:yoneyama mai:0.74), (artist:chimmyming:0.72), (artist:konya karasue:0.55), (artist:remsrar:0.65), nub1mo, (artist:Yomu:0.3),(dino_(dinoartforame):0.5),(artist:quasarcake:0.47),(artist:wlop:0.4), (artist:ebifurya:0.52), (artist:as109:0.82), (artist:krekkov:0.68), (artist:mossacannibalis:0.56), (artist:tianliang duohe fangdongye:0.79), (artist:z-ton:1.04), (artist:pontsuka:0.55), (artist:sakimichan:0.4), (artist:nanFe:0.4), (artist:loish:0.35), (photorealistic:1.2), (illustration:1.3), high resolution, sharp focus, soft lighting, sunlight'
  },
  {
    id: 'studio-ghibli',
    name: 'Studio Ghibli',
    description: 'Whimsical anime with nature and fantasy elements',
    category: 'anime',
    promptBase: 'studio ghibli style, miyazaki hayao, anime, hand-drawn animation, watercolor background, soft pastels, whimsical, nature elements, magical atmosphere, detailed scenery, organic shapes, warm lighting'
  },

  // CARTOON STYLES
  {
    id: 'pixar-3d',
    name: 'Pixar 3D',
    description: 'Modern 3D animation with vibrant colors and character focus',
    category: 'cartoon',
    promptBase: 'pixar style, 3d animation, vibrant colors, character-focused, clean lighting, smooth surfaces, expressive features, family-friendly, high quality 3d render, subsurface scattering'
  },
  {
    id: 'disney-2d',
    name: 'Classic Disney 2D',
    description: 'Traditional hand-drawn Disney animation style',
    category: 'cartoon',
    promptBase: 'disney animation style, hand-drawn, traditional animation, cel shading, vibrant colors, expressive characters, clean line art, classic disney proportions'
  },

  // ARTISTIC STYLES
  {
    id: 'oil-painting',
    name: 'Renaissance Oil Painting',
    description: 'Classical oil painting with rich textures and dramatic lighting',
    category: 'artistic',
    promptBase: 'oil painting, renaissance style, chiaroscuro lighting, rich textures, classical composition, dramatic shadows, warm color palette, masterpiece quality, baroque influence'
  },
  {
    id: 'concept-art',
    name: 'Game Concept Art',
    description: 'Digital concept art style for games and films',
    category: 'artistic',
    promptBase: 'concept art, digital painting, matte painting, cinematic lighting, detailed environment, atmospheric perspective, professional concept art, game art style, film concept'
  }
];

// Lighting and atmosphere modifiers
export const LIGHTING_MODIFIERS = [
  'backlight',
  'candlelight', 
  'soft bounced lighting',
  'chiaroscuro',
  'specular lighting',
  'strong side key lights',
  'soft diffused lighting',
  'soft fill lighting',
  'direct flash photography',
  'radiant god rays',
  'luminescence',
  'warm golden hour lighting',
  'soft natural lighting',
  'bright neon lighting',
  'silhouetted against the bright window',
  'hard shadows',
  'glowy luminescence',
  'ektachrome',
  'kodachrome',
  'iridescent light',
  'bioluminescent details',
  'translucency',
  'glowy translucency'
];

export const getStyleById = (id: string): VisualStyle | undefined => {
  return VISUAL_STYLES.find(style => style.id === id);
};

export const getStylesByCategory = (category: VisualStyle['category']): VisualStyle[] => {
  return VISUAL_STYLES.filter(style => style.category === category);
};
