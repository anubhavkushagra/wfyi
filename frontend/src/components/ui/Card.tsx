import React from 'react';
import { cn } from '../../lib/utils';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface CardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    noPadding?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, children, noPadding = false, ...props }, ref) => {
        return (
            <motion.div
                ref={ref}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                    "bg-white rounded-xl shadow-soft-xl overflow-hidden border border-gray-100",
                    !noPadding && "p-6",
                    className
                )}
                {...props}
            >
                {children}
            </motion.div>
        );
    }
);
Card.displayName = "Card";
