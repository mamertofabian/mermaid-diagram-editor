import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import '../print.css';
import ExportDropdown from './DiagramPreview/ExportDropdown';
import ZoomControls from './DiagramPreview/ZoomControls';
import ControlButtons from './DiagramPreview/ControlButtons';
import FullScreenToggle from './DiagramPreview/FullScreenToggle';
import DiagramCanvas from './DiagramPreview/DiagramCanvas';

interface DiagramPreviewProps {
  code: string;
  diagramName: string;
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
  isFullScreen: boolean;
  onFullScreenChange?: (isFullScreen: boolean) => void;
  onAlert?: (message: string, title?: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

/**
 * DiagramPreview component that renders Mermaid diagrams
 * Theme switching changes the container background color, not the diagram content
 * This ensures consistent diagram appearance while providing visual theme options
 */
export default function DiagramPreview({ code, diagramName, theme, onThemeChange, isFullScreen, onFullScreenChange, onAlert }: DiagramPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });
  const [isPanningEnabled, setIsPanningEnabled] = useState(true);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default', // Always use default theme for best readability
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
  }, [code, theme]);

  // Toggle between light and dark background themes
  // Note: This changes the container background, not the diagram content
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    onThemeChange(newTheme);
  };

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

  const handleAutoFit = () => {
    if (!contentRef.current || !containerRef.current) return;
    
    const svgElement = contentRef.current.querySelector('svg');
    if (!svgElement) return;
    
    try {
      // Get container dimensions (viewport)
      const containerRect = containerRef.current.getBoundingClientRect();
      const containerWidth = containerRect.width - 64; // Account for padding (32px each side)
      const containerHeight = containerRect.height - 64;
      
      // Get actual SVG dimensions at current zoom level
      const svgRect = svgElement.getBoundingClientRect();
      const actualSvgWidth = svgRect.width / zoomLevel; // Normalize to zoom level 1
      const actualSvgHeight = svgRect.height / zoomLevel;
      
      // Calculate scale factors for both dimensions
      const scaleX = containerWidth / actualSvgWidth;
      const scaleY = containerHeight / actualSvgHeight;
      
      // Use the smaller scale to ensure the diagram fits completely
      // Also add some padding (90% of available space)
      const optimalScale = Math.min(scaleX, scaleY) * 0.9;
      
      // Respect zoom limits
      const finalScale = Math.max(0.5, Math.min(3, optimalScale));
      
      // Apply the zoom and center the diagram
      setZoomLevel(finalScale);
      setScrollPosition({ x: 0, y: 0 });
    } catch (error) {
      console.error('Auto-fit calculation error:', error);
      // Fallback to reset zoom if calculation fails
      handleResetZoom();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Always allow right-click panning regardless of toggle state
    if (e.button === 2) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - scrollPosition.x, y: e.clientY - scrollPosition.y });
      return;
    }
    
    // Left-click panning only when enabled
    if (e.button === 0 && isPanningEnabled) {
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

  const handleContextMenu = (e: React.MouseEvent) => {
    // Always prevent context menu to allow right-click panning
    e.preventDefault();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const panStep = 20; // Pixels to move per key press
    
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        setScrollPosition(prev => ({ ...prev, y: prev.y + panStep }));
        break;
      case 'ArrowDown':
        e.preventDefault();
        setScrollPosition(prev => ({ ...prev, y: prev.y - panStep }));
        break;
      case 'ArrowLeft':
        e.preventDefault();
        setScrollPosition(prev => ({ ...prev, x: prev.x + panStep }));
        break;
      case 'ArrowRight':
        e.preventDefault();
        setScrollPosition(prev => ({ ...prev, x: prev.x - panStep }));
        break;
    }
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
        <ControlButtons
          isPanningEnabled={isPanningEnabled}
          onPanningToggle={() => setIsPanningEnabled(!isPanningEnabled)}
          theme={theme}
          onThemeChange={toggleTheme}
        />
        
        <ExportDropdown
          contentRef={contentRef}
          containerRef={containerRef}
          theme={theme}
          diagramCode={code}
          diagramName={diagramName}
          onAlert={onAlert}
        />
        
        <ZoomControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetZoom={handleResetZoom}
          onAutoFit={handleAutoFit}
        />
        
        <FullScreenToggle
          isFullScreen={isFullScreen}
          onFullScreenChange={onFullScreenChange}
        />
      </div>

      {/* Diagram container */}
      <DiagramCanvas
        theme={theme}
        isPanningEnabled={isPanningEnabled}
        zoomLevel={zoomLevel}
        scrollPosition={scrollPosition}
        isDragging={isDragging}
        containerRef={containerRef}
        contentRef={contentRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onContextMenu={handleContextMenu}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}
