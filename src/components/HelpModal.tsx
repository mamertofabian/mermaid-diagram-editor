import { X, Keyboard, Copy, Save, Plus, Eye, XCircle, ZoomIn, ZoomOut, RotateCcw, Maximize } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;

  const shortcutSections = [
    {
      title: 'General',
      shortcuts: [
        { key: 'Ctrl + C', action: 'Copy diagram code', icon: Copy },
        { key: 'Ctrl + S', action: 'Save diagram', icon: Save },
        { key: 'Ctrl + M', action: 'Create new diagram', icon: Plus },
        { key: 'Ctrl + E', action: 'Toggle preview/code view', icon: Eye },
        { key: 'Esc', action: 'Close modals', icon: XCircle },
        { key: '?', action: 'Show this help', icon: Keyboard },
      ]
    },
    {
      title: 'Zoom Controls',
      shortcuts: [
        { key: '+ / =', action: 'Zoom in', icon: ZoomIn },
        { key: '-', action: 'Zoom out', icon: ZoomOut },
        { key: '0', action: 'Reset zoom', icon: RotateCcw },
        { key: 'M', action: 'Maximum zoom', icon: Maximize },
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Keyboard className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-gray-100">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-100 hover:bg-gray-700 rounded-lg transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="space-y-6">
            {shortcutSections.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                <h3 className="text-sm font-semibold text-gray-300 mb-3">{section.title}</h3>
                <div className="space-y-2">
                  {section.shortcuts.map((shortcut, index) => {
                    const IconComponent = shortcut.icon;
                    return (
                      <div key={index} className="flex items-center gap-4 p-3 bg-gray-700 rounded-lg">
                        <div className="flex-shrink-0">
                          <IconComponent className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm text-gray-300">{shortcut.action}</div>
                        </div>
                        <div className="flex-shrink-0">
                          <kbd className="px-2 py-1 text-xs font-mono bg-gray-600 text-gray-200 rounded border border-gray-500">
                            {shortcut.key}
                          </kbd>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-blue-900 bg-opacity-20 border border-blue-700 rounded-lg">
            <div className="text-sm text-blue-200">
              <div className="font-semibold mb-2">💡 Tip:</div>
              <div>You can also access most features through the buttons in the header and sidebar.</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}
