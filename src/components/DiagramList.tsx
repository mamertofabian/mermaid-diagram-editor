import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Diagram, Collection } from '../services/DiagramStorage';
import { Download, Upload, HelpCircle, Info, BookOpen, Plus, Search, ChevronDown, ChevronRight, X, Edit3, Trash2 } from 'lucide-react';
import { diagramExportImport } from '../services/DiagramExportImport';
import CollectionBadge from './CollectionBadge';
import DiagramDropdown from './DiagramDropdown';
import * as LucideIcons from 'lucide-react';

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
  onShowAbout: () => void;
  onAddToCollection: (diagramId: string, collectionId: string) => void;
  onRemoveFromCollection: (diagramId: string, collectionId: string) => void;
  onCreateCollection: () => void;
  onEditCollection: (collection: Collection) => void;
  onDeleteCollection: (collection: Collection) => void;
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
  onShowAbout,
  onAddToCollection,
  onRemoveFromCollection,
  onCreateCollection,
  onEditCollection,
  onDeleteCollection
}: DiagramListProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set());
  
  // Drag and drop state
  const [draggedDiagram, setDraggedDiagram] = useState<Diagram | null>(null);
  const [dragOverCollection, setDragOverCollection] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDragOverUncategorized, setIsDragOverUncategorized] = useState(false);



  // Group diagrams by collections and uncategorized
  const { collectionsWithDiagrams, uncategorizedDiagrams } = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    
    // Get all collections that either match the search or contain diagrams that match the search
    const collectionsWithDiagrams = collections.map(collection => {
      const collectionDiagrams = collection.diagramIds
        .map(id => diagrams.find(d => d.id === id))
        .filter(Boolean) as Diagram[];

      // Filter diagrams by search term
      const matchingDiagrams = searchTerm === '' ? collectionDiagrams : collectionDiagrams.filter(diagram =>
        diagram.name.toLowerCase().includes(searchLower)
      );

      // Include collection if it matches search or has matching diagrams
      const shouldInclude = searchTerm === '' || 
        collection.name.toLowerCase().includes(searchLower) ||
        collection.description?.toLowerCase().includes(searchLower) ||
        matchingDiagrams.length > 0;

      return {
        collection,
        diagrams: shouldInclude ? matchingDiagrams : [],
        shouldShow: shouldInclude
      };
    }).filter(item => item.shouldShow);

    // Get uncategorized diagrams (not in any collection)
    const uncategorized = diagrams.filter(diagram => 
      (!diagram.collectionIds || diagram.collectionIds.length === 0) &&
      (searchTerm === '' || diagram.name.toLowerCase().includes(searchLower))
    );

    return {
      collectionsWithDiagrams,
      uncategorizedDiagrams: uncategorized
    };
  }, [diagrams, collections, searchTerm]);

  // Auto-expand collections when searching
  useEffect(() => {
    if (searchTerm) {
      const collectionsToExpand = new Set<string>();
      collectionsWithDiagrams.forEach(({ collection, diagrams }) => {
        if (diagrams.length > 0) {
          collectionsToExpand.add(collection.id);
        }
      });
      setExpandedCollections(collectionsToExpand);
    } else {
      setExpandedCollections(new Set());
    }
  }, [searchTerm, collectionsWithDiagrams]);

  // Keyboard shortcut for search (Ctrl/Cmd + K)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Toggle collection expansion
  const toggleCollection = (collectionId: string) => {
    const newExpanded = new Set(expandedCollections);
    if (newExpanded.has(collectionId)) {
      newExpanded.delete(collectionId);
    } else {
      newExpanded.add(collectionId);
    }
    setExpandedCollections(newExpanded);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, diagram: Diagram) => {
    // Set data transfer
    e.dataTransfer.setData('text/plain', diagram.id);
    e.dataTransfer.effectAllowed = 'move';
    
    // Set state
    setDraggedDiagram(diagram);
    setIsDragging(true);
    
    // Create drag preview with diagram name
    const dragPreview = document.createElement('div');
    dragPreview.style.cssText = `
      position: absolute;
      top: -1000px;
      left: -1000px;
      background: #3B82F6;
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      font-family: Arial, sans-serif;
      font-size: 12px;
      font-weight: 500;
      white-space: nowrap;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
      pointer-events: none;
      z-index: 1000;
    `;
    dragPreview.textContent = diagram.name;
    document.body.appendChild(dragPreview);
    
    e.dataTransfer.setDragImage(dragPreview, 60, 20);
    
    // Clean up after a short delay
    setTimeout(() => {
      if (document.body.contains(dragPreview)) {
        document.body.removeChild(dragPreview);
      }
    }, 1);
  };

  const handleDragEnd = () => {
    setDraggedDiagram(null);
    setIsDragging(false);
    setDragOverCollection(null);
    setIsDragOverUncategorized(false);
  };

  const handleDragOver = (e: React.DragEvent, collectionId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (collectionId && draggedDiagram) {
      // Check if this would be a valid drop
      const isAlreadyInCollection = draggedDiagram.collectionIds?.includes(collectionId);
      const isValidDrop = !isAlreadyInCollection;
      
      // Auto-expand the collection when dragging over it
      if (!expandedCollections.has(collectionId)) {
        setExpandedCollections(prev => new Set([...prev, collectionId]));
      }
      
      e.dataTransfer.dropEffect = isValidDrop ? 'move' : 'none';
      setDragOverCollection(collectionId);
    }
  };

  const handleDrop = (e: React.DragEvent, collectionId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Try to get diagram ID from state first, then from data transfer
    const diagramId = draggedDiagram?.id || e.dataTransfer.getData('text/plain');
    
    if (diagramId) {
      // Find the diagram to check if it's already in this collection
      const diagram = diagrams.find(d => d.id === diagramId);
      
      if (diagram) {
        const isAlreadyInCollection = diagram.collectionIds?.includes(collectionId);
        
        if (!isAlreadyInCollection) {
          onAddToCollection(diagramId, collectionId);
        }
      }
    }
    
    setDraggedDiagram(null);
    setIsDragging(false);
    setDragOverCollection(null);
    setIsDragOverUncategorized(false);
  };

  const handleUncategorizedDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggedDiagram && draggedDiagram.collectionIds && draggedDiagram.collectionIds.length > 0) {
      setIsDragOverUncategorized(true);
    }
  };

  const handleUncategorizedDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const diagramId = draggedDiagram?.id || e.dataTransfer.getData('text/plain');
    
    if (diagramId && draggedDiagram) {
      // Remove diagram from all collections
      if (draggedDiagram.collectionIds && draggedDiagram.collectionIds.length > 0) {
        draggedDiagram.collectionIds.forEach(collectionId => {
          onRemoveFromCollection(diagramId, collectionId);
        });
      }
    }
    
    setDraggedDiagram(null);
    setIsDragging(false);
    setDragOverCollection(null);
    setIsDragOverUncategorized(false);
  };

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
      {/* Header with Search and Controls */}
      <div className="flex-shrink-0 space-y-2 sm:space-y-3 pb-2 sm:pb-3 border-b border-gray-600">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search diagrams and collections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-20 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-16 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-200 rounded-full hover:bg-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 translate-y-[-15px]">
            <kbd className="px-2 py-1 text-xs font-mono text-gray-400/70 bg-gray-800/30 border border-gray-600/30 rounded">
              {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}+K
            </kbd>
          </div>
        </div>

        {/* Drag and Drop Instructions */}
        <div className="text-center">
          <p className="text-xs text-gray-400">
            💡 <span className="font-medium">Tip:</span> Drag diagrams to collections to organize them
          </p>
        </div>

        {/* Import/Export Controls */}
        <div className="grid grid-cols-3 sm:flex sm:flex-row gap-2">
          <button
            onClick={handleImportClick}
            className="flex items-center justify-center gap-1 px-2 py-2 text-xs text-gray-300 hover:text-white bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            title="Import Diagrams"
          >
            <Upload className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">Import</span>
          </button>
          <button
            onClick={handleExportAll}
            className="flex items-center justify-center gap-1 px-2 py-2 text-xs text-gray-300 hover:text-white bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Export All Diagrams"
            disabled={diagrams.length === 0}
          >
            <Download className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">Export All</span>
          </button>
          <button
            onClick={onCreateCollection}
            className="flex items-center justify-center gap-1 px-2 py-2 text-xs text-gray-300 hover:text-white bg-purple-700 rounded-lg hover:bg-purple-600 transition-colors"
            title="Create New Collection"
          >
            <Plus className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">Collection</span>
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
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto min-h-0 py-2 custom-scrollbar">
        <div className="space-y-1">
          {/* Collections */}
          {collectionsWithDiagrams.map(({ collection, diagrams: collectionDiagrams }) => {
            const isExpanded = expandedCollections.has(collection.id);
            const iconName = (collection.icon?.split('-').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)).join('') || 'Folder') as keyof typeof LucideIcons;
            const IconComponent = (LucideIcons[iconName] || LucideIcons.Folder) as React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
            const isDragOver = dragOverCollection === collection.id;
            const isDraggingFromThisCollection = draggedDiagram && draggedDiagram.collectionIds?.includes(collection.id);
            const isValidDrop = isDragOver && !isDraggingFromThisCollection && draggedDiagram && 
              !draggedDiagram.collectionIds?.includes(collection.id);

            return (
              <div 
                key={collection.id} 
                className="border border-gray-600 rounded-lg transition-all duration-200"
              >
                {/* Collection Header - Now the main drop zone */}
                <div
                  className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
                    isValidDrop 
                      ? 'bg-blue-600/20 border-2 border-blue-400' 
                      : isDragOver && !isDraggingFromThisCollection && draggedDiagram?.collectionIds?.includes(collection.id)
                      ? 'bg-red-600/20 border-2 border-red-400'
                      : 'hover:bg-gray-700'
                  }`}
                  onClick={() => toggleCollection(collection.id)}
                  onDragEnter={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDragOver={(e) => {
                    handleDragOver(e, collection.id);
                  }}
                  onDragLeave={(e) => {
                    e.stopPropagation();
                    // Only clear drag over if we're actually leaving the collection header
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX;
                    const y = e.clientY;
                    
                    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
                      setDragOverCollection(null);
                    }
                  }}
                  onDrop={(e) => {
                    handleDrop(e, collection.id);
                  }}
                >
                  <div className={`flex items-center gap-3 ${isDragging ? 'pointer-events-none' : ''}`}>
                    <button className={`text-gray-400 ${isDragging ? 'pointer-events-none' : ''}`}>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    
                    <div 
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDragging ? 'pointer-events-none' : ''}`}
                      style={{ 
                        backgroundColor: collection.color + '20',
                        border: `1px solid ${collection.color}40`
                      }}
                    >
                      <IconComponent 
                        className="w-4 h-4" 
                        style={{ color: collection.color }} 
                      />
                    </div>
                    
                    <div className={isDragging ? 'pointer-events-none' : ''}>
                      <h3 className="font-medium text-gray-100">{collection.name}</h3>
                      <p className="text-sm text-gray-400">
                        {collectionDiagrams.length} diagram{collectionDiagrams.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <div className={`flex items-center gap-2 ${isDragging ? 'pointer-events-none' : ''}`}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditCollection(collection);
                      }}
                      className="text-gray-400 hover:text-gray-200 p-1"
                      title="Edit Collection"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteCollection(collection);
                      }}
                      className="text-gray-400 hover:text-red-400 p-1"
                      title="Delete Collection"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Drop zone indicator when dragging over collection */}
                {isDragOver && !isDraggingFromThisCollection && (
                  <div className={`px-3 py-2 border-t text-center ${
                    isValidDrop 
                      ? 'bg-blue-600/20 border-blue-400/30' 
                      : 'bg-red-600/20 border-red-400/30'
                  }`}>
                    <p className={`text-sm font-medium ${
                      isValidDrop ? 'text-blue-200' : 'text-red-200'
                    }`}>
                      {isValidDrop 
                        ? `Drop here to add to "${collection.name}"`
                        : `Already in "${collection.name}"`
                      }
                    </p>
                  </div>
                )}

                {/* Expanded Collection Content */}
                {isExpanded && (
                  <div className="border-t border-gray-600">
                    {collectionDiagrams.length === 0 ? (
                      <p className="text-sm text-gray-400 italic p-3">No diagrams in this collection</p>
                    ) : (
                      collectionDiagrams.map((diagram) => {
                        const diagramCollections = (diagram.collectionIds || [])
                          .map(id => collections.find(c => c.id === id))
                          .filter(Boolean) as Collection[];
                        const isBeingDragged = draggedDiagram?.id === diagram.id;

                        return (
                          <div
                            key={diagram.id}
                            draggable={true}
                            onDragStart={(e) => handleDragStart(e, diagram)}
                            onDragEnd={handleDragEnd}
                            className={`border-b border-gray-600 last:border-b-0 p-3 transition-all duration-200 ${
                              diagram.id === currentDiagramId
                                ? 'bg-blue-600/20'
                                : isBeingDragged
                                ? 'opacity-50 bg-gray-800'
                                : 'hover:bg-gray-700'
                            } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                          >
                            <div className="flex items-center justify-between">
                              <button
                                className="flex-1 text-left"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelect(diagram);
                                }}
                                onMouseDown={(e) => e.stopPropagation()}
                                onDragStart={(e) => e.stopPropagation()}
                              >
                                <h4 className={`font-medium text-sm ${diagram.id === currentDiagramId ? 'text-blue-100' : 'text-gray-100'}`}>
                                  {diagram.name}
                                </h4>
                                <p className={`text-xs ${diagram.id === currentDiagramId ? 'text-blue-200' : 'text-gray-400'}`}>
                                  Updated {new Date(diagram.updatedAt).toLocaleDateString()}
                                </p>
                              </button>

                              <div className="flex items-center gap-2">
                                {/* Collection badges for multi-collection diagrams */}
                                {diagramCollections.length > 1 && (
                                  <div className="flex items-center gap-1">
                                    {diagramCollections
                                      .filter(col => col.id !== collection.id)
                                      .slice(0, 2)
                                      .map(otherCollection => (
                                        <CollectionBadge
                                          key={otherCollection.id}
                                          collection={otherCollection}
                                          size="sm"
                                        />
                                      ))
                                    }
                                    {diagramCollections.length > 3 && (
                                      <span className="text-xs text-gray-400">
                                        +{diagramCollections.length - 3}
                                      </span>
                                    )}
                                  </div>
                                )}

                                <DiagramDropdown
                                  diagram={diagram}
                                  collections={collections}
                                  isCurrentDiagram={diagram.id === currentDiagramId}
                                  onShare={onShare}
                                  onExport={onExportSingle}
                                  onRename={onRename}
                                  onDelete={onDelete}
                                  onAddToCollection={onAddToCollection}
                                  onRemoveFromCollection={onRemoveFromCollection}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Uncategorized Diagrams - Show when there are uncategorized diagrams OR when dragging from collections */}
          {(uncategorizedDiagrams.length > 0 || (isDragging && draggedDiagram && draggedDiagram.collectionIds && draggedDiagram.collectionIds.length > 0)) && (
            <div 
              className={`border border-gray-600 rounded-lg transition-all duration-200 ${
                isDragOverUncategorized ? 'bg-blue-600/10 border-blue-400 border-2' : ''
              }`}
              onDragOver={handleUncategorizedDragOver}
              onDragLeave={(e) => {
                e.stopPropagation();
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX;
                const y = e.clientY;
                
                if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
                  setIsDragOverUncategorized(false);
                }
              }}
              onDrop={handleUncategorizedDrop}
            >
              <div className="flex items-center justify-between p-3 cursor-default">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Uncategorized</span>
                  <span className="text-xs text-gray-500">({uncategorizedDiagrams.length})</span>
                </div>
              </div>
              
              {/* Drop zone indicator when dragging over uncategorized */}
              {isDragOverUncategorized && (
                <div className="px-3 py-2 border-t bg-blue-600/20 border-blue-400/30">
                  <p className="text-sm font-medium text-blue-200 text-center">
                    Drop here to remove from collections
                  </p>
                </div>
              )}
              {uncategorizedDiagrams.length > 0 && (
                <div className="border-t border-gray-600">
                  {uncategorizedDiagrams.map((diagram) => {
                  const diagramCollections = (diagram.collectionIds || [])
                    .map(id => collections.find(c => c.id === id))
                    .filter(Boolean) as Collection[];
                  const isBeingDragged = draggedDiagram?.id === diagram.id;

                  return (
                    <div
                      key={diagram.id}
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, diagram)}
                      onDragEnd={handleDragEnd}
                      className={`border-b border-gray-600 last:border-b-0 p-3 transition-all duration-200 ${
                        diagram.id === currentDiagramId
                          ? 'bg-blue-600/20'
                          : isBeingDragged
                          ? 'opacity-50 bg-gray-800'
                          : 'hover:bg-gray-700'
                      } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                    >
                      <div className="flex items-center justify-between">
                        <button
                          className="flex-1 text-left"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelect(diagram);
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                          onDragStart={(e) => e.stopPropagation()}
                        >
                          <h4 className={`font-medium text-sm ${diagram.id === currentDiagramId ? 'text-blue-100' : 'text-gray-100'}`}>
                            {diagram.name}
                          </h4>
                          <p className={`text-xs ${diagram.id === currentDiagramId ? 'text-blue-200' : 'text-gray-400'}`}>
                            Updated {new Date(diagram.updatedAt).toLocaleDateString()}
                          </p>
                        </button>
                        
                        <DiagramDropdown
                          diagram={diagram}
                          collections={collections}
                          isCurrentDiagram={diagram.id === currentDiagramId}
                          onShare={onShare}
                          onExport={onExportSingle}
                          onRename={onRename}
                          onDelete={onDelete}
                          onAddToCollection={onAddToCollection}
                          onRemoveFromCollection={onRemoveFromCollection}
                        />
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
                  })}
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {diagrams.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              <p>No diagrams yet</p>
              <p className="text-sm mt-1">Create your first diagram or import existing ones</p>
            </div>
          )}

          {/* No Search Results */}
          {diagrams.length > 0 && collectionsWithDiagrams.length === 0 && uncategorizedDiagrams.length === 0 && searchTerm && (
            <div className="text-center text-gray-400 py-8">
              <p>No results found for "{searchTerm}"</p>
              <button
                onClick={() => setSearchTerm('')}
                className="mt-2 text-blue-400 hover:text-blue-300 text-sm"
              >
                Clear search
              </button>
            </div>
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

      {/* About Button - Fixed at bottom */}
      <div className="mt-4 pt-3 border-t border-gray-600 flex-shrink-0">
        <button
          onClick={onShowAbout}
          className="w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-gray-400 hover:text-gray-200 hover:bg-gray-600"
          title="About the Author"
        >
          <Info className="w-4 h-4 text-blue-400" />
          <span className="text-sm">About the Author</span>
        </button>
      </div>
    </div>
  );
}
