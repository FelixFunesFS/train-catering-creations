
import { GalleryImage } from "@/data/gallery/types";
import { SectionContentCard } from "@/components/ui/section-content-card";
import { MasonryGalleryGrid } from "./MasonryGalleryGrid";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";

interface ThemeSectionProps {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  brandMessage: string;
  images: GalleryImage[];
  accentColor: string;
  onImageClick: (imageSrc: string) => void;
  isActive: boolean;
  onSectionFocus: () => void;
  alternateLayout?: boolean;
}

export const ThemeSection = ({
  id,
  title,
  subtitle,
  description,
  brandMessage,
  images,
  accentColor,
  onImageClick,
  isActive,
  onSectionFocus,
  alternateLayout = false
}: ThemeSectionProps) => {
  const { ref: headerRef, isVisible: headerVisible, variant: headerVariant } = useScrollAnimation({ 
    delay: 0, 
    variant: 'fade-up',
    mobile: { variant: 'fade-up', delay: 0 },
    desktop: { variant: 'ios-spring', delay: 0 }
  });

  const { ref: galleryRef, isVisible: galleryVisible, variant: galleryVariant } = useScrollAnimation({ 
    delay: 300, 
    variant: 'ios-spring',
    mobile: { variant: 'medium', delay: 200 },
    desktop: { variant: 'ios-spring', delay: 300 }
  });

  if (images.length === 0) return null;

  return (
    <SectionContentCard className="mb-0 overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${accentColor} opacity-0 transition-opacity duration-500 ${isActive ? 'opacity-100' : ''}`} />
      
      <div className="relative z-10">
        <div ref={headerRef} className={useAnimationClass(headerVariant, headerVisible)}>
          <div className={`text-center mb-8 sm:mb-12 ${alternateLayout ? 'lg:text-right' : 'lg:text-left'}`}>
            <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
              <div className="w-8 h-0.5 bg-primary"></div>
              <span className="text-sm sm:text-base text-primary font-medium tracking-wide uppercase">
                {subtitle}
              </span>
              <div className="w-8 h-0.5 bg-primary"></div>
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-elegant font-bold text-foreground mb-4 sm:mb-6 leading-tight">
              {title}
            </h2>
            
            <p className="text-muted-foreground text-base sm:text-lg lg:text-xl leading-relaxed max-w-4xl mx-auto mb-4 sm:mb-6">
              {description}
            </p>
            
            <div className="relative">
              <p className="text-primary font-elegant font-semibold text-lg sm:text-xl italic">
                "{brandMessage}"
              </p>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-0.5 bg-gradient-to-r from-primary to-primary/50"></div>
            </div>
          </div>
        </div>

        <div ref={galleryRef} className={useAnimationClass(galleryVariant, galleryVisible)}>
          <MasonryGalleryGrid
            images={images}
            onImageClick={onImageClick}
            sectionId={id}
            alternateLayout={alternateLayout}
          />
        </div>

        {images.length > 12 && (
          <div className="text-center mt-8 sm:mt-12">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <span>Showing {Math.min(12, images.length)} of {images.length} images</span>
              <span className="text-primary">•</span>
              <span className="text-primary font-medium">Click any image to view full gallery</span>
            </div>
          </div>
        )}
      </div>
    </SectionContentCard>
  );
};
