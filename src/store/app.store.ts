import { create } from 'zustand';
import type { AppState, CaptionStyle } from '../types';
import { CAPTION_PRESETS } from '../utils/captionPresets';
import { DEFAULT_TRANSCRIPTION_MODEL } from '../utils/transcriptionModels';

export const STYLE_TEMPLATES = CAPTION_PRESETS;

const defaultCaptionStyle: CaptionStyle = {
    // Display Mode
    displayMode: 'word-by-word',

    // Text Styling
    fontFamily: 'Montserrat',
    fontSize: 52,
    fontWeight: 800,
    color: '#ffffff',
    textTransform: 'none',
    letterSpacing: 1,

    // Stroke
    strokeEnabled: true,
    strokeColor: '#000000',
    strokeWidth: 3,

    // Background
    showBackground: false,
    backgroundColor: '#000000',
    backgroundOpacity: 0.7,
    backgroundPadding: 8,
    backgroundRadius: 6,

    // Position & Layout
    position: 'bottom',
    linesPerCaption: 2,
    wordsPerLine: 4,
    lineSpacing: 1.2,

    // Animation
    animation: 'pop',
    animationSpeed: 1,

    // Active Word Styling
    activeWordColor: '#FFD700',
    activeWordFontFamily: 'Montserrat',
    activeWordFontSize: 52,
    activeWordFontWeight: 900,
    activeWordScale: 1.15,
    activeWordBackground: false,
    activeWordBackgroundColor: '#FFD700',

    // Emphasis Styling
    autoEmphasize: false,
    emphasisColor: '#FFD700',
    emphasisFontFamily: 'Pinyon Script',
    emphasisFontSize: 56,
    emphasisFontWeight: 400,
    emphasisStyle: 'both',

    // Glow Effect
    glowEnabled: true,
    glowColor: '#FFD700',
    glowIntensity: 15,

    // Shadow Effect
    shadowEnabled: true,
    shadowColor: '#000000',
    shadowBlur: 10,
    shadowOffsetX: 2,
    shadowOffsetY: 2,

    // Legacy
    highlightColor: '#FFD700',
    outline: true,
    outlineColor: '#000000',
    templateId: 'hormozi',
};

export const useAppStore = create<AppState>((set) => ({
    // File state
    mediaFile: null,
    setMediaFile: (file) => set({ mediaFile: file }),

    // Transcription state
    segments: [],
    setSegments: (segments) => set({ segments }),
    transcriptMetadata: null,
    setTranscriptMetadata: (metadata) => set({ transcriptMetadata: metadata }),
    transcriptionModel: DEFAULT_TRANSCRIPTION_MODEL,
    setTranscriptionModel: (model) => set({ transcriptionModel: model }),
    viralSuggestion: null,
    setViralSuggestion: (suggestion) => set({ viralSuggestion: suggestion }),
    isTranscribing: false,
    setIsTranscribing: (isTranscribing) => set({ isTranscribing }),
    transcriptionProgress: 0,
    setTranscriptionProgress: (progress) => set({ transcriptionProgress: progress }),

    // Playback state
    currentTime: 0,
    setCurrentTime: (time) => set({ currentTime: time }),
    isPlaying: false,
    setIsPlaying: (isPlaying) => set({ isPlaying }),
    duration: 0,
    setDuration: (duration) => set({ duration }),

    // Active word tracking
    activeSegmentId: null,
    setActiveSegmentId: (id) => set({ activeSegmentId: id }),
    activeWordIndex: -1,
    setActiveWordIndex: (index) => set({ activeWordIndex: index }),

    // Caption styling
    captionStyle: defaultCaptionStyle,
    setCaptionStyle: (style) =>
        set((state) => ({
            captionStyle: { ...state.captionStyle, ...style },
        })),

    updateSegment: (id, updates) =>
        set((state) => ({
            segments: state.segments.map((s) =>
                s.id === id ? { ...s, ...updates } : s
            ),
        })),

    deleteSegment: (id) =>
        set((state) => ({
            segments: state.segments.filter((s) => s.id !== id),
        })),

    toggleWordEmphasis: (segmentId: string, wordIndex: number) =>
        set((state) => ({
            segments: state.segments.map((s) => {
                if (s.id !== segmentId) return s;
                const newWords = [...s.words];
                if (newWords[wordIndex]) {
                    newWords[wordIndex] = {
                        ...newWords[wordIndex],
                        isEmphasized: !newWords[wordIndex].isEmphasized
                    };
                }
                return { ...s, words: newWords };
            })
        })),

    applyAutoEmphasis: () =>
        set((state) => {
            // Words that should be emphasized
            const emotionalWords = ['amazing', 'wow', 'incredible', 'awesome', 'insane', 'crazy', 'perfect', 'love', 'best', 'worst', 'terrible', 'amazing', 'epic', 'legendary', 'fire', 'sick', 'dope', 'lit', 'vibes', 'banger'];

            const shouldEmphasize = (word: string): boolean => {
                const cleaned = word.toLowerCase().replace(/[^a-z0-9]/g, '');

                // CAPS words (if original has 2+ caps letters)
                if (word.match(/[A-Z]{2,}/)) return true;

                // Numbers
                if (/\d/.test(word)) return true;

                // Emotional/important words
                if (emotionalWords.includes(cleaned)) return true;

                // Exclamation
                if (word.includes('!')) return true;

                return false;
            };

            return {
                segments: state.segments.map((segment) => ({
                    ...segment,
                    words: segment.words.map((word) => ({
                        ...word,
                        isEmphasized: state.captionStyle.autoEmphasize ? shouldEmphasize(word.word) : (word.isEmphasized || false)
                    }))
                }))
            };
        }),

    addSegment: (index) =>
        set((state) => {
            const segments = [...state.segments];
            const prev = segments[index];
            const next = segments[index + 1];

            // Calculate start/end times for new segment
            const start = prev ? prev.end : 0;
            const end = next ? next.start : (prev ? prev.end + 2 : 2);

            const newSegment = {
                id: Math.random().toString(36).substr(2, 9),
                start,
                end,
                text: 'New segment',
                words: []
            };

            segments.splice(index + 1, 0, newSegment);
            return { segments };
        }),

    // Export state
    isExporting: false,
    setIsExporting: (isExporting) => set({ isExporting }),
    exportProgress: 0,
    setExportProgress: (progress) => set({ exportProgress: progress }),
    exportAspectRatio: 'original',
    setExportAspectRatio: (ratio) => set({ exportAspectRatio: ratio }),

    // UI state
    showStylePanel: false,
    setShowStylePanel: (show) => set({ showStylePanel: show }),
    error: null,
    setError: (error) => set({ error }),
}));
