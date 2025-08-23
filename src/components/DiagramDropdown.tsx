import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Share, FileDown, Edit3, Trash2, FolderPlus } from 'lucide-react';
import { Diagram, Collection } from '../services/DiagramStorage';

interface DiagramDropdownProps {
  diagram: Diagram;
  collections: Collection[];
  isCurrentDiagram?: boolean;
  onShare: (diagram: Diagram) => void;
  onExport: (diagram: Diagram) => void;
  onRename: (diagram: Diagram) => void;
  onDelete: (diagramId: string) => void;
  onAddToCollection: (diagramId: string, collectionId: string) => void;
  onRemoveFromCollection: (diagramId: string, collectionId: string) => void;
}

export default function DiagramDropdown({
  diagram,
  collections,
  isCurrentDiagram = false,
  onShare,
  onExport,
  onRename,
  onDelete,
  onAddToCollection,
  onRemoveFromCollection,
}: DiagramDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCollectionMenu, setShowCollectionMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowCollectionMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
    setShowCollectionMenu(false);
  };

  const handleActionClick = (action: () => void) => {
    action();
    setIsOpen(false);
    setShowCollectionMenu(false);
  };

  const handleCollectionToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowCollectionMenu(!showCollectionMenu);
  };

  const handleCollectionAction = (collectionId: string) => {
    const isInCollection = diagram.collectionIds?.includes(collectionId);
    if (isInCollection) {
      onRemoveFromCollection(diagram.id, collectionId);
    } else {
      onAddToCollection(diagram.id, collectionId);
    }
    setIsOpen(false);
    setShowCollectionMenu(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleMenuClick}
        className={`p-2 rounded-full transition-colors ${
          isCurrentDiagram
            ? 'text-blue-100 hover:text-white hover:bg-blue-500'
            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-600'
        }`}
        title="More actions"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-10 bg-gray-800 border border-gray-600 rounded-lg shadow-lg py-1 min-w-48 z-30">
          {/* Collections submenu */}
          <div className="relative">
            <button
              onClick={handleCollectionToggle}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Collections</span>
              <span className="ml-auto text-xs">›</span>
            </button>

            {showCollectionMenu && (
              <div className="absolute left-full top-0 ml-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg py-1 min-w-48 max-h-60 overflow-y-auto">
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
                        onClick={() => handleCollectionAction(collection.id)}
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
                          <span className="text-xs ml-auto">✓</span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>

          <hr className="border-gray-600 my-1" />

          <button
            onClick={() => handleActionClick(() => onShare(diagram))}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
          >
            <Share className="w-4 h-4" />
            <span>Share</span>
          </button>

          <button
            onClick={() => handleActionClick(() => onExport(diagram))}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
          >
            <FileDown className="w-4 h-4" />
            <span>Export</span>
          </button>

          <button
            onClick={() => handleActionClick(() => onRename(diagram))}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            <span>Rename</span>
          </button>

          <hr className="border-gray-600 my-1" />

          <button
            onClick={() => handleActionClick(() => onDelete(diagram.id))}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-300 hover:text-red-200 hover:bg-gray-700 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
}