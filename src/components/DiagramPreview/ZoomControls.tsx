import React from 'react';

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onAutoFit: () => void;
  onMaxZoom: () => void;
  zoomLevel: number;
}

export default function ZoomControls({ onZoomIn, onZoomOut, onResetZoom, onAutoFit, onMaxZoom, zoomLevel }: ZoomControlsProps) {
  const zoomPercentage = Math.round(zoomLevel * 100);
  const isMobile = window.innerWidth < 768;
  const maxZoom = isMobile ? 10 : 5;
  const isAtMaxZoom = zoomLevel >= maxZoom;
  
  return (
    <>
      <button
        onClick={onZoomIn}
        disabled={isAtMaxZoom}
        className={`rounded-lg p-2 shadow-md h-[40px] w-[40px] sm:h-[44px] sm:w-[44px] flex items-center justify-center transition-colors ${
          isAtMaxZoom 
            ? 'bg-gray-500 text-gray-400 cursor-not-allowed' 
            : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
        }`}
        title={isAtMaxZoom ? "Maximum zoom reached" : "Zoom In (+/= key)"}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          <line x1="11" y1="8" x2="11" y2="14"/>
          <line x1="8" y1="11" x2="14" y2="11"/>
        </svg>
      </button>
      
      {/* Zoom Level Display */}
      <div className={`rounded-lg px-3 py-2 shadow-md h-[40px] sm:h-[44px] flex items-center justify-center min-w-[60px] text-sm font-mono ${
        isAtMaxZoom 
          ? 'bg-green-700 text-green-200' 
          : 'bg-gray-700 text-gray-200'
      }`}>
        {zoomPercentage}%
      </div>
      
      <button
        onClick={onZoomOut}
        className="bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg p-2 shadow-md h-[40px] w-[40px] sm:h-[44px] sm:w-[44px] flex items-center justify-center transition-colors"
        title="Zoom Out (- key)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          <line x1="8" y1="11" x2="14" y2="11"/>
        </svg>
      </button>
      
      <button
        onClick={onResetZoom}
        className="bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg p-2 shadow-md h-[40px] w-[40px] sm:h-[44px] sm:w-[44px] flex items-center justify-center transition-colors"
        title="Reset Zoom (0 key)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <path d="M9 9h6v6H9z"/>
        </svg>
      </button>
      
      <button
        onClick={onAutoFit}
        className="bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg p-2 shadow-md h-[40px] w-[40px] sm:h-[44px] sm:w-[44px] flex items-center justify-center transition-colors"
        title="Auto Fit"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
          <rect x="7" y="7" width="10" height="10"/>
        </svg>
      </button>
      
      <button
        onClick={onMaxZoom}
        disabled={isAtMaxZoom}
        className={`rounded-lg p-2 shadow-md h-[40px] w-[40px] sm:h-[44px] sm:w-[44px] flex items-center justify-center transition-colors ${
          isAtMaxZoom 
            ? 'bg-green-600 text-green-200 cursor-not-allowed' 
            : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
        }`}
        title={isAtMaxZoom ? `Already at max zoom (${maxZoom}x)` : `Zoom to maximum (${maxZoom}x) - M key`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="M11 7v8M7 11h8"/>
        </svg>
      </button>
    </>
  );
}