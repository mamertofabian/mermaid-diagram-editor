import React from 'react';

interface ControlButtonsProps {
  isPanningEnabled: boolean;
  onPanningToggle: () => void;
  theme: 'light' | 'dark';
  onThemeChange: () => void;
}

export default function ControlButtons({ 
  isPanningEnabled, 
  onPanningToggle, 
  theme, 
  onThemeChange
}: ControlButtonsProps) {
  return (
    <>
      {/* Panning Toggle */}
      <button
        onClick={onPanningToggle}
        className={`rounded-lg p-2 shadow-md ${
          isPanningEnabled 
            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
            : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
        }`}
        title={isPanningEnabled ? "Disable Left-Click Panning (Right-click always enabled)" : "Enable Left-Click Panning"}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/>
          <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/>
          <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/>
          <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
        </svg>
      </button>

      <button
        onClick={onThemeChange}
        className="bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg p-2 shadow-md"
        title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Background`}
      >
        {theme === 'light' ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
        )}
      </button>
    </>
  );
}