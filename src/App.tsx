import React, { useState } from 'react';
import { Maximize2, Minimize2, Code, Eye } from 'lucide-react';
import Editor from './components/Editor';
import DiagramPreview from './components/DiagramPreview';

const DEFAULT_DIAGRAM = `graph TD
    A[Start] --> B{Is it?}
    B -- Yes --> C[OK]
    C --> D[Rethink]
    D --> B
    B -- No --> E[End]`;

function App() {
  const [code, setCode] = useState(DEFAULT_DIAGRAM);
  const [isPreview, setIsPreview] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const toggleView = () => setIsPreview(!isPreview);
  const toggleFullScreen = () => setIsFullScreen(!isFullScreen);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="px-6 py-4 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-800">Mermaid Diagram Viewer</h1>
              <div className="flex space-x-4">
                <button
                  onClick={toggleView}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
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
                {isPreview && (
                  <button
                    onClick={toggleFullScreen}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    {isFullScreen ? (
                      <>
                        <Minimize2 className="w-4 h-4 mr-2" />
                        Exit Fullscreen
                      </>
                    ) : (
                      <>
                        <Maximize2 className="w-4 h-4 mr-2" />
                        Fullscreen
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <div className="h-[calc(100vh-12rem)]">
            {isPreview ? (
              <DiagramPreview 
                code={code} 
                isFullScreen={isFullScreen} 
                onFullScreenChange={setIsFullScreen}
              />
            ) : (
              <Editor code={code} onChange={setCode} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
