# 🗺️ Mermaid Diagram Editor - Development Roadmap

This document outlines the planned features and improvements for the Mermaid Diagram Editor.

## 🎯 **Priority Levels**

- 🟢 **Low Hanging Fruits** - High impact, low effort
- 🟡 **Medium Priority** - High impact, medium effort  
- 🔴 **Long Term** - High impact, high effort

---

## 🟢 **Phase 1: Low Hanging Fruits (Next Sprint)**

### ⌨️ **Keyboard Shortcuts**
- `Ctrl+C` / `Cmd+C` - Copy diagram code ✅ (Already implemented)
- `Ctrl+S` / `Cmd+S` - Save current diagram
- `Ctrl+N` / `Cmd+N` - Create new diagram
- `Ctrl+E` / `Cmd+E` - Toggle between code/preview
- `Ctrl+F` / `Cmd+F` - Search diagrams
- `Esc` - Close modals/dropdowns


### 📂 **Recent Files**
- Show last 5 accessed diagrams at top of sidebar
- Quick access without scrolling through full list
- Persist recent list in localStorage

---

## 🟡 **Phase 2: Medium Priority (Next Month)**

### 🧭 **Guided Diagram Creation** 
- **Interactive Flowchart Builder** - Visual node-and-edge editor with live Mermaid code generation
- **Step-by-Step Sequence Wizard** - Form-based interface for creating sequence diagrams
- **Class Diagram Assistant** - Guided forms for classes, methods, relationships
- **Visual State Machine Builder** - Drag-and-drop state and transition creator
- **Mermaid Syntax Tutorial** - Interactive lessons teaching syntax as you create
- **Live Syntax Help** - Context-sensitive help and autocomplete suggestions

*Note: These visual builders teach Mermaid syntax while creating diagrams, much more valuable than static code templates*

### 🎨 **Editor Enhancements**
- **Syntax Highlighting** - Color-coded Mermaid syntax in code editor
- **Auto-formatting** - Format/prettify Mermaid code with proper indentation
- **Live Error Checking** - Show syntax errors inline as you type
- **Split View Mode** - Side-by-side code and preview for larger screens
- **Fullscreen Editor** - Dedicated fullscreen mode for code editing

### 🔍 **Search & Organization**
- **Search Functionality** - Search through diagram names and content
- **Filter by Type** - Filter diagrams by Mermaid diagram type
- **Diagram Categories** - Tag and organize diagrams by type/project
- **Sort Options** - Sort by name, date modified, date created

### ⚡ **Productivity Features**
- **Auto-save Indicators** - Visual feedback showing when changes are saved
- **Diagram Statistics** - Node count, complexity metrics, render time
- **Diagram Validation** - Pre-validate syntax before rendering

---

## 🔴 **Phase 3: Long Term (Next Quarter)**

### 📊 **Advanced Diagram Features**
- **Diagram Thumbnails** - Preview images in the diagram list
- **Version History** - Undo/redo with diagram change history  
- **Diagram Diff View** - Compare versions of diagrams visually
- **Performance Monitoring** - Show render times and optimization suggestions

### 📱 **Mobile & Accessibility**
- **Enhanced Mobile UI** - Better touch editing and mobile-optimized controls
- **Keyboard Navigation** - Full keyboard accessibility for all features
- **Screen Reader Support** - Proper ARIA labels and descriptions
- **Touch Gestures** - Pinch-to-zoom, touch panning for mobile

### 🔧 **Advanced Export & Sharing**
- **Export Presets** - Save preferred export settings (size, format, quality)
- **Bulk Export** - Export multiple diagrams at once
- **Collaborative Links** - Links that allow others to suggest edits
- **Cloud Integration** - Optional sync with Google Drive, Dropbox, etc.

### ⚡ **Advanced Features**
- **Smart Paste Enhancement** - Detect more diagram formats (PlantUML, etc.)
- **Offline PWA** - Full offline functionality as a Progressive Web App
- **Plugin System** - Allow custom extensions and integrations

---

## 📋 **Implementation Status**

### ✅ **Completed Features**
- Cross-device sync (URL sharing, import/export, drag & drop)
- Custom modal system (AlertModal, ConfirmModal, PromptModal)
- Enhanced panning with right-click always enabled
- Copy code functionality with visual feedback
- Smart paste detection for Mermaid diagrams
- Professional print functionality (Ctrl+P)
- About section with author information
- Welcome guide with feature overview
- Custom favicon and branding
- Keyboard shortcuts (Ctrl+C, Ctrl+S, Ctrl+M, Ctrl+E, Esc) ✅
- Scrollable diagram list with fixed controls ✅

### 🚧 **In Progress**
- Recent files functionality
- Guided diagram creation system (rethinking templates approach)

### 💡 **Key Insight**
Instead of simple code templates, users need **guided creation tools** that teach Mermaid syntax while building diagrams. This is especially important for users unfamiliar with Mermaid syntax.

### 📝 **Planned**
- Syntax highlighting for code editor
- Search and filter functionality
- Split view mode

---

## 🤝 **Contributing**

Want to help implement these features? Check out our [Contributing Guidelines](README.md#contributing) and pick an item from the roadmap!

### **Getting Started with Development**
1. Choose a feature from the **Low Hanging Fruits** section
2. Create a feature branch: `git checkout -b feature/keyboard-shortcuts`
3. Follow the existing code patterns and TypeScript conventions
4. Test your changes thoroughly
5. Update this roadmap to mark features as completed
6. Submit a pull request

---

## 📞 **Feedback & Suggestions**

Have ideas for new features? [Open an issue](https://github.com/mamertofabian/mermaid-diagram-editor/issues) or reach out:

- 📅 [Book a consultation](https://calendly.com/mamerto/30min)
- 🐙 [GitHub Discussions](https://github.com/mamertofabian/mermaid-diagram-editor/discussions)
- 📧 Contact: [Mamerto Fabian](https://mamerto.codefrost.dev)

---

*Last updated: 2025-01-23*  
*Maintained by: [Mamerto Fabian](https://mamerto.codefrost.dev) at [Codefrost](https://codefrost.dev)*