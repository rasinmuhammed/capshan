import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore } from './store/app.store';
import UploadZone from './components/upload/UploadZone';
import EditorLayout from './components/editor/EditorLayout';
import TranscriptionProcessor from './components/upload/TranscriptionProcessor';
import StylePanel from './components/styling/StylePanel';
import KeyboardShortcutsModal from './components/ui/KeyboardShortcutsModal';
import { ToastProvider } from './components/ui/Toast';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

import Header from './components/layout/Header';

function App() {
  const { mediaFile, error, setError } = useAppStore();
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Initialize keyboard shortcuts
  useKeyboardShortcuts();

  // Listen for show-shortcuts event
  useEffect(() => {
    const handleShowShortcuts = () => setShowShortcuts(true);
    window.addEventListener('show-shortcuts', handleShowShortcuts);
    return () => window.removeEventListener('show-shortcuts', handleShowShortcuts);
  }, []);

  return (
    <ToastProvider>
      <div className={`h-screen bg-black text-white overflow-hidden ${!mediaFile ? '' : 'pt-16'}`}>
        <Header />

        {/* Error Toast - Now using animated version */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 z-50 glass p-4 rounded-xl border border-red-500/30 max-w-md backdrop-blur-xl"
            >
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 animate-pulse" />
                <div className="flex-1">
                  <p className="text-sm text-zinc-300">{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="text-xs text-zinc-500 hover:text-white mt-1 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Transcription Processor (shows when processing) */}
        {mediaFile && <TranscriptionProcessor />}

        {/* Style Panel (shows when file is uploaded) */}
        {mediaFile && <StylePanel />}

        {/* Keyboard Shortcuts Modal */}
        <KeyboardShortcutsModal
          isOpen={showShortcuts}
          onClose={() => setShowShortcuts(false)}
        />

        {/* Main Content with Page Transitions */}
        <AnimatePresence mode="wait">
          {!mediaFile ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <UploadZone />
            </motion.div>
          ) : (
            <motion.div
              key="editor"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="h-full"
            >
              <EditorLayout />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToastProvider>
  );
}

export default App;
