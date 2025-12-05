import React from 'react';
import { X, Keyboard } from 'lucide-react';
import { KEYBOARD_SHORTCUTS } from '../../hooks/useKeyboardShortcuts';

interface KeyboardShortcutsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const playbackShortcuts = KEYBOARD_SHORTCUTS.filter(s => s.category === 'playback');
    const navigationShortcuts = KEYBOARD_SHORTCUTS.filter(s => s.category === 'navigation');
    const appShortcuts = KEYBOARD_SHORTCUTS.filter(s => s.category === 'app');

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="glass rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto custom-scrollbar animate-slide-up">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Keyboard className="w-6 h-6 text-electric-blue" />
                        <h2 className="text-2xl font-bold">Keyboard Shortcuts</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Shortcuts List */}
                <div className="space-y-6">
                    {/* Playback */}
                    <div>
                        <h3 className="text-lg font-semibold text-zinc-400 mb-3">Playback</h3>
                        <div className="space-y-2">
                            {playbackShortcuts.map((shortcut, index) => (
                                <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-zinc-800/50">
                                    <span className="text-zinc-300">{shortcut.description}</span>
                                    <kbd className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-sm font-mono">
                                        {shortcut.key}
                                    </kbd>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div>
                        <h3 className="text-lg font-semibold text-zinc-400 mb-3">Navigation</h3>
                        <div className="space-y-2">
                            {navigationShortcuts.map((shortcut, index) => (
                                <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-zinc-800/50">
                                    <span className="text-zinc-300">{shortcut.description}</span>
                                    <kbd className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-sm font-mono">
                                        {shortcut.key}
                                    </kbd>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* App Controls */}
                    <div>
                        <h3 className="text-lg font-semibold text-zinc-400 mb-3">App Controls</h3>
                        <div className="space-y-2">
                            {appShortcuts.map((shortcut, index) => (
                                <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-zinc-800/50">
                                    <span className="text-zinc-300">{shortcut.description}</span>
                                    <kbd className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-sm font-mono">
                                        {shortcut.key}
                                    </kbd>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 pt-6 border-t border-zinc-800">
                    <p className="text-sm text-zinc-500 text-center">
                        Press <kbd className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-xs font-mono">?</kbd> anytime to view this help
                    </p>
                </div>
            </div>
        </div>
    );
};

export default KeyboardShortcutsModal;
