import React from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular';
    width?: string | number;
    height?: string | number;
    count?: number;
}

const Skeleton: React.FC<SkeletonProps> = ({
    className = '',
    variant = 'rectangular',
    width,
    height,
    count = 1
}) => {
    const baseClasses = 'animate-pulse bg-zinc-800/60';

    const variantClasses = {
        text: 'rounded h-4',
        circular: 'rounded-full',
        rectangular: 'rounded-lg',
    };

    const style: React.CSSProperties = {
        width: width || '100%',
        height: height || (variant === 'text' ? '1rem' : '100%'),
    };

    const items = Array.from({ length: count }, (_, i) => (
        <div
            key={i}
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            style={style}
        />
    ));

    if (count === 1) return items[0];

    return <div className="space-y-2">{items}</div>;
};

// Skeleton presets
export const TranscriptSkeleton: React.FC = () => (
    <div className="space-y-4 p-4">
        {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-2">
                <Skeleton variant="text" width="30%" height={12} />
                <Skeleton variant="text" width="100%" height={16} />
                <Skeleton variant="text" width="85%" height={16} />
            </div>
        ))}
    </div>
);

export const PreviewSkeleton: React.FC = () => (
    <div className="w-full h-full flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md">
            <Skeleton variant="rectangular" height={200} className="rounded-xl" />
            <div className="flex gap-2 justify-center">
                <Skeleton variant="circular" width={40} height={40} />
                <Skeleton variant="circular" width={40} height={40} />
                <Skeleton variant="circular" width={40} height={40} />
            </div>
        </div>
    </div>
);

export const StylePanelSkeleton: React.FC = () => (
    <div className="p-4 space-y-4">
        <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} variant="rectangular" width={80} height={32} />
            ))}
        </div>
        <Skeleton variant="rectangular" height={100} />
        <Skeleton variant="rectangular" height={60} />
        <Skeleton variant="rectangular" height={60} />
    </div>
);

export default Skeleton;
