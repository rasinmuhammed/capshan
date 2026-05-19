import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
    Play,
    Pause,
    Volume2,
    VolumeX,
    RotateCcw,
    RotateCw,
    Maximize
} from 'lucide-react';
import { useAppStore } from '../../store/app.store';
import CaptionOverlay from './CaptionOverlay';

const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const MediaPlayer: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const {
        mediaFile,
        isPlaying,
        setIsPlaying,
        currentTime,
        setCurrentTime,
        duration,
        setDuration,
        exportAspectRatio,
    } = useAppStore();

    // Get aspect ratio CSS for preview
    const getAspectRatioStyle = () => {
        switch (exportAspectRatio) {
            case '9:16': return { aspectRatio: '9/16', maxHeight: '100%' };
            case '1:1': return { aspectRatio: '1/1', maxHeight: '100%' };
            case '16:9': return { aspectRatio: '16/9', maxHeight: '100%' };
            default: return {}; // Original - no constraint
        }
    };

    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [showControls, setShowControls] = useState(true);
    const [hoverTime, setHoverTime] = useState<number | null>(null);
    const [mediaError, setMediaError] = useState<string | null>(null);
    const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

    const getMediaElement = useCallback(() => (
        mediaFile?.type === 'video' ? videoRef.current : audioRef.current
    ), [mediaFile?.type]);

    useEffect(() => {
        const handleMouseMove = () => {
            setShowControls(true);
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
            if (isPlaying) {
                controlsTimeoutRef.current = setTimeout(() => {
                    setShowControls(false);
                }, 2000);
            }
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener('mousemove', handleMouseMove);
            container.addEventListener('mouseleave', () => {
                if (isPlaying) setShowControls(false);
            });
        }

        return () => {
            if (container) {
                container.removeEventListener('mousemove', handleMouseMove);
            }
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
        };
    }, [isPlaying]);

    useEffect(() => {
        if (!mediaFile) return;
        setMediaError(null);
        setDuration(mediaFile.duration);
        setCurrentTime(0);
        setIsPlaying(false);
    }, [mediaFile, setCurrentTime, setDuration, setIsPlaying]);

    useEffect(() => {
        const mediaElement = getMediaElement();
        if (!mediaElement) return;

        if (isPlaying) {
            mediaElement.play().catch(console.error);
        } else {
            mediaElement.pause();
        }
    }, [getMediaElement, isPlaying]);

    useEffect(() => {
        const mediaElement = getMediaElement();
        if (!mediaElement) return;
        if (Math.abs(mediaElement.currentTime - currentTime) > 0.5) {
            mediaElement.currentTime = currentTime;
        }
    }, [currentTime, getMediaElement]);

    const togglePlay = () => {
        if (mediaError) return;
        setIsPlaying(!isPlaying);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const mediaElement = getMediaElement();
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (mediaElement) {
            mediaElement.volume = newVolume;
        }
        if (newVolume === 0) {
            setIsMuted(true);
        } else {
            setIsMuted(false);
        }
    };

    const toggleMute = () => {
        const mediaElement = getMediaElement();
        if (mediaElement) {
            mediaElement.muted = !isMuted;
            setIsMuted(!isMuted);
            if (!isMuted && volume === 0) { // If unmuting from 0 volume, set to a default
                setVolume(0.5);
                mediaElement.volume = 0.5;
            }
        }
    };

    const skip = (seconds: number) => {
        const mediaElement = getMediaElement();
        if (mediaElement) {
            const mediaDuration = Number.isFinite(mediaElement.duration) && mediaElement.duration > 0
                ? mediaElement.duration
                : duration;
            const newTime = Math.max(0, Math.min(mediaDuration, mediaElement.currentTime + seconds));
            mediaElement.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    const changePlaybackRate = (rate: number) => {
        const mediaElement = getMediaElement();
        setPlaybackRate(rate);
        if (mediaElement) {
            mediaElement.playbackRate = rate;
        }
    };

    const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const mediaElement = getMediaElement();
        if (!mediaElement || !containerRef.current || duration <= 0) return;
        const progressBar = e.currentTarget;
        const rect = progressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const newTime = (clickX / rect.width) * duration;
        mediaElement.currentTime = newTime;
        setCurrentTime(newTime);
    }, [duration, getMediaElement, setCurrentTime]);

    const handleSeekHover = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const mediaElement = getMediaElement();
        if (!mediaElement || !containerRef.current || duration <= 0) return;
        const progressBar = e.currentTarget;
        const rect = progressBar.getBoundingClientRect();
        const hoverX = e.clientX - rect.left;
        const hoverPercentage = Math.max(0, Math.min(1, hoverX / rect.width));
        const time = hoverPercentage * duration;
        setHoverTime(time);
    }, [duration, getMediaElement]);


    const handleLoadedMetadata = (event: React.SyntheticEvent<HTMLVideoElement | HTMLAudioElement>) => {
        const nextDuration = event.currentTarget.duration;
        if (Number.isFinite(nextDuration) && nextDuration > 0) {
            setDuration(nextDuration);
        }
    };

    const handleTimeUpdate = (event: React.SyntheticEvent<HTMLVideoElement | HTMLAudioElement>) => {
        setCurrentTime(event.currentTarget.currentTime);
    };

    const handleEnded = () => {
        setIsPlaying(false);
        setShowControls(true);
    };

    const handleMediaError = () => {
        setMediaError('Preview failed to load this media. Try a local MP4/WebM file, or use the sample only as a transcript demo.');
        setIsPlaying(false);
    };

    const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

    if (!mediaFile) return null;

    return (
        <div className="flex flex-col h-full">
            {/* Video/Audio Element */}
            <div ref={containerRef} className="flex-1 flex items-center justify-center bg-black rounded-lg overflow-hidden relative group">
                {mediaFile.type === 'video' ? (
                    <>
                        {/* Aspect ratio container for preview */}
                        <div
                            className="relative w-full h-full flex items-center justify-center"
                            style={exportAspectRatio !== 'original' ? { padding: '8px' } : {}}
                        >
                            <div
                                className={`relative overflow-hidden bg-black ${exportAspectRatio !== 'original' ? 'shadow-2xl' : 'w-full h-full'}`}
                                style={getAspectRatioStyle()}
                            >
                                <video
                                    ref={videoRef}
                                    src={mediaFile.url}
                                    className="w-full h-full object-contain"
                                    playsInline
                                    preload="metadata"
                                    crossOrigin={mediaFile.url.startsWith('http') ? 'anonymous' : undefined}
                                    onLoadedMetadata={handleLoadedMetadata}
                                    onCanPlay={handleLoadedMetadata}
                                    onTimeUpdate={handleTimeUpdate}
                                    onEnded={handleEnded}
                                    onError={handleMediaError}
                                />

                                {/* Caption Overlay */}
                                <CaptionOverlay videoRef={videoRef} />

                                {exportAspectRatio !== 'original' && (
                                    <div className="pointer-events-none absolute inset-[8%] border border-white/15 rounded-sm">
                                        <div className="absolute left-0 right-0 top-[18%] border-t border-dashed border-capshan-gold/30" />
                                        <div className="absolute left-0 right-0 bottom-[18%] border-t border-dashed border-capshan-gold/30" />
                                    </div>
                                )}

                                {mediaError && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/85 p-6 text-center">
                                        <div className="max-w-md rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                                            <p className="text-sm font-semibold text-red-200">{mediaError}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Controls Overlay */}
                        <div
                            className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300 flex flex-col justify-end p-4 lg:p-6 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}
                        >
                            {/* Progress Bar */}
                            <div
                                className="w-full h-1.5 bg-white/20 rounded-full mb-4 cursor-pointer group relative"
                                onClick={handleSeek}
                                onMouseMove={handleSeekHover}
                                onMouseLeave={() => setHoverTime(null)}
                            >
                                <div
                                    className="h-full bg-electric-blue rounded-full relative group-hover:h-2 transition-all"
                                    style={{ width: `${progressPercent}%` }}
                                >
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                                </div>

                                {/* Hover Preview */}
                                {hoverTime !== null && (
                                    <div
                                        className="absolute bottom-4 -translate-x-1/2 bg-black/90 px-2 py-1 rounded text-xs font-mono border border-zinc-800 pointer-events-none"
                                        style={{ left: `${(hoverTime / duration) * 100}%` }}
                                    >
                                        {formatTime(hoverTime)}
                                    </div>
                                )}
                            </div>

                            {/* Main Controls */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 lg:gap-4">
                                    <button
                                        onClick={togglePlay}
                                        className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center bg-white text-black rounded-full hover:scale-105 transition-transform"
                                    >
                                        {isPlaying ? (
                                            <Pause className="w-5 h-5 lg:w-6 lg:h-6 fill-current" />
                                        ) : (
                                            <Play className="w-5 h-5 lg:w-6 lg:h-6 fill-current ml-1" />
                                        )}
                                    </button>

                                    <div className="flex items-center gap-1 lg:gap-2">
                                        <button
                                            onClick={() => skip(-5)}
                                            className="p-2 hover:bg-white/10 rounded-full transition-colors hidden sm:block"
                                        >
                                            <RotateCcw className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => skip(5)}
                                            className="p-2 hover:bg-white/10 rounded-full transition-colors hidden sm:block"
                                        >
                                            <RotateCw className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-2 group relative">
                                        <button
                                            onClick={toggleMute}
                                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                        >
                                            {isMuted ? (
                                                <VolumeX className="w-5 h-5" />
                                            ) : (
                                                <Volume2 className="w-5 h-5" />
                                            )}
                                        </button>
                                        <div className="w-0 overflow-hidden group-hover:w-24 transition-all duration-300 hidden lg:block">
                                            <input
                                                type="range"
                                                min="0"
                                                max="1"
                                                step="0.1"
                                                value={isMuted ? 0 : volume}
                                                onChange={handleVolumeChange}
                                                className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                                            />
                                        </div>
                                    </div>

                                    <span className="text-xs lg:text-sm font-mono text-zinc-300 ml-2">
                                        {formatTime(currentTime)} / {formatTime(duration)}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="relative group hidden sm:block">
                                        <button className="flex items-center gap-1 px-3 py-1.5 bg-black/40 rounded-lg text-xs font-medium hover:bg-black/60 transition-colors border border-white/10">
                                            {playbackRate}x
                                        </button>
                                        <div className="absolute bottom-full right-0 mb-2 bg-black/90 border border-zinc-800 rounded-lg p-1 hidden group-hover:flex flex-col gap-1 min-w-[80px]">
                                            {[0.5, 1, 1.25, 1.5, 2].map((rate) => (
                                                <button
                                                    key={rate}
                                                    onClick={() => changePlaybackRate(rate)}
                                                    className={`px-3 py-1.5 text-left text-xs rounded hover:bg-white/10 ${playbackRate === rate ? 'text-electric-blue' : 'text-zinc-300'
                                                        }`}
                                                >
                                                    {rate}x
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                        <Maximize className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-4">
                        <audio
                            ref={audioRef}
                            src={mediaFile.url}
                            preload="metadata"
                            onLoadedMetadata={handleLoadedMetadata}
                            onCanPlay={handleLoadedMetadata}
                            onTimeUpdate={handleTimeUpdate}
                            onEnded={handleEnded}
                            onError={handleMediaError}
                        />
                        <div className="w-32 h-32 bg-gradient-to-br from-electric-blue to-neon-pink rounded-full animate-pulse" />
                        <p className="text-zinc-400 text-lg">{mediaFile.name}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MediaPlayer;
