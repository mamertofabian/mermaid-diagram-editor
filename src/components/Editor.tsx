import React from 'react';

interface EditorProps {
  code: string;
  onChange: (value: string) => void;
  onSave: () => void;
}

export default function Editor({ code, onChange, onSave }: EditorProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      onSave();
    }
  };
  return (
    <textarea
      onKeyDown={handleKeyDown}
      value={code}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-full p-4 font-mono text-sm bg-gray-800 text-gray-100 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
      placeholder="Paste your Mermaid diagram code here..."
      spellCheck={false}
    />
  );
}
