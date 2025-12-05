import type { TranscriptSegment, CaptionStyle } from '../types';

const API_URL = 'http://localhost:3001';

// Check if backend is available
export async function checkBackendHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${API_URL}/api/health`, {
            method: 'GET',
            signal: AbortSignal.timeout(3000)
        });
        return response.ok;
    } catch {
        return false;
    }
}

// Export video with captions using backend server
export async function exportVideoWithCaptions(
    videoFile: File,
    segments: TranscriptSegment[],
    style: CaptionStyle,
    aspectRatio: string = 'original',
    onProgress?: (status: string, progress: number) => void
): Promise<Blob> {
    // Check backend availability
    onProgress?.('Connecting to server...', 0);

    const backendAvailable = await checkBackendHealth();
    if (!backendAvailable) {
        throw new Error(
            'Export server not running! Please start the server:\n\n' +
            'cd server && npm install && npm start\n\n' +
            'Then try exporting again.'
        );
    }

    onProgress?.('Uploading video...', 10);

    // Create form data
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('data', JSON.stringify({
        segments,
        style,
        aspectRatio
    }));

    // Upload and process
    const response = await fetch(`${API_URL}/api/export`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || 'Export failed');
    }

    onProgress?.('Processing video...', 50);

    // Get the video blob
    const blob = await response.blob();

    if (blob.size === 0) {
        throw new Error('Export returned empty file');
    }

    onProgress?.('Complete!', 100);

    return blob;
}

// Download blob as file
export async function downloadBlob(blob: Blob, filename: string) {
    const baseName = filename.replace(/\.[^/.]+$/, '');
    const finalFilename = `${baseName}.mp4`;

    console.log('Saving file:', finalFilename, 'Size:', (blob.size / 1024 / 1024).toFixed(2), 'MB');

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = finalFilename;
    link.style.cssText = 'position:fixed;left:-9999px;';

    document.body.appendChild(link);

    await new Promise(resolve => setTimeout(resolve, 100));

    link.click();

    setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, 10000);

    console.log('Download triggered');
}
