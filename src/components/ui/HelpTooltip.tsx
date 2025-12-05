import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface HelpTooltipProps {
    content: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
    children?: React.ReactNode;
}

const HelpTooltip: React.FC<HelpTooltipProps> = ({
    content,
    position = 'top',
    children
}) => {
    const [isVisible, setIsVisible] = useState(false);

    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };

    return (
        <div
            className="relative inline-flex items-center"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children || (
                <HelpCircle className="w-4 h-4 text-zinc-500 hover:text-zinc-300 transition-colors cursor-help" />
            )}

            {isVisible && (
                <div className={`absolute z-50 w-max max-w-xs px-3 py-2 text-xs text-zinc-200 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl animate-fade-in ${positionClasses[position]}`}>
                    {content}
                    {/* Arrow */}
                    <div
                        className={`absolute w-2 h-2 bg-zinc-900 border-zinc-700 rotate-45
              ${position === 'top' ? 'bottom-[-5px] left-1/2 -translate-x-1/2 border-b border-r' : ''}
              ${position === 'bottom' ? 'top-[-5px] left-1/2 -translate-x-1/2 border-t border-l' : ''}
              ${position === 'left' ? 'right-[-5px] top-1/2 -translate-y-1/2 border-t border-r' : ''}
              ${position === 'right' ? 'left-[-5px] top-1/2 -translate-y-1/2 border-b border-l' : ''}
            `}
                    />
                </div>
            )}
        </div>
    );
};

export default HelpTooltip;
