import { useState, useEffect, useRef } from 'react';
import { X, FileText, ChevronDown, Eye } from 'lucide-react';
import { TEMPLATE_CATEGORIES, getTemplatesByCategory, type DiagramTemplate } from '../data/templates';
import mermaid from 'mermaid';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: DiagramTemplate) => void;
}

export default function TemplatesModal({ isOpen, onClose, onSelectTemplate }: TemplatesModalProps) {
  const [selectedCategory, setSelectedCategory] = useState(TEMPLATE_CATEGORIES[0]);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<DiagramTemplate | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const filteredTemplates = getTemplatesByCategory(selectedCategory);

  // Set the first template as preview when category changes or modal opens
  useEffect(() => {
    if (isOpen && filteredTemplates.length > 0) {
      setPreviewTemplate(filteredTemplates[0]);
    }
  }, [isOpen, filteredTemplates]);

  // Effect to render Mermaid diagram when preview template changes
  useEffect(() => {
    if (isOpen && previewTemplate && previewRef.current) {
      const renderDiagram = async () => {
        try {
          // Clear previous content
          previewRef.current!.innerHTML = '';
          
          // Generate unique ID for this diagram
          const id = `mermaid-preview-${Date.now()}`;
          
          // Render the diagram
          const { svg } = await mermaid.render(id, previewTemplate.code);
          
          // Create a container div for better control
          const container = document.createElement('div');
          container.innerHTML = svg;
          
          // Get the SVG element and make it responsive
          const svgElement = container.querySelector('svg');
          if (svgElement) {
            // Remove fixed width and height
            svgElement.removeAttribute('width');
            svgElement.removeAttribute('height');
            // Add responsive attributes
            svgElement.setAttribute('width', '100%');
            svgElement.setAttribute('height', '100%');
            svgElement.style.maxWidth = '100%';
            svgElement.style.maxHeight = '100%';
            svgElement.style.objectFit = 'contain';
          }
          
          previewRef.current!.appendChild(container);
        } catch (error) {
          console.error('Failed to render Mermaid diagram:', error);
          previewRef.current!.innerHTML = `
            <div class="flex items-center justify-center h-full text-gray-400">
              <div class="text-center">
                <div class="text-2xl mb-2">⚠️</div>
                <div class="text-sm">Failed to render diagram</div>
              </div>
            </div>
          `;
        }
      };
      
      renderDiagram();
    }
  }, [isOpen, previewTemplate]);

  const handleSelectTemplate = (template: DiagramTemplate) => {
    onSelectTemplate(template);
    onClose();
  };

  const handleTemplateHover = (template: DiagramTemplate) => {
    setPreviewTemplate(template);
  };

  const toggleCategoryDropdown = () => {
    setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl w-full max-w-5xl xl:max-w-7xl 2xl:max-w-[90vw] max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-100">Diagram Templates</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Category Selector */}
        <div className="block sm:hidden p-4 border-b border-gray-700">
          <div className="relative">
            <button
              onClick={toggleCategoryDropdown}
              className="w-full flex items-center justify-between bg-gray-700 text-gray-100 px-4 py-3 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <span className="text-sm font-medium">{selectedCategory}</span>
              <ChevronDown 
                className={`w-4 h-4 transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} 
              />
            </button>
            
            {isCategoryDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-gray-700 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                {TEMPLATE_CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setIsCategoryDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-gray-600 first:rounded-t-lg last:rounded-b-lg ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:text-gray-100'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Desktop Categories Sidebar */}
          <div className="hidden sm:block w-48 flex-shrink-0 border-r border-gray-700">
            <div className="p-4">
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
          </div>

          {/* Combined Template & Preview Display */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6 min-h-0">
            {filteredTemplates.length > 0 && (
              <div
                className="bg-gray-700 rounded-xl p-4 lg:p-6 hover:bg-gray-600 transition-colors cursor-pointer group flex flex-col min-h-full"
                onClick={() => handleSelectTemplate(filteredTemplates[0])}
                onMouseEnter={() => handleTemplateHover(filteredTemplates[0])}
                onTouchStart={() => handleTemplateHover(filteredTemplates[0])}
              >
                {/* Template Header */}
                <div className="flex items-start gap-3 lg:gap-4 mb-4 lg:mb-6 flex-shrink-0">
                  <div className="text-3xl lg:text-4xl flex-shrink-0">{filteredTemplates[0].icon}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl lg:text-2xl font-semibold text-gray-100 group-hover:text-blue-300 mb-2">
                      {filteredTemplates[0].name}
                    </h3>
                    <p className="text-base lg:text-lg text-gray-400 leading-relaxed">
                      {filteredTemplates[0].description}
                    </p>
                  </div>
                </div>
                
                {/* Code & Preview Container */}
                <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-6 mb-4 lg:mb-6 min-h-0">
                  {/* Code Section */}
                  <div className="flex-1 bg-gray-800 rounded-lg p-4 lg:p-5 min-h-0 flex flex-col">
                    <div className="flex items-center gap-2 mb-3 flex-shrink-0">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-gray-500 ml-2">Template Code</span>
                    </div>
                    <div className="flex-1 overflow-auto min-h-0">
                      <pre className="text-xs lg:text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {filteredTemplates[0].code}
                      </pre>
                    </div>
                  </div>

                  {/* Preview Section */}
                  <div className="flex-1 bg-white rounded-lg overflow-hidden shadow-lg min-h-0 flex flex-col">
                    <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex-shrink-0">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-700">Live Preview</span>
                      </div>
                    </div>
                    
                    <div className="flex-1 overflow-auto p-3 lg:p-4 min-h-0">
                      {previewTemplate ? (
                        <div 
                          ref={previewRef}
                          className="w-full min-h-full flex items-center justify-center"
                          style={{ 
                            minHeight: '200px',
                            maxWidth: '100%',
                            overflow: 'hidden'
                          }}
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-400">
                          <div className="text-center">
                            <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="text-sm">Diagram preview</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Action Button */}
                <div className="text-center flex-shrink-0">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 lg:px-8 py-2 lg:py-3 rounded-lg font-medium text-base lg:text-lg transition-colors">
                    Use This Template
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 sm:p-6 pt-4 border-t border-gray-600">
          <p className="text-xs text-gray-400 text-center">
            Select a template to create a new diagram with pre-built code
          </p>
        </div>
      </div>
    </div>
  );
}