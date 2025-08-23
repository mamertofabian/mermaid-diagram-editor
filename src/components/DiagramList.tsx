import React, { useRef, useState, useEffect } from 'react';
import { Diagram, Collection } from '../services/DiagramStorage';
import { Pencil, Trash2, Download, Upload, Share, FileDown, HelpCircle, Info, ExternalLink, Calendar, Youtube, Github, BookOpen, FolderPlus } from 'lucide-react';
import { diagramExportImport } from '../services/DiagramExportImport';
import CollectionBadge from './CollectionBadge';

interface DiagramListProps {
  diagrams: Diagram[];
  collections: Collection[];
  currentDiagramId?: string;
  isWelcomeActive?: boolean;
  isTutorialActive?: boolean;
  onSelect: (diagram: Diagram) => void;
  onDelete: (id: string) => void;
  onRename: (diagram: Diagram) => void;
  onImport: (diagrams: Diagram[]) => void;
  onExportSingle: (diagram: Diagram) => void;
  onShare: (diagram: Diagram) => void;
  onShowWelcome: () => void;
  onShowTutorial: () => void;
  onAddToCollection: (diagramId: string, collectionId: string) => void;
  onRemoveFromCollection: (diagramId: string, collectionId: string) => void;
}

export default function DiagramList({ 
  diagrams, 
  collections, 
  currentDiagramId, 
  isWelcomeActive, 
  isTutorialActive, 
  onSelect, 
  onDelete, 
  onRename, 
  onImport, 
  onExportSingle, 
  onShare, 
  onShowWelcome, 
  onShowTutorial,
  onAddToCollection,
  onRemoveFromCollection 
}: DiagramListProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showCollectionMenu, setShowCollectionMenu] = useState<string | null>(null);

  // Close collection menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showCollectionMenu) {
        const target = event.target as HTMLElement;
        if (!target.closest('.collection-menu-container')) {
          setShowCollectionMenu(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCollectionMenu]);

  const handleExportAll = () => {
    diagramExportImport.exportAllAsJSON(diagrams);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const result = await diagramExportImport.processDroppedFiles(files);
    
    if (result.success && 'diagrams' in result) {
      onImport(result.diagrams as Diagram[]);
      
      // Show success message
      let message = `Imported ${result.imported} diagram(s)`;
      if (result.errors.length > 0) {
        message += `\nErrors: ${result.errors.join(', ')}`;
      }
      // Show success message with any errors
      console.log(message);
    } else {
      // Show error message
      console.error(`Import failed: ${result.errors.join(', ')}`);
    }
    
    // Reset file input
    e.target.value = '';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Import/Export Controls */}
      <div className="flex gap-2 pb-2 border-b border-gray-600 flex-shrink-0">
        <button
          onClick={handleImportClick}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          title="Import Diagrams"
        >
          <Upload className="w-4 h-4" />
          Import
        </button>
        <button
          onClick={handleExportAll}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          title="Export All Diagrams"
          disabled={diagrams.length === 0}
        >
          <Download className="w-4 h-4" />
          Export All
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.mmd"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Diagram List - Scrollable */}
      <div className="flex-1 overflow-y-auto min-h-0 py-2">
        <div className="space-y-2">
          {diagrams.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <p>No diagrams yet</p>
              <p className="text-sm mt-1">Create your first diagram or import existing ones</p>
            </div>
          ) : (
            diagrams.map((diagram) => {
              const diagramCollections = (diagram.collectionIds || [])
                .map(id => collections.find(c => c.id === id))
                .filter(Boolean) as Collection[];

              return (
                <div
                  key={diagram.id}
                  className={`relative p-3 rounded-lg shadow-sm transition-colors ${
                    diagram.id === currentDiagramId
                      ? 'bg-blue-600 border-2 border-blue-400'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <button
                      className="flex-1 text-left"
                      onClick={() => onSelect(diagram)}
                    >
                      <h3 className={`font-medium ${diagram.id === currentDiagramId ? 'text-white' : 'text-gray-100'}`}>
                        {diagram.name}
                      </h3>
                      <p className={`text-sm ${diagram.id === currentDiagramId ? 'text-blue-100' : 'text-gray-400'}`}>
                        Updated {new Date(diagram.updatedAt).toLocaleDateString()}
                      </p>
                    </button>
                    <div className="flex space-x-1">
                      {/* Add to Collection Button */}
                      <div className="relative collection-menu-container">
                        <button
                          onClick={() => setShowCollectionMenu(
                            showCollectionMenu === diagram.id ? null : diagram.id
                          )}
                          className={`p-2 rounded-full transition-colors ${
                            diagram.id === currentDiagramId
                              ? 'text-blue-100 hover:text-white hover:bg-blue-500'
                              : 'text-gray-400 hover:text-purple-400 hover:bg-gray-600'
                          }`}
                          title="Add to Collection"
                        >
                          <FolderPlus className="w-4 h-4" />
                        </button>
                        
                        {showCollectionMenu === diagram.id && (
                          <div className="absolute right-0 top-10 bg-gray-800 border border-gray-600 rounded-lg shadow-lg py-1 min-w-48 z-20 max-h-60 overflow-y-auto">
                            {collections.length === 0 ? (
                              <div className="px-3 py-2 text-sm text-gray-400">
                                No collections available
                              </div>
                            ) : (
                              collections.map(collection => {
                                const isInCollection = diagram.collectionIds?.includes(collection.id);
                                return (
                                  <button
                                    key={collection.id}
                                    onClick={() => {
                                      if (isInCollection) {
                                        onRemoveFromCollection(diagram.id, collection.id);
                                      } else {
                                        onAddToCollection(diagram.id, collection.id);
                                      }
                                      setShowCollectionMenu(null);
                                    }}
                                    className={`flex items-center gap-2 w-full px-3 py-2 text-sm transition-colors ${
                                      isInCollection 
                                        ? 'text-red-300 hover:text-red-200 hover:bg-gray-700'
                                        : 'text-gray-300 hover:text-white hover:bg-gray-700'
                                    }`}
                                  >
                                    <div 
                                      className="w-3 h-3 rounded-full"
                                      style={{ backgroundColor: collection.color }}
                                    />
                                    <span className="truncate">{collection.name}</span>
                                    {isInCollection && (
                                      <span className="text-xs">✓</span>
                                    )}
                                  </button>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => onShare(diagram)}
                        className={`p-2 rounded-full transition-colors ${
                          diagram.id === currentDiagramId
                            ? 'text-blue-100 hover:text-white hover:bg-blue-500'
                            : 'text-gray-400 hover:text-blue-400 hover:bg-gray-600'
                        }`}
                        title="Share Diagram"
                      >
                        <Share className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onExportSingle(diagram)}
                        className={`p-2 rounded-full transition-colors ${
                          diagram.id === currentDiagramId
                            ? 'text-blue-100 hover:text-white hover:bg-blue-500'
                            : 'text-gray-400 hover:text-green-400 hover:bg-gray-600'
                        }`}
                        title="Export as .mmd file"
                      >
                        <FileDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onRename(diagram)}
                        className={`p-2 rounded-full transition-colors ${
                          diagram.id === currentDiagramId
                            ? 'text-blue-100 hover:text-white hover:bg-blue-500'
                            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-600'
                        }`}
                        title="Rename Diagram"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(diagram.id)}
                        className={`p-2 rounded-full transition-colors ${
                          diagram.id === currentDiagramId
                            ? 'text-blue-100 hover:text-white hover:bg-blue-500'
                            : 'text-gray-400 hover:text-red-400 hover:bg-gray-600'
                        }`}
                        title="Delete Diagram"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Collection Badges */}
                  {diagramCollections.length > 0 && (
                    <div className="flex items-center gap-1 mt-2 flex-wrap">
                      {diagramCollections.slice(0, 3).map(collection => (
                        <CollectionBadge
                          key={collection.id}
                          collection={collection}
                          size="sm"
                          showRemove
                          onRemove={() => onRemoveFromCollection(diagram.id, collection.id)}
                        />
                      ))}
                      {diagramCollections.length > 3 && (
                        <span className="text-xs text-gray-400">
                          +{diagramCollections.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
      
      {/* Guide Buttons - Fixed at bottom */}
      <div className="mt-4 pt-3 border-t border-gray-600 flex-shrink-0 space-y-2">
        <button
          onClick={onShowWelcome}
          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
            isWelcomeActive
              ? 'bg-blue-600 border-2 border-blue-400 text-white'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-600'
          }`}
          title="Show Welcome Guide"
        >
          <HelpCircle className="w-4 h-4" />
          <span className="text-sm">Show Welcome Guide</span>
        </button>
        
        <button
          onClick={onShowTutorial}
          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
            isTutorialActive
              ? 'bg-blue-600 border-2 border-blue-400 text-white'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-600'
          }`}
          title="Show Mermaid Tutorial"
        >
          <BookOpen className="w-4 h-4" />
          <span className="text-sm">Mermaid Tutorial</span>
        </button>
      </div>

      {/* About Section - Fixed at bottom */}
      <div className="mt-4 pt-3 border-t border-gray-600 flex-shrink-0">
        <div className="p-3">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-semibold text-gray-200">About</span>
          </div>
          
          <div className="text-xs text-gray-400 space-y-2">
            <div>
              <div className="font-medium text-gray-300">Mamerto Fabian</div>
              <div>Founder & AI Solutions Architect</div>
              <div className="text-blue-400">Codefrost | AI-Driven Coder</div>
            </div>
            
            <div className="flex flex-wrap gap-2 pt-2">
              <a
                href="https://calendly.com/mamerto/30min"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors"
                title="Book a Consultation"
              >
                <Calendar className="w-3 h-3" />
                <span>Book</span>
              </a>
              
              <a
                href="https://youtube.com/@aidrivencoder"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors"
                title="AI-Driven Coder YouTube"
              >
                <Youtube className="w-3 h-3" />
                <span>YouTube</span>
              </a>
              
              <a
                href="https://codefrost.dev/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors"
                title="Codefrost"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Codefrost</span>
              </a>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <a
                href="https://github.com/mamertofabian"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors"
                title="GitHub Profile"
              >
                <Github className="w-3 h-3" />
                <span>@mamertofabian</span>
              </a>
              
              <a
                href="https://mamerto.codefrost.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors"
                title="Portfolio"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Portfolio</span>
              </a>
            </div>
            
            <div className="pt-1">
              <a
                href="https://mermaid.codefrost.dev/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-xs underline"
                title="Live Demo"
              >
                🚀 Live App: mermaid.codefrost.dev
              </a>
            </div>
            
            <div>
              <a
                href="https://github.com/mamertofabian/mermaid-diagram-editor"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-xs underline flex items-center gap-1"
                title="Source Code"
              >
                <Github className="w-3 h-3" />
                <span>View Source Code</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
