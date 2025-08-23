# 🧜‍♀️ Mermaid Diagram Editor

A modern, feature-rich web-based editor for creating and managing Mermaid diagrams with real-time preview, cross-device sync, and advanced export capabilities.

## 🚀 Live Demo

**Try it now:** [mermaid.codefrost.dev](https://mermaid.codefrost.dev/)

![Mermaid Diagram Editor Screenshot](https://via.placeholder.com/800x400/1f2937/ffffff?text=Mermaid+Diagram+Editor)

## ✨ Features

### 🎨 **Editor & Preview**
- 📊 **Real-time Mermaid diagram rendering** with live preview
- 📝 **Smart code editor** with auto-save functionality  
- 🔍 **Advanced zoom & pan controls** (mouse wheel + drag)
- 📺 **Full-screen preview mode** for distraction-free viewing
- 🎨 **Light/Dark theme support** with optimal contrast
- 🖱️ **Enhanced panning**: Right-click always enabled, left-click toggleable

### 💾 **Cross-Device Sync & Storage**
- 🔗 **URL-based sharing** - Generate shareable links for any diagram
- 📁 **File import/export** - Support for .mmd and .json backup files
- 🗂️ **Drag & drop import** - Simply drop files to import diagrams
- 📋 **Smart paste detection** - Paste Mermaid code to auto-create diagrams
- 💾 **Auto-backup system** - Export all diagrams as JSON backup

### 🚀 **Export & Print**
- 📄 **Multi-format export**: PDF, PNG, SVG, MMD
- 🖨️ **Print optimization** - Clean, centered printing via Ctrl+P
- 📱 **Enhanced mobile controls** - 2-row layout with expandable export options
- ⚡ **High-quality exports** with proper scaling and backgrounds
- 🎮 **Smooth animations** - Fluid sidebar transitions and control animations

### 🎯 **User Experience**
- ✨ **Custom modal system** - No ugly browser alerts/confirms
- 🎉 **Interactive welcome guide** - Comprehensive feature overview  
- 📂 **Smart diagram management** - Create, rename, delete, organize
- 🔄 **Persistent state** - Remembers your preferences and diagrams
- 🌐 **No login required** - Works completely offline after first load

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/mamertofabian/mermaid-diagram-editor.git
cd mermaid-diagram-editor
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📖 Usage

### 🆕 **Creating Diagrams**
1. **New Diagram**: Click the '+' button in the sidebar
2. **Smart Paste**: Copy Mermaid code and paste anywhere - automatically creates a new diagram
3. **Import Files**: Drag & drop .mmd or .json files, or use the Import button

### ✏️ **Editing & Viewing**
1. **Live Editing**: Write Mermaid syntax and see real-time preview
2. **View Modes**: Toggle between code and preview modes (eye/code icons)
3. **Auto-Save**: All changes are automatically saved as you type

### 🔍 **Navigation & Controls**
- **Zoom**: Mouse wheel or +/- buttons
- **Pan**: Left-click drag (toggleable) or right-click drag (always enabled)  
- **Full-screen**: Click expand icon for distraction-free viewing
- **Themes**: Switch between light/dark themes for optimal contrast
- **Mobile**: 2-row control layout with expandable export buttons and smooth animations

### 🔗 **Sharing & Export**
- **Share**: Click share icon to generate URL and copy to clipboard
- **Export Single**: Export individual diagrams as .mmd files
- **Export All**: Backup all diagrams as JSON file
- **Print**: Use Ctrl+P for clean, diagram-only printing
- **Multi-format**: Export as PDF, PNG, or SVG

## 🛠️ Built With

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite (for fast development and optimized builds)
- **Diagram Engine**: Mermaid.js (latest version)
- **Styling**: Tailwind CSS (utility-first CSS framework)
- **Icons**: Lucide React (beautiful, customizable icons)
- **Export**: jsPDF + html2canvas (high-quality exports)
- **Storage**: Browser localStorage (no backend required)

## 🎯 Architecture

- **Component-based**: Modular React components with TypeScript
- **Service Layer**: Separate services for storage, import/export, and utilities
- **State Management**: React hooks (useState, useEffect) - no external state library needed
- **Theme System**: CSS-in-JS with Tailwind for consistent theming
- **File Handling**: Native File API with drag & drop support
- **URL Encoding**: Base64 encoding with Unicode support for sharing

## 👨‍💻 About the Author

**Mamerto Fabian**  
*Founder & AI Solutions Architect*  
*Codefrost | AI-Driven Coder*

[![Book Consultation](https://img.shields.io/badge/📅_Book-Consultation-blue?style=flat-square)](https://calendly.com/mamerto/30min)
[![YouTube](https://img.shields.io/badge/▶️_AI_Driven-Coder-red?style=flat-square)](https://youtube.com/@aidrivencoder)
[![Codefrost](https://img.shields.io/badge/🌐_Visit-Codefrost-green?style=flat-square)](https://codefrost.dev/)

[![GitHub](https://img.shields.io/badge/GitHub-@mamertofabian-black?style=flat-square&logo=github)](https://github.com/mamertofabian)
[![Portfolio](https://img.shields.io/badge/Portfolio-mamerto.codefrost.dev-blue?style=flat-square)](https://mamerto.codefrost.dev)

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)  
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow the existing code style and TypeScript patterns
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation if needed

## 🐛 Bug Reports & Feature Requests

Found a bug or have a feature idea? Please [open an issue](https://github.com/mamertofabian/mermaid-diagram-editor/issues) with:
- Clear description of the problem/feature
- Steps to reproduce (for bugs)
- Screenshots if applicable
- Your environment details

## ⭐ Show Your Support

If this project helped you, please consider:
- ⭐ **Starring** the repository
- 🐦 **Sharing** it on social media  
- 📝 **Writing** a blog post about it
- ☕ **Supporting** the developer

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**🚀 [Try the Live Demo](https://mermaid.codefrost.dev/) | 💻 [View Source](https://github.com/mamertofabian/mermaid-diagram-editor) | 📅 [Book Consultation](https://calendly.com/mamerto/30min)**

*Built with ❤️ by [Mamerto Fabian](https://mamerto.codefrost.dev) at [Codefrost](https://codefrost.dev)*

</div>
