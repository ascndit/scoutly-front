import { forwardRef, type InputHTMLAttributes } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, id, className = '', ...props }, ref) => {
        const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

        return (
            <div className="w-full">
                <div className="relative">
                    <input
                        ref={ref}
                        id={inputId}
                        placeholder=" "
                        className={`peer w-full rounded-lg border bg-white px-3.5 pt-5 pb-2 text-sm text-scoutly-dark outline-none transition-all
              ${
                            error
                                ? 'border-status-danger focus:ring-2 focus:ring-status-danger/20'
                                : 'border-gray-300 focus:border-scoutly-accent focus:ring-2 focus:ring-scoutly-accent/20'
                        } ${className}`}
                        {...props}
                    />
                    <label
                        htmlFor={inputId}
                        className={`pointer-events-none absolute left-3.5 top-2 text-[11px] font-medium transition-all
              peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal
              peer-focus:top-2 peer-focus:text-[11px] peer-focus:font-medium
              ${error ? 'text-status-danger' : 'text-scoutly-muted peer-focus:text-scoutly-accent'}`}
                    >
                        {label}
                    </label>
                </div>

                <AnimatePresence>
                    {error && (
                        <motion.p
                            initial={{ opacity: 0, y: -4, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -4, height: 0 }}
                            transition={{ duration: 0.18 }}
                            className="mt-1 text-xs text-status-danger"
                        >
                            {error}
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>
        );
    }
);

Input.displayName = 'Input';