import { supabase } from '../supabase/client';

export interface ConversationMessage {
  id?: string;
  story_id?: string;
  conversation_session?: string;
  phase_name?: string;
  message_type: 'query' | 'thinking' | 'response' | 'error' | 'system';
  message_order: number;
  content: string;
  metadata?: {
    model?: string;
    tokens_used?: number;
    cost_estimate?: number;
    timestamp?: string;
    reasoning_tokens?: number;
    completion_tokens?: number;
    phase?: string;
    story_title?: string;
    [key: string]: any; // Allow additional metadata fields
  };
  created_at?: string;
}

export interface ConversationSession {
  session_id: string;
  story_id: string;
  phase_name: string;
  messages: ConversationMessage[];
  created_at: string;
  total_tokens?: number;
  total_cost?: number;
}

class AIConversationService {
  private currentSession: string | null = null;
  private currentStoryId: string | null = null;
  private currentPhase: string | null = null;
  private messageOrder = 0;
  
  // In-memory backup for conversations (fallback if DB fails)
  private inMemoryConversations: ConversationMessage[] = [];

  // Start a new conversation session
  startSession(storyId: string, phaseName: string): string {
    this.currentSession = crypto.randomUUID();
    this.currentStoryId = storyId;
    this.currentPhase = phaseName;
    this.messageOrder = 0;
    
    console.log(`💬 [Conversation] Started session: ${this.currentSession} for ${phaseName}`);
    console.log(`💬 [Conversation] Story ID: ${storyId}`);
    console.log(`💬 [Conversation] 🛡️ In-memory backup ACTIVE - conversations will be preserved even if DB fails`);
    return this.currentSession;
  }

  // Log a message to the current session
  async logMessage(
    type: ConversationMessage['message_type'],
    content: string,
    metadata?: ConversationMessage['metadata']
  ): Promise<void> {
    if (!this.currentSession || !this.currentStoryId || !this.currentPhase) {
      console.warn('💬 [Conversation] No active session - cannot log message');
      return;
    }

    this.messageOrder++;

    // Create message object
    const message: ConversationMessage = {
      story_id: this.currentStoryId,
      conversation_session: this.currentSession,
      phase_name: this.currentPhase,
      message_type: type,
      message_order: this.messageOrder,
      content,
      metadata: {
        timestamp: new Date().toISOString(),
        ...metadata
      }
    };

    // ALWAYS save to in-memory backup first (guaranteed to work)
    this.inMemoryConversations.push(message);
    console.log(`💬 [Conversation] 🛡️ SAVED TO MEMORY: ${type} (${content.length} chars)`);
    console.log(`💬 [Conversation] 📊 Total in memory: ${this.inMemoryConversations.length} messages`);

    // Try to save to database (may fail, but we have backup)
    try {
      // Use any type to bypass TypeScript checking for ai_conversations table
      const { error } = await (supabase as any)
        .from('ai_conversations')
        .insert({
          story_id: this.currentStoryId,
          conversation_session: this.currentSession,
          phase_name: this.currentPhase,
          message_type: type,
          message_order: this.messageOrder,
          content,
          metadata: {
            timestamp: new Date().toISOString(),
            ...metadata
          }
        });

      if (error) {
        console.error('💬 [Conversation] ⚠️ Database save failed, but message is safe in memory:', error);
        console.log(`💬 [Conversation] 🛡️ Message preserved: ${content.substring(0, 100)}...`);
      } else {
        console.log(`💬 [Conversation] ✅ Database + Memory: ${type} saved successfully`);
      }
    } catch (err) {
      console.error('💬 [Conversation] ⚠️ Database error, but message is safe in memory:', err);
      console.log(`💬 [Conversation] 🛡️ Message preserved: ${content.substring(0, 100)}...`);
    }
  }

  // Log a user query
  async logQuery(prompt: string, metadata?: ConversationMessage['metadata']): Promise<void> {
    await this.logMessage('query', prompt, metadata);
  }

  // Log AI thinking (o3 reasoning)
  async logThinking(reasoning: string, metadata?: ConversationMessage['metadata']): Promise<void> {
    await this.logMessage('thinking', reasoning, metadata);
  }

  // Log AI response
  async logResponse(response: string, metadata?: ConversationMessage['metadata']): Promise<void> {
    await this.logMessage('response', response, metadata);
  }

  // Log system messages
  async logSystem(message: string, metadata?: ConversationMessage['metadata']): Promise<void> {
    await this.logMessage('system', message, metadata);
  }

  // Log errors
  async logError(error: string, metadata?: ConversationMessage['metadata']): Promise<void> {
    await this.logMessage('error', error, metadata);
  }

  // End current session
  endSession(): void {
    console.log(`💬 [Conversation] Ended session: ${this.currentSession}`);
    this.currentSession = null;
    this.currentStoryId = null;
    this.currentPhase = null;
    this.messageOrder = 0;
  }

  // Get all conversations for a story
  async getStoryConversations(storyId: string): Promise<ConversationSession[]> {
    try {
      // Use any type to bypass TypeScript checking for ai_conversations table
      const { data, error } = await (supabase as any)
        .from('ai_conversations')
        .select('*')
        .eq('story_id', storyId)
        .order('conversation_session')
        .order('message_order');

      if (error) {
        console.error('💬 [Conversation] Failed to fetch conversations:', error);
        return [];
      }

      // Group messages by session
      const sessions: { [key: string]: ConversationSession } = {};
      
      (data || []).forEach((message: any) => {
        const sessionId = message.conversation_session;
        
        if (!sessions[sessionId]) {
          sessions[sessionId] = {
            session_id: sessionId,
            story_id: storyId,
            phase_name: message.phase_name,
            messages: [],
            created_at: message.created_at,
            total_tokens: 0,
            total_cost: 0
          };
        }
        
        sessions[sessionId].messages.push(message);
        
        // Accumulate tokens and cost
        if (message.metadata?.tokens_used) {
          sessions[sessionId].total_tokens! += message.metadata.tokens_used;
        }
        if (message.metadata?.cost_estimate) {
          sessions[sessionId].total_cost! += message.metadata.cost_estimate;
        }
      });

      return Object.values(sessions).sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

    } catch (err) {
      console.error('💬 [Conversation] Error fetching conversations:', err);
      return [];
    }
  }

  // Get conversations for a specific phase
  async getPhaseConversations(storyId: string, phaseName: string): Promise<ConversationSession[]> {
    const allConversations = await this.getStoryConversations(storyId);
    return allConversations.filter(session => session.phase_name === phaseName);
  }

  // Get current session info
  getCurrentSession(): { session: string | null; storyId: string | null; phase: string | null } {
    return {
      session: this.currentSession,
      storyId: this.currentStoryId,
      phase: this.currentPhase
    };
  }

  // Get in-memory conversations (fallback when DB fails)
  getInMemoryConversations(storyId?: string): ConversationMessage[] {
    if (storyId) {
      return this.inMemoryConversations.filter(msg => msg.story_id === storyId);
    }
    return [...this.inMemoryConversations];
  }

  // Export conversations as JSON (for saving/debugging)
  exportConversationsAsJSON(storyId?: string): string {
    const conversations = this.getInMemoryConversations(storyId);
    return JSON.stringify(conversations, null, 2);
  }

  // Clear in-memory conversations
  clearInMemoryConversations(): void {
    const count = this.inMemoryConversations.length;
    this.inMemoryConversations = [];
    console.log(`💬 [Conversation] 🧹 Cleared ${count} messages from memory`);
  }
}

export const aiConversationService = new AIConversationService();
