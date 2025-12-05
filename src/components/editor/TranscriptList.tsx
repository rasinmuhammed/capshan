import React, { useRef, useEffect, useState } from 'react';
import { Clock, Trash2, Plus, Lock, Unlock } from 'lucide-react';
import { useAppStore } from '../../store/app.store';
import { formatTime } from '../../utils/time';

const TranscriptList: React.FC = () => {
    const listRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
    const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);
    const [editingSegmentId, setEditingSegmentId] = useState<string | null>(null);

    const {
        segments,
        currentTime,
        updateSegment,
        deleteSegment,
        addSegment,
        setCurrentTime,
        captionStyle,
        toggleWordEmphasis
    } = useAppStore();

    // Scroll to active segment
    useEffect(() => {
        if (!isAutoScrollEnabled) return;

        const activeIndex = segments.findIndex(
            s => currentTime >= s.start && currentTime < s.end
        );

        if (activeIndex !== -1 && itemRefs.current[activeIndex]) {
            itemRefs.current[activeIndex]?.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }, [currentTime, segments, isAutoScrollEnabled]);

    const handleSegmentClick = (start: number) => {
        setCurrentTime(start);
    };

    const handleWordClick = (e: React.MouseEvent, segmentId: string, wordIndex: number, start: number) => {
        e.stopPropagation();
        if (e.ctrlKey || e.metaKey) {
            toggleWordEmphasis(segmentId, wordIndex);
        } else {
            setCurrentTime(start);
        }
    };

    if (segments.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-4">
                <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center">
                    <Clock className="w-8 h-8 opacity-50" />
                </div>
                <p>No transcript segments yet</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header with Auto-scroll toggle */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-sm z-10">
                <h3 className="text-sm font-medium text-zinc-400">Transcript</h3>
                <div className="flex items-center gap-4">
                    <p className="text-xs text-zinc-500 hidden md:block">
                        <span className="font-mono bg-zinc-800 px-1 rounded">Ctrl</span> + Click to emphasize
                    </p>
                    <button
                        onClick={() => setIsAutoScrollEnabled(!isAutoScrollEnabled)}
                        className={`p-2 rounded-lg transition-colors flex items-center gap-2 text-xs ${isAutoScrollEnabled
                            ? 'bg-electric-blue/10 text-electric-blue'
                            : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                            }`}
                        title={isAutoScrollEnabled ? "Auto-scroll enabled" : "Auto-scroll disabled"}
                    >
                        {isAutoScrollEnabled ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                        {isAutoScrollEnabled ? 'Locked' : 'Free'}
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4" ref={listRef}>
                <div className="flex flex-col gap-4 pb-20">
                    {segments.map((segment, index) => {
                        const isActive = currentTime >= segment.start && currentTime < segment.end;
                        const isEditing = editingSegmentId === segment.id;

                        return (
                            <div
                                key={segment.id}
                                ref={el => { itemRefs.current[index] = el; }}
                                className={`
                                    group relative p-4 rounded-xl border transition-all duration-200 hover:border-zinc-700
                                    ${isActive
                                        ? 'bg-zinc-800/50 border-electric-blue/50 shadow-[0_0_20px_rgba(0,212,255,0.1)]'
                                        : 'bg-zinc-900/30 border-zinc-800/50 hover:bg-zinc-900/50'
                                    }
                                `}
                            >
                                {/* Time & Controls */}
                                <div className="flex items-center justify-between mb-2">
                                    <div
                                        className="flex items-center gap-2 text-xs font-mono text-zinc-500 cursor-pointer hover:text-electric-blue transition-colors"
                                        onClick={() => handleSegmentClick(segment.start)}
                                    >
                                        <Clock className="w-3 h-3" />
                                        <span>{formatTime(segment.start)} - {formatTime(segment.end)}</span>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => addSegment(index)}
                                            className="p-1.5 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-colors"
                                            title="Insert segment below"
                                        >
                                            <Plus className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={() => deleteSegment(segment.id)}
                                            className="p-1.5 hover:bg-red-500/10 rounded-lg text-zinc-400 hover:text-red-500 transition-colors"
                                            title="Delete segment"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>

                                {/* Content: Read Mode vs Edit Mode */}
                                {isEditing ? (
                                    <textarea
                                        value={segment.text}
                                        onChange={(e) => updateSegment(segment.id, { text: e.target.value })}
                                        onBlur={() => setEditingSegmentId(null)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Escape') setEditingSegmentId(null);
                                        }}
                                        autoFocus
                                        className={`
                                            w-full bg-transparent border-none resize-none focus:ring-0 p-0 font-medium leading-relaxed
                                            ${isActive ? 'text-white' : 'text-zinc-300'}
                                        `}
                                        style={{
                                            fontFamily: captionStyle.fontFamily,
                                            fontSize: '16px',
                                            minHeight: '24px'
                                        }}
                                        rows={Math.ceil(segment.text.length / (window.innerWidth < 768 ? 30 : 40))}
                                    />
                                ) : (
                                    <div
                                        onDoubleClick={() => setEditingSegmentId(segment.id)}
                                        className={`
                                            w-full font-medium leading-relaxed cursor-text
                                            ${isActive ? 'text-white' : 'text-zinc-300'}
                                        `}
                                        style={{
                                            fontFamily: captionStyle.fontFamily,
                                            fontSize: '16px',
                                            minHeight: '24px'
                                        }}
                                    >
                                        {segment.words && segment.words.length > 0 ? (
                                            segment.words.map((word, wIdx) => (
                                                <span
                                                    key={wIdx}
                                                    onClick={(e) => handleWordClick(e, segment.id, wIdx, word.start)}
                                                    className={`
                                                        inline-block cursor-pointer hover:underline decoration-electric-blue/50 rounded px-0.5 transition-colors
                                                        ${word.isEmphasized ? 'text-cyber-pink font-bold' : ''}
                                                        hover:bg-white/10
                                                    `}
                                                    style={{
                                                        color: word.isEmphasized ? captionStyle.emphasisColor : 'inherit',
                                                        fontFamily: word.isEmphasized ? captionStyle.emphasisFontFamily : 'inherit'
                                                    }}
                                                    title="Ctrl+Click to emphasize"
                                                >
                                                    {word.word}{' '}
                                                </span>
                                            ))
                                        ) : (
                                            <span>{segment.text}</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default TranscriptList;
