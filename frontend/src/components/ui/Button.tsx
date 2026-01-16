import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
        const variants = {
            primary: "bg-pink-500 hover:bg-pink-600 text-white shadow-md active:opacity-90", // Using tailwind colors mapping to our theme variables if possible, or direct tokens. 
            // Note: In index.css we defined --color-primary as #cb0c9f. 
            // Tailwind v4 can use CSS variables directly usually, but standard palette classes like bg-pink-500 exist.
            // Let's use custom classes mapping to our CSS vars for best accuracy with the prompt.
            // actually, let's use arbitrary values or style injection if needed, but best is to use the theme values.
            // Since I defined --color-primary, I can use utilities if I configured them, or just use `bg-[var(--color-primary)]`
            // detailed: "bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white shadow-md"

            // Let's go with the specific requested colors
            customPrimary: "bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5",
            secondary: "bg-gray-800 text-white hover:bg-gray-900 shadow-md",
            outline: "border-2 border-gray-200 bg-transparent hover:bg-gray-50 text-gray-700",
            ghost: "bg-transparent hover:bg-gray-100 text-gray-700",
        };

        const sizes = {
            sm: "h-9 px-4 text-xs font-bold uppercase tracking-wider",
            md: "h-11 px-6 text-sm font-bold uppercase tracking-wider",
            lg: "h-14 px-8 text-base font-bold uppercase tracking-wider",
        };

        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
                    variants[variant === 'primary' ? 'customPrimary' : variant],
                    sizes[size],
                    className
                )}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </button>
        );
    }
);
Button.displayName = "Button";
