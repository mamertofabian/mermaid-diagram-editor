import React, { useState, useMemo } from 'react';
import { Plus, Search, Grid3x3, List, ChevronDown, ChevronRight, FolderOpen, X } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Collection, Diagram } from '../services/DiagramStorage';
import CollectionCard from './CollectionCard';
import CollectionBadge from './CollectionBadge';
import ConfirmModal from './ConfirmModal';

interface CollectionManagerProps {
  collections: Collection[];
  diagrams: Diagram[];
  currentDiagramId?: string;
  onCreateCollection: () => void;
  onEditCollection: (collection: Collection) => void;
  onDeleteCollection: (collection: Collection) => void;
  onSelectDiagram: (diagram: Diagram) => void;
  onRemoveDiagramFromCollection: (collectionId: string, diagramId: string) => void;
}

type ViewMode = 'grid' | 'list';
type SortBy = 'name' | 'updated' | 'created' | 'size';

export default function CollectionManager({
  collections,
  diagrams,
  currentDiagramId,
  onCreateCollection,
  onEditCollection,
  onDeleteCollection,
  onSelectDiagram,
  onRemoveDiagramFromCollection,
}: CollectionManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('updated');
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set());
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    collection: Collection | null;
  }>({ isOpen: false, collection: null });

  // Filter and sort collections
  const filteredAndSortedCollections = useMemo(() => {
    const filtered = collections.filter(collection =>
      collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collection.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created':
          return b.createdAt - a.createdAt;
        case 'size':
          return b.diagramIds.length - a.diagramIds.length;
        case 'updated':
        default:
          return b.updatedAt - a.updatedAt;
      }
    });
  }, [collections, searchTerm, sortBy]);

  // Get diagrams for a collection
  const getDiagramsForCollection = (collection: Collection): Diagram[] => {
    return collection.diagramIds
      .map(id => diagrams.find(d => d.id === id))
      .filter(Boolean) as Diagram[];
  };

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

  // Handle collection deletion
  const handleDeleteClick = (collection: Collection) => {
    setDeleteModal({ isOpen: true, collection });
  };

  const handleDeleteConfirm = () => {
    if (deleteModal.collection) {
      onDeleteCollection(deleteModal.collection);
      setDeleteModal({ isOpen: false, collection: null });
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 space-y-3 pb-3 border-b border-gray-600">
        {/* Title and Create Button */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-100">Collections</h2>
          <button
            onClick={onCreateCollection}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-300 hover:text-white bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            title="Create New Collection"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search collections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-8 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-gray-100"
            >
              <option value="updated">Last Updated</option>
              <option value="name">Name</option>
              <option value="created">Created</option>
              <option value="size">Size</option>
            </select>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded ${
                viewMode === 'grid' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded ${
                viewMode === 'list' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Collections List */}
      <div className="flex-1 overflow-y-auto py-3">
        {filteredAndSortedCollections.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            {collections.length === 0 ? (
              <div>
                <FolderOpen className="w-12 h-12 mx-auto mb-3 text-gray-500" />
                <p className="text-lg mb-2">No collections yet</p>
                <p className="text-sm">Create your first collection to organize diagrams</p>
                <button
                  onClick={onCreateCollection}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
                >
                  Create Collection
                </button>
              </div>
            ) : (
              <div>
                <p>No collections match your search</p>
                <button
                  onClick={clearSearch}
                  className="mt-2 text-blue-400 hover:text-blue-300 text-sm"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            {filteredAndSortedCollections.map((collection) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                diagramCount={collection.diagramIds.length}
                isSelected={selectedCollection === collection.id}
                onSelect={(col) => setSelectedCollection(col.id)}
                onEdit={onEditCollection}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredAndSortedCollections.map((collection) => {
              const collectionDiagrams = getDiagramsForCollection(collection);
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
                          {collection.diagramIds.length} diagram{collection.diagramIds.length !== 1 ? 's' : ''}
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
                        <LucideIcons.Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(collection);
                        }}
                        className="text-gray-400 hover:text-red-400 p-1"
                        title="Delete Collection"
                      >
                        <LucideIcons.Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Collection Content */}
                  {isExpanded && (
                    <div className="border-t border-gray-600 p-3 space-y-2">
                      {collectionDiagrams.length === 0 ? (
                        <p className="text-sm text-gray-400 italic">No diagrams in this collection</p>
                      ) : (
                        collectionDiagrams.map((diagram) => (
                          <div
                            key={diagram.id}
                            className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                              diagram.id === currentDiagramId
                                ? 'bg-blue-600'
                                : 'hover:bg-gray-600'
                            }`}
                            onClick={() => onSelectDiagram(diagram)}
                          >
                            <div>
                              <h4 className="font-medium text-gray-100 text-sm">{diagram.name}</h4>
                              <p className="text-xs text-gray-400">
                                Updated {new Date(diagram.updatedAt).toLocaleDateString()}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {diagram.collectionIds && diagram.collectionIds.length > 1 && (
                                <div className="flex items-center gap-1">
                                  {diagram.collectionIds
                                    .filter(id => id !== collection.id)
                                    .slice(0, 2)
                                    .map(id => {
                                      const otherCollection = collections.find(c => c.id === id);
                                      if (!otherCollection) return null;
                                      return (
                                        <CollectionBadge
                                          key={id}
                                          collection={otherCollection}
                                          size="sm"
                                        />
                                      );
                                    })
                                  }
                                  {diagram.collectionIds.length > 3 && (
                                    <span className="text-xs text-gray-400">
                                      +{diagram.collectionIds.length - 3} more
                                    </span>
                                  )}
                                </div>
                              )}
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRemoveDiagramFromCollection(collection.id, diagram.id);
                                }}
                                className="text-gray-400 hover:text-red-400 p-1"
                                title="Remove from collection"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Collection"
        message={`Are you sure you want to delete "${deleteModal.collection?.name}"? This action cannot be undone. Diagrams in this collection will not be deleted.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModal({ isOpen: false, collection: null })}
        variant="danger"
      />
    </div>
  );
}