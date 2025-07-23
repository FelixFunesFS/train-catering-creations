import React from 'react';
import { cn } from '@/lib/utils';

interface MenuCategoryProps {
  children: React.ReactNode;
  type?: 'signature' | 'premium' | 'classic';
  className?: string;
}

export const MenuCategory: React.FC<MenuCategoryProps> = ({
  children,
  type = 'classic',
  className
}) => {
  const getContainerStyles = () => {
    switch (type) {
      case 'signature':
        return 'border-primary/20 bg-primary/2 shadow-lg shadow-primary/5';
      case 'premium':
        return 'border-gold/20 bg-gold/2 shadow-lg shadow-gold/5';
      default:
        return 'border-border/50 bg-card/30 shadow-md';
    }
  };

  return (
    <div className={cn(
      'relative rounded-2xl border backdrop-blur-sm p-8 transition-all duration-300',
      getContainerStyles(),
      className
    )}>
      {/* Background pattern for signature items */}
      {type === 'signature' && (
        <div className="absolute inset-0 rounded-2xl opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/10" />
        </div>
      )}
      
      {/* Background pattern for premium items */}
      {type === 'premium' && (
        <div className="absolute inset-0 rounded-2xl opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-gold/20 via-transparent to-gold/10" />
        </div>
      )}

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};