import React from 'react';
import MediaPlayer from '../preview/MediaPlayer';
import TranscriptList from './TranscriptList';
import Waveform from '../timeline/Waveform';
import ExportPanel from '../export/ExportPanel';
import ViralCommandCenter from '../viral/ViralCommandCenter';

const EditorLayout: React.FC = () => {
    return (
        <div className="h-[calc(100vh-4rem)] p-4 lg:p-5 overflow-hidden">
            <div className="h-full max-w-[1800px] mx-auto">
                {/* Main Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 h-full">
                    {/* Left Panel - Transcript Editor */}
                    <div className="order-2 lg:order-1 lg:col-span-2 glass p-4 rounded-xl overflow-hidden flex flex-col h-full">
                        <TranscriptList />
                    </div>

                    {/* Right Panel - Preview & Export */}
                    <div className="order-1 lg:order-2 lg:col-span-3 flex flex-col gap-4 h-full overflow-hidden">
                        {/* Media Player */}
                        <div className="glass p-4 rounded-xl flex-1 min-h-0 overflow-hidden">
                            <MediaPlayer />
                        </div>

                        {/* Timeline - compact */}
                        <div className="h-24 hidden lg:block flex-shrink-0">
                            <Waveform />
                        </div>

                        <div className="flex-shrink-0">
                            <ViralCommandCenter />
                        </div>

                        {/* Export Panel - compact */}
                        <div className="flex-shrink-0">
                            <ExportPanel />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditorLayout;
