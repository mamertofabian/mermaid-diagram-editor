import { useEffect } from 'react';

interface KeyboardShortcutsProps {
  onCopy: () => void;
  onSave: () => void;
  onNew: () => void;
  onToggleView: () => void;
  onEscape: () => void;
  isModalOpen?: boolean;
}

export const useKeyboardShortcuts = ({
  onCopy,
  onSave,
  onNew,
  onToggleView,
  onEscape,
  isModalOpen = false
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
      
      // Skip other shortcuts if in input field or modal is open
      if (isInInput || isModalOpen) {
        return;
      }
      
      // Handle keyboard shortcuts
      if (isCtrlOrCmd) {
        switch (event.key.toLowerCase()) {
          case 'c':
            event.preventDefault();
            onCopy();
            break;
          case 's':
            event.preventDefault();
            onSave();
            break;
          case 'n':
            event.preventDefault();
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
  }, [onCopy, onSave, onNew, onToggleView, onEscape, isModalOpen]);
};