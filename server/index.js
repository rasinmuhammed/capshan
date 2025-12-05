import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

const TEMP_DIR = path.join(__dirname, 'temp');
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, TEMP_DIR),
    filename: (req, file, cb) => cb(null, `${uuidv4()}-${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 500 * 1024 * 1024 } });

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.get('/api/health', (req, res) => res.json({ status: 'ok', ffmpeg: true }));

// Convert hex to ASS color (&HAABBGGRR)
function hexToASS(hex, alpha = 0) {
    const color = (hex || '#FFFFFF').replace('#', '').toUpperCase().padEnd(6, 'F');
    const r = color.slice(0, 2);
    const g = color.slice(2, 4);
    const b = color.slice(4, 6);
    const a = Math.round(alpha * 255).toString(16).padStart(2, '0').toUpperCase();
    return `&H${a}${b}${g}${r}`;
}

function formatASSTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const cs = Math.floor((seconds % 1) * 100);
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
}

// Text transform helper
function applyTransform(text, transform) {
    if (transform === 'uppercase') return text.toUpperCase();
    if (transform === 'lowercase') return text.toLowerCase();
    if (transform === 'capitalize') {
        return text.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    }
    return text;
}

/**
 * Generate ASS subtitles that EXACTLY match the CaptionOverlay preview
 * 
 * Key insight from CaptionOverlay.tsx:
 * - HormoziCaption shows words from activeIndex to activeIndex + 3
 * - Current word is scaled 1.15x with activeWordColor
 * - Uses spring animation (we simulate with ASS transforms)
 */
function generateASS(segments, style) {
    const fontSize = Math.min(style.fontSize || 52, 64);
    const fontFamily = 'Arial Black'; // Best match for Montserrat/bold fonts
    const bold = (style.fontWeight || 700) >= 700 ? -1 : 0;
    const transform = style.textTransform || 'none';

    // Colors - exactly as in CaptionOverlay
    const primaryColor = hexToASS(style.color || '#FFFFFF');
    const activeColor = hexToASS(style.activeWordColor || '#FFD700');
    const strokeColor = hexToASS(style.strokeColor || '#000000');

    // Effects
    const outline = style.strokeEnabled ? (style.strokeWidth || 3) : 2;
    const shadow = style.glowEnabled ? 2 : 1;
    const activeScale = Math.round((style.activeWordScale || 1.15) * 100);

    // Position - exactly as in CaptionOverlay
    // bottom-[12%] = MarginV ~130 on 1080p
    // top-[12%] = Alignment 8 with MarginV ~130
    // center = Alignment 5
    let alignment = 2; // bottom center
    let marginV = 130; // 12% of 1080

    if (style.position === 'top') {
        alignment = 8;
        marginV = 130;
    } else if (style.position === 'center') {
        alignment = 5;
        marginV = 0;
    }

    let ass = `[Script Info]
Title: Capshan Export
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,${fontFamily},${fontSize},${primaryColor},${primaryColor},${strokeColor},&H80000000,${bold},0,0,0,100,100,0,0,1,${outline},${shadow},${alignment},60,60,${marginV},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

    // Process based on display mode
    const displayMode = style.displayMode || 'word-by-word';

    if (displayMode === 'word-by-word') {
        // EXACT MATCH to HormoziCaption component:
        // const start = Math.max(0, activeIndex);
        // const end = Math.min(words.length, activeIndex + 3);
        // Shows 3 words starting from activeIndex

        const WORDS_TO_SHOW = 3;

        segments.forEach(segment => {
            if (!segment.words || segment.words.length === 0) {
                const start = formatASSTime(segment.start);
                const end = formatASSTime(segment.end);
                ass += `Dialogue: 0,${start},${end},Default,,0,0,0,,${applyTransform(segment.text, transform)}\n`;
                return;
            }

            const words = segment.words;

            // For each word that becomes active...
            for (let activeIndex = 0; activeIndex < words.length; activeIndex++) {
                const currentWord = words[activeIndex];
                const wordStart = formatASSTime(currentWord.start);
                const wordEnd = formatASSTime(currentWord.end);

                // Calculate visible range - EXACTLY like CaptionOverlay
                const visibleStart = Math.max(0, activeIndex);
                const visibleEnd = Math.min(words.length, activeIndex + WORDS_TO_SHOW);

                // Build the caption text with only visible words
                let captionText = '';

                for (let i = visibleStart; i < visibleEnd; i++) {
                    const wordText = applyTransform(words[i].word, transform);
                    const isActive = (i === activeIndex);

                    if (isActive) {
                        // Active word: scaled up, active color
                        // ASS format: {\fscxN\fscyN} for scaling, {\c&HBBGGRR&} for color
                        captionText += `{\\c${activeColor}\\fscx${activeScale}\\fscy${activeScale}\\bord${outline + 1}}${wordText}{\\c${primaryColor}\\fscx100\\fscy100\\bord${outline}} `;
                    } else {
                        // Non-active word: normal
                        captionText += `${wordText} `;
                    }
                }

                ass += `Dialogue: 0,${wordStart},${wordEnd},Default,,0,0,0,,${captionText.trim()}\n`;
            }
        });

    } else if (displayMode === 'karaoke' || displayMode === 'typewriter') {
        // Typewriter: words appear one by one, newest highlighted
        segments.forEach(segment => {
            if (!segment.words || segment.words.length === 0) {
                const start = formatASSTime(segment.start);
                const end = formatASSTime(segment.end);
                ass += `Dialogue: 0,${start},${end},Default,,0,0,0,,${applyTransform(segment.text, transform)}\n`;
                return;
            }

            let accumulated = [];
            segment.words.forEach((word, i) => {
                accumulated.push(applyTransform(word.word, transform));

                const start = formatASSTime(word.start);
                const end = i < segment.words.length - 1
                    ? formatASSTime(segment.words[i + 1].start)
                    : formatASSTime(segment.end);

                // Build text with last word highlighted
                let text = '';
                accumulated.forEach((w, j) => {
                    if (j === accumulated.length - 1) {
                        text += `{\\c${activeColor}\\fscx110\\fscy110}${w}{\\c${primaryColor}\\fscx100\\fscy100}`;
                    } else {
                        text += `${w} `;
                    }
                });

                ass += `Dialogue: 0,${start},${end},Default,,0,0,0,,${text}\n`;
            });
        });

    } else {
        // line-by-line / flow: show whole segment
        segments.forEach(segment => {
            const start = formatASSTime(segment.start);
            const end = formatASSTime(segment.end);
            const text = applyTransform(segment.text, transform).replace(/\n/g, '\\N');
            ass += `Dialogue: 0,${start},${end},Default,,0,0,0,,${text}\n`;
        });
    }

    return ass;
}

app.post('/api/export', upload.single('video'), async (req, res) => {
    const startTime = Date.now();
    let inputPath, assPath, outputPath;

    try {
        if (!req.file) return res.status(400).json({ error: 'No video' });

        const { segments, style, aspectRatio } = JSON.parse(req.body.data || '{}');
        if (!segments?.length) return res.status(400).json({ error: 'No segments' });

        console.log('\n=== Export ===');
        console.log('Mode:', style?.displayMode);
        console.log('Segments:', segments.length);
        console.log('Total words:', segments.reduce((a, s) => a + (s.words?.length || 0), 0));

        inputPath = req.file.path;
        const jobId = uuidv4();
        assPath = path.join(TEMP_DIR, `${jobId}.ass`);
        outputPath = path.join(TEMP_DIR, `${jobId}-output.mp4`);

        const assContent = generateASS(segments, style || {});
        fs.writeFileSync(assPath, assContent);

        // Log sample
        const events = assContent.split('\n').filter(l => l.startsWith('Dialogue'));
        console.log('Sample dialogues:');
        events.slice(0, 5).forEach(l => console.log('  ', l.slice(0, 100)));
        console.log(`  ... (${events.length} total)\n`);

        let vf = `ass=${assPath}`;
        if (aspectRatio === '9:16') {
            vf = `scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black,${vf}`;
        } else if (aspectRatio === '1:1') {
            vf = `scale=1080:1080:force_original_aspect_ratio=decrease,pad=1080:1080:(ow-iw)/2:(oh-ih)/2:black,${vf}`;
        } else if (aspectRatio === '16:9') {
            vf = `scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black,${vf}`;
        }

        const ffmpegArgs = [
            '-i', inputPath,
            '-vf', vf,
            '-c:v', 'libx264',
            '-preset', 'fast',
            '-crf', '22',
            '-profile:v', 'high',
            '-level', '4.2',
            '-pix_fmt', 'yuv420p',
            '-c:a', 'aac',
            '-b:a', '192k',
            '-ar', '48000',
            '-movflags', '+faststart',
            '-y',
            outputPath
        ];

        const ffmpeg = spawn('ffmpeg', ffmpegArgs);
        let stderr = '';

        ffmpeg.stderr.on('data', (d) => {
            stderr += d.toString();
            const m = d.toString().match(/time=(\d+:\d+:\d+\.\d+)/);
            if (m) process.stdout.write(`\r${m[1]}`);
        });

        ffmpeg.on('error', () => {
            cleanup();
            res.status(500).json({ error: 'FFmpeg not found' });
        });

        ffmpeg.on('close', (code) => {
            console.log(`\nDone: ${((Date.now() - startTime) / 1000).toFixed(1)}s`);

            if (code !== 0 || !fs.existsSync(outputPath)) {
                console.error(stderr.slice(-300));
                cleanup();
                return res.status(500).json({ error: 'Export failed' });
            }

            const stat = fs.statSync(outputPath);
            console.log(`Size: ${(stat.size / 1024 / 1024).toFixed(2)} MB`);

            res.setHeader('Content-Type', 'video/mp4');
            res.setHeader('Content-Length', stat.size);
            res.setHeader('Content-Disposition', 'attachment; filename="capshan-export.mp4"');

            fs.createReadStream(outputPath).pipe(res).on('finish', cleanup);
        });

        function cleanup() {
            setTimeout(() => {
                [inputPath, assPath, outputPath].forEach(p => {
                    try { if (p && fs.existsSync(p)) fs.unlinkSync(p); } catch { }
                });
            }, 1000);
        }

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`\n🎬 Capshan Server @ http://localhost:${PORT}\n`);
});
