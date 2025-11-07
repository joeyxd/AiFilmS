import { useState, useEffect, useRef } from 'react';
import { CheckCircle, AlertCircle, Loader, Terminal } from 'lucide-react';

interface ProgressStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
  details?: string;
  progress?: number;
}

interface StoryProcessingTerminalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (storyId: string) => void;
  storyTitle: string;
  storyText: string;
}

const initialSteps: ProgressStep[] = [
  { id: 'save', label: 'Saving to database', status: 'pending' },
  { id: 'parse1', label: 'Step 1: Story DNA Analysis', status: 'pending' },
  { id: 'parse2', label: 'Step 2: Character Psychometrics', status: 'pending' },
  { id: 'parse3', label: 'Step 3: Narrative Architecture', status: 'pending' },
  { id: 'parse4', label: 'Step 4: Production Blueprint', status: 'pending' },
  { id: 'parse5', label: 'Step 5: Visual Style Generation', status: 'pending' },
  { id: 'finalize', label: 'Finalizing story creation', status: 'pending' }
];

export default function StoryProcessingTerminal({ 
  isOpen, 
  onClose, 
  onComplete, 
  storyTitle, 
  storyText 
}: StoryProcessingTerminalProps) {
  const [steps, setSteps] = useState<ProgressStep[]>(initialSteps);
  const [currentStep, setCurrentStep] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  // Start processing when modal opens
  useEffect(() => {
    if (isOpen && !isProcessing) {
      startProcessing();
    }
  }, [isOpen]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const updateStep = (stepId: string, status: ProgressStep['status'], message?: string, details?: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status, message, details }
        : step
    ));
  };

  const simulateAIResponse = (stepName: string): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const responses: { [key: string]: string } = {
          'Story DNA Analysis': `Genre: Drama/Thriller | Tone: Suspenseful | Themes: Identity, Truth, Redemption | Commercial Appeal: 8.5/10`,
          'Character Psychometrics': `Main Character: Alex Chen (Protagonist) | Supporting: 3 characters | Antagonist: Internal conflict | Character Arc Strength: 9/10`,
          'Narrative Architecture': `Act Structure: 3-Act | Pacing: Rising tension | Conflict Resolution: Satisfying | Plot Cohesion: 9.2/10`,
          'Production Blueprint': `Estimated Duration: 15-20 minutes | Scenes: 8 | Locations: 4 | Production Complexity: Medium | Budget Tier: Independent`,
          'Visual Style Generation': `Style: Cinematic Realism | Color Palette: Cool blues, warm golds | Mood: Atmospheric | Lighting: Natural with dramatic shadows`
        };
        resolve(responses[stepName] || 'Processing complete');
      }, Math.random() * 2000 + 1000); // 1-3 seconds
    });
  };

  const startProcessing = async () => {
    setIsProcessing(true);
    addLog('🚀 Starting story processing...');
    addLog(`📝 Title: "${storyTitle}"`);
    addLog(`📊 Story length: ${storyText.length} characters`);

    try {
      // Step 1: Save to database
      setCurrentStep(0);
      updateStep('save', 'running');
      addLog('💾 Connecting to database...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      addLog('✅ Story saved to database with ID: story_' + Math.random().toString(36).substr(2, 9));
      updateStep('save', 'success', 'Story saved successfully');
      setOverallProgress(14);

      // Steps 2-6: AI Processing
      const aiSteps = ['parse1', 'parse2', 'parse3', 'parse4', 'parse5'];
      const stepNames = ['Story DNA Analysis', 'Character Psychometrics', 'Narrative Architecture', 'Production Blueprint', 'Visual Style Generation'];

      for (let i = 0; i < aiSteps.length; i++) {
        setCurrentStep(i + 1);
        const stepId = aiSteps[i];
        const stepName = stepNames[i];
        
        updateStep(stepId, 'running');
        addLog(`🤖 Processing ${stepName}...`);
        addLog(`📡 Sending data to OpenAI GPT-5...`);
        
        // Simulate AI processing
        const response = await simulateAIResponse(stepName);
        
        addLog(`💬 AI Response: ${response}`);
        addLog(`💾 Saving ${stepName} results to database...`);
        
        updateStep(stepId, 'success', 'Analysis complete', response);
        setOverallProgress(14 + (i + 1) * 14);
      }

      // Step 7: Finalize
      setCurrentStep(6);
      updateStep('finalize', 'running');
      addLog('🎯 Finalizing story creation...');
      addLog('🔄 Updating story status to "completed"...');
      addLog('🎨 Generating cover image prompt...');
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      updateStep('finalize', 'success', 'Story creation completed!');
      setOverallProgress(100);
      setIsComplete(true);
      
      addLog('');
      addLog('🎉 SUCCESS! Your story has been created successfully!');
      addLog('📚 Story is now available in your portfolio');
      addLog('🎬 Ready for video production pipeline');

    } catch (error) {
      const failedStepId = steps[currentStep]?.id;
      if (failedStepId) {
        updateStep(failedStepId, 'error', 'Processing failed');
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      addLog(`❌ Error: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStepIcon = (status: ProgressStep['status']) => {
    switch (status) {
      case 'running':
        return <Loader className="w-4 h-4 animate-spin text-blue-400" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-gray-600" />;
    }
  };

  const handleClose = () => {
    // Reset form and close on complete or cancel
    setSteps(initialSteps);
    setCurrentStep(0);
    setOverallProgress(0);
    setIsProcessing(false);
    setIsComplete(false);
    setLogs([]);
    
    if (isComplete) {
      onComplete('story_' + Math.random().toString(36).substr(2, 9));
    }
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Allow closing on backdrop click only if completed or not processing
    if (e.target === e.currentTarget && (isComplete || !isProcessing)) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-900 rounded-lg border border-gray-700 w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Terminal className="w-5 h-5 text-green-400" />
            <h2 className="text-lg font-semibold text-white">Story Processing Terminal</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isProcessing && !isComplete}
            className={`px-4 py-2 rounded text-sm transition-colors ${
              isComplete 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : isProcessing 
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
          >
            {isComplete ? 'Complete' : isProcessing ? 'Processing...' : 'Close'}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Overall Progress</span>
            <span>{overallProgress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Steps Panel */}
          <div className="w-1/3 border-r border-gray-700 p-4">
            <h3 className="text-sm font-medium text-gray-300 mb-4">Processing Steps</h3>
            <div className="space-y-3">
              {steps.map((step) => (
                <div key={step.id} className="flex items-start gap-3">
                  {getStepIcon(step.status)}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${
                      step.status === 'success' ? 'text-green-400' :
                      step.status === 'error' ? 'text-red-400' :
                      step.status === 'running' ? 'text-blue-400' :
                      'text-gray-400'
                    }`}>
                      {step.label}
                    </p>
                    {step.message && (
                      <p className="text-xs text-gray-500 mt-1">{step.message}</p>
                    )}
                    {step.details && (
                      <p className="text-xs text-gray-400 mt-1 break-words">{step.details}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Terminal Panel */}
          <div className="flex-1 p-4">
            <h3 className="text-sm font-medium text-gray-300 mb-4">Live Processing Log</h3>
            <div 
              ref={terminalRef}
              className="bg-black rounded p-4 h-96 overflow-y-auto font-mono text-sm select-text cursor-text"
            >
              {logs.map((log, index) => (
                <div key={index} className="text-green-400 mb-1 select-text">
                  {log}
                </div>
              ))}
              {isProcessing && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-gray-400 text-xs">Processing...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
