import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Video, Loader2, Sparkles, Monitor, Smartphone, Square } from 'lucide-react';
import { useAppStore } from '../../store/app.store';
import { toSRT, toVTT, toTXT, downloadFile } from '../../utils/subtitle';
import { exportVideoWithCaptions, downloadBlob } from '../../utils/ffmpeg';

const ASPECT_RATIOS = [
    { id: 'original', label: 'Original', icon: Video, desc: 'Keep source ratio' },
    { id: '16:9', label: 'Landscape', icon: Monitor, desc: 'YouTube, Web' },
    { id: '9:16', label: 'Portrait', icon: Smartphone, desc: 'TikTok, Reels' },
    { id: '1:1', label: 'Square', icon: Square, desc: 'Instagram Feed' },
];

const ExportPanel: React.FC = () => {
    const { segments, mediaFile, captionStyle, setError, exportAspectRatio, setExportAspectRatio } = useAppStore();
    const [isExporting, setIsExporting] = useState(false);
    const [exportStatus, setExportStatus] = useState('');
    const [exportProgress, setExportProgress] = useState(0);

    const handleSubtitleExport = (format: 'srt' | 'vtt' | 'txt') => {
        if (segments.length === 0) return;

        let content: string;
        let filename: string;
        let mimeType: string;

        const baseName = mediaFile?.name?.replace(/\.[^/.]+$/, '') || 'transcript';

        switch (format) {
            case 'srt':
                content = toSRT(segments);
                filename = `${baseName}.srt`;
                mimeType = 'application/x-subrip';
                break;
            case 'vtt':
                content = toVTT(segments);
                filename = `${baseName}.vtt`;
                mimeType = 'text/vtt';
                break;
            case 'txt':
                content = toTXT(segments);
                filename = `${baseName}.txt`;
                mimeType = 'text/plain';
                break;
        }

        downloadFile(content, filename, mimeType);
    };

    const handleVideoExport = async () => {
        if (!mediaFile || segments.length === 0) {
            setError('No video or transcript available to export');
            return;
        }

        if (mediaFile.type !== 'video') {
            setError('Video export only works with video files. Please upload a video.');
            return;
        }

        const baseName = mediaFile.name.replace(/\.[^/.]+$/, '');
        const filename = `${baseName}_captions.mp4`;

        // Get file handle FIRST while we still have user gesture
        let fileHandle: any = null;
        if ('showSaveFilePicker' in window) {
            try {
                fileHandle = await (window as any).showSaveFilePicker({
                    suggestedName: filename,
                    types: [{
                        description: 'MP4 Video',
                        accept: { 'video/mp4': ['.mp4'] }
                    }]
                });
            } catch (err: any) {
                if (err.name === 'AbortError') {
                    // User cancelled
                    return;
                }
                // Fall through to use download blob
                console.warn('File picker not available, will use download');
            }
        }

        setIsExporting(true);
        setExportStatus('Initializing...');
        setExportProgress(0);

        try {
            const videoBlob = await exportVideoWithCaptions(
                mediaFile.file,
                segments,
                captionStyle,
                exportAspectRatio,
                (status, progress) => {
                    setExportStatus(status);
                    setExportProgress(progress);
                }
            );

            // Write to file handle if we have one, otherwise download
            if (fileHandle) {
                setExportStatus('Saving file...');
                const writable = await fileHandle.createWritable();
                await writable.write(videoBlob);
                await writable.close();
                console.log('File saved successfully!');
            } else {
                // Fallback download
                await downloadBlob(videoBlob, filename);
            }

            setExportStatus('Saved!');
            setTimeout(() => {
                setIsExporting(false);
                setExportStatus('');
            }, 2000);
        } catch (error: any) {
            setError(error.message);
            setIsExporting(false);
            setExportStatus('');
        }
    };

    if (segments.length === 0) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-4 rounded-xl"
        >
            <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-capshan-gold" />
                <h3 className="font-bold text-sm">Export</h3>
            </div>

            {/* Aspect Ratio Selector - Always Visible */}
            <div className="mb-4">
                <div className="text-xs text-zinc-400 mb-2">Video Format</div>
                <div className="grid grid-cols-4 gap-2">
                    {ASPECT_RATIOS.map((ratio) => {
                        const Icon = ratio.icon;
                        return (
                            <button
                                key={ratio.id}
                                onClick={() => setExportAspectRatio(ratio.id as any)}
                                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${exportAspectRatio === ratio.id
                                    ? 'bg-capshan-gold/20 border border-capshan-gold/50 text-capshan-gold'
                                    : 'bg-zinc-800/50 border border-transparent hover:bg-zinc-800 text-zinc-400'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span className="text-[10px] font-medium">{ratio.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="space-y-3">
                {/* Video Export */}
                <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleVideoExport}
                    disabled={isExporting}
                    className="w-full flex items-center justify-center gap-2 bg-capshan-gold hover:bg-yellow-400 disabled:opacity-50 px-4 py-3 rounded-xl font-bold text-black text-sm transition-all glow-gold-sm"
                >
                    {isExporting ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="truncate">{exportStatus || 'Processing...'}</span>
                        </>
                    ) : (
                        <>
                            <Video className="w-4 h-4" />
                            Save as MP4
                        </>
                    )}
                </motion.button>

                {/* Progress Bar */}
                <AnimatePresence>
                    {isExporting && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                                <motion.div
                                    className="h-full bg-capshan-gold"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${exportProgress}%` }}
                                />
                            </div>
                            <div className="text-[10px] text-zinc-500 mt-1 text-right">{exportProgress}%</div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Subtitle Exports - Compact */}
                <div className="flex gap-2">
                    {[
                        { format: 'srt' as const, label: 'SRT' },
                        { format: 'vtt' as const, label: 'VTT' },
                        { format: 'txt' as const, label: 'TXT' },
                    ].map(({ format, label }) => (
                        <motion.button
                            key={format}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleSubtitleExport(format)}
                            className="flex-1 flex items-center justify-center gap-1 bg-zinc-800/50 hover:bg-zinc-800 px-2 py-2 rounded-lg transition-colors"
                        >
                            <Download className="w-3 h-3 text-zinc-400" />
                            <span className="text-xs font-medium">.{label}</span>
                        </motion.button>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default ExportPanel;
