import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Share, FileDown, Edit3, Trash2, FolderPlus } from 'lucide-react';
import { Diagram, Collection } from '../services/DiagramStorage';
import { createPortal } from 'react-dom';

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
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, showAbove: false });
  const [submenuPosition, setSubmenuPosition] = useState({ showLeft: true, top: 0, left: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Calculate optimal dropdown position
  const calculateDropdownPosition = () => {
    if (!buttonRef.current) return;

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const dropdownHeight = 280; // Approximate dropdown height
    const dropdownWidth = 192; // min-w-48 = 192px

    // Check if there's enough space below the button
    const spaceBelow = viewportHeight - buttonRect.bottom;
    const spaceAbove = buttonRect.top;
    const showAbove = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

    const top = showAbove ? buttonRect.top - 8 : buttonRect.bottom + 8;
    let left = Math.min(buttonRect.right - dropdownWidth, viewportWidth - dropdownWidth - 8);

    // Ensure left position doesn't go off screen
    if (left < 8) left = 8;

    setDropdownPosition({ top, left, showAbove });
  };

  // Calculate submenu position
  const calculateSubmenuPosition = () => {
    // Use setTimeout to ensure dropdown is rendered before calculating submenu position
    setTimeout(() => {
      if (!dropdownRef.current) return;

      const viewportWidth = window.innerWidth;
      const submenuWidth = 208; // 192px + 16px margin

      // Find the Collections button within the dropdown to align submenu with it
      const collectionsButton = dropdownRef.current.querySelector('[data-collections-button]');
      
      if (!collectionsButton) return;

      const buttonRect = (collectionsButton as HTMLElement).getBoundingClientRect();
      
      // Position submenu next to the collections button
      const showLeft = viewportWidth - buttonRect.right < submenuWidth;
      
      // Align submenu vertically with the Collections button
      // The submenu should be aligned with the top of the button for perfect alignment
      // Subtract 4px to account for the submenu's top padding (py-1 = 4px top)
      const submenuTop = buttonRect.top - 4;
      const submenuLeft = showLeft ? buttonRect.left - submenuWidth : buttonRect.right;

      setSubmenuPosition({
        showLeft,
        top: submenuTop,
        left: submenuLeft
      });
    }, 0);
  };

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
    if (!isOpen) {
      calculateDropdownPosition();
    }
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
    if (!showCollectionMenu) {
      calculateSubmenuPosition();
    }
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

  // Dropdown content to be rendered in portal
  const dropdownContent = (
    <div
      ref={dropdownRef}
      className="fixed bg-gray-800 border border-gray-600 rounded-lg shadow-lg py-1 min-w-48 z-50"
      style={{
        top: dropdownPosition.top,
        left: dropdownPosition.left,
        transform: dropdownPosition.showAbove ? 'translateY(-100%)' : 'none'
      }}
    >
          {/* Collections submenu */}
          <div className="relative">
            <button
              data-collections-button
              onClick={handleCollectionToggle}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Collections</span>
              <span className="ml-auto text-xs">›</span>
            </button>

            {showCollectionMenu && (
              <div
                className="fixed bg-gray-800 border border-gray-600 rounded-lg shadow-lg py-1 min-w-48 max-h-60 overflow-y-auto z-50"
                style={{
                  top: submenuPosition.top,
                  left: submenuPosition.left,
                  transform: dropdownPosition.showAbove ? 'translateY(-100%)' : 'none'
                }}
              >
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
  );

  return (
    <div className="relative">
      <button
        ref={buttonRef}
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

      {isOpen && createPortal(dropdownContent, document.body)}
    </div>
  );
}