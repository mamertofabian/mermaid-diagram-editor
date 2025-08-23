import React, { useState } from 'react';
import { X, FileText } from 'lucide-react';
import { DIAGRAM_TEMPLATES, TEMPLATE_CATEGORIES, getTemplatesByCategory, type DiagramTemplate } from '../data/templates';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: DiagramTemplate) => void;
}

export default function TemplatesModal({ isOpen, onClose, onSelectTemplate }: TemplatesModalProps) {
  const [selectedCategory, setSelectedCategory] = useState(TEMPLATE_CATEGORIES[0]);

  if (!isOpen) return null;

  const filteredTemplates = getTemplatesByCategory(selectedCategory);

  const handleSelectTemplate = (template: DiagramTemplate) => {
    onSelectTemplate(template);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-100">Diagram Templates</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 gap-6 overflow-hidden">
          {/* Categories Sidebar */}
          <div className="w-48 flex-shrink-0">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Categories</h3>
            <div className="space-y-1">
              {TEMPLATE_CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-gray-100'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Templates Grid */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors cursor-pointer group"
                  onClick={() => handleSelectTemplate(template)}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="text-2xl">{template.icon}</div>
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-gray-100 group-hover:text-blue-300">
                        {template.name}
                      </h4>
                      <p className="text-sm text-gray-400 mt-1">
                        {template.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Code Preview */}
                  <div className="bg-gray-800 rounded p-3 mt-3">
                    <pre className="text-xs text-gray-300 overflow-hidden">
                      {template.code.split('\n').slice(0, 4).join('\n')}
                      {template.code.split('\n').length > 4 && '\n...'}
                    </pre>
                  </div>
                  
                  <div className="mt-3 text-right">
                    <span className="text-xs px-2 py-1 bg-blue-600 text-white rounded">
                      Use Template
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-600">
          <p className="text-xs text-gray-400 text-center">
            Select a template to create a new diagram with pre-built code
          </p>
        </div>
      </div>
    </div>
  );
}