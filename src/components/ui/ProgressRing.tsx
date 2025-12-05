import React from 'react';
import { motion } from 'framer-motion';

interface ProgressRingProps {
    progress: number; // 0-100
    size?: number;
    strokeWidth?: number;
    color?: string;
    trackColor?: string;
    showPercentage?: boolean;
    label?: string;
}

const ProgressRing: React.FC<ProgressRingProps> = ({
    progress,
    size = 120,
    strokeWidth = 8,
    color = '#FFD700',
    trackColor = 'rgba(255, 255, 255, 0.1)',
    showPercentage = true,
    label,
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg
                width={size}
                height={size}
                className="transform -rotate-90"
            >
                {/* Track */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke={trackColor}
                    strokeWidth={strokeWidth}
                />

                {/* Progress */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    style={{
                        strokeDasharray: circumference,
                    }}
                />
            </svg>

            {/* Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                {showPercentage && (
                    <motion.span
                        className="text-2xl font-bold text-white"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        key={Math.round(progress)}
                    >
                        {Math.round(progress)}%
                    </motion.span>
                )}
                {label && (
                    <span className="text-xs text-zinc-400 mt-1">{label}</span>
                )}
            </div>
        </div>
    );
};

// Smaller inline progress indicator
export const ProgressBar: React.FC<{
    progress: number;
    className?: string;
    color?: string;
}> = ({ progress, className = '', color = '#FFD700' }) => (
    <div className={`h-1.5 bg-zinc-800 rounded-full overflow-hidden ${className}`}>
        <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: color }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
        />
    </div>
);

// Animated spinner
export const Spinner: React.FC<{ size?: number; color?: string }> = ({
    size = 24,
    color = '#FFD700',
}) => (
    <motion.div
        className="rounded-full border-2 border-t-transparent"
        style={{
            width: size,
            height: size,
            borderColor: `${color}40`,
            borderTopColor: color,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
);

export default ProgressRing;
