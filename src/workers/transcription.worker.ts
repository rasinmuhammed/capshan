// Import transformers.js from bundled version for proper caching
import { pipeline, env } from '@xenova/transformers';

console.log('[Worker] Transformers.js loaded from bundle');

// Debug: Intercept fetch to log requests
// We define this BEFORE loading any libraries to ensure we catch everything
const originalFetch = self.fetch;
console.log('[Worker] Setting up fetch interceptor...');

self.fetch = async (input, init) => {
    let url = typeof input === 'string' ? input : input instanceof Request ? input.url : input.toString();

    // Filter out frequent polling or irrelevant requests if any
    if (!url.includes('socket') && !url.includes('vite')) {
        console.log(`[Worker] Fetching: ${url}`);
    }

    // CRITICAL FIX: Rewrite ANY request for the model to Hugging Face if it's not already there
    // This catches localhost:5173/Xenova... which was slipping through the previous check
    if (url.includes('Xenova/whisper-tiny.en') && !url.includes('huggingface.co')) {
        // Extract the part after the model name
        const parts = url.split('Xenova/whisper-tiny.en/');
        const fileName = parts[1];

        if (fileName) {
            const newUrl = `https://huggingface.co/Xenova/whisper-tiny.en/resolve/main/${fileName}`;
            console.log(`[Worker] Rewriting URL: ${url} -> ${newUrl}`);
            url = newUrl;

            if (input instanceof Request) {
                input = new Request(newUrl, input);
            } else {
                input = newUrl;
            }
        }
    }

    // CRITICAL FIX: Block ALL local requests (relative or localhost) for model files if they weren't rewritten
    const isLocal = !url.startsWith('http') || url.includes('localhost') || url.includes('127.0.0.1');
    const isModelFile = url.includes('.json') || url.includes('.onnx') || url.includes('.wasm');

    if (isLocal && isModelFile) {
        console.warn(`[Worker] Blocking local fetch for ${url} to force remote.`);
        return new Response(null, { status: 404, statusText: "Not Found" });
    }

    try {
        const response = await originalFetch(input, init);

        // Check for 404s or HTML responses which cause the JSON error
        if (!response.ok || (response.headers.get('content-type')?.includes('text/html'))) {
            if (response.headers.get('content-type')?.includes('text/html') && (url.includes('.json') || isModelFile)) {
                console.error(`[Worker] CRITICAL: Received HTML for ${url}. Returning 404 to force fallback.`);
                return new Response(null, { status: 404, statusText: "Not Found" });
            }
            console.error(`[Worker] BAD RESPONSE for ${url}: ${response.status} ${response.statusText} type=${response.headers.get('content-type')}`);
        }

        return response;
    } catch (error) {
        console.error(`[Worker] Network error for ${url}:`, error);
        throw error;
    }
};

let transcriber: any = null;

// Initialize the model
async function initializeModel(modelName: string = 'Xenova/whisper-tiny.en') {
    try {
        self.postMessage({ type: 'progress', data: { status: 'loading', progress: 0, message: '✨ Sprinkling magic dust...' } });

        console.log('[Worker] Configuring transformers environment...');

        // Configure environment BEFORE any pipeline calls
        env.allowLocalModels = false;
        env.allowRemoteModels = true;
        env.useBrowserCache = true; // This will now actually work!

        console.log(`[Worker] Initializing model: ${modelName}`);
        console.log('[Worker] Environment settings:', {
            allowLocalModels: env.allowLocalModels,
            allowRemoteModels: env.allowRemoteModels,
            useBrowserCache: env.useBrowserCache
        });

        self.postMessage({ type: 'progress', data: { status: 'loading', progress: 10, message: '🚀 Teaching AI to read lips...' } });

        // Initialize pipeline with caching enabled
        transcriber = await pipeline('automatic-speech-recognition', modelName, {
            revision: 'main',
            quantized: true,
            progress_callback: (progress: any) => {
                if (progress.status === 'progress') {
                    const percent = Math.round((progress.loaded / progress.total) * 100);
                    self.postMessage({
                        type: 'progress',
                        data: {
                            status: 'downloading',
                            progress: percent,
                            message: `Downloading model: ${percent}%`,
                        },
                    });
                }
            },
        });

        self.postMessage({ type: 'progress', data: { status: 'ready', progress: 100, message: 'Model loaded!' } });
    } catch (error: any) {
        console.error('Model initialization error:', error);
        self.postMessage({ type: 'error', data: { message: error.message || 'Failed to load model' } });
    }
}

// Interpolate word-level timestamps from segment-level data
function interpolateWordTimestamps(text: string, start: number, end: number) {
    const words = text.trim().split(/\s+/);
    const duration = end - start;
    const totalChars = words.reduce((sum, word) => sum + word.length, 0);

    const wordTimings = [];
    let currentTime = start;

    for (const word of words) {
        // Estimate word duration based on character length
        const wordDuration = (word.length / totalChars) * duration;
        const wordEnd = Math.min(currentTime + wordDuration, end);

        wordTimings.push({
            word,
            start: currentTime,
            end: wordEnd,
        });

        currentTime = wordEnd;
    }

    return wordTimings;
}

// Transcribe audio
async function transcribeAudio(audioData: Float32Array) {
    try {
        if (!transcriber) {
            await initializeModel();
        }

        if (!transcriber) {
            throw new Error('Failed to initialize transcription model');
        }

        console.log('Transcriber initialized');

        self.postMessage({ type: 'progress', data: { status: 'transcribing', progress: 0, message: 'Transcribing audio...' } });

        const output: any = await transcriber(audioData, {
            return_timestamps: 'word',
            chunk_length_s: 30,
            stride_length_s: 5,
        });

        // Process the output
        const segments = [];

        if (output.chunks) {
            // Word-level timestamps available
            let currentSegment: any = null;

            for (let i = 0; i < output.chunks.length; i++) {
                const chunk = output.chunks[i];

                if (!currentSegment || (chunk.timestamp && chunk.timestamp[0] - currentSegment.end > 1.0)) {
                    // Start a new segment
                    if (currentSegment) {
                        segments.push(currentSegment);
                    }

                    currentSegment = {
                        id: `segment-${segments.length}`,
                        start: chunk.timestamp ? chunk.timestamp[0] : i * 0.5,
                        end: chunk.timestamp ? chunk.timestamp[1] : (i + 1) * 0.5,
                        text: chunk.text.trim(),
                        words: [{
                            word: chunk.text.trim(),
                            start: chunk.timestamp ? chunk.timestamp[0] : i * 0.5,
                            end: chunk.timestamp ? chunk.timestamp[1] : (i + 1) * 0.5,
                        }],
                    };
                } else {
                    // Add to current segment
                    currentSegment.text += ' ' + chunk.text.trim();
                    currentSegment.end = chunk.timestamp ? chunk.timestamp[1] : (i + 1) * 0.5;
                    currentSegment.words.push({
                        word: chunk.text.trim(),
                        start: chunk.timestamp ? chunk.timestamp[0] : i * 0.5,
                        end: chunk.timestamp ? chunk.timestamp[1] : (i + 1) * 0.5,
                    });
                }
            }

            if (currentSegment) {
                segments.push(currentSegment);
            }
        } else {
            // Fallback: create segments from text with interpolated timestamps
            const text = output.text || '';
            const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
            const avgDuration = 3.0; // Average sentence duration

            for (let i = 0; i < sentences.length; i++) {
                const sentence = sentences[i].trim();
                const start = i * avgDuration;
                const end = (i + 1) * avgDuration;

                segments.push({
                    id: `segment-${i}`,
                    start,
                    end,
                    text: sentence,
                    words: interpolateWordTimestamps(sentence, start, end),
                });
            }
        }

        self.postMessage({ type: 'complete', data: { segments } });
    } catch (error: any) {
        console.error('Transcription error:', error);
        self.postMessage({ type: 'error', data: { message: error.message } });
    }
}

// Handle messages from main thread
self.onmessage = async (e) => {
    const { type, data } = e.data;

    switch (type) {
        case 'init':
            await initializeModel(data.modelName);
            break;
        case 'transcribe':
            await transcribeAudio(data.audioData);
            break;
        default:
            break;
    }
};
