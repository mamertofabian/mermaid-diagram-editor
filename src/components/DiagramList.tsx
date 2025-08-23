import React, { useRef, useState, useMemo } from 'react';
import { Diagram, Collection } from '../services/DiagramStorage';
import { Download, Upload, HelpCircle, Info, ExternalLink, Calendar, Youtube, Github, BookOpen, Plus, Search, ChevronDown, ChevronRight, X, Edit3, Trash2 } from 'lucide-react';
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
  onAddToCollection,
  onRemoveFromCollection,
  onCreateCollection,
  onEditCollection,
  onDeleteCollection
}: DiagramListProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set());

  // Group diagrams by collections and uncategorized
  const { collectionsWithDiagrams, uncategorizedDiagrams } = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    
    // Filter collections by search
    const filtered = collections.filter(collection =>
      collection.name.toLowerCase().includes(searchLower) ||
      collection.description?.toLowerCase().includes(searchLower)
    );

    // Get diagrams for collections (only visible if collection matches search or diagram matches search)
    const collectionsWithDiagrams = filtered.map(collection => {
      const collectionDiagrams = collection.diagramIds
        .map(id => diagrams.find(d => d.id === id))
        .filter(Boolean)
        .filter(diagram => 
          searchTerm === '' || 
          diagram!.name.toLowerCase().includes(searchLower) ||
          collection.name.toLowerCase().includes(searchLower)
        ) as Diagram[];

      return {
        collection,
        diagrams: collectionDiagrams
      };
    }).filter(item => item.diagrams.length > 0 || collection.name.toLowerCase().includes(searchLower));

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
      <div className="flex-shrink-0 space-y-3 pb-3 border-b border-gray-600">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search diagrams and collections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-8 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Import/Export Controls */}
        <div className="flex gap-2">
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
          <button
            onClick={onCreateCollection}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white bg-purple-700 rounded-lg hover:bg-purple-600 transition-colors"
            title="Create New Collection"
          >
            <Plus className="w-4 h-4" />
            Collection
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
      <div className="flex-1 overflow-y-auto min-h-0 py-2">
        <div className="space-y-1">
          {/* Collections */}
          {collectionsWithDiagrams.map(({ collection, diagrams: collectionDiagrams }) => {
            const isExpanded = expandedCollections.has(collection.id);
            const iconName = (collection.icon?.split('-').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)).join('') || 'Folder') as keyof typeof LucideIcons;
            const IconComponent = LucideIcons[iconName] || LucideIcons.Folder;

            return (
              <div key={collection.id} className="border border-gray-600 rounded-lg">
                {/* Collection Header */}
                <div
                  className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-700 transition-colors"
                  onClick={() => toggleCollection(collection.id)}
                >
                  <div className="flex items-center gap-3">
                    <button className="text-gray-400">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
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
                    
                    <div>
                      <h3 className="font-medium text-gray-100">{collection.name}</h3>
                      <p className="text-sm text-gray-400">
                        {collectionDiagrams.length} diagram{collectionDiagrams.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
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

                        return (
                          <div
                            key={diagram.id}
                            className={`border-b border-gray-600 last:border-b-0 p-3 transition-colors ${
                              diagram.id === currentDiagramId
                                ? 'bg-blue-600/20'
                                : 'hover:bg-gray-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <button
                                className="flex-1 text-left"
                                onClick={() => onSelect(diagram)}
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

          {/* Uncategorized Diagrams */}
          {uncategorizedDiagrams.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center gap-2 px-2 py-2 text-sm text-gray-400 border-b border-gray-600">
                <span>Uncategorized</span>
                <span className="text-xs">({uncategorizedDiagrams.length})</span>
              </div>
              <div className="space-y-1 mt-2">
                {uncategorizedDiagrams.map((diagram) => {
                  const diagramCollections = (diagram.collectionIds || [])
                    .map(id => collections.find(c => c.id === id))
                    .filter(Boolean) as Collection[];

                  return (
                    <div
                      key={diagram.id}
                      className={`p-3 rounded-lg transition-colors ${
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
