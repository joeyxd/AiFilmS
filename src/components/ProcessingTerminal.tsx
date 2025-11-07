import { useState, useEffect, useRef } from 'react';
import { Terminal, Play, Pause, RotateCcw, Zap } from 'lucide-react';

interface TerminalMessage {
  timestamp: string;
  type: 'info' | 'success' | 'error' | 'warning' | 'processing';
  message: string;
  icon?: string;
}

interface ProcessingTerminalProps {
  isProcessing: boolean;
  onStartProcessing: () => void;
  onStopProcessing: () => void;
  messages: TerminalMessage[];
  className?: string;
}

export default function ProcessingTerminal({ 
  isProcessing, 
  onStartProcessing, 
  onStopProcessing, 
  messages,
  className = '' 
}: ProcessingTerminalProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getMessageIcon = (message: TerminalMessage) => {
    if (message.icon) return message.icon;
    
    switch (message.type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'processing': return '🔄';
      default: return '📝';
    }
  };

  const getMessageColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      case 'processing': return 'text-blue-400';
      default: return 'text-gray-300';
    }
  };

  return (
    <div className={`bg-black/90 rounded-lg border border-gray-700 ${className}`}>
      {/* Terminal Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700 bg-gray-900/50">
        <div className="flex items-center gap-2">
          <Terminal size={16} className="text-green-400" />
          <span className="text-sm font-medium text-white">Processing Terminal</span>
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Processing Status Indicator */}
          {isProcessing && (
            <div className="flex items-center gap-1 text-blue-400">
              <div className="animate-spin rounded-full h-3 w-3 border border-blue-400 border-t-transparent"></div>
              <span className="text-xs">Processing...</span>
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex gap-1">
            {isProcessing ? (
              <button
                onClick={onStopProcessing}
                className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors"
                title="Stop Processing"
              >
                <Pause size={14} />
              </button>
            ) : (
              <button
                onClick={onStartProcessing}
                className="p-1.5 text-green-400 hover:text-green-300 hover:bg-green-400/10 rounded transition-colors"
                title="Resume Processing"
              >
                <Play size={14} />
              </button>
            )}
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? <RotateCcw size={14} /> : <Zap size={14} />}
            </button>
          </div>
        </div>
      </div>

      {/* Terminal Content */}
      <div className={`transition-all duration-200 ${isExpanded ? 'h-96' : 'h-48'}`}>
        <div className="h-full overflow-y-auto p-3 space-y-1 font-mono text-xs">
          {messages.length === 0 ? (
            <div className="text-gray-500 italic">No processing messages yet...</div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="text-gray-500 flex-shrink-0 w-20">
                  {msg.timestamp}
                </span>
                <span className="flex-shrink-0">
                  {getMessageIcon(msg)}
                </span>
                <span className={`${getMessageColor(msg.type)} break-words flex-1`}>
                  {msg.message}
                </span>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Terminal Footer with Quick Stats */}
      {messages.length > 0 && (
        <div className="px-3 py-2 border-t border-gray-700 bg-gray-900/30">
          <div className="flex justify-between text-xs text-gray-400">
            <span>{messages.length} messages</span>
            <span>
              {messages.filter(m => m.type === 'success').length} completed, {' '}
              {messages.filter(m => m.type === 'error').length} errors
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper hook for managing terminal messages
export function useProcessingTerminal() {
  const [messages, setMessages] = useState<TerminalMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const addMessage = (type: TerminalMessage['type'], message: string, icon?: string) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      timeStyle: 'medium' 
    });
    
    setMessages(prev => [...prev, { timestamp, type, message, icon }]);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const startProcessing = () => {
    setIsProcessing(true);
    addMessage('info', 'Starting processing...', '🚀');
  };

  const stopProcessing = () => {
    setIsProcessing(false);
    addMessage('warning', 'Processing stopped by user', '⏹️');
  };

  const completeProcessing = () => {
    setIsProcessing(false);
    addMessage('success', 'Processing completed successfully!', '🎉');
  };

  const errorProcessing = (error: string) => {
    setIsProcessing(false);
    addMessage('error', `Processing failed: ${error}`, '💥');
  };

  return {
    messages,
    isProcessing,
    addMessage,
    clearMessages,
    startProcessing,
    stopProcessing,
    completeProcessing,
    errorProcessing
  };
}
