import React from 'react';
import { X } from 'lucide-react';
import CreateHistoryForm from './Createhistoryform';

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoryCreated?: () => void;
}

const CreateStoryModal: React.FC<CreateStoryModalProps> = ({ isOpen, onClose, onStoryCreated }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Black background overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-75 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal content - completely transparent */}
      <div className="relative z-10 flex items-center justify-center min-h-screen w-full p-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-8 right-8 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>
        
        {/* Form container - no background */}
        <CreateHistoryForm onClose={onClose} onSuccess={onStoryCreated} />
      </div>
    </div>
  );
};

export default CreateStoryModal;
