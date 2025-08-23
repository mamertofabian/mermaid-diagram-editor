import React from 'react';

interface DiagramCanvasProps {
  theme: 'light' | 'dark';
  isPanningEnabled: boolean;
  zoomLevel: number;
  scrollPosition: { x: number; y: number };
  isDragging: boolean;
  containerRef: React.RefObject<HTMLDivElement>;
  contentRef: React.RefObject<HTMLDivElement>;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

export default function DiagramCanvas({
  theme,
  isPanningEnabled,
  zoomLevel,
  scrollPosition,
  isDragging,
  containerRef,
  contentRef,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onContextMenu,
  onKeyDown
}: DiagramCanvasProps) {
  return (
    <div 
      className="flex-1 overflow-hidden relative diagram-print-area"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onContextMenu={onContextMenu}
      onKeyDown={onKeyDown}
      tabIndex={0}
      ref={containerRef}
      style={{
        ...{
          backgroundColor: theme === 'light' ? '#ffffff' : '#f8fafc',
          border: `2px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
          userSelect: isPanningEnabled ? 'none' : 'text',
        },
        touchAction: 'none' // Disable browser touch behaviors
      }}
    >
      <div
        ref={contentRef}
        className="w-full h-full flex items-center justify-center p-8"
        style={{
          transform: `scale(${zoomLevel}) translate(${scrollPosition.x}px, ${scrollPosition.y}px)`,
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          cursor: isDragging ? 'grabbing' : (isPanningEnabled ? 'grab' : 'default'),
          userSelect: isPanningEnabled ? 'none' : 'text',
        }}
      />
    </div>
  );
}