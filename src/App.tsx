import React, { useState, useEffect, useCallback } from 'react';
import { Code, Eye, List, FolderPlus, Copy, Check, FileText } from 'lucide-react';
import CreateDiagramModal from './components/CreateDiagramModal';
import TemplatesModal from './components/TemplatesModal';
import AlertModal from './components/AlertModal';
import ConfirmModal from './components/ConfirmModal';
import PromptModal from './components/PromptModal';
import { diagramStorage, type Diagram } from './services/DiagramStorage';
import { diagramExportImport } from './services/DiagramExportImport';
import { isMermaidDiagram, generateDiagramName } from './utils/mermaidDetector';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { type DiagramTemplate } from './data/templates';
import { WELCOME_DIAGRAM, TUTORIAL_DIAGRAM } from './data/defaultDiagrams';
import Editor from './components/Editor';
import DiagramPreview from './components/DiagramPreview';
import DiagramList from './components/DiagramList';


function App() {
  const [diagrams, setDiagrams] = useState<Diagram[]>([]);
  const [currentDiagram, setCurrentDiagram] = useState<Diagram>(WELCOME_DIAGRAM);
  const [isPreview, setIsPreview] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);

  // Modal states
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    message: string;
    title?: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    onConfirm?: () => void;
  }>({ isOpen: false, message: '' });

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    message: string;
    title?: string;
    onConfirm: () => void;
    variant?: 'danger' | 'primary';
  }>({ isOpen: false, message: '', onConfirm: () => {} });

  const [promptModal, setPromptModal] = useState<{
    isOpen: boolean;
    message: string;
    title?: string;
    defaultValue?: string;
    onConfirm: (value: string) => void;
  }>({ isOpen: false, message: '', onConfirm: () => {} });

  useEffect(() => {
    const stored = diagramStorage.getAllDiagrams();
    // Add theme property to existing diagrams for backward compatibility
    const diagramsWithTheme = stored.map(diagram => ({
      ...diagram,
      theme: diagram.theme || 'light'
    }));
    setDiagrams(diagramsWithTheme);

    // Check for shared diagram in URL first
    const sharedDiagram = diagramExportImport.importFromURL();
    if (sharedDiagram) {
      // Save the shared diagram
      const saved = diagramStorage.saveDiagram(sharedDiagram.name, sharedDiagram.code);
      const withTheme = diagramStorage.updateDiagram(saved.id, { theme: sharedDiagram.theme });
      
      setDiagrams(prev => [...prev, withTheme]);
      setCurrentDiagram(withTheme);
      
      // Clear the URL parameter to avoid re-importing on refresh
      const url = new URL(window.location.href);
      url.searchParams.delete('shared');
      window.history.replaceState({}, '', url.toString());
      
      setAlertModal({
        isOpen: true,
        message: `Imported shared diagram: "${sharedDiagram.name}"`,
        title: 'Diagram Imported',
        type: 'success'
      });
    } else {
      // Check if this is first visit (no stored diagrams and no welcome seen flag)
      const hasSeenWelcome = localStorage.getItem('hasSeenWelcome') === 'true';
      
      if (diagramsWithTheme.length > 0 && hasSeenWelcome) {
        // Show first diagram if user has seen welcome before
        setCurrentDiagram(diagramsWithTheme[0]);
      } else if (diagramsWithTheme.length === 0) {
        // First time user - show welcome and mark as seen
        localStorage.setItem('hasSeenWelcome', 'true');
      }
      // Otherwise keep showing welcome diagram
    }
  }, []);

  const toggleView = () => setIsPreview(!isPreview);
  const toggleSidebar = () => setShowSidebar(!showSidebar);

  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreateNew = (name: string) => {
    const newDiagram = diagramStorage.saveDiagram(name, 'graph TD\n  A[Start] --> B[End]');
    setDiagrams([...diagrams, newDiagram]);
    setCurrentDiagram(newDiagram);
  };

  const handleSelectTemplate = (template: DiagramTemplate) => {
    const templateName = `${template.name} - ${new Date().toLocaleDateString()}`;
    const newDiagram = diagramStorage.saveDiagram(templateName, template.code);
    setDiagrams([...diagrams, newDiagram]);
    setCurrentDiagram(newDiagram);
    
    setAlertModal({
      isOpen: true,
      message: `Created new diagram "${templateName}" using ${template.name} template!`,
      title: 'Template Applied',
      type: 'success'
    });
  };

  const handleSave = () => {
    // Don't save welcome or tutorial diagrams
    if (currentDiagram.id === 'welcome' || currentDiagram.id === 'tutorial') {
      setAlertModal({
        isOpen: true,
        message: 'To save changes, please create a new diagram first using the "New Diagram" button.',
        title: currentDiagram.id === 'welcome' ? 'Save Welcome Guide' : 'Save Tutorial',
        type: 'info'
      });
      return;
    }
    
    const updated = diagramStorage.updateDiagram(currentDiagram.id, {
      code: currentDiagram.code
    });
    setDiagrams(diagrams.map(d => d.id === updated.id ? updated : d));
    setCurrentDiagram(updated);
    
    // Show save confirmation
    setAlertModal({
      isOpen: true,
      message: `Diagram "${currentDiagram.name}" has been saved successfully!`,
      title: 'Saved',
      type: 'success'
    });
  };

  const handleDelete = (id: string) => {
    setConfirmModal({
      isOpen: true,
      message: 'Are you sure you want to delete this diagram? This action cannot be undone.',
      title: 'Delete Diagram',
      variant: 'danger',
      onConfirm: () => {
        diagramStorage.deleteDiagram(id);
        setDiagrams(diagrams.filter(d => d.id !== id));
        if (currentDiagram.id === id) {
          // If deleting current diagram, show welcome or first available diagram
          const remaining = diagrams.filter(d => d.id !== id);
          setCurrentDiagram(remaining.length > 0 ? remaining[0] : WELCOME_DIAGRAM);
        }
      }
    });
  };

  const handleRename = (diagram: Diagram) => {
    setPromptModal({
      isOpen: true,
      message: 'Enter a new name for the diagram:',
      title: 'Rename Diagram',
      defaultValue: diagram.name,
      onConfirm: (newName: string) => {
        const updated = diagramStorage.updateDiagram(diagram.id, { name: newName });
        setDiagrams(diagrams.map(d => d.id === updated.id ? updated : d));
        if (currentDiagram.id === diagram.id) {
          setCurrentDiagram(updated);
        }
      }
    });
  };

  const handleCodeChange = (code: string) => {
    setCurrentDiagram(prev => ({ ...prev, code }));
    
    // Save changes to storage immediately (except for welcome and tutorial diagrams)
    if (currentDiagram.id !== 'welcome' && currentDiagram.id !== 'tutorial') {
      const updated = diagramStorage.updateDiagram(currentDiagram.id, {
        code: code
      });
      setDiagrams(diagrams.map(d => d.id === updated.id ? updated : d));
    }
  };

  const handleThemeChange = (theme: 'light' | 'dark') => {
    setCurrentDiagram(prev => ({ ...prev, theme }));
    
    // Only save theme change to storage if it's a saved diagram (not welcome or tutorial)
    if (currentDiagram.id !== 'welcome' && currentDiagram.id !== 'tutorial') {
      const updated = diagramStorage.updateDiagram(currentDiagram.id, {
        theme: theme
      });
      setDiagrams(diagrams.map(d => d.id === updated.id ? updated : d));
    }
  };

  const handleImport = (importedDiagrams: Diagram[]) => {
    // Save all imported diagrams to storage
    const savedDiagrams: Diagram[] = [];
    importedDiagrams.forEach(diagram => {
      const saved = diagramStorage.saveDiagram(diagram.name, diagram.code);
      // Update theme if provided
      if (diagram.theme) {
        const withTheme = diagramStorage.updateDiagram(saved.id, { theme: diagram.theme });
        savedDiagrams.push(withTheme);
      } else {
        savedDiagrams.push(saved);
      }
    });
    
    // Update state with new diagrams
    setDiagrams(prev => [...prev, ...savedDiagrams]);
    
    // Select the first imported diagram
    if (savedDiagrams.length > 0) {
      setCurrentDiagram(savedDiagrams[0]);
    }
  };

  const handleExportSingle = (diagram: Diagram) => {
    diagramExportImport.exportSingleAsMmd(diagram);
  };

  const handleShare = async (diagram: Diagram) => {
    try {
      const success = await diagramExportImport.copyShareURLToClipboard(diagram);
      if (success) {
        setAlertModal({
          isOpen: true,
          message: 'Share link copied to clipboard! Anyone with this link can open the diagram.',
          title: 'Link Copied',
          type: 'success'
        });
      } else {
        // Fallback: show the URL in a prompt
        const shareURL = diagramExportImport.createShareableURL(diagram);
        setPromptModal({
          isOpen: true,
          message: 'Copy this URL to share the diagram:',
          title: 'Share Diagram',
          defaultValue: shareURL,
          onConfirm: () => {} // Just close the modal
        });
      }
    } catch (error) {
      console.error('Failed to create share link:', error);
      setAlertModal({
        isOpen: true,
        message: 'Failed to create share link. Please try again.',
        title: 'Share Failed',
        type: 'error'
      });
    }
  };

  // Copy code to clipboard
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(currentDiagram.code);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000); // Reset after 2 seconds
    } catch (error) {
      console.error('Failed to copy code:', error);
      setAlertModal({
        isOpen: true,
        message: 'Failed to copy code to clipboard. Please try again.',
        title: 'Copy Failed',
        type: 'error'
      });
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    
    if (files.length > 0) {
      const result = await diagramExportImport.processDroppedFiles(files);
      
      if (result.success && 'diagrams' in result) {
        handleImport(result.diagrams as Diagram[]);
        
        let message = `Imported ${result.imported} diagram(s) via drag & drop`;
        if (result.errors.length > 0) {
          message += `\nErrors: ${result.errors.join(', ')}`;
        }
        setAlertModal({
          isOpen: true,
          message,
          title: 'Import Complete',
          type: result.errors.length > 0 ? 'warning' : 'success'
        });
      } else {
        setAlertModal({
          isOpen: true,
          message: `Import failed: ${result.errors.join(', ')}`,
          title: 'Import Failed',
          type: 'error'
        });
      }
    }
  };

  // Paste functionality for creating diagrams from clipboard (only in Preview mode)
  const handlePaste = useCallback(async (e: ClipboardEvent) => {
    // Only handle paste for diagram creation when in Preview mode
    if (!isPreview) return;
    
    try {
      const clipboardText = e.clipboardData?.getData('text');
      if (!clipboardText) return;

      // Check if the pasted text is a Mermaid diagram
      if (isMermaidDiagram(clipboardText)) {
        e.preventDefault(); // Prevent default paste behavior
        
        const diagramName = generateDiagramName(clipboardText);
        const newDiagram = diagramStorage.saveDiagram(diagramName, clipboardText);
        setDiagrams(prev => [...prev, newDiagram]);
        setCurrentDiagram(newDiagram);
        
        setAlertModal({
          isOpen: true,
          message: `Created new diagram "${diagramName}" from pasted content!`,
          title: 'Diagram Created',
          type: 'success'
        });
      }
    } catch (error) {
      console.error('Failed to process pasted content:', error);
    }
  }, [isPreview]);

  // Add paste event listener
  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [isPreview, handlePaste]);

  // Handle escape key for closing modals/dropdowns
  const handleEscape = () => {
    if (alertModal.isOpen) {
      setAlertModal({ ...alertModal, isOpen: false });
    } else if (confirmModal.isOpen) {
      setConfirmModal({ ...confirmModal, isOpen: false });
    } else if (promptModal.isOpen) {
      setPromptModal({ ...promptModal, isOpen: false });
    } else if (showCreateModal) {
      setShowCreateModal(false);
    } else if (showTemplatesModal) {
      setShowTemplatesModal(false);
    }
  };

  // Check if any modal is open
  const isModalOpen = alertModal.isOpen || confirmModal.isOpen || promptModal.isOpen || showCreateModal || showTemplatesModal;

  // Setup keyboard shortcuts
  useKeyboardShortcuts({
    onCopy: handleCopyCode,
    onSave: handleSave,
    onNew: () => setShowCreateModal(true),
    onToggleView: toggleView,
    onEscape: handleEscape,
    isModalOpen,
    isPreview
  });

  return (
    <div 
      className="min-h-screen bg-gray-900 text-gray-100"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 flex gap-4 relative">
        {/* Mobile Sidebar Overlay */}
        {showSidebar && (
          <>
            {/* Mobile backdrop */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity duration-500 ease-out"
              onClick={toggleSidebar}
            />
            
            {/* Sidebar */}
            <div className={`
              ${showSidebar ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}
              fixed md:relative top-0 left-0 z-50 md:z-auto
              w-80 md:w-80 
              bg-gray-800 rounded-xl shadow-xl p-4 
              flex flex-col h-[calc(100vh-2rem)] md:h-[calc(100vh-4rem)]
              transform transition-all duration-500 ease-out md:transform-none md:opacity-100
            `}>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold">My Diagrams</h2>
            </div>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors flex-1"
                title="Create New Diagram"
              >
                <FolderPlus className="w-4 h-4" />
                <span className="text-sm font-medium">New</span>
              </button>
              <button
                onClick={() => setShowTemplatesModal(true)}
                className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white bg-blue-700 rounded-lg hover:bg-blue-600 transition-colors flex-1"
                title="Use Template"
              >
                <FileText className="w-4 h-4" />
                <span className="text-sm font-medium">Templates</span>
              </button>
            </div>
            <div className="flex-1 min-h-0">
              <DiagramList
                diagrams={diagrams}
                currentDiagramId={currentDiagram.id}
                isWelcomeActive={currentDiagram.id === WELCOME_DIAGRAM.id}
                isTutorialActive={currentDiagram.id === TUTORIAL_DIAGRAM.id}
                onSelect={setCurrentDiagram}
                onDelete={handleDelete}
                onRename={handleRename}
                onImport={handleImport}
                onExportSingle={handleExportSingle}
                onShare={handleShare}
                onShowWelcome={() => setCurrentDiagram(WELCOME_DIAGRAM)}
                onShowTutorial={() => setCurrentDiagram(TUTORIAL_DIAGRAM)}
              />
            </div>
            </div>
          </>
        )}

        {/* Main Content */}
        <div className="flex-1 bg-gray-800 rounded-xl shadow-xl overflow-hidden">
          <div className="border-b border-gray-700">
            <div className="px-3 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <button
                  onClick={toggleSidebar}
                  className="p-2 text-gray-300 hover:text-gray-100 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                  title={showSidebar ? "Hide List" : "Show List"}
                >
                  <List className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-100">Mermaid Diagram Viewer</h1>
                  <div className="hidden sm:block text-xs text-gray-400 mt-1">
                    Ctrl+C Copy • Ctrl+S Save • Ctrl+M New • Ctrl+E Toggle View • Esc Close
                  </div>
                </div>
              </div>
              <div className="flex space-x-2 overflow-x-auto">
                <button
                  onClick={handleCopyCode}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
                  title="Copy diagram code to clipboard"
                >
                  {copySuccess ? (
                    <>
                      <Check className="w-4 h-4 mr-2 text-green-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Code
                    </>
                  )}
                </button>
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
          
          <div className="h-[calc(100vh-10rem)] sm:h-[calc(100vh-12rem)]">
            {isPreview ? (
              <DiagramPreview 
                code={currentDiagram.code}
                diagramName={currentDiagram.name}
                theme={currentDiagram.theme}
                onThemeChange={handleThemeChange}
                isFullScreen={isFullScreen} 
                onFullScreenChange={setIsFullScreen}
                onAlert={(message, title, type) => setAlertModal({
                  isOpen: true,
                  message,
                  title,
                  type
                })}
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
      
      <TemplatesModal
        isOpen={showTemplatesModal}
        onClose={() => setShowTemplatesModal(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      {/* Custom Modals */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        message={alertModal.message}
        title={alertModal.title}
        type={alertModal.type}
        onConfirm={alertModal.onConfirm}
      />
      
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        message={confirmModal.message}
        title={confirmModal.title}
        variant={confirmModal.variant}
      />
      
      <PromptModal
        isOpen={promptModal.isOpen}
        onClose={() => setPromptModal({ ...promptModal, isOpen: false })}
        onConfirm={promptModal.onConfirm}
        message={promptModal.message}
        title={promptModal.title}
        defaultValue={promptModal.defaultValue}
      />
    </div>
  );
}

export default App;
