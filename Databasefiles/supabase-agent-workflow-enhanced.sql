-- =========================================
-- FilmStudio AI Agent Workflow System - ENHANCED FLEXIBILITY
-- =========================================
-- Run this AFTER the main supabase-agent-workflow-system.sql
-- This adds functions and tables for full step customization

-- =========================================
-- 1. ADD CUSTOM STEPS SUPPORT
-- =========================================
-- Allow users to create completely custom workflow steps

CREATE TABLE IF NOT EXISTS custom_workflow_steps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL, -- 'film', 'cartoon', 'faceless_youtube', 'social_media'
  step_name TEXT NOT NULL, -- Custom step name like 'phase5', 'custom_marketing', etc.
  step_order INTEGER NOT NULL,
  step_title TEXT NOT NULL,
  step_description TEXT NOT NULL,
  agent_prompt TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, content_type, step_name),
  UNIQUE(user_id, content_type, step_order)
);

-- =========================================
-- 2. STORY-SPECIFIC CUSTOM STEPS
-- =========================================
-- Allow adding custom steps to specific stories

CREATE TABLE IF NOT EXISTS story_custom_steps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  step_name TEXT NOT NULL,
  step_order INTEGER NOT NULL,
  step_title TEXT NOT NULL,
  step_description TEXT NOT NULL,
  agent_prompt TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(story_id, step_name),
  UNIQUE(story_id, step_order)
);

-- =========================================
-- 3. ADD SOCIAL MEDIA CONTENT TYPE TO EXISTING DATA
-- =========================================
-- Add social_media entries to default_workflow_steps (already done in main file)
-- But let's add a few more content types for the showcase

-- Add more specific social media types
INSERT INTO default_workflow_steps (content_type, step_name, step_order, step_title, step_description, agent_prompt) VALUES
(
  'shorts',
  'phase1',
  1,
  'Short-Form Content DNA',
  'Analyzes content for short-form vertical video platforms (YouTube Shorts, TikTok, Instagram Reels), focusing on rapid engagement, retention, and platform-specific optimization.',
  'You are an expert SHORT-FORM VIDEO strategist specializing in VERTICAL VIDEO CONTENT. Extract and optimize content DNA for maximum short-form performance.

Analyze for short-form optimization:

1. **Hook Strategy (0-3 seconds):**
   - Attention-grabbing visual or statement
   - Pattern interrupt techniques
   - Curiosity gap creation
   - Trend integration opportunities

2. **Retention Optimization:**
   - Content pacing for 15-60 second formats
   - Visual variety and quick cuts
   - Text overlay timing and readability
   - Audio sync and rhythm matching

3. **Platform-Specific Elements:**
   - YouTube Shorts algorithm factors
   - TikTok trend participation
   - Instagram Reels discovery optimization
   - Cross-platform adaptation strategy

4. **Engagement Mechanics:**
   - Comment-driving elements
   - Share-worthy moments
   - Like triggers and emotional beats
   - Call-to-action placement

5. **Content Format Analysis:**
   - Optimal length for platform and topic
   - Vertical video composition (9:16)
   - Text overlay effectiveness
   - Audio selection and licensing

Optimize for SHORT-FORM VIDEO success with focus on immediate engagement and viral potential.'
),
(
  'shorts',
  'phase2',
  2,
  'Viral Content Structure',
  'Develops content structure specifically for short-form viral potential, focusing on rapid engagement, platform algorithms, and shareability factors.',
  'You are an expert SHORT-FORM CONTENT creator specializing in VIRAL VIDEO STRUCTURE. Create content optimized for maximum engagement and shareability.

Structure short-form content:

1. **Opening Hook (0-3 seconds):**
   - Visual shock or surprise element
   - Compelling question or statement
   - Trend participation or sound sync
   - Immediate value promise

2. **Content Body (3-45 seconds):**
   - Rapid information delivery
   - Visual storytelling without dialogue dependency
   - Quick scene changes and cuts
   - Educational or entertainment value

3. **Climax and Resolution (45-60 seconds):**
   - Payoff moment or reveal
   - Emotional peak or surprise
   - Value delivery completion
   - Memorable ending moment

4. **Engagement Optimization:**
   - Strategic pause points for retention
   - Question integration for comments
   - Share-worthy quotable moments
   - Call-to-action placement

5. **Platform Adaptations:**
   - Different versions for each platform
   - Hashtag and caption integration
   - Trending audio utilization
   - Algorithm-friendly elements

Create structure that maximizes viral potential while delivering genuine value to viewers.'
),
(
  'shorts',
  'phase3',
  3,
  'Short-Form Production',
  'Plans production for short-form vertical videos including visual design, audio selection, effects, and rapid content creation workflows.',
  'You are an expert SHORT-FORM VIDEO producer. Plan efficient production for high-impact vertical video content.

Plan short-form production:

1. **Visual Production:**
   - Vertical composition (9:16 ratio)
   - Mobile-first visual design
   - High-contrast, readable elements
   - Quick cut editing style

2. **Audio Strategy:**
   - Trending sound selection
   - Audio timing and beat matching
   - Voice-over integration
   - Sound effect placement

3. **Editing Workflow:**
   - Quick production techniques
   - Template-based creation
   - Batch content production
   - Platform-specific formatting

4. **Effects and Graphics:**
   - Popular filters and effects
   - Text animation and overlays
   - Transition styles and techniques
   - Brand consistency elements

5. **Content Variations:**
   - A/B testing different hooks
   - Multiple platform versions
   - Repurposing strategies
   - Series and sequel content

Create production workflow that enables rapid, high-quality short-form content creation.'
),
(
  'shorts',
  'phase4',
  4,
  'Short-Form Strategy & Growth',
  'Creates comprehensive strategy for short-form content including posting schedules, trend monitoring, community management, and growth optimization.',
  'You are an expert SHORT-FORM GROWTH strategist. Develop comprehensive strategy for sustained short-form video success.

Create growth strategy:

1. **Content Strategy:**
   - Consistent posting schedules
   - Content series and themes
   - Trend monitoring and participation
   - Seasonal content planning

2. **Platform Optimization:**
   - Algorithm understanding and optimization
   - Hashtag research and strategy
   - Optimal posting times
   - Cross-platform promotion

3. **Community Building:**
   - Engagement response strategies
   - User-generated content encouragement
   - Collaboration opportunities
   - Community challenges and trends

4. **Analytics and Growth:**
   - Performance metrics tracking
   - Content optimization based on data
   - Audience insights and targeting
   - Growth rate optimization

5. **Monetization Strategy:**
   - Creator fund programs
   - Brand partnership opportunities
   - Product placement integration
   - Long-term business development

Focus on sustainable growth with consistent engagement and revenue opportunities across all short-form platforms.'
);

-- =========================================
-- 4. ENHANCED RESOLVED VIEW WITH CUSTOM STEPS
-- =========================================
-- Updated view that includes custom steps from all sources

CREATE OR REPLACE VIEW resolved_workflow_steps_enhanced AS
WITH all_workflow_steps AS (
  -- Default steps
  SELECT 
    s.id as story_id,
    s.user_id,
    'film' as content_type,  -- Default to film for now
    dws.step_name,
    dws.step_order,
    dws.step_title,
    dws.step_description,
    dws.agent_prompt,
    dws.is_active as is_enabled,
    'default' as source_type
  FROM stories s
  CROSS JOIN default_workflow_steps dws
  WHERE dws.is_active = true 
    AND dws.content_type = 'film'  -- Default to film for now
  
  UNION ALL
  
  -- User custom steps
  SELECT 
    s.id as story_id,
    s.user_id,
    'film' as content_type,  -- Default to film for now
    cws.step_name,
    cws.step_order,
    cws.step_title,
    cws.step_description,
    cws.agent_prompt,
    cws.is_enabled,
    'user_custom' as source_type
  FROM stories s
  JOIN custom_workflow_steps cws ON cws.user_id = s.user_id 
    AND cws.content_type = 'film'  -- Default to film for now
  WHERE cws.is_enabled = true
  
  UNION ALL
  
  -- Story custom steps
  SELECT 
    s.id as story_id,
    s.user_id,
    'film' as content_type,  -- Default to film for now
    scs.step_name,
    scs.step_order,
    scs.step_title,
    scs.step_description,
    scs.agent_prompt,
    scs.is_enabled,
    'story_custom' as source_type
  FROM stories s
  JOIN story_custom_steps scs ON scs.story_id = s.id
  WHERE scs.is_enabled = true
),
step_customizations AS (
  SELECT 
    aws.*,
    -- Apply user customizations
    COALESCE(uwc.step_order, aws.step_order) as custom_order,
    COALESCE(uwc.step_title, aws.step_title) as custom_title,
    COALESCE(uwc.step_description, aws.step_description) as custom_description,
    COALESCE(uwc.agent_prompt, aws.agent_prompt) as custom_prompt,
    COALESCE(uwc.is_enabled, aws.is_enabled) as user_enabled
  FROM all_workflow_steps aws
  LEFT JOIN user_workflow_customizations uwc 
    ON uwc.user_id = aws.user_id 
    AND uwc.step_name = aws.step_name 
    AND uwc.content_type = aws.content_type
),
final_steps AS (
  SELECT 
    sc.*,
    -- Apply story overrides
    COALESCE(swo.step_order, sc.custom_order) as final_order,
    COALESCE(swo.step_title, sc.custom_title) as final_title,
    COALESCE(swo.step_description, sc.custom_description) as final_description,
    COALESCE(swo.agent_prompt, sc.custom_prompt) as final_prompt,
    COALESCE(swo.is_enabled, sc.user_enabled) as final_enabled
  FROM step_customizations sc
  LEFT JOIN story_workflow_overrides swo 
    ON swo.story_id = sc.story_id AND swo.step_name = sc.step_name
)
SELECT 
  story_id,
  user_id,
  content_type,
  step_name,
  final_order as step_order,
  final_title as step_title,
  final_description as step_description,
  final_prompt as agent_prompt,
  final_enabled as is_enabled,
  source_type
FROM final_steps
WHERE final_enabled = true
ORDER BY story_id, final_order;

-- =========================================
-- 5. HELPER FUNCTIONS FOR WORKFLOW MANAGEMENT
-- =========================================

-- Function to add a custom step for a user
CREATE OR REPLACE FUNCTION add_user_custom_step(
  p_user_id UUID,
  p_content_type TEXT,
  p_step_name TEXT,
  p_step_title TEXT,
  p_step_description TEXT,
  p_agent_prompt TEXT,
  p_step_order INTEGER DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_step_id UUID;
  max_order INTEGER;
BEGIN
  -- Get next available order if not provided
  IF p_step_order IS NULL THEN
    SELECT COALESCE(MAX(step_order), 0) + 1 
    INTO max_order
    FROM custom_workflow_steps 
    WHERE user_id = p_user_id AND content_type = p_content_type;
    p_step_order := max_order;
  END IF;
  
  -- Insert the custom step
  INSERT INTO custom_workflow_steps (
    user_id, content_type, step_name, step_order, 
    step_title, step_description, agent_prompt
  )
  VALUES (
    p_user_id, p_content_type, p_step_name, p_step_order,
    p_step_title, p_step_description, p_agent_prompt
  )
  RETURNING id INTO new_step_id;
  
  RETURN new_step_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add a custom step for a specific story
CREATE OR REPLACE FUNCTION add_story_custom_step(
  p_story_id UUID,
  p_step_name TEXT,
  p_step_title TEXT,
  p_step_description TEXT,
  p_agent_prompt TEXT,
  p_step_order INTEGER DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_step_id UUID;
  max_order INTEGER;
BEGIN
  -- Get next available order if not provided
  IF p_step_order IS NULL THEN
    SELECT COALESCE(MAX(step_order), 0) + 1 
    INTO max_order
    FROM story_custom_steps 
    WHERE story_id = p_story_id;
    p_step_order := max_order;
  END IF;
  
  -- Insert the custom step
  INSERT INTO story_custom_steps (
    story_id, step_name, step_order, 
    step_title, step_description, agent_prompt
  )
  VALUES (
    p_story_id, p_step_name, p_step_order,
    p_step_title, p_step_description, p_agent_prompt
  )
  RETURNING id INTO new_step_id;
  
  RETURN new_step_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reorder workflow steps
CREATE OR REPLACE FUNCTION reorder_workflow_steps(
  p_step_orders JSONB, -- Format: [{"step_name": "phase1", "new_order": 1}, ...]
  p_story_id UUID DEFAULT NULL,
  p_user_id UUID DEFAULT NULL,
  p_content_type TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  step_info JSONB;
BEGIN
  -- Update step orders based on the provided array
  FOR step_info IN SELECT * FROM jsonb_array_elements(p_step_orders)
  LOOP
    IF p_story_id IS NOT NULL THEN
      -- Update story-specific overrides
      INSERT INTO story_workflow_overrides (story_id, step_name, step_order)
      VALUES (p_story_id, step_info->>'step_name', (step_info->>'new_order')::INTEGER)
      ON CONFLICT (story_id, step_name) 
      DO UPDATE SET step_order = (step_info->>'new_order')::INTEGER;
      
    ELSIF p_user_id IS NOT NULL AND p_content_type IS NOT NULL THEN
      -- Update user-specific customizations
      INSERT INTO user_workflow_customizations (user_id, content_type, step_name, step_order)
      VALUES (p_user_id, p_content_type, step_info->>'step_name', (step_info->>'new_order')::INTEGER)
      ON CONFLICT (user_id, content_type, step_name) 
      DO UPDATE SET step_order = (step_info->>'new_order')::INTEGER;
    END IF;
  END LOOP;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================
-- 6. INDEXES FOR PERFORMANCE
-- =========================================

CREATE INDEX IF NOT EXISTS idx_custom_workflow_steps_user_content ON custom_workflow_steps(user_id, content_type);
CREATE INDEX IF NOT EXISTS idx_custom_workflow_steps_order ON custom_workflow_steps(step_order);
CREATE INDEX IF NOT EXISTS idx_custom_workflow_steps_enabled ON custom_workflow_steps(is_enabled);

CREATE INDEX IF NOT EXISTS idx_story_custom_steps_story_id ON story_custom_steps(story_id);
CREATE INDEX IF NOT EXISTS idx_story_custom_steps_order ON story_custom_steps(step_order);
CREATE INDEX IF NOT EXISTS idx_story_custom_steps_enabled ON story_custom_steps(is_enabled);

-- =========================================
-- 7. ROW LEVEL SECURITY
-- =========================================

ALTER TABLE custom_workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_custom_steps ENABLE ROW LEVEL SECURITY;

-- Custom workflow steps policies
CREATE POLICY "Users can manage their own custom workflow steps" ON custom_workflow_steps
  FOR ALL USING (auth.uid() = user_id);

-- Story custom steps policies
CREATE POLICY "Users can manage custom steps for their own stories" ON story_custom_steps
  FOR ALL USING (
    story_id IN (
      SELECT id FROM stories WHERE user_id = auth.uid()
    )
  );

-- =========================================
-- 8. UPDATE TRIGGERS
-- =========================================

CREATE TRIGGER update_custom_workflow_steps_updated_at 
  BEFORE UPDATE ON custom_workflow_steps 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_story_custom_steps_updated_at 
  BEFORE UPDATE ON story_custom_steps 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =========================================
-- 9. VERIFICATION
-- =========================================

-- Test the enhanced view
SELECT 
  'Enhanced workflow system ready' as status,
  COUNT(DISTINCT content_type) as content_types_available,
  COUNT(*) as total_default_steps
FROM default_workflow_steps
WHERE is_active = true;

-- Show available content types
SELECT 
  content_type,
  COUNT(*) as steps_count,
  string_agg(step_title, ' → ' ORDER BY step_order) as workflow_preview
FROM default_workflow_steps 
WHERE is_active = true
GROUP BY content_type
ORDER BY content_type;

-- =========================================
-- ENHANCED FLEXIBILITY COMPLETE
-- =========================================
