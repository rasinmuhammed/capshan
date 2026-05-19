import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/app.store';
import { useCurrentWord, shouldEmphasize, getEmphasisColor } from '../../hooks/useCurrentWord';
import type { Word, CaptionStyle } from '../../types';

type PresetType = 'hormozi' | 'karaoke' | 'veed-clean';

interface CaptionOverlayProps {
    videoRef: React.RefObject<HTMLVideoElement | null>;
}

// Helper to apply text transform
const applyTextTransform = (text: string, transform: CaptionStyle['textTransform']): string => {
    switch (transform) {
        case 'uppercase': return text.toUpperCase();
        case 'lowercase': return text.toLowerCase();
        case 'capitalize': return text.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        default: return text;
    }
};

// Helper to get text shadow for legibility
const getTextShadow = (style: CaptionStyle): string => {
    if (style.strokeEnabled) {
        const sw = style.strokeWidth || 2;
        return `
            ${sw}px ${sw}px 0px ${style.strokeColor},
            -${sw}px -${sw}px 0px ${style.strokeColor},
            ${sw}px -${sw}px 0px ${style.strokeColor},
            -${sw}px ${sw}px 0px ${style.strokeColor},
            0px ${sw}px 0px ${style.strokeColor},
            0px -${sw}px 0px ${style.strokeColor},
            ${sw}px 0px 0px ${style.strokeColor},
            -${sw}px 0px 0px ${style.strokeColor}
        `;
    }
    if (style.shadowEnabled) {
        return `${style.shadowOffsetX}px ${style.shadowOffsetY}px ${style.shadowBlur}px ${style.shadowColor}`;
    }
    return '2px 2px 4px rgba(0,0,0,0.8)';
};

// ============================================
// PRESET A: THE HORMOZI (High Energy Pop-In)
// ============================================
const HormoziCaption: React.FC<{
    words: Word[];
    activeIndex: number;
    style: CaptionStyle;
    onWordClick: (idx: number) => void;
}> = ({ words, activeIndex, style, onWordClick }) => {

    // Only show 1-3 words at a time centered around active word
    const visibleWords = useMemo(() => {
        const start = Math.max(0, activeIndex);
        const end = Math.min(words.length, activeIndex + 3);
        return words.slice(start, end).map((w, i) => ({
            word: w,
            originalIndex: start + i,
            isActive: start + i === activeIndex,
        }));
    }, [words, activeIndex]);

    const baseFontSize = Math.min(style.fontSize || 52, 64); // Cap for readability

    return (
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 max-w-[90%] mx-auto">
            <AnimatePresence mode="popLayout">
                {visibleWords.map(({ word, originalIndex, isActive }) => {
                    // Check for emphasis (manual or auto)
                    const isEmphasis = word.isEmphasized || (style.autoEmphasize && shouldEmphasize(word.word));
                    const emphasisColor = isEmphasis ? getEmphasisColor(word.word, originalIndex) : null;

                    // Apply text transform
                    const displayText = applyTextTransform(word.word, style.textTransform);

                    // Determine color
                    let textColor = style.color || '#ffffff';
                    if (isActive) {
                        textColor = emphasisColor || style.activeWordColor || '#FFD700';
                    }

                    return (
                        <motion.span
                            key={`${word.word}-${originalIndex}-${word.start}`}
                            initial={{ scale: 0.8, opacity: 0, y: 20 }}
                            animate={{
                                scale: isActive ? (style.activeWordScale || 1.15) : 1,
                                opacity: 1,
                                y: 0,
                            }}
                            exit={{ scale: 0.8, opacity: 0, y: -20 }}
                            transition={{
                                type: 'spring',
                                stiffness: 500,
                                damping: 30,
                                mass: 0.8,
                            }}
                            onClick={() => onWordClick(originalIndex)}
                            className="cursor-pointer select-none inline-block"
                            style={{
                                fontFamily: `${style.fontFamily || 'Montserrat'}, sans-serif`,
                                fontWeight: isActive ? (style.activeWordFontWeight || 900) : (style.fontWeight || 800),
                                fontSize: `${baseFontSize}px`,
                                letterSpacing: '-0.03em',
                                color: textColor,
                                textShadow: getTextShadow(style),
                                ...(style.glowEnabled && isActive && {
                                    filter: `drop-shadow(0 0 ${style.glowIntensity || 15}px ${style.glowColor || textColor})`,
                                }),
                            }}
                        >
                            {displayText}
                        </motion.span>
                    );
                })}
            </AnimatePresence>
        </div>
    );
};

// ============================================
// PRESET B: THE KARAOKE (Smooth Fill Effect)
// ============================================
const KaraokeCaption: React.FC<{
    words: Word[];
    activeIndex: number;
    progress: number;
    style: CaptionStyle;
    onWordClick: (idx: number) => void;
}> = ({ words, activeIndex, progress, style, onWordClick }) => {

    const baseFontSize = Math.min(style.fontSize || 44, 52);

    return (
        <div className="flex flex-wrap justify-center gap-x-2 gap-y-1 max-w-[95%] mx-auto">
            {words.map((word, idx) => {
                const isPast = idx < activeIndex;
                const isActive = idx === activeIndex;

                // Calculate fill percentage for active word
                const fillPercent = isActive ? progress * 100 : isPast ? 100 : 0;

                // Apply text transform
                const displayText = applyTextTransform(word.word, style.textTransform);

                // Active word fill color
                const fillColor = style.activeWordColor || '#00D4FF';

                return (
                    <span
                        key={`${word.word}-${idx}-${word.start}`}
                        onClick={() => onWordClick(idx)}
                        className="relative cursor-pointer select-none inline-block"
                        style={{
                            fontFamily: `${style.fontFamily || 'Inter'}, sans-serif`,
                            fontWeight: style.fontWeight || 700,
                            fontSize: `${baseFontSize}px`,
                        }}
                    >
                        {/* Base layer (inactive) */}
                        <span
                            style={{
                                color: 'rgba(255, 255, 255, 0.35)',
                                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                            }}
                        >
                            {displayText}
                        </span>

                        {/* Fill layer (active - uses clip) */}
                        <span
                            className="absolute left-0 top-0 overflow-hidden transition-all duration-75"
                            style={{
                                width: `${fillPercent}%`,
                                color: fillColor,
                                textShadow: `0 0 20px ${fillColor}80, 2px 2px 4px rgba(0,0,0,0.5)`,
                            }}
                        >
                            <span className="whitespace-nowrap">{displayText}</span>
                        </span>
                    </span>
                );
            })}
        </div>
    );
};

// ============================================
// PRESET C: THE VEED CLEAN (Box Highlight)
// ============================================
const VeedCleanCaption: React.FC<{
    words: Word[];
    activeIndex: number;
    style: CaptionStyle;
    onWordClick: (idx: number) => void;
}> = ({ words, activeIndex, style, onWordClick }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [boxPosition, setBoxPosition] = useState({ x: 0, width: 0, height: 0 });

    const baseFontSize = Math.min(style.fontSize || 44, 52);

    // Update box position when active word changes
    useEffect(() => {
        if (containerRef.current) {
            const wordElements = containerRef.current.querySelectorAll('[data-word]');
            const activeElement = wordElements[activeIndex] as HTMLElement;
            if (activeElement) {
                const containerRect = containerRef.current.getBoundingClientRect();
                const wordRect = activeElement.getBoundingClientRect();
                setBoxPosition({
                    x: wordRect.left - containerRect.left - 6,
                    width: wordRect.width + 12,
                    height: wordRect.height + 8,
                });
            }
        }
    }, [activeIndex, words]);

    // Use active word color or cycle through palette
    const boxColors = ['#FF6B9D', '#FFE600', '#00FF88', '#00D4FF', '#FF6B6B'];
    const activeColor = style.activeWordBackgroundColor || style.activeWordColor || boxColors[activeIndex % boxColors.length];

    return (
        <div ref={containerRef} className="relative flex flex-wrap justify-center gap-x-2 gap-y-2 max-w-[95%] mx-auto">
            {/* Animated background box */}
            {boxPosition.width > 0 && (
                <motion.div
                    className="absolute rounded-lg"
                    initial={false}
                    animate={{
                        x: boxPosition.x,
                        width: boxPosition.width,
                    }}
                    transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 35,
                    }}
                    style={{
                        backgroundColor: activeColor,
                        height: boxPosition.height || `${baseFontSize + 16}px`,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 0,
                    }}
                />
            )}

            {words.map((word, idx) => {
                const isActive = idx === activeIndex;

                // Apply text transform
                const displayText = applyTextTransform(word.word, style.textTransform);

                return (
                    <span
                        key={`${word.word}-${idx}-${word.start}`}
                        data-word
                        onClick={() => onWordClick(idx)}
                        className="relative cursor-pointer select-none px-1.5 py-1 z-10"
                        style={{
                            fontFamily: `${style.fontFamily || 'Montserrat'}, sans-serif`,
                            fontWeight: style.fontWeight || 800,
                            fontSize: `${baseFontSize}px`,
                            color: isActive ? '#000000' : (style.color || '#ffffff'),
                            transition: 'color 0.15s ease',
                            textShadow: isActive ? 'none' : getTextShadow(style),
                        }}
                    >
                        {displayText}
                    </span>
                );
            })}
        </div>
    );
};

// ============================================
// MAIN CAPTION OVERLAY COMPONENT
// ============================================
const CaptionOverlay: React.FC<CaptionOverlayProps> = ({ videoRef }) => {
    const { captionStyle, setCurrentTime } = useAppStore();
    const currentWordData = useCurrentWord();

    // Determine preset based on templateId or animation style
    const preset: PresetType = useMemo(() => {
        const templateId = captionStyle.templateId;
        if (templateId === 'hormozi' || templateId === 'gamer' || templateId === 'meme') {
            return 'hormozi';
        }
        if (templateId === 'karaoke-fill') {
            return 'karaoke';
        }
        if (templateId === 'veed-clean' || templateId === 'minimal-pro' || templateId === 'hindi-urdu') {
            return 'veed-clean';
        }
        // Default based on animation
        if (captionStyle.animation === 'pop' || captionStyle.animation === 'bounce') {
            return 'hormozi';
        }
        if (captionStyle.animation === 'fade') {
            return 'karaoke';
        }
        return 'hormozi'; // Default to hormozi for best visuals
    }, [captionStyle.templateId, captionStyle.animation]);

    // Handle word click to seek
    const handleWordClick = useCallback((wordIndex: number) => {
        if (currentWordData && videoRef.current) {
            const word = currentWordData.segment.words[wordIndex];
            if (word) {
                videoRef.current.currentTime = word.start;
                setCurrentTime(word.start);
            }
        }
    }, [currentWordData, videoRef, setCurrentTime]);

    if (!currentWordData) {
        return null;
    }

    const { segment, wordIndex, progress } = currentWordData;

    // Calculate position
    let positionClass = 'bottom-[12%]';
    if (captionStyle.position === 'top') {
        positionClass = 'top-[12%]';
    } else if (captionStyle.position === 'center') {
        positionClass = 'top-1/2 -translate-y-1/2';
    }

    return (
        <div
            className={`absolute left-0 right-0 ${positionClass} pointer-events-none z-20`}
            style={{ padding: '0 3%' }}
        >
            <div className="pointer-events-auto flex justify-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={segment.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                        className="w-full"
                    >
                        {preset === 'hormozi' && (
                            <HormoziCaption
                                words={segment.words}
                                activeIndex={wordIndex}
                                style={captionStyle}
                                onWordClick={handleWordClick}
                            />
                        )}

                        {preset === 'karaoke' && (
                            <KaraokeCaption
                                words={segment.words}
                                activeIndex={wordIndex}
                                progress={progress}
                                style={captionStyle}
                                onWordClick={handleWordClick}
                            />
                        )}

                        {preset === 'veed-clean' && (
                            <VeedCleanCaption
                                words={segment.words}
                                activeIndex={wordIndex}
                                style={captionStyle}
                                onWordClick={handleWordClick}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default CaptionOverlay;
