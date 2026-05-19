import React, { useMemo } from 'react';
import { BadgeCheck, Clapperboard, Scissors, Sparkles, Wand2 } from 'lucide-react';
import { useAppStore, STYLE_TEMPLATES } from '../../store/app.store';
import { analyzeViralWorkflow, applyViralEmphasis } from '../../utils/viralWorkflow';
import { formatTime } from '../../utils/time';

const ViralCommandCenter: React.FC = () => {
    const {
        segments,
        setSegments,
        captionStyle,
        setCaptionStyle,
        exportAspectRatio,
        setCurrentTime,
        setViralSuggestion,
        viralSuggestion,
    } = useAppStore();

    const suggestion = useMemo(
        () => analyzeViralWorkflow(segments, exportAspectRatio),
        [segments, exportAspectRatio],
    );

    if (!suggestion) return null;

    const recommendedPreset = STYLE_TEMPLATES.find((preset) => preset.id === suggestion.recommendedPresetId);
    const currentSuggestion = viralSuggestion || suggestion;

    const makeViral = () => {
        setSegments(applyViralEmphasis(segments));
        setCaptionStyle({
            ...(recommendedPreset?.style || {}),
            templateId: recommendedPreset?.id || captionStyle.templateId,
            textTransform: 'uppercase',
            position: exportAspectRatio === '9:16' ? 'bottom' : captionStyle.position,
        });
        setViralSuggestion(suggestion);
    };

    return (
        <div className="glass p-4 rounded-xl">
            <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                    <Wand2 className="w-4 h-4 text-capshan-gold" />
                    <h3 className="font-bold text-sm">Viral Lab</h3>
                </div>
                <button
                    onClick={makeViral}
                    className="inline-flex items-center gap-1.5 bg-capshan-gold text-black px-3 py-2 rounded-lg text-xs font-black hover:bg-yellow-300 transition-colors"
                >
                    <Sparkles className="w-3.5 h-3.5" />
                    Make Viral
                </button>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="rounded-lg bg-zinc-950/60 border border-zinc-800 p-3">
                    <Clapperboard className="w-4 h-4 text-cyan-300 mb-1" />
                    <div className="text-[10px] uppercase text-zinc-500">Format</div>
                    <div className="text-xs font-bold text-white">{currentSuggestion.platform}</div>
                </div>
                <div className="rounded-lg bg-zinc-950/60 border border-zinc-800 p-3">
                    <Scissors className="w-4 h-4 text-pink-300 mb-1" />
                    <div className="text-[10px] uppercase text-zinc-500">Cleanups</div>
                    <div className="text-xs font-bold text-white">
                        {currentSuggestion.fillerWords + currentSuggestion.silenceGaps} cues
                    </div>
                </div>
                <div className="rounded-lg bg-zinc-950/60 border border-zinc-800 p-3">
                    <BadgeCheck className="w-4 h-4 text-green-300 mb-1" />
                    <div className="text-[10px] uppercase text-zinc-500">Style</div>
                    <div className="text-xs font-bold text-white truncate">{recommendedPreset?.name || 'Hormozi'}</div>
                </div>
            </div>

            <div className="rounded-lg border border-capshan-gold/20 bg-capshan-gold/5 p-3 mb-3">
                <div className="text-[10px] uppercase text-capshan-gold font-bold mb-1">Suggested Hook</div>
                <div className="text-sm font-semibold text-white leading-snug">{currentSuggestion.hookTitle}</div>
            </div>

            <div className="space-y-2">
                {currentSuggestion.moments.map((moment) => (
                    <button
                        key={moment.id}
                        onClick={() => setCurrentTime(moment.start)}
                        className="w-full text-left rounded-lg bg-zinc-950/50 border border-zinc-800 hover:border-capshan-gold/40 p-3 transition-colors"
                    >
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-xs font-bold text-white">{moment.title}</span>
                            <span className="text-[10px] font-mono text-capshan-gold">
                                {formatTime(moment.start)}-{formatTime(moment.end)}
                            </span>
                        </div>
                        <div className="mt-1 text-[11px] text-zinc-500">{moment.reason}</div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ViralCommandCenter;

