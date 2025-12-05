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

// Create temp directory
const TEMP_DIR = path.join(__dirname, 'temp');
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Configure multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, TEMP_DIR),
    filename: (req, file, cb) => cb(null, `${uuidv4()}-${file.originalname}`)
});
const upload = multer({
    storage,
    limits: { fileSize: 500 * 1024 * 1024 }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', ffmpeg: true });
});

// Convert hex color to ASS format (&HAABBGGRR)
function hexToASS(hex, alpha = 0) {
    const color = hex.replace('#', '').toUpperCase().padEnd(6, '0');
    const r = color.slice(0, 2);
    const g = color.slice(2, 4);
    const b = color.slice(4, 6);
    const a = Math.round(alpha * 255).toString(16).padStart(2, '0').toUpperCase();
    return `&H${a}${b}${g}${r}`;
}

// Map font family to available system fonts
function mapFont(fontFamily) {
    const font = (fontFamily || '').toLowerCase();
    if (font.includes('montserrat')) return 'Montserrat';
    if (font.includes('poppins')) return 'Poppins';
    if (font.includes('inter')) return 'Inter';
    if (font.includes('roboto')) return 'Roboto';
    if (font.includes('arial')) return 'Arial';
    if (font.includes('pinyon')) return 'Brush Script MT'; // Fallback for script fonts
    return 'Arial'; // Safe default
}

// Generate ASS subtitle file with FULL styling support
function generateASS(segments, style) {
    // Extract all style properties
    const fontSize = style.fontSize || 48;
    const fontFamily = mapFont(style.fontFamily);
    const fontWeight = style.fontWeight || 700;
    const textTransform = style.textTransform || 'none';

    // Colors
    const primaryColor = hexToASS(style.color || '#FFFFFF');
    const outlineColor = hexToASS(style.strokeColor || '#000000');
    const activeColor = hexToASS(style.activeWordColor || '#FFD700');
    const glowColor = hexToASS(style.glowColor || '#FFD700');

    // Effects
    const outlineWidth = style.strokeEnabled ? (style.strokeWidth || 3) : 2;
    const shadow = style.glowEnabled ? Math.min(style.glowIntensity / 5 || 3, 4) : 1;

    // Position
    const alignment = style.position === 'top' ? 8 : style.position === 'center' ? 5 : 2;
    const marginV = style.position === 'top' ? 40 : style.position === 'center' ? 0 : 60;

    // Bold
    const bold = fontWeight >= 700 ? -1 : 0;

    // Build ASS file
    let ass = `[Script Info]
Title: Capshan Export
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,${fontFamily},${fontSize},${primaryColor},${primaryColor},${outlineColor},&H80000000,${bold},0,0,0,100,100,0,0,1,${outlineWidth},${shadow},${alignment},30,30,${marginV},1
Style: Highlight,${fontFamily},${Math.round(fontSize * 1.1)},${activeColor},${activeColor},${outlineColor},&H00000000,${bold},0,0,0,100,100,0,0,1,${outlineWidth + 1},${shadow},${alignment},30,30,${marginV},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

    // Process each segment
    segments.forEach(segment => {
        const formatTime = (seconds) => {
            const h = Math.floor(seconds / 3600);
            const m = Math.floor((seconds % 3600) / 60);
            const s = Math.floor(seconds % 60);
            const cs = Math.floor((seconds % 1) * 100);
            return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
        };

        const start = formatTime(segment.start);
        const end = formatTime(segment.end);

        // Apply text transform
        let text = segment.text;
        if (textTransform === 'uppercase') {
            text = text.toUpperCase();
        } else if (textTransform === 'lowercase') {
            text = text.toLowerCase();
        } else if (textTransform === 'capitalize') {
            text = text.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        }

        // Escape special characters
        text = text.replace(/\n/g, '\\N').replace(/[{}]/g, '');

        // For word-by-word mode, highlight current word
        if (style.displayMode === 'word-by-word' && segment.words && segment.words.length > 0) {
            // Process each word with timing
            segment.words.forEach((word, wordIndex) => {
                const wordStart = formatTime(word.start);
                const wordEnd = formatTime(word.end);

                // Build the line with the current word highlighted
                let styledText = '';
                segment.words.forEach((w, i) => {
                    let wordText = w.word;
                    if (textTransform === 'uppercase') wordText = wordText.toUpperCase();

                    if (i === wordIndex) {
                        // Highlight this word with scale and color
                        styledText += `{\\c${activeColor}\\fscx110\\fscy110}${wordText}{\\c${primaryColor}\\fscx100\\fscy100} `;
                    } else {
                        styledText += `${wordText} `;
                    }
                });

                ass += `Dialogue: 0,${wordStart},${wordEnd},Default,,0,0,0,,${styledText.trim()}\n`;
            });
        } else {
            // Simple mode - just show the text
            ass += `Dialogue: 0,${start},${end},Default,,0,0,0,,${text}\n`;
        }
    });

    return ass;
}

// Export video with captions
app.post('/api/export', upload.single('video'), async (req, res) => {
    const startTime = Date.now();
    let inputPath, assPath, outputPath;

    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No video file uploaded' });
        }

        const { segments, style, aspectRatio } = JSON.parse(req.body.data || '{}');

        if (!segments || segments.length === 0) {
            return res.status(400).json({ error: 'No segments provided' });
        }

        console.log('\n=== Export Request ===');
        console.log('Video:', req.file.originalname);
        console.log('Segments:', segments.length);
        console.log('Style:', JSON.stringify(style, null, 2).substring(0, 500));

        inputPath = req.file.path;
        const jobId = uuidv4();
        assPath = path.join(TEMP_DIR, `${jobId}.ass`);
        outputPath = path.join(TEMP_DIR, `${jobId}-output.mp4`);

        // Generate styled ASS file
        const assContent = generateASS(segments, style || {});
        fs.writeFileSync(assPath, assContent);
        console.log('\nGenerated ASS preview:\n', assContent.substring(0, 800));

        // Build video filter
        let vf = `ass=${assPath}`;

        // Add aspect ratio filter if needed
        if (aspectRatio === '9:16') {
            vf = `scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black,${vf}`;
        } else if (aspectRatio === '1:1') {
            vf = `scale=1080:1080:force_original_aspect_ratio=decrease,pad=1080:1080:(ow-iw)/2:(oh-ih)/2:black,${vf}`;
        } else if (aspectRatio === '16:9') {
            vf = `scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black,${vf}`;
        }

        // FFmpeg command
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

        console.log('\nFFmpeg command:', 'ffmpeg', ffmpegArgs.slice(0, 6).join(' '), '...');

        // Run FFmpeg
        const ffmpeg = spawn('ffmpeg', ffmpegArgs);

        let ffmpegStderr = '';
        ffmpeg.stderr.on('data', (data) => {
            ffmpegStderr += data.toString();
            const match = data.toString().match(/time=(\d+:\d+:\d+\.\d+)/);
            if (match) {
                process.stdout.write(`\rProgress: ${match[1]}`);
            }
        });

        ffmpeg.on('error', (err) => {
            console.error('\nFFmpeg spawn error:', err);
            cleanup();
            res.status(500).json({ error: 'FFmpeg not found' });
        });

        ffmpeg.on('close', (code) => {
            const duration = ((Date.now() - startTime) / 1000).toFixed(1);
            console.log(`\n\nFFmpeg finished: code=${code}, time=${duration}s`);

            if (code !== 0) {
                console.error('FFmpeg error:', ffmpegStderr.slice(-500));
                cleanup();
                return res.status(500).json({
                    error: 'Video processing failed',
                    details: ffmpegStderr.slice(-300)
                });
            }

            if (!fs.existsSync(outputPath)) {
                cleanup();
                return res.status(500).json({ error: 'Output file not created' });
            }

            const stat = fs.statSync(outputPath);
            console.log(`Output: ${(stat.size / 1024 / 1024).toFixed(2)} MB`);

            res.setHeader('Content-Type', 'video/mp4');
            res.setHeader('Content-Length', stat.size);
            res.setHeader('Content-Disposition', 'attachment; filename="exported.mp4"');

            const readStream = fs.createReadStream(outputPath);
            readStream.pipe(res);
            readStream.on('end', cleanup);
            readStream.on('error', () => cleanup());
        });

        function cleanup() {
            setTimeout(() => {
                try {
                    if (inputPath && fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                    if (assPath && fs.existsSync(assPath)) fs.unlinkSync(assPath);
                    if (outputPath && fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
                } catch (e) { }
            }, 1000);
        }

    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`\n🎬 Capshan Export Server running on http://localhost:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/api/health\n`);
});
