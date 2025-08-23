export interface Diagram {
  id: string;
  name: string;
  code: string;
  theme: 'light' | 'dark';
  createdAt: number;
  updatedAt: number;
}

class DiagramStorage {
  private readonly STORAGE_KEY = 'mermaid-diagrams';

  getAllDiagrams(): Diagram[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  saveDiagram(name: string, code: string): Diagram {
    const diagrams = this.getAllDiagrams();
    const newDiagram: Diagram = {
      id: crypto.randomUUID(),
      name,
      code,
      theme: 'light', // Default to light theme for better readability
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    diagrams.push(newDiagram);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(diagrams));
    return newDiagram;
  }

  updateDiagram(id: string, updates: Partial<Diagram>): Diagram {
    const diagrams = this.getAllDiagrams();
    const index = diagrams.findIndex(d => d.id === id);
    if (index === -1) throw new Error('Diagram not found');

    diagrams[index] = {
      ...diagrams[index],
      ...updates,
      updatedAt: Date.now(),
    };

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(diagrams));
    return diagrams[index];
  }

  deleteDiagram(id: string): void {
    const diagrams = this.getAllDiagrams();
    const filtered = diagrams.filter(d => d.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
  }
}

export const diagramStorage = new DiagramStorage();
