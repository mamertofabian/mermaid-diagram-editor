import { Diagram } from './DiagramStorage';

export interface DiagramBackup {
  version: string;
  exportDate: number;
  diagrams: Diagram[];
}

export interface ImportResult {
  success: boolean;
  imported: number;
  errors: string[];
  duplicates: number;
  diagrams?: Diagram[];
}

class DiagramExportImport {
  private readonly BACKUP_VERSION = '1.0';
  
  // Export all diagrams as JSON backup
  exportAllAsJSON(diagrams: Diagram[]): void {
    const backup: DiagramBackup = {
      version: this.BACKUP_VERSION,
      exportDate: Date.now(),
      diagrams: diagrams
    };
    
    const dataStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `mermaid-diagrams-backup-${timestamp}.json`;
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }
  
  // Export single diagram as .mmd file
  exportSingleAsMmd(diagram: Diagram): void {
    const content = diagram.code;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const safeFileName = diagram.name.replace(/[^a-zA-Z0-9-_\s]/g, '');
    const filename = `${safeFileName}.mmd`;
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }
  
  // Import diagrams from JSON backup
  async importFromJSON(file: File): Promise<ImportResult> {
    try {
      const content = await this.readFileAsText(file);
      const backup = JSON.parse(content) as DiagramBackup;
      
      // Validate backup format
      if (!backup.version || !backup.diagrams || !Array.isArray(backup.diagrams)) {
        throw new Error('Invalid backup file format');
      }
      
      // Check if all required fields are present
      const errors: string[] = [];
      const validDiagrams: Diagram[] = [];
      
      backup.diagrams.forEach((diagram, index) => {
        if (!this.isValidDiagram(diagram)) {
          errors.push(`Invalid diagram at index ${index}: missing required fields`);
        } else {
          // Generate new ID to avoid conflicts
          validDiagrams.push({
            ...diagram,
            id: crypto.randomUUID(),
            updatedAt: Date.now()
          });
        }
      });
      
      return {
        success: true,
        imported: validDiagrams.length,
        errors,
        duplicates: 0,
        diagrams: validDiagrams
      };
      
    } catch (error) {
      return {
        success: false,
        imported: 0,
        errors: [`Failed to parse backup file: ${error instanceof Error ? error.message : 'Unknown error'}`],
        duplicates: 0
      };
    }
  }
  
  // Import single diagram from .mmd file
  async importSingleMmd(file: File): Promise<ImportResult> {
    try {
      const content = await this.readFileAsText(file);
      const fileName = file.name.replace(/\.mmd$/, '');
      
      const diagram: Diagram = {
        id: crypto.randomUUID(),
        name: fileName || 'Imported Diagram',
        code: content,
        theme: 'light',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      return {
        success: true,
        imported: 1,
        errors: [],
        duplicates: 0,
        diagrams: [diagram]
      };
      
    } catch (error) {
      return {
        success: false,
        imported: 0,
        errors: [`Failed to import diagram: ${error instanceof Error ? error.message : 'Unknown error'}`],
        duplicates: 0
      };
    }
  }
  
  // Create shareable URL for a diagram
  createShareableURL(diagram: Diagram): string {
    const shareData = {
      name: diagram.name,
      code: diagram.code,
      theme: diagram.theme
    };
    
    // Use TextEncoder to handle Unicode characters properly
    const jsonString = JSON.stringify(shareData);
    const encoder = new TextEncoder();
    const uint8Array = encoder.encode(jsonString);
    
    // Convert to base64 using a method that handles Unicode
    let binary = '';
    uint8Array.forEach(byte => {
      binary += String.fromCharCode(byte);
    });
    const encoded = btoa(binary);
    
    const currentURL = new URL(window.location.href);
    currentURL.searchParams.set('shared', encoded);
    
    return currentURL.toString();
  }
  
  // Import diagram from URL
  importFromURL(url?: string): Diagram | null {
    try {
      const urlObj = new URL(url || window.location.href);
      const encoded = urlObj.searchParams.get('shared');
      
      if (!encoded) return null;
      
      // Decode using the same method as encoding
      const binary = atob(encoded);
      const uint8Array = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        uint8Array[i] = binary.charCodeAt(i);
      }
      
      const decoder = new TextDecoder();
      const jsonString = decoder.decode(uint8Array);
      const shareData = JSON.parse(jsonString);
      
      if (!shareData.name || !shareData.code) {
        throw new Error('Invalid share data');
      }
      
      const diagram: Diagram = {
        id: crypto.randomUUID(),
        name: shareData.name + ' (Shared)',
        code: shareData.code,
        theme: shareData.theme || 'light',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      return diagram;
      
    } catch (error) {
      console.error('Failed to import from URL:', error);
      return null;
    }
  }
  
  // Copy shareable URL to clipboard
  async copyShareURLToClipboard(diagram: Diagram): Promise<boolean> {
    try {
      const shareURL = this.createShareableURL(diagram);
      await navigator.clipboard.writeText(shareURL);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }
  
  // Validate file types for drag and drop
  isValidImportFile(file: File): boolean {
    const validExtensions = ['.json', '.mmd'];
    const validTypes = ['application/json', 'text/plain'];
    
    return validExtensions.some(ext => file.name.toLowerCase().endsWith(ext)) ||
           validTypes.includes(file.type);
  }
  
  // Process dropped files
  async processDroppedFiles(files: FileList): Promise<ImportResult> {
    const allResults: ImportResult[] = [];
    const allDiagrams: Diagram[] = [];
    
    for (const file of Array.from(files)) {
      if (!this.isValidImportFile(file)) {
        allResults.push({
          success: false,
          imported: 0,
          errors: [`Unsupported file type: ${file.name}`],
          duplicates: 0
        });
        continue;
      }
      
      let result: ImportResult;
      
      if (file.name.toLowerCase().endsWith('.json')) {
        result = await this.importFromJSON(file);
      } else if (file.name.toLowerCase().endsWith('.mmd')) {
        result = await this.importSingleMmd(file);
      } else {
        result = {
          success: false,
          imported: 0,
          errors: [`Unknown file type: ${file.name}`],
          duplicates: 0
        };
      }
      
      allResults.push(result);
      
      if ('diagrams' in result && result.diagrams) {
        allDiagrams.push(...result.diagrams);
      }
    }
    
    // Combine results
    const combinedResult: ImportResult = {
      success: allResults.some(r => r.success),
      imported: allResults.reduce((sum, r) => sum + r.imported, 0),
      errors: allResults.flatMap(r => r.errors),
      duplicates: allResults.reduce((sum, r) => sum + r.duplicates, 0)
    };
    
    return {
      ...combinedResult,
      diagrams: allDiagrams
    };
  }
  
  // Helper methods
  private readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }
  
  private isValidDiagram(obj: unknown): obj is Diagram {
    if (!obj || typeof obj !== 'object' || obj === null) {
      return false;
    }
    
    const candidate = obj as Record<string, unknown>;
    
    return typeof candidate.id === 'string' &&
           typeof candidate.name === 'string' &&
           typeof candidate.code === 'string' &&
           typeof candidate.theme === 'string' &&
           typeof candidate.createdAt === 'number' &&
           typeof candidate.updatedAt === 'number';
  }
}

export const diagramExportImport = new DiagramExportImport();