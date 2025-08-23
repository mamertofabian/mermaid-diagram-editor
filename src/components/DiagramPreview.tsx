import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ChevronUp, ChevronDown } from 'lucide-react';
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
 * 
 * Enhanced Zoom Features:
 * - Mobile devices: 0.1x to 10x zoom range
 * - Desktop devices: 0.5x to 5x zoom range  
 * - Dynamic zoom increments based on current zoom level
 * - Keyboard shortcuts: +/- for zoom, 0 for reset, M for max zoom
 * - Touch pinch-to-zoom support with enhanced limits
 * - Visual feedback when maximum zoom is reached
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
  const [showSecondRow, setShowSecondRow] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

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

  // Export functions for mobile buttons
  const exportToPDF = async () => {
    if (!contentRef.current) return;
    
    try {
      setIsExporting(true);
      const originalTransform = contentRef.current.style.transform;
      const originalOverflow = containerRef.current?.style.overflow || '';
      
      contentRef.current.style.transform = 'scale(1) translate(0px, 0px)';
      if (containerRef.current) {
        containerRef.current.style.overflow = 'visible';
      }

      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(contentRef.current, {
        backgroundColor: theme === 'light' ? '#ffffff' : '#f8fafc',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: contentRef.current.scrollWidth,
        height: contentRef.current.scrollHeight,
      });

      contentRef.current.style.transform = originalTransform;
      if (containerRef.current) {
        containerRef.current.style.overflow = originalOverflow;
      }

      const aspectRatio = canvas.width / canvas.height;
      const isLandscape = aspectRatio > 1;
      
      const pdf = new jsPDF({
        orientation: isLandscape ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      const margin = 10;
      const maxWidth = pageWidth - (2 * margin);
      const maxHeight = pageHeight - (2 * margin);
      
      let imgWidth, imgHeight;
      
      if (isLandscape) {
        imgWidth = maxWidth;
        imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        if (imgHeight > maxHeight) {
          imgHeight = maxHeight;
          imgWidth = (canvas.width * imgHeight) / canvas.height;
        }
      } else {
        imgHeight = maxHeight;
        imgWidth = (canvas.width * imgHeight) / canvas.height;
        
        if (imgWidth > maxWidth) {
          imgWidth = maxWidth;
          imgHeight = (canvas.height * imgWidth) / canvas.width;
        }
      }
      
      const x = (pageWidth - imgWidth) / 2;
      const y = (pageHeight - imgHeight) / 2;

      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
      
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `mermaid-diagram-${timestamp}.pdf`;
      
      pdf.save(filename);

    } catch (error) {
      console.error('PDF export error:', error);
      onAlert?.('Failed to export PDF. Please try again.', 'Export Failed', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPNG = async () => {
    if (!contentRef.current) return;
    
    try {
      setIsExporting(true);
      const originalTransform = contentRef.current.style.transform;
      const originalOverflow = containerRef.current?.style.overflow || '';
      
      contentRef.current.style.transform = 'scale(1) translate(0px, 0px)';
      if (containerRef.current) {
        containerRef.current.style.overflow = 'visible';
      }

      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(contentRef.current, {
        backgroundColor: theme === 'light' ? '#ffffff' : '#f8fafc',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: contentRef.current.scrollWidth,
        height: contentRef.current.scrollHeight,
      });

      contentRef.current.style.transform = originalTransform;
      if (containerRef.current) {
        containerRef.current.style.overflow = originalOverflow;
      }

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `mermaid-diagram-${Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }, 'image/png');

    } catch (error) {
      console.error('PNG export error:', error);
      onAlert?.('Failed to export PNG. Please try again.', 'Export Failed', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToSVG = () => {
    if (!contentRef.current) return;
    
    const svgElement = contentRef.current.querySelector('svg');
    if (!svgElement) {
      onAlert?.('No diagram to export.', 'Export Failed', 'warning');
      return;
    }

    try {
      const clonedSvg = svgElement.cloneNode(true) as SVGElement;
      const backgroundColor = theme === 'light' ? '#ffffff' : '#f8fafc';
      clonedSvg.style.backgroundColor = backgroundColor;
      
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(clonedSvg);
      
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `mermaid-diagram-${Date.now()}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('SVG export error:', error);
      onAlert?.('Failed to export SVG. Please try again.', 'Export Failed', 'error');
    }
  };

  const exportToMmd = () => {
    try {
      const content = code;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      const safeFileName = diagramName.replace(/[^a-zA-Z0-9-_\s]/g, '');
      const filename = `${safeFileName}.mmd`;
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('MMD export error:', error);
      onAlert?.('Failed to export MMD file. Please try again.', 'Export Failed', 'error');
    }
  };

  const handleZoomIn = () => {
    // Dynamic zoom increments based on current level
    const isMobile = window.innerWidth < 768;
    let increment;
    
    if (zoomLevel < 1) {
      increment = 0.1; // Fine control at low zoom
    } else if (zoomLevel < 3) {
      increment = 0.25; // Medium control
    } else if (zoomLevel < 6) {
      increment = 0.5; // Coarse control at high zoom
    } else {
      increment = 1; // Very coarse control at very high zoom
    }
    
    // Mobile devices get more aggressive zooming
    if (isMobile) {
      increment *= 1.5;
    }
    
    setZoomLevel(prev => Math.min(prev + increment, 10));
  };

  const handleZoomOut = () => {
    // Dynamic zoom increments based on current level
    const isMobile = window.innerWidth < 768;
    let increment;
    
    if (zoomLevel <= 1) {
      increment = 0.1; // Fine control at low zoom
    } else if (zoomLevel <= 3) {
      increment = 0.25; // Medium control
    } else if (zoomLevel <= 6) {
      increment = 0.5; // Coarse control at high zoom
    } else {
      increment = 1; // Very coarse control at very high zoom
    }
    
    // Mobile devices get more aggressive zooming
    if (isMobile) {
      increment *= 1.5;
    }
    
    setZoomLevel(prev => Math.max(prev - increment, 0.1));
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
      
      // Allow much higher zoom levels for mobile devices
      const isMobile = window.innerWidth < 768;
      const minZoom = isMobile ? 0.1 : 0.5;
      const maxZoom = isMobile ? 10 : 5;
      
      // Respect zoom limits
      const finalScale = Math.max(minZoom, Math.min(maxZoom, optimalScale));
      
      // Apply the zoom and center the diagram
      setZoomLevel(finalScale);
      setScrollPosition({ x: 0, y: 0 });
    } catch (error) {
      console.error('Auto-fit calculation error:', error);
      // Fallback to reset zoom if calculation fails
      handleResetZoom();
    }
  };

  const handleMaxZoom = () => {
    // Zoom to maximum level for detailed viewing
    const isMobile = window.innerWidth < 768;
    const maxZoom = isMobile ? 10 : 5;
    setZoomLevel(maxZoom);
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
      case '0':
        e.preventDefault();
        handleResetZoom();
        break;
      case '=':
      case '+':
        e.preventDefault();
        handleZoomIn();
        break;
      case '-':
        e.preventDefault();
        handleZoomOut();
        break;
      case 'm':
      case 'M':
        e.preventDefault();
        handleMaxZoom();
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
      const isMobile = window.innerWidth < 768;
      const minZoom = isMobile ? 0.1 : 0.5;
      const maxZoom = isMobile ? 10 : 5;
      setZoomLevel(prev => Math.max(minZoom, Math.min(maxZoom, prev + delta)));
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
        const isMobile = window.innerWidth < 768;
        const minZoom = isMobile ? 0.1 : 0.5;
        const maxZoom = isMobile ? 10 : 5;
        const clampedZoom = Math.max(minZoom, Math.min(maxZoom, newZoom));
        
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
          onMaxZoom={handleMaxZoom}
          zoomLevel={zoomLevel}
        />
        
        <FullScreenToggle
          isFullScreen={isFullScreen}
          onFullScreenChange={onFullScreenChange}
        />
      </div>

      {/* Mobile Controls - 2-row layout with toggle */}
      <div className="absolute bottom-2 left-2 right-2 sm:hidden bg-gray-800/95 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-gray-600 z-30 animate-in slide-in-from-bottom-2 duration-300">
        {/* First Row - Core Controls */}
        <div className={`flex gap-2 justify-between items-center ${showSecondRow ? 'mb-2' : 'mb-0'} transition-all duration-300`}>
          <div className="flex gap-2">
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
              onMaxZoom={handleMaxZoom}
              zoomLevel={zoomLevel}
            />
            
            <FullScreenToggle
              isFullScreen={isFullScreen}
              onFullScreenChange={onFullScreenChange}
            />
          </div>
          
          {/* Row toggle button */}
          <button
            onClick={() => setShowSecondRow(!showSecondRow)}
            className="bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg p-2 shadow-md h-[40px] w-[40px] flex items-center justify-center transition-all duration-300"
            title={showSecondRow ? "Hide Export Options" : "Show Export Options"}
          >
            {showSecondRow ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </button>
        </div>
        
        {/* Second Row - Export Options */}
        <div className={`
          ${showSecondRow ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}
          overflow-hidden transition-all duration-300 ease-out
        `}>
          <div className="flex gap-2 justify-center">
            <button
              onClick={exportToPDF}
              disabled={isExporting}
              className={`bg-red-600 hover:bg-red-700 text-white rounded-lg p-2 shadow-md h-[40px] flex items-center justify-center transition-colors flex-1 ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Export to PDF"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
              </svg>
              <span className="ml-1 text-xs font-medium">PDF</span>
            </button>
            
            <button
              onClick={exportToPNG}
              disabled={isExporting}
              className={`bg-green-600 hover:bg-green-700 text-white rounded-lg p-2 shadow-md h-[40px] flex items-center justify-center transition-colors flex-1 ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Export to PNG"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21,15 16,10 5,21"/>
              </svg>
              <span className="ml-1 text-xs font-medium">PNG</span>
            </button>
            
            <button
              onClick={exportToSVG}
              disabled={isExporting}
              className={`bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-2 shadow-md h-[40px] flex items-center justify-center transition-colors flex-1 ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Export to SVG"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
              </svg>
              <span className="ml-1 text-xs font-medium">SVG</span>
            </button>
            
            <button
              onClick={exportToMmd}
              disabled={isExporting}
              className={`bg-purple-600 hover:bg-purple-700 text-white rounded-lg p-2 shadow-md h-[40px] flex items-center justify-center transition-colors flex-1 ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Export as .mmd file"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <path d="M12 17V7m0 10l-3-3m3 3l3-3"/>
              </svg>
              <span className="ml-1 text-xs font-medium">MMD</span>
            </button>
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
