import { useEffect } from 'react';

interface KeyboardShortcutsProps {
  onCopy: () => void;
  onSave: () => void;
  onNew: () => void;
  onToggleView: () => void;
  onEscape: () => void;
  onHelp?: () => void;
  isModalOpen?: boolean;
  isPreview?: boolean;
}

export const useKeyboardShortcuts = ({
  onCopy,
  onSave,
  onNew,
  onToggleView,
  onEscape,
  onHelp,
  isModalOpen = false,
  isPreview = true
}: KeyboardShortcutsProps) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isCtrlOrCmd = event.ctrlKey || event.metaKey;
      const target = event.target as HTMLElement;
      
      // Don't trigger shortcuts when typing in input fields (except for Escape)
      const isInInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true';
      
      // Handle Escape key (always active)
      if (event.key === 'Escape') {
        event.preventDefault();
        onEscape();
        return;
      }
      
      // Handle ? key for help (always active)
      if (event.key === '?' && onHelp) {
        event.preventDefault();
        onHelp();
        return;
      }
      
      // Skip other shortcuts if in input field or modal is open
      if (isInInput || isModalOpen) {
        return;
      }
      
      // Handle keyboard shortcuts
      if (isCtrlOrCmd) {
        switch (event.key.toLowerCase()) {
          case 'c':
            // Only override Ctrl+C in Preview mode and if not in a text selection context
            if (isPreview && window.getSelection()?.toString() === '') {
              event.preventDefault();
              onCopy();
            }
            break;
          case 's':
            event.preventDefault();
            onSave();
            break;
          case 'm':
            // Use Ctrl+M for new diagram (M for Mermaid)
            event.preventDefault();
            event.stopPropagation();
            onNew();
            break;
          case 'e':
            event.preventDefault();
            onToggleView();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onCopy, onSave, onNew, onToggleView, onEscape, onHelp, isModalOpen, isPreview]);
};