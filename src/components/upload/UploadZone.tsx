import React, { useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Sparkles, Zap, Play, Star, Shield, Lock, Cpu, Check } from 'lucide-react';
import { useAppStore } from '../../store/app.store';
import { mockSegments } from '../../utils/mockData';
import { TRANSCRIPTION_MODELS } from '../../utils/transcriptionModels';

const TRUST_BADGES = [
    { icon: Shield, label: 'Local-first', desc: 'No hosted cloud upload required' },
    { icon: Lock, label: 'Private by default', desc: 'Browser transcript and subtitle export' },
    { icon: Cpu, label: 'AI-Powered', desc: 'Whisper AI runs in your browser' },
];

const FEATURES = [
    { icon: Zap, label: 'Instant', color: 'text-yellow-400' },
    { icon: Star, label: 'Word-by-word', color: 'text-blue-400' },
    { icon: Sparkles, label: '9 Viral Styles', color: 'text-pink-400' },
    { icon: Check, label: '100% Free', color: 'text-green-400' },
];

const UploadZone: React.FC = () => {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const {
        setMediaFile,
        setError,
        setSegments,
        setTranscriptMetadata,
        setViralSuggestion,
        transcriptionModel,
        setTranscriptionModel,
    } = useAppStore();

    const handleFile = useCallback(async (file: File) => {
        const type = file.type;

        if (!type.startsWith('audio/') && !type.startsWith('video/')) {
            setError('Please upload an audio (MP3, WAV) or video (MP4) file');
            return;
        }

        const url = URL.createObjectURL(file);
        const mediaType = type.startsWith('video/') ? 'video' : 'audio';

        const element = document.createElement(mediaType) as HTMLVideoElement | HTMLAudioElement;
        element.src = url;

        element.onloadedmetadata = () => {
            setSegments([]);
            setTranscriptMetadata(null);
            setViralSuggestion(null);
            setMediaFile({
                file,
                url,
                type: mediaType,
                duration: element.duration,
                name: file.name,
            });
        };
    }, [setError, setMediaFile, setSegments, setTranscriptMetadata, setViralSuggestion]);

    const handleTestWithMockData = () => {
        setMediaFile({
            file: new File([], 'test-video.mp4'),
            url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
            type: 'video',
            duration: 5.1,
            name: 'Sample Video',
        });
        setSegments(mockSegments);
        setTranscriptMetadata({
            language: 'en',
            engine: 'browser-whisper',
            model: 'sample-transcript',
            confidence: 0.92,
            generatedAt: new Date().toISOString(),
        });
        setViralSuggestion(null);
    };

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && (file.type.startsWith('video/') || file.type.startsWith('audio/'))) {
            handleFile(file);
        }
    }, [handleFile]);

    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const onDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    return (
        <div className="fixed inset-0 flex items-center justify-center overflow-hidden pt-16">
            {/* Animated Background Orbs */}
            <div className="bg-orb bg-orb-gold w-96 h-96 -top-20 -left-20" />
            <div className="bg-orb bg-orb-gold w-80 h-80 bottom-20 right-10" style={{ animationDelay: '-3s' }} />
            <div className="bg-orb bg-orb-white w-64 h-64 top-1/3 right-1/4" style={{ animationDelay: '-5s' }} />

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 grid-pattern opacity-50" />

            {/* Main Content */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-4xl px-4 md:px-6 flex flex-col items-center"
            >
                {/* Hero Text */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-center mb-6"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30 mb-4"
                    >
                        <Shield className="w-4 h-4 text-green-400" />
                        <span className="text-sm font-bold text-green-400">Local-first • Open Source</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="text-5xl md:text-7xl font-black text-white mb-3 tracking-tighter leading-none"
                    >
                        Viral Captions
                        <br />
                        <span className="text-gradient-gold">in Seconds</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="text-lg md:text-xl text-zinc-400 max-w-xl mx-auto"
                    >
                        Word-by-word animations. Hook analysis. Creator presets.
                        <span className="text-white font-semibold"> No signup or watermark.</span>
                    </motion.p>
                </motion.div>

                {/* Feature Pills */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.45 }}
                    className="flex flex-wrap gap-2 justify-center mb-6"
                >
                    {FEATURES.map(({ icon: Icon, label, color }, i) => (
                        <motion.div
                            key={label}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 + i * 0.1 }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-800/70 text-xs font-medium"
                        >
                            <Icon className={`w-3 h-3 ${color}`} />
                            <span className="text-zinc-300">{label}</span>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Upload Zone */}
                <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    whileHover={{ scale: 1.01 }}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                        w-full max-w-2xl rounded-2xl p-8 md:p-10 cursor-pointer relative overflow-hidden
                        transition-all duration-500 group
                        ${isDragging
                            ? 'bg-capshan-gold/20 border-2 border-capshan-gold scale-[1.02] glow-gold'
                            : 'glass-gold border border-zinc-800 hover:border-capshan-gold/50 hover:glow-gold-sm'
                        }
                    `}
                >
                    {/* Shimmer overlay */}
                    <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity" />

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="audio/*,video/*"
                        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                        className="hidden"
                    />

                    <div className="relative z-10 flex flex-col items-center gap-4 text-center">
                        <motion.div
                            animate={isDragging ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
                            className={`
                                w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center
                                transition-all duration-300
                                ${isDragging ? 'bg-capshan-gold text-black' : 'bg-zinc-800/80 text-zinc-400 group-hover:bg-capshan-gold/20 group-hover:text-capshan-gold'}
                            `}
                        >
                            <Upload className="w-8 h-8 md:w-10 md:h-10" />
                        </motion.div>

                        <div>
                            <h2 className="text-xl md:text-2xl font-bold text-white mb-1">
                                {isDragging ? '🔥 Drop it!' : 'Drop your video here'}
                            </h2>
                            <p className="text-zinc-500 text-sm">
                                or click to browse • MP4, MP3, WAV
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Accuracy Selector */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="mt-4 w-full max-w-2xl rounded-xl border border-zinc-800 bg-zinc-950/70 p-3"
                >
                    <div className="flex items-center justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                            <Cpu className="w-4 h-4 text-capshan-gold" />
                            <span className="text-xs font-bold uppercase tracking-wide text-zinc-300">Caption Accuracy</span>
                        </div>
                        <span className="text-[10px] text-zinc-500">{transcriptionModel.estimatedSize} first download</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {TRANSCRIPTION_MODELS.map((model) => (
                            <button
                                key={model.id}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    setTranscriptionModel(model);
                                }}
                                className={`rounded-lg border p-2 text-left transition-colors ${transcriptionModel.id === model.id
                                        ? 'border-capshan-gold bg-capshan-gold/10'
                                        : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                                    }`}
                            >
                                <div className="text-xs font-bold text-white">{model.label}</div>
                                <div className="mt-1 text-[10px] leading-snug text-zinc-500">{model.description}</div>
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Trust Badges */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                    className="grid grid-cols-3 gap-3 mt-6 w-full max-w-xl"
                >
                    {TRUST_BADGES.map(({ icon: Icon, label, desc }, i) => (
                        <motion.div
                            key={label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 + i * 0.1 }}
                            className="flex flex-col items-center text-center p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50"
                        >
                            <Icon className="w-5 h-5 text-green-400 mb-1" />
                            <span className="text-xs font-bold text-white">{label}</span>
                            <span className="text-[10px] text-zinc-500 hidden md:block">{desc}</span>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Test Button */}
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleTestWithMockData();
                    }}
                    className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800 text-zinc-400 hover:text-capshan-gold hover:border-capshan-gold/50 transition-all text-sm font-medium"
                >
                    <Play className="w-4 h-4" />
                    <span>Try with sample video</span>
                </motion.button>
            </motion.div>
        </div>
    );
};

export default UploadZone;
