import React from 'react';
import { MoreVertical, Edit3, Trash2, FolderOpen } from 'lucide-react';
import { Collection } from '../services/DiagramStorage';
import * as LucideIcons from 'lucide-react';

interface CollectionCardProps {
  collection: Collection;
  diagramCount: number;
  isSelected?: boolean;
  onSelect: (collection: Collection) => void;
  onEdit: (collection: Collection) => void;
  onDelete: (collection: Collection) => void;
  className?: string;
}

export default function CollectionCard({ 
  collection, 
  diagramCount, 
  isSelected = false, 
  onSelect, 
  onEdit, 
  onDelete,
  className = '' 
}: CollectionCardProps) {
  const [showMenu, setShowMenu] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Get the icon component dynamically
  const iconName = (collection.icon?.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)).join('') || 'Folder') as keyof typeof LucideIcons;
  const IconComponent = LucideIcons[iconName] || LucideIcons.Folder;

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCardClick = () => {
    onSelect(collection);
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(collection);
    setShowMenu(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(collection);
    setShowMenu(false);
  };

  return (
    <div 
      className={`relative group cursor-pointer rounded-xl p-4 transition-all duration-200 hover:scale-105 ${
        isSelected 
          ? 'ring-2 ring-blue-400 shadow-lg' 
          : 'hover:shadow-lg'
      } ${className}`}
      style={{
        background: `linear-gradient(135deg, ${collection.color}15, ${collection.color}08)`,
        borderColor: collection.color + '30'
      }}
      onClick={handleCardClick}
    >
      {/* Header with Icon and Menu */}
      <div className="flex items-start justify-between mb-3">
        <div 
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ 
            backgroundColor: collection.color + '20',
            border: `2px solid ${collection.color}40`
          }}
        >
          <IconComponent 
            className="w-6 h-6" 
            style={{ color: collection.color }} 
          />
        </div>
        
        <div className="relative" ref={menuRef}>
          <button
            onClick={handleMenuClick}
            className="p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-gray-700 transition-all"
          >
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-8 bg-gray-800 border border-gray-600 rounded-lg shadow-lg py-1 min-w-32 z-10">
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-300 hover:text-red-200 hover:bg-gray-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Collection Info */}
      <div className="mb-3">
        <h3 className="font-semibold text-gray-100 text-lg mb-1 truncate">
          {collection.name}
        </h3>
        {collection.description && (
          <p className="text-sm text-gray-400 line-clamp-2">
            {collection.description}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-sm text-gray-400">
          <FolderOpen className="w-4 h-4" />
          <span>{diagramCount} diagram{diagramCount !== 1 ? 's' : ''}</span>
        </div>
        
        <div className="text-xs text-gray-500">
          {new Date(collection.updatedAt).toLocaleDateString()}
        </div>
      </div>

      {/* Hover Effect */}
      <div 
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none"
        style={{ backgroundColor: collection.color }}
      />
    </div>
  );
}