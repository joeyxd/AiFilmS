require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_KEY);

const phase1Data = {
  "story_metadata": {
    "title": "EveryDay's Chemistry (The Beatles Never Broke Up)",
    "language": "en",
    "structure_detected": "Three-Act Portal Narrative with Monomyth Undertones",
    "genres": [
      { "label": "Science Fiction", "confidence": 0.94 },
      { "label": "Mystery/Thriller", "confidence": 0.81 }
    ],
    "themes": [
      "The tantalizing lure—and danger—of forbidden knowledge",
      "Nostalgia and the cultural immortality of art",
      "Ethical boundaries of cross-dimensional contact"
    ],
    "motifs": [
      "Unreleased Beatles cassette as a totem of the impossible",
      "Scorched portal trace symbolizing tears in reality"
    ],
    "pacing_curve": [
      { "segment": 1, "action": 0.35, "dialogue": 0.15, "introspection": 0.50 },
      { "segment": 2, "action": 0.20, "dialogue": 0.60, "introspection": 0.20 },
      { "segment": 3, "action": 0.45, "dialogue": 0.20, "introspection": 0.35 }
    ],
    "timeline_notes": "Daylight-to-night real-time progression over roughly six hours. Act I (2 PM): Road trip, dog chase, accident. Act II (late afternoon): Awakening in parallel home, exposition dump, music room. Act III (early evening): Theft of tape, portal return, nighttime canyon exit. Linear chronology with a single subjective timeline; no flashbacks required yet, but potential for intercutting Jonas's explanations with visualizations of other worlds to avoid exposition fatigue.",
    "overall_tone": "Off-kilter realism that shifts from casual travelogue to unsettling techno-mystery",
    "dialogue_style": "Informal first-person narration with self-deprecating asides; conversational, almost confessional tone. Jonas speaks in measured, slightly ominous expositional blocks—polite yet guarded. Use contractions, everyday vocabulary, and sudden shifts into technical jargon when discussing ARP-D.",
    "visual_atmosphere": "Sun-bleached canyon roads; dust motes in dry heat; sterile yet homey mid-century room lit by humming machines; matte-black portal rim with shimmering liquid interior; analog textures—cassette hiss, accordion-like speakers, purple ketchup bottles—contrasting with impossible technology."
  },
  "commercial_analysis": {
    "logline": "After a desert mishap, an ordinary man is rescued by a traveler from a parallel Earth where the Beatles never split—forcing him to choose between safeguarding reality and smuggling history-changing proof.",
    "comparable_films": [
      "Yesterday (theme of alternate Beatles history)",
      "Another Earth (visual intimacy with high-concept multiverse)",
      "Back to the Future (narrative propulsion through stolen artifact)"
    ],
    "target_audience": "Adults 18-45 who enjoy grounded science-fiction mysteries (e.g., Fringe, Black Mirror) and music nostalgia; secondary reach to classic-rock fans and podcast/creepypasta listeners looking for 'true-story' thrillers.",
    "marketability_score": 8.5,
    "franchise_potential": "Medium – Stand-alone film with sequel/anthology potential exploring other legendary 'what-ifs' across dimensions.",
    "marketing_angles": [
      "What-if hook: 'The Beatles never broke up—and we have the tape.'",
      "Lo-fi meets hi-concept: Analog nostalgia collides with multiverse tech.",
      "Cultural relevance: Taps into current multiverse craze and vinyl/cassette revival."
    ],
    "genre_conventions": "Key beats to include: 1) Inciting anomaly in an everyday setting, 2) Portal reveal with sensory detail, 3) Extended exposition via mentor figure, 4) Moral dilemma over artifact theft, 5) Return home with evidence—and ominous repercussions. Maintain steady build of uncanny details before delivering overt spectacle."
  }
};

async function savePhase1Data() {
  try {
    console.log('🔍 Finding the "Every Day\'s Chemistry" story...');
    
    // Find the story
    const { data: stories, error: findError } = await supabase
      .from('stories')
      .select('*')
      .ilike('title', '%Every%')
      .order('created_at', { ascending: false });
      
    if (findError) throw findError;
    
    if (!stories || stories.length === 0) {
      console.log('❌ No stories found matching "Every Day"');
      return;
    }
    
    const story = stories[0];
    console.log(`✅ Found story: "${story.title}" (ID: ${story.id})`);
    console.log(`📊 Current status: ${story.status}`);
    
    // Update the story with Phase 1 data
    console.log('💾 Updating story with Phase 1 analysis data...');
    
    const { data: updateData, error: updateError } = await supabase
      .from('stories')
      .update({
        story_metadata: phase1Data.story_metadata,
        commercial_analysis: phase1Data.commercial_analysis,
        logline: phase1Data.commercial_analysis.logline,
        genre: phase1Data.story_metadata.genres[0].label,
        status: 'chapterized', // Update status to show Phase 1 complete
        updated_at: new Date().toISOString()
      })
      .eq('id', story.id)
      .select();
      
    if (updateError) throw updateError;
    
    console.log('✅ Story updated successfully!');
    console.log('📋 Updated fields:');
    console.log('   ✓ story_metadata (contains genres, themes, structure, etc.)');
    console.log('   ✓ commercial_analysis (contains logline, marketability, etc.)');
    console.log('   ✓ logline extracted to main field');
    console.log('   ✓ genre extracted to main field');
    console.log('   ✓ status updated to "chapterized"');
    
    // Verify the update
    console.log('\n🔍 Verifying the saved data...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('stories')
      .select('*')
      .eq('id', story.id)
      .single();
      
    if (verifyError) throw verifyError;
    
    console.log('✅ Verification successful:');
    console.log(`   📖 Title: ${verifyData.story_metadata?.title || 'N/A'}`);
    console.log(`   🎭 Genre: ${verifyData.genre || 'N/A'}`);
    console.log(`   📝 Logline: ${verifyData.logline ? 'YES' : 'NO'}`);
    console.log(`   📊 Marketability: ${verifyData.commercial_analysis?.marketability_score || 'N/A'}`);
    console.log(`   🎬 Genres count: ${verifyData.story_metadata?.genres?.length || 0}`);
    console.log(`   🎨 Themes count: ${verifyData.story_metadata?.themes?.length || 0}`);
    console.log(`   📈 Status: ${verifyData.status}`);
    
    console.log('\n🎉 Phase 1 data successfully saved to database!');
    console.log('🔄 Refresh your browser to see the updated modal with Phase 1 data');
    
  } catch (error) {
    console.error('❌ Error saving Phase 1 data:', error.message);
  }
}

savePhase1Data();
