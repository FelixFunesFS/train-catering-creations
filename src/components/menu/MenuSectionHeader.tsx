import React from 'react';

interface MenuSectionHeaderProps {
  title: string;
  subtitle?: string;
  color: string;
  categoryType?: 'signature' | 'premium' | 'classic';
}

export const MenuSectionHeader: React.FC<MenuSectionHeaderProps> = ({
  title,
  subtitle,
  color,
  categoryType = 'classic'
}) => {
  const getHeaderStyles = () => {
    switch (categoryType) {
      case 'signature':
        return {
          titleClass: 'text-3xl md:text-4xl font-elegant text-primary mb-2',
          subtitleClass: 'text-lg text-primary/80 font-light italic',
          decorationClass: 'bg-gradient-to-r from-transparent via-primary/40 to-transparent'
        };
      case 'premium':
        return {
          titleClass: 'text-2xl md:text-3xl font-elegant text-gold mb-2',
          subtitleClass: 'text-base text-gold/80 font-light',
          decorationClass: 'bg-gradient-to-r from-transparent via-gold/40 to-transparent'
        };
      default:
        return {
          titleClass: 'text-2xl md:text-3xl font-elegant text-card-foreground mb-2',
          subtitleClass: 'text-base text-muted-foreground font-light',
          decorationClass: 'bg-gradient-to-r from-transparent via-border to-transparent'
        };
    }
  };

  const { titleClass, subtitleClass, decorationClass } = getHeaderStyles();

  return (
    <div className="text-center mb-8">
      {/* Decorative top line */}
      <div className={`h-px ${decorationClass} mb-6`} />
      
      {/* Category badge for signature items */}
      {categoryType === 'signature' && (
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
          <span className="text-xs font-medium text-primary uppercase tracking-wide">
            Chef's Signature Collection
          </span>
        </div>
      )}
      
      {categoryType === 'premium' && (
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-gold/10 border border-gold/20 mb-4">
          <span className="text-xs font-medium text-gold uppercase tracking-wide">
            Premium Selection
          </span>
        </div>
      )}

      {/* Title */}
      <h3 className={titleClass}>
        {title}
      </h3>

      {/* Subtitle */}
      {subtitle && (
        <p className={subtitleClass}>
          {subtitle}
        </p>
      )}

      {/* Decorative bottom element */}
      <div className="flex items-center justify-center mt-4">
        <div className={`h-px w-12 ${decorationClass}`} />
        <div className={`
          w-2 h-2 rounded-full mx-3
          ${categoryType === 'signature' ? 'bg-primary' : 
            categoryType === 'premium' ? 'bg-gold' : 'bg-border'}
        `} />
        <div className={`h-px w-12 ${decorationClass}`} />
      </div>
    </div>
  );
};