import { Calendar, Youtube, Github, ExternalLink, X, Sparkles, Code, Globe, Award } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto border border-gray-700/50 animate-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient background */}
        <div className="relative p-4 border-b border-gray-700/50 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 rounded-t-xl"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  About the Creator
                </h2>
                <p className="text-xs text-gray-400">Building the future with AI</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-all duration-200 hover:scale-110"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-5">
          {/* Author Info with enhanced styling */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-lg">
              MF
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-100 mb-1">Mamerto Fabian</h3>
              <div className="text-gray-300 mb-1 text-sm">Founder & AI Solutions Architect</div>
              <div className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-semibold text-base">
                Codefrost | AI-Driven Coder
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
              <Award className="w-3 h-3 text-yellow-500" />
              <span>Building innovative AI solutions</span>
            </div>
          </div>

          {/* New Layout - Clean Information Cards */}
          <div className="space-y-4">

            {/* Contact Actions - Minimal */}
            <div className="grid grid-cols-2 gap-3">
              <a
                href="https://calendly.com/mamerto/30min"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 hover:text-blue-200 rounded-lg transition-all duration-200 border border-blue-500/20 hover:border-blue-400/30 text-sm"
                title="Book a Consultation"
              >
                <Calendar className="w-4 h-4" />
                <span>Book a Call</span>
              </a>

              <a
                href="https://youtube.com/@aidrivencoder"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-3 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200 rounded-lg transition-all duration-200 border border-red-500/20 hover:border-red-400/30 text-sm"
                title="YouTube Channel"
              >
                <Youtube className="w-4 h-4" />
                <span>Watch on YouTube</span>
              </a>
            </div>

            {/* Professional Links - Clean List */}
            <div className="space-y-1">
              <a
                href="https://codefrost.dev/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-gray-100 rounded-lg transition-all duration-200 hover:bg-gray-700/30 text-sm"
                title="Codefrost"
              >
                <Globe className="w-4 h-4 text-gray-500" />
                <span>codefrost.dev</span>
              </a>

              <a
                href="https://github.com/mamertofabian"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-gray-100 rounded-lg transition-all duration-200 hover:bg-gray-700/30 text-sm"
                title="GitHub Profile"
              >
                <Github className="w-4 h-4 text-gray-500" />
                <span>@mamertofabian</span>
              </a>

              <a
                href="https://mamerto.codefrost.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-gray-100 rounded-lg transition-all duration-200 hover:bg-gray-700/30 text-sm"
                title="Portfolio"
              >
                <ExternalLink className="w-4 h-4 text-gray-500" />
                <span>mamerto.codefrost.dev</span>
              </a>
            </div>

            {/* App Information - Simple Display */}
            <div className="pt-2 border-t border-gray-700/50">
              <div className="space-y-2">
                <a
                  href="https://mermaid.codefrost.dev/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2 text-blue-300 hover:text-blue-200 rounded-lg transition-all duration-200 hover:bg-blue-500/10 text-sm"
                  title="Live App"
                >
                  <span className="text-lg">🚀</span>
                  <span>mermaid.codefrost.dev</span>
                </a>

                <a
                  href="https://github.com/mamertofabian/mermaid-diagram-editor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-gray-100 rounded-lg transition-all duration-200 hover:bg-gray-700/30 text-sm"
                  title="Source Code"
                >
                  <Code className="w-4 h-4 text-gray-500" />
                  <span>Open Source</span>
                </a>
              </div>
            </div>
          </div>

          {/* Footer with additional info */}
          <div className="text-center pt-3">
            <div className="text-xs text-gray-500 space-y-0.5">
              <p>Built with React, TypeScript & Tailwind CSS</p>
              <p>Powered by Mermaid.js for beautiful diagrams</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
