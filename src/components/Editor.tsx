import React from 'react';

interface EditorProps {
  code: string;
  onChange: (value: string) => void;
}

export default function Editor({ code, onChange }: EditorProps) {
  return (
    <textarea
      value={code}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-full p-4 font-mono text-sm bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
      placeholder="Paste your Mermaid diagram code here..."
      spellCheck={false}
    />
  );
}