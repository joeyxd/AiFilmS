// Global debugging utilities for conversation logging
// Access via browser console: window.conversationDebug

import { aiConversationService } from '../services/ai/conversationLogger';

declare global {
  interface Window {
    conversationDebug: {
      service: typeof aiConversationService;
      testConversation: () => Promise<void>;
      exportJSON: (storyId?: string) => string;
      viewMemory: (storyId?: string) => void;
      clearMemory: () => void;
    };
  }
}

// Create test conversation function
async function testConversation() {
  console.log('🧪 [Debug] Starting test conversation...');
  
  aiConversationService.startSession('debug-story-123', 'debug_test');
  
  await aiConversationService.logQuery('Test query: What is the meaning of life?', {
    model: 'debug',
    phase: 'debug_test'
  });
  
  await aiConversationService.logThinking('Let me think about this... The meaning of life is a complex philosophical question...', {
    model: 'debug',
    reasoning_tokens: 100,
    phase: 'debug_test'
  });
  
  await aiConversationService.logResponse('The meaning of life is to give life meaning through our actions and relationships.', {
    model: 'debug',
    tokens_used: 50,
    cost_estimate: 0.001,
    phase: 'debug_test'
  });
  
  aiConversationService.endSession();
  
  console.log('✅ [Debug] Test conversation completed!');
  console.log('📊 [Debug] Check in-memory conversations:', aiConversationService.getInMemoryConversations('debug-story-123'));
}

function exportJSON(storyId?: string): string {
  const json = aiConversationService.exportConversationsAsJSON(storyId);
  console.log('📋 [Debug] Conversations JSON:', json);
  return json;
}

function viewMemory(storyId?: string): void {
  const conversations = aiConversationService.getInMemoryConversations(storyId);
  console.log('🧠 [Debug] In-memory conversations:', conversations);
  console.log(`📊 [Debug] Total messages: ${conversations.length}`);
  
  if (conversations.length > 0) {
    console.log('📋 [Debug] Latest message:', conversations[conversations.length - 1]);
  }
}

function clearMemory(): void {
  aiConversationService.clearInMemoryConversations();
  console.log('🧹 [Debug] Memory cleared');
}

// Make debugging tools globally available
if (typeof window !== 'undefined') {
  window.conversationDebug = {
    service: aiConversationService,
    testConversation,
    exportJSON,
    viewMemory,
    clearMemory
  };
  
  console.log('🛠️ [CONVERSATION DEBUG] Debugging tools loaded!');
  console.log('💡 [CONVERSATION DEBUG] Use window.conversationDebug in browser console');
  console.log('💡 [CONVERSATION DEBUG] Available commands:');
  console.log('   • window.conversationDebug.testConversation() - Create test conversation');
  console.log('   • window.conversationDebug.viewMemory() - View in-memory conversations');
  console.log('   • window.conversationDebug.exportJSON() - Export as JSON');
  console.log('   • window.conversationDebug.clearMemory() - Clear memory');
  
  // Test the conversation service immediately
  console.log('🧪 [CONVERSATION DEBUG] Testing conversation service...');
  const testSession = aiConversationService.getCurrentSession();
  console.log('📊 [CONVERSATION DEBUG] Current session:', testSession);
  
  // Also expose the service directly for easier access
  (window as any).conversationService = aiConversationService;
  console.log('🔧 [CONVERSATION DEBUG] Direct service access: window.conversationService');
}

export default window?.conversationDebug;
