import React from 'react';
import { Diagram } from '../services/DiagramStorage';
import { Pencil, Trash2 } from 'lucide-react';

interface DiagramListProps {
  diagrams: Diagram[];
  onSelect: (diagram: Diagram) => void;
  onDelete: (id: string) => void;
  onRename: (diagram: Diagram) => void;
}

export default function DiagramList({ diagrams, onSelect, onDelete, onRename }: DiagramListProps) {
  return (
    <div className="space-y-2">
      {diagrams.map((diagram) => (
        <div
          key={diagram.id}
          className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm hover:bg-gray-50"
        >
          <button
            className="flex-1 text-left"
            onClick={() => onSelect(diagram)}
          >
            <h3 className="font-medium text-gray-900">{diagram.name}</h3>
            <p className="text-sm text-gray-500">
              Updated {new Date(diagram.updatedAt).toLocaleDateString()}
            </p>
          </button>
          <div className="flex space-x-2">
            <button
              onClick={() => onRename(diagram)}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(diagram.id)}
              className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
