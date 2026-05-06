import React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'teal' | 'orange';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className,
  ...props 
}) => {
  const variants = {
    primary: "bg-brand-red text-white hover:bg-brand-red/90",
    secondary: "bg-brand-dark text-white hover:bg-brand-dark/90",
    outline: "border-2 border-brand-red/20 text-brand-red hover:bg-brand-red/5",
    ghost: "text-gray-500 hover:bg-gray-100",
    teal: "bg-brand-teal text-white hover:bg-brand-teal/90",
    orange: "bg-brand-orange text-white hover:bg-brand-orange/90",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-6 py-2.5 text-sm",
    lg: "px-8 py-3.5 text-base",
    icon: "p-2.5",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      className={cn(
        "rounded-2xl font-bold transition-all flex items-center justify-center gap-2",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn("bento-card p-6", className)}>
    {children}
  </div>
);

export const Badge: React.FC<{ children: React.ReactNode; variant?: 'red' | 'orange' | 'teal' | 'gray' }> = ({ children, variant = 'gray' }) => {
  const styles = {
    red: "bg-brand-red/10 text-brand-red",
    orange: "bg-brand-orange/10 text-brand-orange",
    teal: "bg-brand-teal/10 text-brand-teal",
    gray: "bg-gray-100 text-gray-500",
  };
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider", styles[variant])}>
      {children}
    </span>
  );
};
