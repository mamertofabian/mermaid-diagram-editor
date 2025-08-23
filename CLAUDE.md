# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development server**: `npm run dev` (runs on http://localhost:5173)
- **Build for production**: `npm run build`
- **Lint code**: `npm run lint`
- **Preview production build**: `npm run preview`
- **Type checking**: TypeScript checking is handled by the build process and editor

## Architecture Overview

This is a React + TypeScript web application for creating and editing Mermaid diagrams with real-time preview capabilities.

### Core Architecture

- **Frontend Framework**: React 18 with TypeScript, built with Vite
- **Styling**: Tailwind CSS with custom dark theme (gray-800/900 color scheme)
- **Diagram Rendering**: Mermaid.js library for diagram generation
- **State Management**: React useState/useEffect (no external state management library)
- **Data Persistence**: Browser localStorage for diagram storage
- **Export Features**: jsPDF and html2canvas for PDF and image exports

### Key Components Structure

- **App.tsx**: Main application container managing global state (diagrams, current diagram, view modes)
- **DiagramPreview.tsx**: Complex modular component handling Mermaid rendering, zoom/pan controls, theme switching, and export functionality
  - **DiagramPreview/**: Subcomponents for ControlButtons, DiagramCanvas, ExportDropdown, FullScreenToggle, ZoomControls
- **Editor.tsx**: Simple textarea-based code editor with auto-save on changes
- **DiagramList.tsx**: Sidebar component for diagram management (select, rename, delete)
- **CreateDiagramModal.tsx**: Modal for creating new diagrams
- **DiagramStorage.ts**: Service class for localStorage operations with full CRUD functionality

### Data Flow

1. **Storage Layer**: `DiagramStorage` class handles all localStorage operations
2. **App State**: Main App component maintains diagrams array and currentDiagram state
3. **Auto-save**: Code changes trigger immediate localStorage updates via `handleCodeChange`
4. **Theme Persistence**: Theme changes are saved per-diagram and persisted to localStorage

### Key Features Implementation

- **Real-time Preview**: Mermaid diagrams re-render on code changes with error handling
- **Export System**: Multi-format export (PDF, PNG, SVG) with loading states and error handling
- **Zoom & Pan**: Custom implementation in DiagramPreview with mouse wheel zoom and drag panning
- **Theme Support**: Per-diagram theme settings (light/dark) affecting container appearance
- **Full-screen Mode**: Toggle for distraction-free diagram viewing

## Important Implementation Details

- **Mermaid Configuration**: Always uses 'default' theme for consistent diagram appearance regardless of UI theme
- **Unique IDs**: Uses `crypto.randomUUID()` for diagram identification
- **Error Boundaries**: Mermaid rendering includes try/catch blocks for graceful error handling
- **Responsive Design**: Tailwind classes provide mobile-friendly layout
- **Auto-save**: All changes (code, theme, name) are immediately persisted to localStorage
- **Print Optimization**: Custom print.css provides clean diagram-only printing with centered layout

### Additional Services & Utilities

- **DiagramExportImport.ts**: Service for file import/export, URL sharing, and backup functionality
- **useKeyboardShortcuts.ts**: Custom hook managing keyboard shortcuts (Ctrl+C, Ctrl+S, Ctrl+M, Ctrl+E, Esc)
- **mermaidDetector.ts**: Utility for detecting valid Mermaid syntax and generating diagram names
- **templates.ts**: Pre-defined diagram templates for quick diagram creation

### Key Interaction Patterns

- **Drag & Drop Import**: Files can be dropped anywhere on the app to import diagrams
- **Smart Paste Detection**: Pasting Mermaid code automatically creates new diagrams
- **URL Sharing**: Diagrams can be shared via base64-encoded URLs with `?shared=` parameter
- **Custom Modals**: All user interactions use custom modals (AlertModal, ConfirmModal, PromptModal) instead of browser dialogs

## Development Guidelines

- Use existing Tailwind dark theme classes (bg-gray-800, text-gray-100, etc.)
- Follow the established component prop patterns (interfaces defined at component level)
- Maintain the auto-save functionality when adding new diagram properties
- Keep Mermaid theme as 'default' to ensure consistent diagram rendering
- Use lucide-react icons for consistency with existing UI
- Handle errors gracefully with try/catch blocks and user-friendly error messages
- Always validate Mermaid syntax before rendering to prevent crashes