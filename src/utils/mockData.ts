import type { TranscriptSegment } from '../types';

// Mock transcript data for testing
export const mockSegments: TranscriptSegment[] = [
    {
        id: 'segment-0',
        start: 0.0,
        end: 3.5,
        text: 'Welcome to our amazing video transcription app.',
        words: [
            { word: 'Welcome', start: 0.0, end: 0.5 },
            { word: 'to', start: 0.5, end: 0.7 },
            { word: 'our', start: 0.7, end: 0.9 },
            { word: 'amazing', start: 0.9, end: 1.5 },
            { word: 'video', start: 1.5, end: 2.0 },
            { word: 'transcription', start: 2.0, end: 2.9 },
            { word: 'app.', start: 2.9, end: 3.5 },
        ],
    },
    {
        id: 'segment-1',
        start: 4.0,
        end: 7.5,
        text: 'This tool uses AI to transcribe your audio and video files.',
        words: [
            { word: 'This', start: 4.0, end: 4.3 },
            { word: 'tool', start: 4.3, end: 4.6 },
            { word: 'uses', start: 4.6, end: 4.9 },
            { word: 'AI', start: 4.9, end: 5.2 },
            { word: 'to', start: 5.2, end: 5.3 },
            { word: 'transcribe', start: 5.3, end: 6.0 },
            { word: 'your', start: 6.0, end: 6.2 },
            { word: 'audio', start: 6.2, end: 6.6 },
            { word: 'and', start: 6.6, end: 6.8 },
            { word: 'video', start: 6.8, end: 7.1 },
            { word: 'files.', start: 7.1, end: 7.5 },
        ],
    },
    {
        id: 'segment-2',
        start: 8.0,
        end: 12.0,
        text: 'You can customize the caption style and export as video.',
        words: [
            { word: 'You', start: 8.0, end: 8.2 },
            { word: 'can', start: 8.2, end: 8.4 },
            { word: 'customize', start: 8.4, end: 9.1 },
            { word: 'the', start: 9.1, end: 9.2 },
            { word: 'caption', start: 9.2, end: 9.6 },
            { word: 'style', start: 9.6, end: 10.0 },
            { word: 'and', start: 10.0, end: 10.2 },
            { word: 'export', start: 10.2, end: 10.7 },
            { word: 'as', start: 10.7, end: 10.9 },
            { word: 'video.', start: 10.9, end: 12.0 },
        ],
    },
];
