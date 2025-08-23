import React from 'react';

interface FullScreenToggleProps {
  isFullScreen: boolean;
  onFullScreenChange?: (isFullScreen: boolean) => void;
}

export default function FullScreenToggle({ isFullScreen, onFullScreenChange }: FullScreenToggleProps) {
  return (
    <>
      {isFullScreen ? (
        <button
          onClick={() => onFullScreenChange?.(false)}
          className="bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg p-2 shadow-md h-[40px] w-[40px] sm:h-[44px] sm:w-[44px] flex items-center justify-center transition-colors"
          title="Exit Full Screen"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
          </svg>
        </button>
      ) : (
        <button
          onClick={() => onFullScreenChange?.(true)}
          className="bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg p-2 shadow-md h-[40px] w-[40px] sm:h-[44px] sm:w-[44px] flex items-center justify-center transition-colors"
          title="Full Screen"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
          </svg>
        </button>
      )}
    </>
  );
}