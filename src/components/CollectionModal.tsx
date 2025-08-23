import React, { useState, useEffect } from 'react';
import { X, Folder, FolderOpen, Star, Heart, Bookmark, Archive, Briefcase, Home, User, Users, Settings, Code, FileText, Image, Music, Video, Coffee, BookOpen, Lightbulb, Target, Trophy, Gamepad2, Palette } from 'lucide-react';
import { Collection } from '../services/DiagramStorage';

interface CollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { name: string; description?: string; color?: string; icon?: string }) => void;
  collection?: Collection; // For editing existing collection
}

const COLLECTION_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6B7280', // Gray
];

const COLLECTION_ICONS = [
  { name: 'folder', icon: Folder, label: 'Folder' },
  { name: 'folder-open', icon: FolderOpen, label: 'Open Folder' },
  { name: 'star', icon: Star, label: 'Star' },
  { name: 'heart', icon: Heart, label: 'Heart' },
  { name: 'bookmark', icon: Bookmark, label: 'Bookmark' },
  { name: 'archive', icon: Archive, label: 'Archive' },
  { name: 'briefcase', icon: Briefcase, label: 'Work' },
  { name: 'home', icon: Home, label: 'Home' },
  { name: 'user', icon: User, label: 'Personal' },
  { name: 'users', icon: Users, label: 'Team' },
  { name: 'settings', icon: Settings, label: 'Settings' },
  { name: 'code', icon: Code, label: 'Code' },
  { name: 'file-text', icon: FileText, label: 'Documents' },
  { name: 'image', icon: Image, label: 'Images' },
  { name: 'music', icon: Music, label: 'Music' },
  { name: 'video', icon: Video, label: 'Video' },
  { name: 'coffee', icon: Coffee, label: 'Coffee' },
  { name: 'book-open', icon: BookOpen, label: 'Learning' },
  { name: 'lightbulb', icon: Lightbulb, label: 'Ideas' },
  { name: 'target', icon: Target, label: 'Goals' },
  { name: 'trophy', icon: Trophy, label: 'Achievements' },
  { name: 'gamepad-2', icon: Gamepad2, label: 'Games' },
  { name: 'palette', icon: Palette, label: 'Design' },
];

export default function CollectionModal({ isOpen, onClose, onConfirm, collection }: CollectionModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState('#3B82F6');
  const [selectedIcon, setSelectedIcon] = useState('folder');

  useEffect(() => {
    if (collection) {
      setName(collection.name);
      setDescription(collection.description || '');
      setSelectedColor(collection.color || '#3B82F6');
      setSelectedIcon(collection.icon || 'folder');
    } else {
      setName('');
      setDescription('');
      setSelectedColor('#3B82F6');
      setSelectedIcon('folder');
    }
  }, [collection, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onConfirm({
        name: name.trim(),
        description: description.trim() || undefined,
        color: selectedColor,
        icon: selectedIcon,
      });
      if (!collection) {
        setName('');
        setDescription('');
        setSelectedColor('#3B82F6');
        setSelectedIcon('folder');
      }
      onClose();
    }
  };

  if (!isOpen) return null;

  const SelectedIconComponent = COLLECTION_ICONS.find(icon => icon.name === selectedIcon)?.icon || Folder;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-100">
            {collection ? 'Edit Collection' : 'Create New Collection'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Preview Section */}
          <div className="mb-6 p-4 bg-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: selectedColor + '20', border: `2px solid ${selectedColor}` }}
              >
                <SelectedIconComponent 
                  className="w-5 h-5" 
                  style={{ color: selectedColor }} 
                />
              </div>
              <div>
                <h3 className="font-medium text-gray-100">{name || 'Collection Name'}</h3>
                <p className="text-sm text-gray-400">{description || 'Optional description'}</p>
              </div>
            </div>
          </div>

          {/* Name Field */}
          <div className="mb-4">
            <label htmlFor="collectionName" className="block text-sm font-medium text-gray-300 mb-2">
              Collection Name *
            </label>
            <input
              type="text"
              id="collectionName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Enter collection name"
              autoFocus={!collection}
            />
          </div>

          {/* Description Field */}
          <div className="mb-4">
            <label htmlFor="collectionDescription" className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              id="collectionDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              placeholder="Optional description for this collection"
            />
          </div>

          {/* Color Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {COLLECTION_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    selectedColor === color 
                      ? 'border-white scale-110' 
                      : 'border-gray-600 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Icon Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Icon
            </label>
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-48 overflow-y-auto p-2 bg-gray-700 rounded-lg">
              {COLLECTION_ICONS.map((iconData) => {
                const IconComponent = iconData.icon;
                return (
                  <button
                    key={iconData.name}
                    type="button"
                    onClick={() => setSelectedIcon(iconData.name)}
                    className={`p-2 rounded-lg transition-colors ${
                      selectedIcon === iconData.name
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-600'
                    }`}
                    title={iconData.label}
                  >
                    <IconComponent className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {collection ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}