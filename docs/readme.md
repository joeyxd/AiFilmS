# FilmStudio AI Platform

## **Core Philosophy:**

- **Granularity:** Break down the creative process into the smallest meaningful steps. This makes AI prompting more focused and results more predictable.
- **Supabase as the Single Source of Truth:** Everything gets stored and linked in Supabase. This allows agents to pick up where others left off and provides a clear audit trail.
- **Iterative Processing:** One agent's output becomes the input for the next, building up the final product piece by piece.
- **User-Driven Creation:** Empower users to create various video types (film-style, cartoon, faceless YouTube videos) with an intuitive interface.
- **AI-Powered Automation:** Leverage AI agents to handle complex video creation tasks automatically.ng Prompt or idea](https://www.notion.so/Starting-Prompt-or-idea-20f66b865c7080edb55eff3255e4953c?pvs=21)

## **Core Philosophy:**

- **Granularity:** Break down the creative process into the smallest meaningful steps. This makes AI prompting more focused and results more predictable.
- **Airtable as the Single Source of Truth:** Everything gets stored and linked in Airtable. This allows agents to pick up where others left off and provides a clear audit trail.
- **Iterative Processing:** One agent's output becomes the input for the next, building up the final product piece by piece.

---

## **Airtable Structure**

Let's design the tables first, as they'll dictate how data flows.

### **1. Table: Stories**

- StoryID (Primary Key, Autonumber or Formula CONCATENATE("STY-",RECORD_ID()))
- Title (Single Line Text)
- Logline (Single Line Text, optional summary)
- FullStoryText (Long Text, with rich text enabled if you want formatting)
- Status (Single Select: "New", "Chapterizing", "Character Extraction", "Scripting Scenes", "Designing Shots", "Generating Stills", "Generating Video Prompts", "Generating Video", "Completed")
- LinkedChapters (Link to Chapters table, multiple)
- LinkedCharacters (Link to Characters table, multiple)
- LastModified (Last Modified Time)

### **2. Table: Chapters**

- ChapterID (Primary Key, Autonumber or Formula CONCATENATE("CHP-",RECORD_ID()))
- StoryID (Link to Stories table, single)
- ChapterNumber (Number)
- ChapterTitle (Single Line Text, AI-generated or manual)
- OriginalStoryTextPortion (Long Text - the actual text for this chapter from the original story)
- ChapterSummary_AI (Long Text - AI-generated summary of this chapter's key events/focus)
- EstimatedFilmTime (Duration - e.g., 0:01:30 for 1 min 30 sec, AI suggested)
- LinkedScenes (Link to Scenes table, multiple)
- Status (Single Select: "Pending Scenes", "Scripting Scenes", "Completed")

### **3. Table: Characters**

- CharacterID (Primary Key, Autonumber or Formula CONCATENATE("CHR-",RECORD_ID()))
- StoryID (Link to Stories table, multiple - a character could appear in multiple stories if you reuse them, otherwise single)
- CharacterName (Single Line Text)
- RoleInStory (Long Text - e.g., Protagonist, Antagonist, Mentor, Supporting)
- Context/Backstory_AI (Long Text - AI-generated brief backstory or context relevant to the story)
- SuggestedLookFeel_AI (Long Text - AI-generated description of appearance, attire, demeanor)
- StillImagePrompt_CharacterDesign (Long Text - Prompt for AI image generator to create a visual concept)
- GeneratedCharacterImage (Attachment - The visual concept image)
- Status (Single Select: "Identified", "Awaiting Look/Feel", "Awaiting Image Prompt", "Awaiting Image", "Concept Ready")

### **4. Table: Scenes** (approx. 10 per chapter, but flexible)

- SceneID (Primary Key, Autonumber or Formula CONCATENATE("SCN-",RECORD_ID()))
- ChapterID (Link to Chapters table, single)
- SceneNumber (Number - e.g., 1.1, 1.2 for Chapter 1 Scene 1, Scene 2)
- Location_AI (Single Line Text - e.g., "Misty Forest Clearing", "Cyberpunk Alleyway")
- TimeOfDay_AI (Single Line Text - e.g., "Golden Hour", "Dead of Night", "Overcast Noon")
- CharactersInScene (Link to Characters table, multiple)
- OverallMoodFeel_AI (Long Text - e.g., "Tense and suspenseful", "Whimsical and dreamlike")
- ArtisticFocus_AI (Long Text - e.g., "Emphasis on long shadows and desaturated colors", "Vibrant neon glow with dynamic reflections")
- SceneDescription_AI (Long Text - What happens in this scene, what's its purpose for the story, key actions and emotional beats. This is the "ultra profesional discription")
- LinkedShots (Link to Shots table, multiple)
- Status (Single Select: "Pending Shots", "Designing Shots", "Completed")

### **5. Table: Shots** (several per scene)

- ShotID (Primary Key, Autonumber or Formula CONCATENATE("SHT-",RECORD_ID()))
- SceneID (Link to Scenes table, single)
- ShotNumberInScene (Number)
- ShotDescription_AI (Long Text - What specifically this shot captures. The "why and what trying to show.")
- CameraShotType_AI (Single Select or Text - e.g., "Extreme Close-Up", "Wide Shot", "Medium Shot", "Dutch Angle")
- CameraMovement_AI (Single Select or Text - e.g., "Static", "Slow Pan Right", "Dolly In", "Jib Up", "Handheld Follow")
- LensChoiceSuggestion_AI (Single Line Text - e.g., "Wide Angle (e.g., 24mm)", "Telephoto (e.g., 85mm)")
- LightingDescription_AI (Long Text - e.g., "Key light from left, rim light, moody underlighting", "Flat, even lighting")
- ColorPaletteFocus_AI (Long Text - e.g., "Monochromatic blues with a single red highlight", "Analogous warm colors")
- ArtisticIntent_AI (Long Text - The *reason* for this specific shot composition and movement)
- StillImagePrompt_Technical_AI (Long Text - The prompt for the still image generator for *this specific shot*)
- GeneratedStillImage (Attachment - The reference image for this shot)
- VideoShotFlowDescription_AI (Long Text - How the 1-30s video clip for *this shot* should progress, e.g., "Start on character's eyes, slow zoom out to reveal dagger in hand, subtle camera shake")
- VideoGenerationPrompt_Technical_AI (Long Text - The prompt for the video generator for *this shot*, possibly incorporating elements from the still image and the flow)
- EstimatedDuration_AI (Number - seconds, e.g., 3, 5, 10, up to 30)
- GeneratedVideoClip (Attachment - The final video clip)
- Status (Single Select: "Pending Still Prompt", "Pending Still Image", "Pending Video Flow", "Pending Video Prompt", "Pending Video Generation", "Completed")

---

## **AI Agents & Their Roles**

You can implement these as separate LLM calls within your n8n workflow, each with a carefully crafted system prompt and user prompt based on data from Airtable.

### **Agent 1: Story Deconstructor & Character Extractor**

- **Input:** FullStoryText from Stories table.
- **Task:**
    - Divide the story into logical chapters/sections (e.g., based on plot points, time progression, or to keep chunks manageable, say 5-10 chapters). Provide OriginalStoryTextPortion for each. Suggest a ChapterTitle and ChapterSummary_AI.
    - Identify all characters. For each, describe their RoleInStory and Context/Backstory_AI based on the full story.
- **Output:** Data to create records in Chapters and Characters tables.
- **Why:** Breaks down the narrative into digestible parts and establishes the cast.

### **Agent 2: Creative Scripter (Scene Designer)**

- **Input:** OriginalStoryTextPortion and ChapterSummary_AI from a Chapters record, and linked Characters involved in that chapter.
- **Task:**
    - For the given chapter, break it down into ~10 distinct scenes.
    - For each scene: define Location_AI, TimeOfDay_AI, CharactersInScene (link existing), OverallMoodFeel_AI, ArtisticFocus_AI, and a detailed SceneDescription_AI (what happens, dialogue hints, emotional core).
- **Output:** Data to create records in the Scenes table, linked to the chapter.
- **Why:** Translates prose into a structured screenplay format, focusing on the "what" and "where" with an artistic vision.

### **Agent 3: Shot Architect (Visual Storyteller)**

- **Input:** A Scenes record (with its SceneDescription_AI, ArtisticFocus_AI, OverallMoodFeel_AI, Location_AI, involved Characters).
- **Task:**
    - For the given scene, design multiple individual shots (e.g., 3-7 shots per scene).
    - For each shot:
        - ShotDescription_AI: What's the key visual information or action?
        - CameraShotType_AI, CameraMovement_AI, LensChoiceSuggestion_AI.
        - LightingDescription_AI, ColorPaletteFocus_AI.
        - ArtisticIntent_AI: *Why* this shot? What emotion or information is it conveying? How does it contribute to the scene's artistic focus?
        - EstimatedDuration_AI (1-30 seconds).
- **Output:** Data to create multiple records in the Shots table, linked to the scene.
- **Why:** This is where the "art of delivery" happens. Focuses on detailed, artistic cinematography for each small moment.

### **Agent 4: Still Image Prompt Engineer (Art Director)**

- **Input:** A Shots record (with all its details: ShotDescription_AI, CameraShotType_AI, Lighting_AI, Colors_AI, linked Characters and their SuggestedLookFeel_AI).
- **Task:** Generate a highly detailed and technical StillImagePrompt_Technical_AI suitable for a still image AI generator (e.g., Midjourney, Stable Diffusion, DALL-E). This prompt should encapsulate all the visual elements defined for the shot to create a perfect reference still.
- **Output:** Updates the StillImagePrompt_Technical_AI field in the Shots table.
- **Why:** Creates the precise instructions for the still image AI to generate a frame that perfectly represents the intended visual for the shot.

### **Agent 5: Cinematographer / Video Motion Designer**

- **Input:** A Shots record, now including its GeneratedStillImage (or at least the prompt if the image isn't generated yet/failed) and all its other descriptive fields.
- **Task:**
    - Describe the VideoShotFlowDescription_AI: How should this shot unfold over its short duration (1-30s)? If it's a static shot, what subtle animations or atmospheric effects could be present? If there's camera movement, describe its speed and focus. If characters are present, what are their micro-actions or expressions?
    - Generate the VideoGenerationPrompt_Technical_AI for an AI video generator (e.g., RunwayML, Pika Labs, Stable Video Diffusion). This prompt should leverage the ShotDescription_AI, VideoShotFlowDescription_AI, and potentially reference the GeneratedStillImage (e.g., "Animate this image: [link to image] with a slow zoom in, add dust motes floating in the light beams").
- **Output:** Updates VideoShotFlowDescription_AI and VideoGenerationPrompt_Technical_AI fields in the Shots table.
- **Why:** Translates the static shot concept into a dynamic, short video clip by defining movement and progression, then crafts the prompt for the video AI.

---

## **n8n Workflow (High-Level Conceptual Nodes)**

1. **Trigger: Airtable - New Story**
    - Watches the Stories table for records where Status is "New".
2. **AI Agent 1: Story Deconstruct & Character Extract**
    - Node: HTTP Request (to your LLM API - OpenAI, Claude, etc.)
    - Input: StoryID, FullStoryText.
    - Prompt: Instructs Agent 1's tasks. Specify output format (e.g., JSON array of chapters, JSON array of characters).
    - Node: Parse JSON (if LLM outputs JSON).
    - Loop 1 (For each Chapter generated):
        - Node: Airtable - Create Record (in Chapters table, link to StoryID).
    - Loop 2 (For each Character generated):
        - Node: Airtable - Create Record (in Characters table, link to StoryID).
    - Node: Airtable - Update Record (update Stories status to "Chapterizing" or "Character Extraction Complete").
3. **Process Chapters for Scenes (Scheduled or Triggered by Status Change)**
    - Trigger: Airtable - Records Updated (watches Chapters table when status is "Pending Scenes" OR runs on a schedule to pick up pending chapters).
    - Node: Airtable - Get Records (fetch Chapters needing scenes, get linked characters).
    - Loop (For each Chapter):
        - **AI Agent 2: Creative Scripter (Scene Designer)**
            - Node: HTTP Request (to LLM API).
            - Input: Chapter data, linked character descriptions.
            - Prompt: Instructs Agent 2's tasks (generate scenes).
            - Node: Parse JSON.
            - Loop (For each Scene generated):
                - Node: Airtable - Create Record (in Scenes table, link to ChapterID, link characters).
            - Node: Airtable - Update Record (update Chapters status to "Scripting Scenes" or "Completed").
4. **Process Scenes for Shots**
    - Trigger: Airtable - Records Updated (watches Scenes table when status is "Pending Shots").
    - Node: Airtable - Get Records (fetch Scenes needing shots, get linked characters and scene details).
    - Loop (For each Scene):
        - **AI Agent 3: Shot Architect**
            - Node: HTTP Request (to LLM API).
            - Input: Scene data.
            - Prompt: Instructs Agent 3's tasks (generate shots).
            - Node: Parse JSON.
            - Loop (For each Shot generated):
                - Node: Airtable - Create Record (in Shots table, link to SceneID).
            - Node: Airtable - Update Record (update Scenes status to "Designing Shots" or "Completed").
5. **Process Shots for Still Image Prompts**
    - Trigger: Airtable - Records Updated (watches Shots table when status is "Pending Still Prompt").
    - Node: Airtable - Get Records (fetch Shots needing still prompts).
    - Loop (For each Shot):
        - **AI Agent 4: Still Image Prompt Engineer**
            - Node: HTTP Request (to LLM API).
            - Input: Shot data.
            - Prompt: Instructs Agent 4's task.
            - Node: Airtable - Update Record (in Shots table with StillImagePrompt_Technical_AI, update status to "Pending Still Image").
6. **Generate Still Images**
    - Trigger: Airtable - Records Updated (watches Shots table when status is "Pending Still Image").
    - Node: Airtable - Get Records (fetch Shots needing still images).
    - Loop (For each Shot):
        - Node: HTTP Request (to Still Image AI API - e.g., Midjourney via a bot if unofficial, DALL-E API, Stable Diffusion API).
        - Input: StillImagePrompt_Technical_AI.
        - Node: (If image is returned as URL) HTTP Request - GET file
        - Node: (If image is binary) Move Binary Data
        - Node: Airtable - Update Record (upload GeneratedStillImage attachment to Shots table, update status to "Pending Video Flow").
        - Error Handling: If image generation fails, update status to "Still Image Failed".
7. **Process Shots for Video Flow & Prompts**
    - Trigger: Airtable - Records Updated (watches Shots table when status is "Pending Video Flow").
    - Node: Airtable - Get Records (fetch Shots needing video prompts).
    - Loop (For each Shot):
        - **AI Agent 5: Cinematographer / Video Motion Designer**
            - Node: HTTP Request (to LLM API).
            - Input: Shot data (including GeneratedStillImage URL or description).
            - Prompt: Instructs Agent 5's tasks.
            - Node: Airtable - Update Record (in Shots table with VideoShotFlowDescription_AI and VideoGenerationPrompt_Technical_AI, update status to "Pending Video Generation").
8. **Generate Video Clips**
    - Trigger: Airtable - Records Updated (watches Shots table when status is "Pending Video Generation").
    - Node: Airtable - Get Records (fetch Shots needing videos).
    - Loop (For each Shot):
        - Node: HTTP Request (to Video AI API - e.g., RunwayML API, Pika Labs if they have one, etc.).
        - Input: VideoGenerationPrompt_Technical_AI, GeneratedStillImage (if used as init_image).
        - Node: (Handle async responses if video generation takes time - poll status endpoint).
        - Node: (If video is returned as URL) HTTP Request - GET file
        - Node: Airtable - Update Record (upload GeneratedVideoClip attachment to Shots table, update status to "Completed").
        - Error Handling: If video generation fails, update status to "Video Generation Failed".
        

## **Next Steps:**

1. **Set up Airtable:** Create these tables and fields.
2. **Choose your AI Tools:**
    - LLM (OpenAI GPT-4/3.5, Claude 3 Opus/Sonnet, Gemini, etc.)
    - Still Image Generator (Midjourney, DALL-E 3, Stable Diffusion)
    - Video Generator (RunwayML Gen-2, Pika Labs, Stable Video Diffusion)
3. **Start building n8n workflow:** Begin with the first few steps (Story to Chapters & Characters).
4. **Craft Prompts:** This is CRUCIAL. You'll need to iterate on system prompts for each agent to get the desired output quality and format. Ask the AI to output in JSON where possible for easier parsing in n8n.
5. **Error Handling & Status Updates:** Make sure your n8n workflow updates statuses in Airtable correctly, and handles potential failures from AI APIs.