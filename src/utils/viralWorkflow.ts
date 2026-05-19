import type { TranscriptSegment, ViralMoment, ViralSuggestion } from '../types';

const HOOK_WORDS = new Set([
    'secret',
    'mistake',
    'never',
    'always',
    'stop',
    'start',
    'why',
    'how',
    'what',
    'money',
    'free',
    'million',
    'growth',
    'hack',
    'truth',
    'wrong',
    'fast',
    'today',
]);

const FILLER_WORDS = new Set([
    'um',
    'uh',
    'like',
    'basically',
    'actually',
    'literally',
    'you know',
    'sort of',
    'kind of',
]);

const cleanWord = (word: string) => word.toLowerCase().replace(/[^a-z0-9]/g, '');

const scoreSegment = (segment: TranscriptSegment, index: number): number => {
    const words = segment.words.length > 0 ? segment.words.map((word) => word.word) : segment.text.split(/\s+/);
    const text = segment.text.toLowerCase();
    const startsEarly = segment.start <= 5 ? 25 : 0;
    const question = text.includes('?') || /^(why|how|what|when|who)\b/.test(text) ? 18 : 0;
    const urgency = words.filter((word) => HOOK_WORDS.has(cleanWord(word))).length * 8;
    const numbers = /\d|million|billion|percent|%/.test(text) ? 14 : 0;
    const compact = words.length >= 4 && words.length <= 18 ? 10 : 0;
    const introBoost = index === 0 ? 12 : 0;

    return Math.min(100, startsEarly + question + urgency + numbers + compact + introBoost);
};

const buildHookTitle = (segments: TranscriptSegment[]): string => {
    const firstText = segments[0]?.text.trim();
    if (!firstText) return 'Make the first line impossible to ignore';

    const short = firstText.split(/\s+/).slice(0, 9).join(' ');
    if (/^(why|how|what)\b/i.test(short)) return short.replace(/[.]+$/, '?');
    if (short.length < 56) return short;
    return `${short.slice(0, 53).trim()}...`;
};

export function analyzeViralWorkflow(
    segments: TranscriptSegment[],
    aspectRatio: string,
): ViralSuggestion | null {
    if (segments.length === 0) return null;

    const ranked = segments
        .map((segment, index) => ({ segment, index, score: scoreSegment(segment, index) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

    const moments: ViralMoment[] = ranked.map(({ segment, score }, index) => ({
        id: `moment-${segment.id}`,
        start: segment.start,
        end: Math.min(segment.end, segment.start + 8),
        title: index === 0 ? 'Best hook candidate' : 'Strong retention beat',
        reason: score >= 70
            ? 'Early, specific, and high-urgency language.'
            : score >= 45
                ? 'Good pacing with searchable or emotional wording.'
                : 'Useful clip beat, but the opening line could be sharper.',
        score,
    }));

    const fullText = segments.map((segment) => segment.text.toLowerCase()).join(' ');
    const fillerWords = [...FILLER_WORDS].reduce((count, filler) => {
        const matches = fullText.match(new RegExp(`\\b${filler}\\b`, 'g'));
        return count + (matches?.length || 0);
    }, 0);

    const silenceGaps = segments.reduce((count, segment, index) => {
        const next = segments[index + 1];
        return next && next.start - segment.end > 0.75 ? count + 1 : count;
    }, 0);

    return {
        hookTitle: buildHookTitle(segments),
        platform: aspectRatio === '16:9'
            ? 'YouTube'
            : aspectRatio === '1:1'
                ? 'Instagram Feed'
                : 'TikTok/Reels/Shorts',
        moments,
        fillerWords,
        silenceGaps,
        recommendedPresetId: fillerWords > 3 ? 'podcast-bold' : 'hormozi',
    };
}

export function applyViralEmphasis(segments: TranscriptSegment[]): TranscriptSegment[] {
    return segments.map((segment) => ({
        ...segment,
        words: segment.words.map((word) => ({
            ...word,
            isEmphasized: word.isEmphasized || HOOK_WORDS.has(cleanWord(word.word)) || /\d/.test(word.word),
        })),
    }));
}

