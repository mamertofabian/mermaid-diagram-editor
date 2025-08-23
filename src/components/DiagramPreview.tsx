import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface DiagramPreviewProps {
  code: string;
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
  isFullScreen: boolean;
  onFullScreenChange?: (isFullScreen: boolean) => void;
}

export default function DiagramPreview({ code, theme, onThemeChange, isFullScreen, onFullScreenChange }: DiagramPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: theme,
      securityLevel: 'loose',
      logLevel: 'error',
    });
  }, [theme]);

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

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    onThemeChange(newTheme);
  };

  const exportToPDF = async () => {
    if (!contentRef.current) return;
    
    try {
      // Show loading state
      const exportButton = document.querySelector('[data-export-pdf]') as HTMLButtonElement;
      if (exportButton) {
        exportButton.disabled = true;
        exportButton.innerHTML = `
          <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        `;
      }

      // Store original styles
      const originalTransform = contentRef.current.style.transform;
      const originalOverflow = containerRef.current?.style.overflow || '';
      
      // Temporarily reset zoom and scroll to show full diagram
      contentRef.current.style.transform = 'scale(1) translate(0px, 0px)';
      if (containerRef.current) {
        containerRef.current.style.overflow = 'visible';
      }

      // Wait a bit for the layout to settle
      await new Promise(resolve => setTimeout(resolve, 100));

      // Convert the diagram content to canvas with full content
      const canvas = await html2canvas(contentRef.current, {
        backgroundColor: theme === 'light' ? '#ffffff' : '#1f2937',
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: contentRef.current.scrollWidth,
        height: contentRef.current.scrollHeight,
      });

      // Restore original styles
      contentRef.current.style.transform = originalTransform;
      if (containerRef.current) {
        containerRef.current.style.overflow = originalOverflow;
      }

      // Determine best orientation based on diagram dimensions
      const aspectRatio = canvas.width / canvas.height;
      const isLandscape = aspectRatio > 1;
      
      // Create PDF with appropriate orientation
      const pdf = new jsPDF({
        orientation: isLandscape ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Get page dimensions
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate image dimensions to fit the page with margins
      const margin = 10; // 10mm margin on all sides
      const maxWidth = pageWidth - (2 * margin);
      const maxHeight = pageHeight - (2 * margin);
      
      let imgWidth, imgHeight;
      
      if (isLandscape) {
        // For landscape diagrams, fit to width
        imgWidth = maxWidth;
        imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // If height exceeds page, scale down proportionally
        if (imgHeight > maxHeight) {
          imgHeight = maxHeight;
          imgWidth = (canvas.width * imgHeight) / canvas.height;
        }
      } else {
        // For portrait diagrams, fit to height
        imgHeight = maxHeight;
        imgWidth = (canvas.width * imgHeight) / canvas.height;
        
        // If width exceeds page, scale down proportionally
        if (imgWidth > maxWidth) {
          imgWidth = maxWidth;
          imgHeight = (canvas.height * imgWidth) / canvas.width;
        }
      }
      
      // Center the image on the page
      const x = (pageWidth - imgWidth) / 2;
      const y = (pageHeight - imgHeight) / 2;

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `mermaid-diagram-${timestamp}.pdf`;
      
      // Download the PDF
      pdf.save(filename);

    } catch (error) {
      console.error('PDF export error:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      // Restore button state
      const exportButton = document.querySelector('[data-export-pdf]') as HTMLButtonElement;
      if (exportButton) {
        exportButton.disabled = false;
        exportButton.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10,9 9,9 8,9"/>
          </svg>
        `;
      }
    }
  };

  const printToPDF = () => {
    // Create a new window with just the diagram for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to use the print feature.');
      return;
    }

    const diagramContent = contentRef.current?.innerHTML || '';
    const backgroundColor = theme === 'light' ? '#ffffff' : '#1f2937';
    const textColor = theme === 'light' ? '#000000' : '#ffffff';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Mermaid Diagram - Print</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              background-color: ${backgroundColor};
              color: ${textColor};
              font-family: Arial, sans-serif;
            }
            .diagram-container {
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            .diagram-container svg {
              max-width: 100%;
              max-height: 100vh;
            }
            @media print {
              body { margin: 0; }
              .diagram-container { min-height: auto; }
            }
          </style>
        </head>
        <body>
          <div class="diagram-container">
            ${diagramContent}
          </div>
          <script>
            window.onload = function() {
              setTimeout(() => {
                window.print();
                window.close();
              }, 100);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const exportToSVG = () => {
    if (!contentRef.current) return;
    
    const svgElement = contentRef.current.querySelector('svg');
    if (!svgElement) {
      alert('No diagram to export.');
      return;
    }

    try {
      // Clone the SVG to avoid modifying the original
      const clonedSvg = svgElement.cloneNode(true) as SVGElement;
      
      // Set background color based on theme
      const backgroundColor = theme === 'light' ? '#ffffff' : '#1f2937';
      clonedSvg.style.backgroundColor = backgroundColor;
      
      // Convert SVG to string
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(clonedSvg);
      
      // Create blob and download
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
      alert('Failed to export SVG. Please try again.');
    }
  };

  const exportToPNG = async () => {
    if (!contentRef.current) return;
    
    try {
      // Show loading state
      const pngButton = document.querySelector('[data-export-png]') as HTMLButtonElement;
      if (pngButton) {
        pngButton.disabled = true;
        pngButton.innerHTML = `
          <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        `;
      }

      // Store original styles
      const originalTransform = contentRef.current.style.transform;
      const originalOverflow = containerRef.current?.style.overflow || '';
      
      // Temporarily reset zoom and scroll to show full diagram
      contentRef.current.style.transform = 'scale(1) translate(0px, 0px)';
      if (containerRef.current) {
        containerRef.current.style.overflow = 'visible';
      }

      // Wait a bit for the layout to settle
      await new Promise(resolve => setTimeout(resolve, 100));

      // Convert the diagram content to canvas with full content
      const canvas = await html2canvas(contentRef.current, {
        backgroundColor: theme === 'light' ? '#ffffff' : '#1f2937',
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: contentRef.current.scrollWidth,
        height: contentRef.current.scrollHeight,
      });

      // Restore original styles
      contentRef.current.style.transform = originalTransform;
      if (containerRef.current) {
        containerRef.current.style.overflow = originalOverflow;
      }

      // Convert canvas to blob and download
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
      alert('Failed to export PNG. Please try again.');
    } finally {
      // Restore button state
      const pngButton = document.querySelector('[data-export-png]') as HTMLButtonElement;
      if (pngButton) {
        pngButton.disabled = false;
        pngButton.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21,15 16,10 5,21"/>
          </svg>
        `;
      }
    }
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
          onClick={toggleTheme}
          className="bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg p-2 shadow-md"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Theme`}
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
        <button
          onClick={exportToPDF}
          data-export-pdf
          className="bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg p-2 shadow-md"
          title="Export to PDF"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10,9 9,9 8,9"/>
          </svg>
        </button>
        <button
          onClick={printToPDF}
          className="bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg p-2 shadow-md"
          title="Print to PDF"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 11H5M19 6H5M19 16H5"/>
          </svg>
        </button>
        <button
          onClick={exportToSVG}
          className="bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg p-2 shadow-md"
          title="Export to SVG"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <path d="M9 15h6"/>
            <path d="M9 11h6"/>
          </svg>
        </button>
        <button
          onClick={exportToPNG}
          data-export-png
          className="bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg p-2 shadow-md"
          title="Export to PNG"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21,15 16,10 5,21"/>
          </svg>
        </button>
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
