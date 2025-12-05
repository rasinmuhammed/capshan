import { useState, useEffect } from 'react';

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
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const query = `(min-width: ${breakpoints[breakpoint]}px)`;
        const media = window.matchMedia(query);

        // Set initial value
        setMatches(media.matches);

        // Listen for changes
        const listener = (e: MediaQueryListEvent) => {
            setMatches(e.matches);
        };

        media.addEventListener('change', listener);
        return () => media.removeEventListener('change', listener);
    }, [breakpoint]);

    return matches;
};

// Convenience hooks for common breakpoints
export const useIsMobile = () => !useMediaQuery('md'); // < 768px
export const useIsTablet = () => useMediaQuery('md') && !useMediaQuery('lg'); // 768px - 1024px
export const useIsDesktop = () => useMediaQuery('lg'); // >= 1024px
