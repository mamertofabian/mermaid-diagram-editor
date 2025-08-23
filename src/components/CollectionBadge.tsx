import React from 'react';
import { X } from 'lucide-react';
import { Collection } from '../services/DiagramStorage';

interface CollectionBadgeProps {
  collection: Collection;
  size?: 'sm' | 'md' | 'lg';
  showRemove?: boolean;
  onRemove?: () => void;
  className?: string;
}

export default function CollectionBadge({ 
  collection, 
  size = 'sm', 
  showRemove = false, 
  onRemove,
  className = '' 
}: CollectionBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove?.();
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium transition-colors ${sizeClasses[size]} ${className}`}
      style={{
        backgroundColor: collection.color + '20',
        color: collection.color,
        border: `1px solid ${collection.color}40`
      }}
      title={collection.description || collection.name}
    >
      <span className="truncate max-w-20">{collection.name}</span>
      {showRemove && onRemove && (
        <button
          onClick={handleRemove}
          className="ml-1 p-0.5 rounded-full hover:bg-black/10 transition-colors"
          title={`Remove from ${collection.name}`}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}