// Utility to detect if text contains valid Mermaid syntax
export function isMermaidDiagram(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  
  const trimmedText = text.trim();
  if (trimmedText.length < 5) return false; // Too short to be valid
  
  // Common Mermaid diagram type indicators
  const mermaidKeywords = [
    'graph',
    'flowchart',
    'sequenceDiagram',
    'classDiagram',
    'stateDiagram',
    'journey',
    'gantt',
    'pie',
    'requirement',
    'erDiagram',
    'C4Context',
    'mindmap',
    'timeline',
    'gitgraph',
    'quadrantChart',
    'xychart'
  ];
  
  // Check if text starts with any Mermaid keywords
  const startsWithKeyword = mermaidKeywords.some(keyword => 
    trimmedText.toLowerCase().startsWith(keyword.toLowerCase())
  );
  
  if (startsWithKeyword) return true;
  
  // Additional checks for common Mermaid patterns
  const mermaidPatterns = [
    /^[A-Z]\s*-->/m, // Simple node connections
    /^[A-Z]\s*---/m, // Dashed connections
    /^\s*participant\s+/m, // Sequence diagram participants
    /^\s*[A-Z][A-Z0-9]*\s*:\s*/m, // Class diagram methods/properties
    /^\s*state\s+/m, // State diagram states
    /^\s*[A-Z][A-Z0-9_]*\s*\|\|--o/m, // ER diagram relationships
  ];
  
  // Check if any pattern matches
  if (mermaidPatterns.some(pattern => pattern.test(trimmedText))) {
    return true;
  }
  
  // Check for common Mermaid syntax elements
  const hasMermaidSyntax = (
    (trimmedText.includes('-->') || trimmedText.includes('---')) && // Connections
    (trimmedText.includes('[') && trimmedText.includes(']')) // Node definitions
  ) || (
    trimmedText.includes(':::') // Styling
  ) || (
    /style\s+\w+\s+fill:/m.test(trimmedText) // Style definitions
  );
  
  return hasMermaidSyntax;
}

// Generate a diagram name from Mermaid code
export function generateDiagramName(code: string): string {
  const trimmedCode = code.trim();
  const firstLine = trimmedCode.split('\n')[0].trim();
  
  // Try to extract a meaningful name from the first line
  if (firstLine.toLowerCase().startsWith('graph')) {
    return 'Flowchart Diagram';
  } else if (firstLine.toLowerCase().startsWith('flowchart')) {
    return 'Flowchart Diagram';
  } else if (firstLine.toLowerCase().startsWith('sequencediagram')) {
    return 'Sequence Diagram';
  } else if (firstLine.toLowerCase().startsWith('classdiagram')) {
    return 'Class Diagram';
  } else if (firstLine.toLowerCase().startsWith('statediagram')) {
    return 'State Diagram';
  } else if (firstLine.toLowerCase().startsWith('gantt')) {
    return 'Gantt Chart';
  } else if (firstLine.toLowerCase().startsWith('pie')) {
    return 'Pie Chart';
  } else if (firstLine.toLowerCase().startsWith('journey')) {
    return 'User Journey';
  } else if (firstLine.toLowerCase().startsWith('erdiagram')) {
    return 'Entity Relationship Diagram';
  } else if (firstLine.toLowerCase().startsWith('mindmap')) {
    return 'Mind Map';
  } else if (firstLine.toLowerCase().startsWith('timeline')) {
    return 'Timeline';
  } else if (firstLine.toLowerCase().startsWith('gitgraph')) {
    return 'Git Graph';
  } else if (firstLine.toLowerCase().startsWith('requirement')) {
    return 'Requirement Diagram';
  } else {
    // Fallback: try to find a meaningful node name or just use generic name
    const nodeMatch = code.match(/([A-Z][A-Z0-9]*)\[([^\]]+)\]/);
    if (nodeMatch && nodeMatch[2]) {
      return `${nodeMatch[2]} Diagram`;
    }
    
    return 'Pasted Diagram';
  }
}