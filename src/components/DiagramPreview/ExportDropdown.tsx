import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ExportDropdownProps {
  contentRef: React.RefObject<HTMLDivElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  theme: 'light' | 'dark';
  diagramCode: string;
  diagramName: string;
  onAlert?: (message: string, title?: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export default function ExportDropdown({ contentRef, containerRef, theme, diagramCode, diagramName, onAlert }: ExportDropdownProps) {
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const toggleExportDropdown = () => {
    if (!isExporting) {
      setIsExportDropdownOpen(!isExportDropdownOpen);
    }
  };

  const closeExportDropdown = () => {
    setIsExportDropdownOpen(false);
  };

  const exportToPDF = async () => {
    if (!contentRef.current) return;
    
    try {
      // Show loading state
      setIsExporting(true);

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
        backgroundColor: theme === 'light' ? '#ffffff' : '#f8fafc', // Use theme background color
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
      onAlert?.('Failed to export PDF. Please try again.', 'Export Failed', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const printToPDF = () => {
    // Create a new window with just the diagram for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      onAlert?.('Please allow popups to use the print feature.', 'Popup Blocked', 'warning');
      return;
    }

    const diagramContent = contentRef.current?.innerHTML || '';
    const backgroundColor = theme === 'light' ? '#ffffff' : '#f8fafc'; // Use theme background color
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
      onAlert?.('No diagram to export.', 'Export Failed', 'warning');
      return;
    }

    try {
      // Clone the SVG to avoid modifying the original
      const clonedSvg = svgElement.cloneNode(true) as SVGElement;
      
      // Set background color based on theme
      const backgroundColor = theme === 'light' ? '#ffffff' : '#f8fafc'; // Use theme background color
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
      onAlert?.('Failed to export SVG. Please try again.', 'Export Failed', 'error');
    }
  };

  const exportToPNG = async () => {
    if (!contentRef.current) return;
    
    try {
      // Show loading state
      setIsExporting(true);

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
        backgroundColor: theme === 'light' ? '#ffffff' : '#f8fafc', // Use theme background color
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
      onAlert?.('Failed to export PNG. Please try again.', 'Export Failed', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToMmd = () => {
    try {
      const content = diagramCode;
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

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isExportDropdownOpen) {
        const target = event.target as Element;
        if (!target.closest('.export-dropdown')) {
          closeExportDropdown();
        }
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isExportDropdownOpen) {
        closeExportDropdown();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isExportDropdownOpen]);

  return (
    <div className="relative export-dropdown">
      <button
        onClick={toggleExportDropdown}
        disabled={isExporting}
        className={`bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg p-2 shadow-md h-[40px] w-[40px] sm:h-[44px] sm:w-[44px] flex items-center justify-center transition-colors ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={isExporting ? "Exporting..." : "Export Options"}
      >
        {isExporting ? (
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10,9 9,9 8,9"/>
          </svg>
        )}
        {!isExporting && (
          <svg 
            className={`w-4 h-4 transition-transform ${isExportDropdownOpen ? 'rotate-180' : ''}`} 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <polyline points="6,9 12,15 18,9"/>
          </svg>
        )}
      </button>

      {/* Dropdown Menu */}
      {isExportDropdownOpen && (
        <div className="absolute right-0 bottom-full mb-2 sm:top-full sm:bottom-auto sm:mt-2 sm:mb-0 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-600 z-50 animate-in slide-in-from-bottom-2 sm:slide-in-from-top-2 duration-200">
          <div className="py-1">
            <button
              onClick={() => { exportToPDF(); closeExportDropdown(); }}
              disabled={isExporting}
              className={`w-full text-left px-4 py-2 text-gray-200 hover:bg-gray-700 flex items-center gap-3 ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
              Export to PDF
            </button>
            <button
              onClick={() => { printToPDF(); closeExportDropdown(); }}
              disabled={isExporting}
              className={`w-full text-left px-4 py-2 text-gray-200 hover:bg-gray-700 flex items-center gap-3 ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 11H5M19 6H5M19 16H5"/>
              </svg>
              Print to PDF
            </button>
            <button
              onClick={() => { exportToSVG(); closeExportDropdown(); }}
              disabled={isExporting}
              className={`w-full text-left px-4 py-2 text-gray-200 hover:bg-gray-700 flex items-center gap-3 ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <path d="M9 15h6"/>
                <path d="M9 11h6"/>
              </svg>
              Export to SVG
            </button>
            <button
              onClick={() => { exportToPNG(); closeExportDropdown(); }}
              disabled={isExporting}
              className={`w-full text-left px-4 py-2 text-gray-200 hover:bg-gray-700 flex items-center gap-3 ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21,15 16,10 5,21"/>
              </svg>
              Export to PNG
            </button>
            <button
              onClick={() => { exportToMmd(); closeExportDropdown(); }}
              disabled={isExporting}
              className={`w-full text-left px-4 py-2 text-gray-200 hover:bg-gray-700 flex items-center gap-3 ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <path d="M12 17V7m0 10l-3-3m3 3l3-3"/>
              </svg>
              Export as .mmd
            </button>
          </div>
        </div>
      )}
    </div>
  );
}