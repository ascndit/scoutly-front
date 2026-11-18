import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';

interface ButtonProps extends HTMLMotionProps<'button'> {
    variant?: 'primary' | 'secondary' | 'action' | 'ghost';
    isLoading?: boolean;
    children: ReactNode;
}

export function Button({
                           variant = 'primary',
                           isLoading = false,
                           className = '',
                           children,
                           disabled,
                           ...props
                       }: ButtonProps) {
    const base =
        'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-scoutly-primary text-white hover:bg-scoutly-primary-hover shadow-sm',
        secondary: 'border border-scoutly-primary text-scoutly-primary bg-white hover:bg-scoutly-primary/5',
        action: 'bg-scoutly-action text-white hover:bg-scoutly-action-hover shadow-sm',
        ghost: 'text-scoutly-muted hover:text-scoutly-dark hover:bg-black/5',
    };

    return (
        <motion.button
            whileHover={{ scale: disabled || isLoading ? 1 : 1.015 }}
            whileTap={{ scale: disabled || isLoading ? 1 : 0.97 }}
            transition={{ type: 'spring', stiffness: 450, damping: 25 }}
            disabled={disabled || isLoading}
            className={`${base} ${variants[variant]} ${className}`}
            {...props}
        >
            {isLoading && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            {children}
        </motion.button>
    );
}