import { useMemo } from 'react';
import { useAppStore } from '../store/app.store';
import type { Word, TranscriptSegment } from '../types';

interface CurrentWordResult {
    word: Word;
    segment: TranscriptSegment;
    wordIndex: number;
    segmentIndex: number;
    progress: number; // 0-1 progress through the word
    wordsInContext: Word[];
    contextStartIndex: number;
}

export const useCurrentWord = (): CurrentWordResult | null => {
    const { segments, currentTime } = useAppStore();

    return useMemo(() => {
        for (let segIdx = 0; segIdx < segments.length; segIdx++) {
            const segment = segments[segIdx];
            for (let wordIdx = 0; wordIdx < segment.words.length; wordIdx++) {
                const word = segment.words[wordIdx];
                if (currentTime >= word.start && currentTime < word.end) {
                    // Calculate progress through the word (0-1)
                    const wordDuration = word.end - word.start;
                    const elapsed = currentTime - word.start;
                    const progress = wordDuration > 0 ? elapsed / wordDuration : 0;

                    // Get context words (surrounding words for display)
                    const contextSize = 3; // Show 3 words before and after
                    const contextStart = Math.max(0, wordIdx - contextSize);
                    const contextEnd = Math.min(segment.words.length, wordIdx + contextSize + 1);
                    const wordsInContext = segment.words.slice(contextStart, contextEnd);

                    return {
                        word,
                        segment,
                        wordIndex: wordIdx,
                        segmentIndex: segIdx,
                        progress,
                        wordsInContext,
                        contextStartIndex: contextStart,
                    };
                }
            }
        }
        return null;
    }, [segments, currentTime]);
};

// Helper to determine if a word should be emphasized (important keywords)
const EMPHASIS_WORDS = new Set([
    'money', 'million', 'billion', 'revenue', 'profit', 'success', 'grow', 'growth',
    'never', 'always', 'best', 'worst', 'first', 'last', 'only', 'must', 'need',
    'secret', 'trick', 'hack', 'strategy', 'system', 'method', 'way',
    'free', 'now', 'today', 'immediately', 'instant', 'fast', 'quick',
    'stop', 'start', 'do', 'dont', 'cant', 'wont', 'will',
    'why', 'how', 'what', 'when', 'who', 'where',
    'amazing', 'incredible', 'insane', 'crazy', 'massive', 'huge', 'big',
    'love', 'hate', 'want', 'need', 'think', 'know', 'believe',
    'every', 'all', 'nothing', 'everything', 'everyone', 'nobody',
]);

export const shouldEmphasize = (word: string): boolean => {
    const cleaned = word.toLowerCase().replace(/[^a-z]/g, '');
    return EMPHASIS_WORDS.has(cleaned) || cleaned.length > 8;
};

// Get emphasis color based on word
export const getEmphasisColor = (word: string, index: number): string => {
    const colors = ['#FFE600', '#00FF41', '#FF3366', '#00D4FF'];
    // Use word hash for consistent color per word
    const hash = word.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[(hash + index) % colors.length];
};

