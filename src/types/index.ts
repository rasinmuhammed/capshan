// Core types for the video transcription app

export interface Word {
    word: string;
    start: number;
    end: number;
    isEmphasized?: boolean;
}

export interface TranscriptSegment {
    id: string;
    start: number;
    end: number;
    text: string;
    words: Word[];
}

export interface CaptionStyle {
    // Display Mode
    displayMode: 'flow' | 'word-by-word' | 'typewriter' | 'line-by-line';

    // Text Styling
    fontFamily: string;
    fontSize: number;
    fontWeight: number;
    color: string;
    textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
    letterSpacing: number;

    // Stroke/Outline
    strokeEnabled: boolean;
    strokeColor: string;
    strokeWidth: number;

    // Background
    showBackground: boolean;
    backgroundColor: string;
    backgroundOpacity: number;
    backgroundPadding: number;
    backgroundRadius: number;

    // Position & Layout
    position: 'top' | 'center' | 'bottom';
    linesPerCaption: number;
    wordsPerLine: number;
    lineSpacing: number;

    // Animation
    animation: 'none' | 'fade' | 'slide' | 'pop' | 'bounce' | 'scale';
    animationSpeed: number;

    // Active Word Styling
    activeWordColor: string;
    activeWordFontFamily: string;
    activeWordFontSize: number;
    activeWordFontWeight: number;
    activeWordScale: number;
    activeWordBackground: boolean;
    activeWordBackgroundColor: string;

    // Emphasis Styling (auto-emphasis)
    autoEmphasize: boolean;
    emphasisColor: string;
    emphasisFontFamily: string;
    emphasisFontSize: number;
    emphasisFontWeight: number;
    emphasisStyle: 'color' | 'font' | 'both';

    // Glow Effect
    glowEnabled: boolean;
    glowColor: string;
    glowIntensity: number;

    // Shadow Effect
    shadowEnabled: boolean;
    shadowColor: string;
    shadowBlur: number;
    shadowOffsetX: number;
    shadowOffsetY: number;

    // Legacy (keep for compatibility)
    highlightColor: string;
    outline: boolean;
    outlineColor: string;
    templateId: string;
}

export interface MediaFile {
    file: File;
    url: string;
    type: 'audio' | 'video';
    duration: number;
    name: string;
}

export interface AppState {
    // File state
    mediaFile: MediaFile | null;
    setMediaFile: (file: MediaFile | null) => void;

    // Transcription state
    segments: TranscriptSegment[];
    setSegments: (segments: TranscriptSegment[]) => void;
    isTranscribing: boolean;
    setIsTranscribing: (isTranscribing: boolean) => void;
    transcriptionProgress: number;
    setTranscriptionProgress: (progress: number) => void;

    // Playback state
    currentTime: number;
    setCurrentTime: (time: number) => void;
    isPlaying: boolean;
    setIsPlaying: (isPlaying: boolean) => void;
    duration: number;
    setDuration: (duration: number) => void;

    // Active word tracking
    activeSegmentId: string | null;
    setActiveSegmentId: (id: string | null) => void;
    activeWordIndex: number;
    setActiveWordIndex: (index: number) => void;

    // Caption styling
    captionStyle: CaptionStyle;
    setCaptionStyle: (style: Partial<CaptionStyle>) => void;
    updateSegment: (id: string, updates: Partial<TranscriptSegment>) => void;
    deleteSegment: (id: string) => void;
    addSegment: (index: number) => void;
    toggleWordEmphasis: (segmentId: string, wordIndex: number) => void;
    applyAutoEmphasis: () => void;

    // Export state
    isExporting: boolean;
    setIsExporting: (isExporting: boolean) => void;
    exportProgress: number;
    setExportProgress: (progress: number) => void;
    exportAspectRatio: '16:9' | '9:16' | '1:1' | 'original';
    setExportAspectRatio: (ratio: '16:9' | '9:16' | '1:1' | 'original') => void;

    // UI state
    showStylePanel: boolean;
    setShowStylePanel: (show: boolean) => void;
    error: string | null;
    setError: (error: string | null) => void;
}

export interface WorkerMessage {
    type: 'progress' | 'complete' | 'error';
    data?: any;
}

export interface TranscriptionResult {
    segments: TranscriptSegment[];
}

export interface ExportOptions {
    format: 'mp4' | 'srt' | 'vtt' | 'txt';
    quality?: '720p' | '1080p';
    includeWordHighlight?: boolean;
}
