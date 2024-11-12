import React, { useState, useEffect } from 'react';
import { Code, Eye, Plus, List, FolderPlus } from 'lucide-react';
import CreateDiagramModal from './components/CreateDiagramModal';
import { diagramStorage, type Diagram } from './services/DiagramStorage';
import Editor from './components/Editor';
import DiagramPreview from './components/DiagramPreview';
import DiagramList from './components/DiagramList';

const DEFAULT_DIAGRAM = {
  id: 'default',
  name: 'Welcome to Mermaid Diagram Editor',
  code: `graph TD
    Start[Get Started] --> Create[Click + to Create New Diagram]
    Start --> Edit[Edit Existing Diagrams]
    Start --> Preview[Toggle Preview/Code View]
    
    Create --> Name[Enter Diagram Name]
    Name --> Code[Write Mermaid Code]
    
    Edit --> List[Click List Button]
    List --> Select[Select a Diagram]
    Select --> Modify[Edit or Delete]
    
    Preview --> View[Eye Icon: Preview Mode]
    Preview --> Source[Code Icon: Edit Mode]
    Preview --> FullScreen[Expand Icon: Full Screen]
    
    style Start fill:#f9f,stroke:#333,stroke-width:4px
    style Preview fill:#bbf,stroke:#333
    style Edit fill:#bfb,stroke:#333
    style Create fill:#fbf,stroke:#333`,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

function App() {
  const [diagrams, setDiagrams] = useState<Diagram[]>([]);
  const [currentDiagram, setCurrentDiagram] = useState<Diagram>(DEFAULT_DIAGRAM);
  const [isPreview, setIsPreview] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => {
    const stored = diagramStorage.getAllDiagrams();
    setDiagrams(stored);
  }, []);

  const toggleView = () => setIsPreview(!isPreview);
  const toggleFullScreen = () => setIsFullScreen(!isFullScreen);
  const toggleSidebar = () => setShowSidebar(!showSidebar);

  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreateNew = (name: string) => {
    const newDiagram = diagramStorage.saveDiagram(name, 'graph TD\n  A[Start] --> B[End]');
    setDiagrams([...diagrams, newDiagram]);
    setCurrentDiagram(newDiagram);
  };

  const handleSave = () => {
    const updated = diagramStorage.updateDiagram(currentDiagram.id, {
      code: currentDiagram.code
    });
    setDiagrams(diagrams.map(d => d.id === updated.id ? updated : d));
    setCurrentDiagram(updated);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this diagram?')) return;
    
    diagramStorage.deleteDiagram(id);
    setDiagrams(diagrams.filter(d => d.id !== id));
    if (currentDiagram.id === id) {
      setCurrentDiagram(DEFAULT_DIAGRAM);
    }
  };

  const handleRename = (diagram: Diagram) => {
    const newName = prompt('Enter new name:', diagram.name);
    if (!newName) return;

    const updated = diagramStorage.updateDiagram(diagram.id, { name: newName });
    setDiagrams(diagrams.map(d => d.id === updated.id ? updated : d));
    if (currentDiagram.id === diagram.id) {
      setCurrentDiagram(updated);
    }
  };

  const handleCodeChange = (code: string) => {
    setCurrentDiagram(prev => ({ ...prev, code }));
    
    // Save changes to storage immediately
    const updated = diagramStorage.updateDiagram(currentDiagram.id, {
      code: code
    });
    setDiagrams(diagrams.map(d => d.id === updated.id ? updated : d));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto px-4 py-8 flex gap-4">
        {/* Sidebar */}
        {showSidebar && (
          <div className="w-80 bg-gray-800 rounded-xl shadow-xl p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">My Diagrams</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                title="Create New Diagram"
              >
                <FolderPlus className="w-5 h-5" />
                <span className="text-sm font-medium">New Diagram</span>
              </button>
            </div>
            <DiagramList
              diagrams={diagrams}
              onSelect={setCurrentDiagram}
              onDelete={handleDelete}
              onRename={handleRename}
            />
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 bg-gray-800 rounded-xl shadow-xl overflow-hidden">
          <div className="border-b border-gray-700">
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {!showSidebar && (
                  <button
                    onClick={toggleSidebar}
                    className="p-2 text-gray-300 hover:text-gray-100 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                    title="Show List"
                  >
                    <List className="w-5 h-5" />
                  </button>
                )}
                <h1 className="text-2xl font-bold text-gray-100">Mermaid Diagram Viewer</h1>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={toggleView}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
                >
                  {isPreview ? (
                    <>
                      <Code className="w-4 h-4 mr-2" />
                      Show Code
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          <div className="h-[calc(100vh-12rem)]">
            {isPreview ? (
              <DiagramPreview 
                code={currentDiagram.code} 
                isFullScreen={isFullScreen} 
                onFullScreenChange={setIsFullScreen}
              />
            ) : (
              <Editor 
                code={currentDiagram.code} 
                onChange={handleCodeChange} 
                onSave={handleSave}
              />
            )}
          </div>
        </div>
      </div>
      <CreateDiagramModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onConfirm={handleCreateNew}
      />
    </div>
  );
}

export default App;
