import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface DiagramPreviewProps {
  code: string;
  isFullScreen: boolean;
  onFullScreenChange?: (isFullScreen: boolean) => void;
}

export default function DiagramPreview({ code, isFullScreen, onFullScreenChange }: DiagramPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
      logLevel: 'error',
    });
  }, []);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!contentRef.current) return;
      
      try {
        // Clear previous content
        contentRef.current.innerHTML = '';
        
        // Generate unique ID
        const id = `mermaid-${Math.random().toString(36).slice(2)}`;
        
        // Render diagram
        const { svg } = await mermaid.render(id, code);
        
        // Insert the rendered SVG
        contentRef.current.innerHTML = svg;

        // Reset zoom and scroll when diagram changes
        setZoomLevel(1);
        setScrollPosition({ x: 0, y: 0 });
      } catch (error) {
        console.error('Mermaid rendering error:', error);
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div class="flex items-center justify-center h-full">
              <p class="text-red-400 font-medium">Invalid Mermaid syntax</p>
            </div>
          `;
        }
      }
    };

    renderDiagram();
  }, [code]);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setScrollPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left click only
      setIsDragging(true);
      setDragStart({ x: e.clientX - scrollPosition.x, y: e.clientY - scrollPosition.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      setScrollPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomSensitivity = 0.001;
    const delta = -e.deltaY * zoomSensitivity;
    const newZoom = Math.max(0.5, Math.min(3, zoomLevel + delta));
    setZoomLevel(newZoom);
  };

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const wheelHandler = (e: WheelEvent) => {
      e.preventDefault();
      const zoomSensitivity = 0.001;
      const delta = -e.deltaY * zoomSensitivity;
      setZoomLevel(prev => Math.max(0.5, Math.min(3, prev + delta)));
    };

    element.addEventListener('wheel', wheelHandler, { passive: false });
    
    return () => {
      element.removeEventListener('wheel', wheelHandler);
    };
  }, []);

  return (
    <div 
      className={`
        ${isFullScreen ? 'fixed inset-0 z-50 bg-gray-900' : 'relative w-full h-full'}
        flex flex-col
      `}
    >
      {/* Controls */}
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <button
          onClick={handleZoomIn}
          className="bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg p-2 shadow-md"
          title="Zoom In"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            <line x1="11" y1="8" x2="11" y2="14"/>
            <line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
        </button>
        <button
          onClick={handleZoomOut}
          className="bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg p-2 shadow-md"
          title="Zoom Out"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            <line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
        </button>
        <button
          onClick={handleResetZoom}
          className="bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg p-2 shadow-md"
          title="Reset Zoom"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M8 12h8"/>
          </svg>
        </button>
        {isFullScreen ? (
          <button
            onClick={() => onFullScreenChange?.(false)}
            className="bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg p-2 shadow-md"
            title="Exit Full Screen"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
            </svg>
          </button>
        ) : (
          <button
            onClick={() => onFullScreenChange?.(true)}
            className="bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg p-2 shadow-md"
            title="Full Screen"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
            </svg>
          </button>
        )}
      </div>

      {/* Diagram container */}
      <div 
        className="flex-1 overflow-hidden relative"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        ref={containerRef}
      >
        <div
          ref={contentRef}
          className="w-full h-full flex items-center justify-center p-8"
          style={{
            transform: `scale(${zoomLevel}) translate(${scrollPosition.x}px, ${scrollPosition.y}px)`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
        />
      </div>
    </div>
  );
}
