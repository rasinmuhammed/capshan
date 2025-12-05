import type { TranscriptSegment } from '../types';

// Format time for SRT (HH:MM:SS,MS)
function formatSRTTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
}

// Format time for VTT (HH:MM:SS.MS)
function formatVTTTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
}

// Convert segments to SRT format
export function toSRT(segments: TranscriptSegment[]): string {
    return segments
        .map((segment, index) => {
            const lines = [
                `${index + 1}`,
                `${formatSRTTime(segment.start)} --> ${formatSRTTime(segment.end)}`,
                segment.text,
                '',
            ];
            return lines.join('\n');
        })
        .join('\n');
}

// Convert segments to VTT format
export function toVTT(segments: TranscriptSegment[]): string {
    const header = 'WEBVTT\n\n';
    const content = segments
        .map((segment) => {
            const lines = [
                `${formatVTTTime(segment.start)} --> ${formatVTTTime(segment.end)}`,
                segment.text,
                '',
            ];
            return lines.join('\n');
        })
        .join('\n');

    return header + content;
}

// Convert segments to plain text
export function toTXT(segments: TranscriptSegment[]): string {
    return segments
        .map((segment) => {
            return `[${formatVTTTime(segment.start)}] ${segment.text}`;
        })
        .join('\n\n');
}

// Download a file
export function downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
