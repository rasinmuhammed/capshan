import { useSyncExternalStore } from 'react';

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const breakpoints = {
    xs: 0,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
};

export const useMediaQuery = (breakpoint: Breakpoint): boolean => {
    const query = `(min-width: ${breakpoints[breakpoint]}px)`;

    return useSyncExternalStore(
        (callback) => {
            const media = window.matchMedia(query);
            media.addEventListener('change', callback);
            return () => media.removeEventListener('change', callback);
        },
        () => window.matchMedia(query).matches,
        () => false,
    );
};

// Convenience hooks for common breakpoints
export const useIsMobile = () => !useMediaQuery('md'); // < 768px
export const useIsTablet = () => {
    const isMd = useMediaQuery('md');
    const isLg = useMediaQuery('lg');
    return isMd && !isLg;
}; // 768px - 1024px
export const useIsDesktop = () => useMediaQuery('lg'); // >= 1024px
