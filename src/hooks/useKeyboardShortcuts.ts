import { useEffect } from 'react';
import { useAppStore } from '../store/app.store';

interface KeyboardShortcut {
    key: string;
    description: string;
    category: 'playback' | 'navigation' | 'app';
    action: () => void;
    preventDefault?: boolean;
}

export const useKeyboardShortcuts = () => {
    const {
        isPlaying,
        setIsPlaying,
        currentTime,
        setCurrentTime,
        duration,
        showStylePanel,
        setShowStylePanel,
    } = useAppStore();

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            // Don't trigger shortcuts if user is typing in an input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            // Create a key identifier (handles modifiers)
            const key = e.key.toLowerCase();

            switch (key) {
                // Playback controls
                case ' ':
                case 'k':
                    e.preventDefault();
                    setIsPlaying(!isPlaying);
                    break;

                case 'arrowleft':
                case 'j':
                    e.preventDefault();
                    setCurrentTime(Math.max(0, currentTime - 5));
                    break;

                case 'arrowright':
                case 'l':
                    e.preventDefault();
                    setCurrentTime(Math.min(duration, currentTime + 5));
                    break;

                // App shortcuts
                case 's':
                    if (e.ctrlKey || e.metaKey) {
                        // Allow Ctrl/Cmd+S for save
                        return;
                    }
                    e.preventDefault();
                    setShowStylePanel(!showStylePanel);
                    break;

                case 'e':
                    e.preventDefault();
                    // Scroll to export panel
                    document.querySelector('.export-panel')?.scrollIntoView({ behavior: 'smooth' });
                    break;

                case '?':
                    e.preventDefault();
                    // Show keyboard shortcuts modal (handled in parent component)
                    window.dispatchEvent(new CustomEvent('show-shortcuts'));
                    break;

                case 'escape':
                    e.preventDefault();
                    if (showStylePanel) {
                        setShowStylePanel(false);
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [currentTime, duration, isPlaying, setCurrentTime, setIsPlaying, setShowStylePanel, showStylePanel]);
};

// Export shortcuts definition for documentation
export const KEYBOARD_SHORTCUTS: KeyboardShortcut[] = [
    // Playback
    { key: 'Space', description: 'Play / Pause', category: 'playback', action: () => { }, preventDefault: true },
    { key: 'K', description: 'Play / Pause', category: 'playback', action: () => { } },
    { key: '← / J', description: 'Rewind 5 seconds', category: 'playback', action: () => { }, preventDefault: true },
    { key: '→ / L', description: 'Forward 5 seconds', category: 'playback', action: () => { }, preventDefault: true },

    // Navigation  
    { key: 'E', description: 'Jump to Export panel', category: 'navigation', action: () => { } },
    { key: 'S', description: 'Toggle Style panel', category: 'app', action: () => { } },
    { key: '?', description: 'Show keyboard shortcuts', category: 'app', action: () => { } },
    { key: 'Esc', description: 'Close panels', category: 'app', action: () => { } },
];
