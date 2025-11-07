"use client"

import AuracleLoader from './AuracleLoader';

interface LoadingScreenProps {
  message?: string;
  subMessage?: string;
}

export default function LoadingScreen({ 
  message = "Loading...", 
  subMessage 
}: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
      <AuracleLoader />
      <div className="mt-6 text-center">
        <div className="text-white text-lg font-medium mb-2" style={{ fontFamily: 'var(--font-figtree)' }}>
          {message}
        </div>
        {subMessage && (
          <div className="text-gray-400 text-sm opacity-80" style={{ fontFamily: 'var(--font-figtree)' }}>
            {subMessage}
          </div>
        )}
      </div>
    </div>
  );
}
