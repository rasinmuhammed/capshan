import React, { useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { useAppStore } from '../../store/app.store';

const Waveform: React.FC = () => {
    const waveformRef = useRef<HTMLDivElement>(null);
    const wavesurfer = useRef<WaveSurfer | null>(null);

    const { mediaFile, isPlaying, setIsPlaying, setCurrentTime, segments } = useAppStore();

    useEffect(() => {
        if (!waveformRef.current || !mediaFile) return;

        // Initialize wavesurfer
        wavesurfer.current = WaveSurfer.create({
            container: waveformRef.current,
            waveColor: '#52525b', // zinc-600
            progressColor: '#00d4ff', // electric-blue
            cursorColor: '#ff006e', // neon-pink
            barWidth: 2,
            barGap: 1,
            barRadius: 3,
            height: 80,
            normalize: true,
            backend: 'WebAudio',
        });

        // Mute wavesurfer to prevent double audio (video player handles audio)
        wavesurfer.current.setVolume(0);

        // Load audio/video safely
        const loadAudio = async () => {
            if (!wavesurfer.current) return;
            try {
                await wavesurfer.current.load(mediaFile.url);
            } catch (error) {
                // Ignore AbortError which happens if component unmounts during load
                if (!(error instanceof DOMException && error.name === 'AbortError')) {
                    console.error('WaveSurfer load error:', error);
                }
            }
        };
        loadAudio();

        // Sync with playback
        wavesurfer.current.on('ready', () => {
            console.log('Waveform ready');
        });

        wavesurfer.current.on('play', () => {
            setIsPlaying(true);
        });

        wavesurfer.current.on('pause', () => {
            setIsPlaying(false);
        });

        wavesurfer.current.on('seeking', (currentTime) => {
            setCurrentTime(currentTime);
        });

        return () => {
            if (wavesurfer.current) {
                const ws = wavesurfer.current;
                wavesurfer.current = null;

                try {
                    ws.unAll();
                    ws.pause();
                    // Destroy immediately but catch errors
                    ws.destroy();
                } catch (e) {
                    // Ignore AbortError which is common when destroying while loading
                    if (!(e instanceof DOMException && e.name === 'AbortError')) {
                        console.debug('WaveSurfer cleanup error:', e);
                    }
                }
            }
        };
    }, [mediaFile, setCurrentTime, setIsPlaying]);

    useEffect(() => {
        if (!wavesurfer.current) return;

        if (isPlaying) {
            wavesurfer.current.play();
        } else {
            wavesurfer.current.pause();
        }
    }, [isPlaying]);

    // Add segment markers
    useEffect(() => {
        if (!wavesurfer.current || segments.length === 0) return;

        // Clear existing markers
        // const regions = wavesurfer.current as any;

        // Add regions for each segment
        // segments.forEach((segment, index) => {
        //     regions.addRegion({
        //         id: segment.id,
        //         start: segment.start,
        //         end: segment.end,
        //         color: index % 2 === 0 ? 'rgba(0, 212, 255, 0.1)' : 'rgba(255, 0, 128, 0.1)',
        //         drag: false,
        //         resize: false,
        //     });
        // });
    }, [segments]);

    if (!mediaFile) return null;

    return (
        <div className="glass p-4 rounded-lg">
            <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-medium text-zinc-400">Timeline</h3>
                <div className="text-xs text-zinc-500">
                    {segments.length} segments
                </div>
            </div>
            <div ref={waveformRef} className="rounded-lg overflow-hidden" />
        </div>
    );
};

export default Waveform;
