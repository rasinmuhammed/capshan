import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps {
    variant?: 'primary' | 'secondary' | 'ghost' | 'gold';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    icon?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    disabled?: boolean;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
}

const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    children,
    className = '',
    disabled,
    onClick,
    type = 'button',
}) => {
    const baseClasses = `
        relative inline-flex items-center justify-center gap-2 font-semibold
        rounded-xl transition-all duration-200 overflow-hidden
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black
    `;

    const variants = {
        primary: `
            bg-white text-black
            hover:bg-zinc-200
            focus:ring-white
        `,
        secondary: `
            bg-zinc-800 text-white border border-zinc-700
            hover:bg-zinc-700 hover:border-zinc-600
            focus:ring-zinc-500
        `,
        ghost: `
            bg-transparent text-zinc-400
            hover:bg-zinc-800 hover:text-white
            focus:ring-zinc-500
        `,
        gold: `
            bg-capshan-gold text-black
            hover:bg-yellow-400
            shadow-[0_0_20px_rgba(255,215,0,0.3)]
            hover:shadow-[0_0_30px_rgba(255,215,0,0.5)]
            focus:ring-capshan-gold
        `,
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
    };

    return (
        <motion.button
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || loading}
            onClick={onClick}
            type={type}
        >
            {/* Ripple effect on hover */}
            <span className="absolute inset-0 overflow-hidden rounded-xl">
                <span className="absolute inset-0 translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700" />
            </span>

            {loading ? (
                <svg
                    className="animate-spin w-4 h-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
            ) : icon ? (
                <span className="w-4 h-4">{icon}</span>
            ) : null}

            <span className="relative">{children}</span>
        </motion.button>
    );
};

// Icon Button variant
interface IconButtonProps {
    variant?: 'primary' | 'secondary' | 'ghost' | 'gold';
    size?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    disabled?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({
    variant = 'ghost',
    size = 'md',
    children,
    className = '',
    onClick,
    disabled,
}) => {
    const sizes = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12',
    };

    const variants = {
        primary: 'bg-white text-black hover:bg-zinc-200',
        secondary: 'bg-zinc-800 text-white hover:bg-zinc-700',
        ghost: 'text-zinc-400 hover:bg-zinc-800 hover:text-white',
        gold: 'bg-capshan-gold text-black hover:bg-yellow-400 glow-gold-sm',
    };

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
                inline-flex items-center justify-center rounded-xl
                transition-all duration-200 disabled:opacity-50
                ${sizes[size]} ${variants[variant]} ${className}
            `}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </motion.button>
    );
};

export default Button;
