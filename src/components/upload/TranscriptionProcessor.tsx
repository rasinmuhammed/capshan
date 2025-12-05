import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check } from 'lucide-react';
import { useAppStore } from '../../store/app.store';
import ProgressRing from '../ui/ProgressRing';
import type { WorkerMessage } from '../../types';

const STEPS = [
    { id: 'prepare', label: 'Preparing audio' },
    { id: 'model', label: 'Loading AI model' },
    { id: 'transcribe', label: 'Transcribing' },
    { id: 'sync', label: 'Syncing words' },
];

const TranscriptionProcessor: React.FC = () => {
    const workerRef = useRef<Worker | null>(null);
    const [status, setStatus] = useState('');
    const [progress, setProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);

    const {
        mediaFile,
        segments,
        setSegments,
        setIsTranscribing,
        setError,
    } = useAppStore();

    const audioDataRef = useRef<Float32Array | null>(null);

    useEffect(() => {
        if (!mediaFile) return;

        // Skip transcription if segments already exist
        if (segments.length > 0) {
            console.log('Segments already loaded, skipping transcription');
            return;
        }

        // Create worker
        workerRef.current = new Worker(
            new URL('../../workers/transcription.worker.ts', import.meta.url),
            { type: 'module' }
        );

        // Handle worker messages
        workerRef.current.onmessage = (e: MessageEvent<WorkerMessage>) => {
            const { type, data } = e.data;

            switch (type) {
                case 'progress':
                    setStatus(data.message);
                    if (data.progress) setProgress(data.progress);

                    // Update step based on message
                    if (data.message?.includes('Model')) setCurrentStep(1);
                    if (data.message?.includes('Transcribing')) setCurrentStep(2);
                    if (data.message?.includes('Processing')) setCurrentStep(3);

                    // If model is ready and we have audio data, start transcription
                    if (data.status === 'ready' && audioDataRef.current) {
                        workerRef.current?.postMessage({
                            type: 'transcribe',
                            data: { audioData: audioDataRef.current }
                        });
                        audioDataRef.current = null; // Clear ref
                    }
                    break;

                case 'complete':
                    setSegments(data.segments);
                    setIsTranscribing(false);
                    setShowConfetti(true);
                    setCurrentStep(4);
                    setProgress(100);
                    setStatus('🎉 Ready to edit!');
                    setTimeout(() => {
                        setStatus('');
                        setShowConfetti(false);
                    }, 3000);
                    break;

                case 'error':
                    setError(data.message);
                    setIsTranscribing(false);
                    break;
            }
        };

        // Start transcription process
        startTranscription();

        return () => {
            workerRef.current?.terminate();
        };
    }, [mediaFile]);

    const startTranscription = async () => {
        if (!mediaFile || !workerRef.current) return;

        setIsTranscribing(true);
        setCurrentStep(0);
        setStatus('Preparing your content...');

        try {
            // Extract audio data
            const audioContext = new AudioContext({ sampleRate: 16000 });
            const response = await fetch(mediaFile.url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            const audioData = audioBuffer.getChannelData(0);

            // Initialize model
            workerRef.current.postMessage({ type: 'init', data: { modelName: 'Xenova/whisper-tiny.en' } });

            audioDataRef.current = audioData;

        } catch (error: any) {
            setError(`Failed to process audio: ${error.message}`);
            setIsTranscribing(false);
        }
    };

    if (!status) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="fixed top-24 right-6 z-50 bg-black/95 backdrop-blur-xl border border-capshan-gold/30 p-6 rounded-2xl max-w-sm shadow-[0_0_40px_rgba(255,215,0,0.15)]"
            >
                <div className="flex items-start gap-5">
                    {/* Progress Ring */}
                    <div className="relative">
                        <ProgressRing
                            progress={progress}
                            size={80}
                            strokeWidth={6}
                            color={showConfetti ? '#22c55e' : '#FFD700'}
                        />

                        {showConfetti && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute inset-0 flex items-center justify-center"
                            >
                                <Check className="w-8 h-8 text-green-500" />
                            </motion.div>
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-4 h-4 text-capshan-gold" />
                            <h4 className="font-black uppercase tracking-tight text-white text-sm">
                                {showConfetti ? 'All Done!' : 'Processing'}
                            </h4>
                        </div>

                        {/* Steps */}
                        <div className="space-y-2">
                            {STEPS.map((step, i) => (
                                <motion.div
                                    key={step.id}
                                    initial={{ opacity: 0.3 }}
                                    animate={{
                                        opacity: i <= currentStep ? 1 : 0.3,
                                    }}
                                    className="flex items-center gap-2"
                                >
                                    <div
                                        className={`w-2 h-2 rounded-full transition-colors ${i < currentStep
                                                ? 'bg-green-500'
                                                : i === currentStep
                                                    ? 'bg-capshan-gold animate-pulse'
                                                    : 'bg-zinc-700'
                                            }`}
                                    />
                                    <span
                                        className={`text-xs ${i <= currentStep ? 'text-zinc-300' : 'text-zinc-600'
                                            }`}
                                    >
                                        {step.label}
                                    </span>
                                    {i < currentStep && (
                                        <Check className="w-3 h-3 text-green-500" />
                                    )}
                                </motion.div>
                            ))}
                        </div>

                        {/* Current status */}
                        <motion.p
                            key={status}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-xs text-zinc-500 mt-3 truncate"
                        >
                            {status}
                        </motion.p>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default TranscriptionProcessor;

