import React, { useCallback, useEffect, useRef } from 'react';
import { useAppStore } from '../../store/app.store';
import type { TranscriptSegment, Word } from '../../types';

const CanvasOverlay: React.FC<{ videoRef: React.RefObject<HTMLVideoElement | null> }> = ({ videoRef }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(null);

    const { segments, currentTime, captionStyle } = useAppStore();

    // Find current word
    const getCurrentWord = useCallback((): { word: Word; segment: TranscriptSegment; wordIndex: number } | null => {
        for (const segment of segments) {
            for (let i = 0; i < segment.words.length; i++) {
                const word = segment.words[i];
                if (currentTime >= word.start && currentTime < word.end) {
                    return { word, segment, wordIndex: i };
                }
            }
        }
        return null;
    }, [currentTime, segments]);

    const drawCaption = useCallback(() => {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        if (!canvas || !video) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Match canvas size to video
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
            canvas.width = video.videoWidth || 1920;
            canvas.height = video.videoHeight || 1080;
        }

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const currentWordData = getCurrentWord();
        if (!currentWordData) return;

        const { segment, wordIndex: currentIndex } = currentWordData;
        const words = segment.words;

        // Calculate text position
        let yPos: number;
        switch (captionStyle.position) {
            case 'top':
                yPos = canvas.height * 0.15;
                break;
            case 'center':
                yPos = canvas.height * 0.5;
                break;
            case 'bottom':
            default:
                yPos = canvas.height * 0.85;
                break;
        }

        // Apply text transform
        const transformText = (text: string): string => {
            switch (captionStyle.textTransform) {
                case 'uppercase': return text.toUpperCase();
                case 'lowercase': return text.toLowerCase();
                case 'capitalize': return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
                default: return text;
            }
        };

        // Set base font
        ctx.font = `${captionStyle.fontWeight} ${captionStyle.fontSize}px "${captionStyle.fontFamily}"`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const wordsPerLine = captionStyle.wordsPerLine || 4;
        const maxLines = captionStyle.linesPerCaption || 2;
        const displayMode = captionStyle.displayMode || 'word-by-word';

        // Determine which words to display based on display mode
        let displayWords: Word[] = [];
        let highlightIndex = -1; // Index of current word in displayWords

        switch (displayMode) {
            case 'word-by-word': {
                // Show words up to and including the current word
                const totalWordsToShow = wordsPerLine * maxLines;
                const startIdx = Math.max(0, currentIndex - totalWordsToShow + 1);
                displayWords = words.slice(startIdx, currentIndex + 1);
                highlightIndex = displayWords.length - 1;
                break;
            }
            case 'typewriter': {
                // Show all words in segment up to current, with typing effect
                displayWords = words.slice(0, currentIndex + 1);
                highlightIndex = displayWords.length - 1;
                break;
            }
            case 'line-by-line': {
                // Show complete lines only
                const lineNum = Math.floor(currentIndex / wordsPerLine);
                const lineStart = lineNum * wordsPerLine;
                const lineEnd = Math.min(lineStart + wordsPerLine, words.length);
                displayWords = words.slice(lineStart, lineEnd);
                highlightIndex = currentIndex - lineStart;
                break;
            }
            case 'flow':
            default: {
                // Show all words in the segment chunk
                const totalWordsToShow = wordsPerLine * maxLines;
                const halfChunk = Math.floor(totalWordsToShow / 2);
                let startIdx = Math.max(0, currentIndex - halfChunk);
                const endIdx = Math.min(words.length, startIdx + totalWordsToShow);
                if (endIdx - startIdx < totalWordsToShow && startIdx > 0) {
                    startIdx = Math.max(0, endIdx - totalWordsToShow);
                }
                displayWords = words.slice(startIdx, endIdx);
                highlightIndex = currentIndex - startIdx;
                break;
            }
        }

        // Group words into lines
        const lines: { word: Word; isHighlighted: boolean }[][] = [];
        for (let i = 0; i < displayWords.length; i += wordsPerLine) {
            const lineWords = displayWords.slice(i, i + wordsPerLine).map((w, idx) => ({
                word: w,
                isHighlighted: (i + idx) === highlightIndex
            }));
            lines.push(lineWords);
        }

        // Limit to max lines
        while (lines.length > maxLines) {
            lines.shift();
            highlightIndex -= wordsPerLine;
        }

        // Calculate block dimensions
        const lineHeight = captionStyle.fontSize * (captionStyle.lineSpacing || 1.2);
        const blockHeight = lines.length * lineHeight;

        // Adjust yPos based on position
        let startY = yPos;
        if (captionStyle.position === 'center') {
            startY = yPos - blockHeight / 2 + lineHeight / 2;
        } else if (captionStyle.position === 'bottom') {
            startY = yPos - blockHeight + lineHeight;
        }

        const centerX = canvas.width / 2;
        const spacing = captionStyle.fontSize * 0.3;

        // Draw each line
        lines.forEach((line, lineIdx) => {
            const currentY = startY + (lineIdx * lineHeight);

            // Measure line width for centering
            let lineWidth = 0;
            line.forEach(({ word }, idx) => {
                ctx.font = `${captionStyle.fontWeight} ${captionStyle.fontSize}px "${captionStyle.fontFamily}"`;
                lineWidth += ctx.measureText(transformText(word.word)).width + (idx > 0 ? spacing : 0);
            });

            let currentX = centerX - lineWidth / 2;

            // Draw words in this line
            line.forEach(({ word, isHighlighted }) => {
                const isEmphasized = word.isEmphasized;
                const text = transformText(word.word);

                // Determine styling
                let fontSize = captionStyle.fontSize;
                let fontFamily = captionStyle.fontFamily;
                let fontWeight = captionStyle.fontWeight;
                let fillColor = captionStyle.color;
                let scale = 1;

                if (isHighlighted) {
                    fillColor = captionStyle.activeWordColor;
                    fontFamily = captionStyle.activeWordFontFamily || captionStyle.fontFamily;
                    fontSize = captionStyle.activeWordFontSize || captionStyle.fontSize;
                    fontWeight = captionStyle.activeWordFontWeight || 900;
                    scale = captionStyle.activeWordScale || 1.15;
                } else if (isEmphasized && captionStyle.autoEmphasize) {
                    fillColor = captionStyle.emphasisColor;
                    fontFamily = captionStyle.emphasisFontFamily || captionStyle.fontFamily;
                    fontSize = captionStyle.emphasisFontSize || captionStyle.fontSize;
                    fontWeight = captionStyle.emphasisFontWeight || captionStyle.fontWeight;
                }

                ctx.font = `${fontWeight} ${fontSize}px "${fontFamily}"`;
                const metrics = ctx.measureText(text);
                const wordWidth = metrics.width;

                // Apply animation for highlighted word
                if (isHighlighted && scale !== 1) {
                    ctx.save();
                    ctx.translate(currentX + wordWidth / 2, currentY);
                    ctx.scale(scale, scale);
                    ctx.translate(-(currentX + wordWidth / 2), -currentY);
                } else if (isHighlighted) {
                    ctx.save();
                }

                // Background for highlighted word
                if (isHighlighted && captionStyle.activeWordBackground) {
                    const padding = captionStyle.backgroundPadding || 8;
                    const bgColor = captionStyle.activeWordBackgroundColor || captionStyle.activeWordColor;
                    ctx.fillStyle = bgColor;
                    ctx.beginPath();
                    ctx.roundRect(
                        currentX - padding,
                        currentY - fontSize / 2 - padding / 2,
                        wordWidth + padding * 2,
                        fontSize + padding,
                        captionStyle.backgroundRadius || 6
                    );
                    ctx.fill();
                    fillColor = '#000000'; // Dark text on light background
                }

                // Non-active word background
                if (captionStyle.showBackground && !isHighlighted) {
                    const padding = captionStyle.backgroundPadding || 8;
                    const r = parseInt(captionStyle.backgroundColor.slice(1, 3), 16);
                    const g = parseInt(captionStyle.backgroundColor.slice(3, 5), 16);
                    const b = parseInt(captionStyle.backgroundColor.slice(5, 7), 16);
                    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${captionStyle.backgroundOpacity})`;
                    ctx.beginPath();
                    ctx.roundRect(
                        currentX - padding,
                        currentY - fontSize / 2 - padding / 2,
                        wordWidth + padding * 2,
                        fontSize + padding,
                        captionStyle.backgroundRadius || 6
                    );
                    ctx.fill();
                }

                // Apply shadow
                if (captionStyle.shadowEnabled) {
                    ctx.shadowColor = captionStyle.shadowColor;
                    ctx.shadowBlur = captionStyle.shadowBlur;
                    ctx.shadowOffsetX = captionStyle.shadowOffsetX || 2;
                    ctx.shadowOffsetY = captionStyle.shadowOffsetY || 2;
                }

                // Apply glow for highlighted word
                if (isHighlighted && captionStyle.glowEnabled) {
                    ctx.shadowColor = captionStyle.glowColor;
                    ctx.shadowBlur = captionStyle.glowIntensity;
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 0;
                }

                // Draw stroke
                if (captionStyle.strokeEnabled) {
                    ctx.strokeStyle = captionStyle.strokeColor;
                    ctx.lineWidth = captionStyle.strokeWidth;
                    ctx.lineJoin = 'round';
                    ctx.strokeText(text, currentX + wordWidth / 2, currentY);
                }

                // Draw text
                ctx.fillStyle = fillColor;
                ctx.fillText(text, currentX + wordWidth / 2, currentY);

                // Reset shadow
                ctx.shadowBlur = 0;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;

                if (isHighlighted) {
                    ctx.restore();
                }

                currentX += wordWidth + spacing;
            });
        });

        animationRef.current = requestAnimationFrame(drawCaption);
    }, [captionStyle, getCurrentWord, videoRef]);

    useEffect(() => {
        animationRef.current = requestAnimationFrame(drawCaption);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [drawCaption]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            style={{ mixBlendMode: 'normal' }}
        />
    );
};

export default CanvasOverlay;
