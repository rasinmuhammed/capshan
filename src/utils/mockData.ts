import type { TranscriptSegment } from '../types';

// Mock transcript data for testing
export const mockSegments: TranscriptSegment[] = [
    {
        id: 'segment-0',
        start: 0.0,
        end: 1.8,
        text: 'Make captions people actually watch.',
        words: [
            { word: 'Make', start: 0.0, end: 0.35 },
            { word: 'captions', start: 0.35, end: 0.85 },
            { word: 'people', start: 0.85, end: 1.2 },
            { word: 'actually', start: 1.2, end: 1.55 },
            { word: 'watch.', start: 1.55, end: 1.8 },
        ],
    },
    {
        id: 'segment-1',
        start: 1.9,
        end: 3.5,
        text: 'Pick a better local AI model.',
        words: [
            { word: 'Pick', start: 1.9, end: 2.2 },
            { word: 'a', start: 2.2, end: 2.32 },
            { word: 'better', start: 2.32, end: 2.7 },
            { word: 'local', start: 2.7, end: 3.0 },
            { word: 'AI', start: 3.0, end: 3.22 },
            { word: 'model.', start: 3.22, end: 3.5 },
        ],
    },
    {
        id: 'segment-2',
        start: 3.6,
        end: 5.0,
        text: 'Then export without a watermark.',
        words: [
            { word: 'Then', start: 3.6, end: 3.9 },
            { word: 'export', start: 3.9, end: 4.25 },
            { word: 'without', start: 4.25, end: 4.62 },
            { word: 'a', start: 4.62, end: 4.72 },
            { word: 'watermark.', start: 4.72, end: 5.0 },
        ],
    },
];
