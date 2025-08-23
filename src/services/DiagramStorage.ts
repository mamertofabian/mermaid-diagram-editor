export interface Diagram {
  id: string;
  name: string;
  code: string;
  theme: 'light' | 'dark';
  createdAt: number;
  updatedAt: number;
  collectionIds?: string[];
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  diagramIds: string[];
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

class CollectionStorage {
  private readonly STORAGE_KEY = 'mermaid-collections';

  getAllCollections(): Collection[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  saveCollection(name: string, description?: string, color?: string, icon?: string): Collection {
    const collections = this.getAllCollections();
    const newCollection: Collection = {
      id: crypto.randomUUID(),
      name,
      description,
      color: color || '#3B82F6', // Default blue color
      icon: icon || 'folder',
      diagramIds: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    collections.push(newCollection);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(collections));
    return newCollection;
  }

  updateCollection(id: string, updates: Partial<Collection>): Collection {
    const collections = this.getAllCollections();
    const index = collections.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Collection not found');

    collections[index] = {
      ...collections[index],
      ...updates,
      updatedAt: Date.now(),
    };

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(collections));
    return collections[index];
  }

  deleteCollection(id: string): void {
    const collections = this.getAllCollections();
    const filtered = collections.filter(c => c.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
    
    // Also remove collection references from diagrams
    const diagrams = diagramStorage.getAllDiagrams();
    diagrams.forEach(diagram => {
      if (diagram.collectionIds?.includes(id)) {
        const updatedCollectionIds = diagram.collectionIds.filter(cId => cId !== id);
        diagramStorage.updateDiagram(diagram.id, { collectionIds: updatedCollectionIds });
      }
    });
  }

  addDiagramToCollection(collectionId: string, diagramId: string): void {
    const collection = this.getAllCollections().find(c => c.id === collectionId);
    if (!collection) throw new Error('Collection not found');
    
    if (!collection.diagramIds.includes(diagramId)) {
      collection.diagramIds.push(diagramId);
      this.updateCollection(collectionId, { diagramIds: collection.diagramIds });
    }

    // Update diagram's collection references
    const diagram = diagramStorage.getAllDiagrams().find(d => d.id === diagramId);
    if (diagram) {
      const collectionIds = diagram.collectionIds || [];
      if (!collectionIds.includes(collectionId)) {
        collectionIds.push(collectionId);
        diagramStorage.updateDiagram(diagramId, { collectionIds });
      }
    }
  }

  removeDiagramFromCollection(collectionId: string, diagramId: string): void {
    const collection = this.getAllCollections().find(c => c.id === collectionId);
    if (!collection) throw new Error('Collection not found');
    
    collection.diagramIds = collection.diagramIds.filter(id => id !== diagramId);
    this.updateCollection(collectionId, { diagramIds: collection.diagramIds });

    // Update diagram's collection references
    const diagram = diagramStorage.getAllDiagrams().find(d => d.id === diagramId);
    if (diagram && diagram.collectionIds) {
      const collectionIds = diagram.collectionIds.filter(id => id !== collectionId);
      diagramStorage.updateDiagram(diagramId, { collectionIds });
    }
  }

  getDiagramsByCollection(collectionId: string): Diagram[] {
    const collection = this.getAllCollections().find(c => c.id === collectionId);
    if (!collection) return [];
    
    const allDiagrams = diagramStorage.getAllDiagrams();
    return collection.diagramIds
      .map(id => allDiagrams.find(d => d.id === id))
      .filter(Boolean) as Diagram[];
  }
}

export const collectionStorage = new CollectionStorage();
