import React, { useState, useEffect } from 'react';
import { X, ChevronRight, Check } from 'lucide-react';

interface TourStep {
    target: string;
    title: string;
    content: string;
    position: 'top' | 'bottom' | 'left' | 'right';
}

const TOUR_STEPS: TourStep[] = [
    {
        target: '.upload-zone',
        title: 'Upload Media',
        content: 'Start by dragging and dropping your video or audio file here.',
        position: 'bottom',
    },
    {
        target: '.transcript-list',
        title: 'Edit Transcript',
        content: 'Click on any word to correct it. The video will jump to that exact moment.',
        position: 'right',
    },
    {
        target: '.style-panel-trigger',
        title: 'Customize Styles',
        content: 'Change fonts, colors, and animations for your captions here.',
        position: 'left',
    },
    {
        target: '.export-panel',
        title: 'Export Video',
        content: 'When you are ready, export your video with burned-in captions.',
        position: 'top',
    },
];

const OnboardingTour: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    useEffect(() => {
        // Check if tour has been completed
        const hasCompletedTour = localStorage.getItem('capshan-tour-completed');
        if (!hasCompletedTour) {
            // Wait a bit for UI to settle
            setTimeout(() => setIsVisible(true), 1000);
        }
    }, []);

    useEffect(() => {
        if (!isVisible) return;

        const updatePosition = () => {
            const step = TOUR_STEPS[currentStep];
            const element = document.querySelector(step.target);

            if (element) {
                const rect = element.getBoundingClientRect();
                const tooltipWidth = 320; // Approximate width
                const tooltipHeight = 150; // Approximate height

                let top = 0;
                let left = 0;

                switch (step.position) {
                    case 'top':
                        top = rect.top - tooltipHeight - 20;
                        left = rect.left + rect.width / 2 - tooltipWidth / 2;
                        break;
                    case 'bottom':
                        top = rect.bottom + 20;
                        left = rect.left + rect.width / 2 - tooltipWidth / 2;
                        break;
                    case 'left':
                        top = rect.top + rect.height / 2 - tooltipHeight / 2;
                        left = rect.left - tooltipWidth - 20;
                        break;
                    case 'right':
                        top = rect.top + rect.height / 2 - tooltipHeight / 2;
                        left = rect.right + 20;
                        break;
                }

                // Keep within viewport
                left = Math.max(20, Math.min(window.innerWidth - tooltipWidth - 20, left));
                top = Math.max(20, Math.min(window.innerHeight - tooltipHeight - 20, top));

                setPosition({ top, left });

                // Scroll element into view
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        };

        updatePosition();
        window.addEventListener('resize', updatePosition);
        return () => window.removeEventListener('resize', updatePosition);
    }, [currentStep, isVisible]);

    const handleNext = () => {
        if (currentStep < TOUR_STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            completeTour();
        }
    };

    const completeTour = () => {
        localStorage.setItem('capshan-tour-completed', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    const step = TOUR_STEPS[currentStep];

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-500" />

            {/* Spotlight (optional - complex to implement perfectly, skipping for now) */}

            {/* Tooltip */}
            <div
                className="fixed z-50 w-80 glass p-6 rounded-xl animate-fade-in transition-all duration-500"
                style={{ top: position.top, left: position.left }}
            >
                <button
                    onClick={completeTour}
                    className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="mb-4">
                    <span className="text-xs font-bold text-electric-blue uppercase tracking-wider">
                        Step {currentStep + 1} of {TOUR_STEPS.length}
                    </span>
                    <h3 className="text-xl font-bold mt-1">{step.title}</h3>
                    <p className="text-zinc-400 mt-2 text-sm leading-relaxed">
                        {step.content}
                    </p>
                </div>

                <div className="flex items-center justify-between mt-6">
                    <div className="flex gap-1">
                        {TOUR_STEPS.map((_, i) => (
                            <div
                                key={i}
                                className={`w-2 h-2 rounded-full transition-colors ${i === currentStep ? 'bg-electric-blue' : 'bg-zinc-800'
                                    }`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={handleNext}
                        className="flex items-center gap-2 bg-zinc-100 text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-white transition-colors"
                    >
                        {currentStep === TOUR_STEPS.length - 1 ? (
                            <>
                                Finish <Check className="w-4 h-4" />
                            </>
                        ) : (
                            <>
                                Next <ChevronRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </>
    );
};

export default OnboardingTour;
