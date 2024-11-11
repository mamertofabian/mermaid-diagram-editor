import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface DiagramPreviewProps {
  code: string;
  isFullScreen: boolean;
}

export default function DiagramPreview({ code, isFullScreen }: DiagramPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      await mermaid.initialize({
        startOnLoad: true,
        theme: 'default',
        securityLevel: 'loose',
        logLevel: 'error',
      });
    };
    init();
  }, []);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!containerRef.current) return;
      
      try {
        // Clear previous content
        containerRef.current.innerHTML = '';
        
        // Generate unique ID
        const id = `mermaid-${Math.random().toString(36).slice(2)}`;
        
        // Create diagram container
        const element = document.createElement('div');
        element.id = id;
        element.style.width = '100%';
        element.style.height = '100%';
        containerRef.current.appendChild(element);

        // Render diagram
        const { svg } = await mermaid.render(id, code);
        element.innerHTML = svg;
      } catch (error) {
        console.error('Mermaid rendering error:', error);
        containerRef.current.innerHTML = `
          <div class="flex items-center justify-center h-full">
            <p class="text-red-500 font-medium">Invalid Mermaid syntax</p>
          </div>
        `;
      }
    };

    renderDiagram();
  }, [code]);

  return (
    <div 
      className={`
        ${isFullScreen ? 'fixed inset-0 z-50 bg-white' : 'relative w-full h-full'}
        flex items-center justify-center
      `}
    >
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center p-8 overflow-auto"
      />
    </div>
  );
}