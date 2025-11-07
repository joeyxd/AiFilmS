import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Brain, User, Bot, AlertCircle, Info, Copy, Check } from 'lucide-react';
import { aiConversationService, ConversationSession, ConversationMessage } from '../services/ai/conversationLogger';

interface AIConversationViewerProps {
  storyId: string;
  phaseName?: string;
  className?: string;
}

export default function AIConversationViewer({ storyId, phaseName, className }: AIConversationViewerProps) {
  const [conversations, setConversations] = useState<ConversationSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, [storyId, phaseName]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages are added
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, selectedSession]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      // Try to load from database first
      const data = phaseName 
        ? await aiConversationService.getPhaseConversations(storyId, phaseName)
        : await aiConversationService.getStoryConversations(storyId);
      
      // If no database conversations, try in-memory fallback
      if (data.length === 0) {
        console.log('💬 [AI Conversations] No database conversations found, checking in-memory backup...');
        const inMemoryMessages = aiConversationService.getInMemoryConversations(storyId);
        
        if (inMemoryMessages.length > 0) {
          console.log(`💬 [AI Conversations] Found ${inMemoryMessages.length} messages in memory backup`);
          
          // Group in-memory messages by session
          const sessionMap: { [key: string]: ConversationSession } = {};
          
          inMemoryMessages.forEach(msg => {
            if (!msg.conversation_session) return;
            
            if (!sessionMap[msg.conversation_session]) {
              sessionMap[msg.conversation_session] = {
                session_id: msg.conversation_session,
                story_id: storyId,
                phase_name: msg.phase_name || 'unknown',
                messages: [],
                created_at: msg.metadata?.timestamp || new Date().toISOString(),
                total_tokens: 0,
                total_cost: 0
              };
            }
            
            sessionMap[msg.conversation_session].messages.push(msg);
            
            // Accumulate tokens and cost
            if (msg.metadata?.tokens_used) {
              sessionMap[msg.conversation_session].total_tokens! += msg.metadata.tokens_used;
            }
            if (msg.metadata?.cost_estimate) {
              sessionMap[msg.conversation_session].total_cost! += msg.metadata.cost_estimate;
            }
          });
          
          const inMemorySessions = Object.values(sessionMap);
          console.log(`💬 [AI Conversations] Created ${inMemorySessions.length} sessions from memory backup`);
          setConversations(inMemorySessions);
        } else {
          setConversations(data);
        }
      } else {
        setConversations(data);
      }
      
      // Auto-select the latest session
      const finalConversations = conversations.length > 0 ? conversations : data;
      if (finalConversations.length > 0 && !selectedSession) {
        setSelectedSession(finalConversations[finalConversations.length - 1].session_id);
      }
    } catch (error) {
      console.error('💬 [AI Conversations] Failed to load conversations, trying memory backup:', error);
      
      // Fallback to in-memory conversations
      const inMemoryMessages = aiConversationService.getInMemoryConversations(storyId);
      if (inMemoryMessages.length > 0) {
        console.log(`💬 [AI Conversations] Using ${inMemoryMessages.length} messages from memory backup`);
        // Convert to sessions format for display
        // This is a simplified fallback - group all messages into one session
        const fallbackSession: ConversationSession = {
          session_id: 'memory-backup',
          story_id: storyId,
          phase_name: 'memory-backup',
          messages: inMemoryMessages,
          created_at: new Date().toISOString(),
          total_tokens: inMemoryMessages.reduce((sum, msg) => sum + (msg.metadata?.tokens_used || 0), 0),
          total_cost: inMemoryMessages.reduce((sum, msg) => sum + (msg.metadata?.cost_estimate || 0), 0)
        };
        setConversations([fallbackSession]);
        setSelectedSession('memory-backup');
      }
    } finally {
      setLoading(false);
    }
  };

  const getMessageIcon = (type: ConversationMessage['message_type']) => {
    switch (type) {
      case 'query':
        return <User size={16} className="text-blue-400" />;
      case 'thinking':
        return <Brain size={16} className="text-purple-400" />;
      case 'response':
        return <Bot size={16} className="text-green-400" />;
      case 'error':
        return <AlertCircle size={16} className="text-red-400" />;
      case 'system':
        return <Info size={16} className="text-gray-400" />;
      default:
        return <MessageCircle size={16} className="text-gray-400" />;
    }
  };

  const getMessageBgColor = (type: ConversationMessage['message_type']) => {
    switch (type) {
      case 'query':
        return 'bg-blue-500/10 border-blue-500/20';
      case 'thinking':
        return 'bg-purple-500/10 border-purple-500/20';
      case 'response':
        return 'bg-green-500/10 border-green-500/20';
      case 'error':
        return 'bg-red-500/10 border-red-500/20';
      case 'system':
        return 'bg-gray-500/10 border-gray-500/20';
      default:
        return 'bg-gray-500/10 border-gray-500/20';
    }
  };

  const copyToClipboard = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const selectedSessionData = conversations.find(c => c.session_id === selectedSession);

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className={`text-center p-8 text-gray-400 ${className}`}>
        <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
        <p>No AI conversations found for this story.</p>
        <p className="text-sm mt-2">Conversations will appear here when story processing begins.</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Session Selector */}
      <div className="flex-shrink-0 border-b border-gray-700 p-4">
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <MessageCircle size={20} className="text-blue-400" />
          AI Conversations
        </h3>
        
        <div className="flex flex-wrap gap-2">
          {conversations.map((session) => (
            <button
              key={session.session_id}
              onClick={() => setSelectedSession(session.session_id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedSession === session.session_id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {session.phase_name}
              <span className="ml-2 text-xs opacity-75">
                ({session.messages.length} msgs)
              </span>
            </button>
          ))}
        </div>

        {/* Session Stats */}
        {selectedSessionData && (
          <div className="mt-3 flex gap-4 text-xs text-gray-400">
            <span>📊 {selectedSessionData.messages.length} messages</span>
            <span>🔤 {selectedSessionData.total_tokens?.toLocaleString() || 0} tokens</span>
            <span>💰 ${(selectedSessionData.total_cost || 0).toFixed(4)}</span>
            <span>🕐 {formatTimestamp(selectedSessionData.created_at)}</span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {selectedSessionData?.messages.map((message) => (
          <div
            key={`${message.conversation_session}-${message.message_order}`}
            className={`border rounded-lg p-4 ${getMessageBgColor(message.message_type)}`}
          >
            {/* Message Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {getMessageIcon(message.message_type)}
                <span className="font-medium text-white capitalize">
                  {message.message_type}
                </span>
                <span className="text-xs text-gray-400">
                  #{message.message_order}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {message.metadata?.tokens_used && (
                  <span className="text-xs text-gray-400">
                    {message.metadata.tokens_used} tokens
                  </span>
                )}
                
                <button
                  onClick={() => copyToClipboard(message.content, `${message.conversation_session}-${message.message_order}`)}
                  className="p-1 text-gray-400 hover:text-white rounded transition-colors"
                  title="Copy to clipboard"
                >
                  {copiedMessageId === `${message.conversation_session}-${message.message_order}` ? (
                    <Check size={14} className="text-green-400" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>
            </div>

            {/* Message Content */}
            <div className="text-gray-200 whitespace-pre-wrap font-mono text-sm bg-black/20 rounded p-3 overflow-x-auto">
              {message.content}
            </div>

            {/* Message Metadata */}
            {message.metadata && (
              <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-400">
                {message.metadata.model && (
                  <span>🤖 {message.metadata.model}</span>
                )}
                {message.metadata.reasoning_tokens && (
                  <span>🧠 {message.metadata.reasoning_tokens} reasoning</span>
                )}
                {message.metadata.completion_tokens && (
                  <span>✍️ {message.metadata.completion_tokens} completion</span>
                )}
                {message.metadata.cost_estimate && (
                  <span>💰 ${message.metadata.cost_estimate.toFixed(4)}</span>
                )}
                {message.created_at && (
                  <span>🕐 {formatTimestamp(message.created_at)}</span>
                )}
              </div>
            )}
          </div>
        ))}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Footer with overall stats */}
      <div className="flex-shrink-0 border-t border-gray-700 p-3 bg-gray-800/50">
        <div className="flex justify-between items-center text-xs text-gray-400">
          <span>
            Total: {conversations.reduce((sum, session) => sum + session.messages.length, 0)} messages
          </span>
          <button
            onClick={loadConversations}
            className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
