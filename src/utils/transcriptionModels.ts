import type { TranscriptionModelOption } from '../types';

export const TRANSCRIPTION_MODELS: TranscriptionModelOption[] = [
    {
        id: 'fast',
        label: 'Fast',
        modelName: 'Xenova/whisper-tiny.en',
        description: 'Quick drafts and previews. Lowest accuracy.',
        estimatedSize: '~40 MB',
    },
    {
        id: 'balanced',
        label: 'Balanced',
        modelName: 'Xenova/whisper-base.en',
        description: 'Better word accuracy without a huge first download.',
        estimatedSize: '~75 MB',
    },
    {
        id: 'accurate',
        label: 'Accurate',
        modelName: 'Xenova/whisper-small.en',
        description: 'Best browser-local English captions. Slower first run.',
        estimatedSize: '~240 MB',
    },
];

export const DEFAULT_TRANSCRIPTION_MODEL = TRANSCRIPTION_MODELS[1];

