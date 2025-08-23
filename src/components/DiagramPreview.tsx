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
  const [lastTouchDistance, setLastTouchDistance] = useState(0);

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
        // Clear previous content and any error states
        contentRef.current.innerHTML = '';
        
        // Clear any lingering Mermaid state
        mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
          logLevel: 'error',
        });
        
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
        
        // Clear any partial renders and show error in content area
        contentRef.current.innerHTML = `
          <div class="flex items-center justify-center h-full">
            <p class="text-red-400 font-medium">Invalid Mermaid syntax</p>
          </div>
        `;
        
        // Reset zoom and scroll on error too
        setZoomLevel(1);
        setScrollPosition({ x: 0, y: 0 });
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

  // Touch event handlers for mobile support
  const getTouchDistance = (touches: TouchList) => {
    if (touches.length < 2) return 0;
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) + 
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
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

    const touchStartHandler = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        setIsDragging(true);
        setDragStart({ x: touch.clientX - scrollPosition.x, y: touch.clientY - scrollPosition.y });
      } else if (e.touches.length === 2) {
        setIsDragging(false);
        const distance = getTouchDistance(e.touches);
        setLastTouchDistance(distance);
      }
    };

    const touchMoveHandler = (e: TouchEvent) => {
      e.preventDefault();
      
      if (e.touches.length === 1 && isDragging) {
        const touch = e.touches[0];
        const newX = touch.clientX - dragStart.x;
        const newY = touch.clientY - dragStart.y;
        setScrollPosition({ x: newX, y: newY });
      } else if (e.touches.length === 2 && lastTouchDistance > 0) {
        const currentDistance = getTouchDistance(e.touches);
        const scale = currentDistance / lastTouchDistance;
        const newZoom = zoomLevel * scale;
        const clampedZoom = Math.max(0.5, Math.min(3, newZoom));
        
        setZoomLevel(clampedZoom);
        setLastTouchDistance(currentDistance);
      }
    };

    const touchEndHandler = () => {
      setIsDragging(false);
      setLastTouchDistance(0);
    };

    element.addEventListener('wheel', wheelHandler, { passive: false });
    element.addEventListener('touchstart', touchStartHandler, { passive: true });
    element.addEventListener('touchmove', touchMoveHandler, { passive: false });
    element.addEventListener('touchend', touchEndHandler, { passive: true });
    
    return () => {
      element.removeEventListener('wheel', wheelHandler);
      element.removeEventListener('touchstart', touchStartHandler);
      element.removeEventListener('touchmove', touchMoveHandler);
      element.removeEventListener('touchend', touchEndHandler);
    };
  }, [isDragging, dragStart, scrollPosition, lastTouchDistance, zoomLevel]);


  return (
    <div 
      className={`
        ${isFullScreen ? 'fixed inset-0 z-50 bg-gray-900' : 'relative w-full h-full'}
        flex flex-col
      `}
    >
      {/* Controls - Desktop: top-right, Mobile: bottom bar */}
      <div className="absolute top-4 right-4 hidden sm:flex gap-2 z-10">
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

      {/* Mobile Controls - Bottom bar with horizontal scroll */}
      <div className="absolute bottom-2 left-2 right-2 sm:hidden bg-gray-800/95 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-gray-600 z-30 animate-in slide-in-from-bottom-2 duration-300">
        <div className="flex gap-2 overflow-x-auto overflow-y-visible scrollbar-hide">
          {/* All controls in one scrollable row */}
          <div className="flex gap-2 flex-shrink-0 min-w-max">
            <ControlButtons
              isPanningEnabled={isPanningEnabled}
              onPanningToggle={() => setIsPanningEnabled(!isPanningEnabled)}
              theme={theme}
              onThemeChange={toggleTheme}
            />
            
            <ZoomControls
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onResetZoom={handleResetZoom}
              onAutoFit={handleAutoFit}
            />
            
            <ExportDropdown
              contentRef={contentRef}
              containerRef={containerRef}
              theme={theme}
              diagramCode={code}
              diagramName={diagramName}
              onAlert={onAlert}
            />
            
            <FullScreenToggle
              isFullScreen={isFullScreen}
              onFullScreenChange={onFullScreenChange}
            />
          </div>
        </div>
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
