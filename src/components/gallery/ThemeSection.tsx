
import { GalleryImage } from "@/data/gallery/types";
import { SectionContentCard } from "@/components/ui/section-content-card";
import { MasonryGalleryGrid } from "./MasonryGalleryGrid";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { Badge } from "@/components/ui/badge";

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
  targetCount?: number;
  completionPercentage?: number;
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
  alternateLayout = false,
  targetCount = 12,
  completionPercentage = 100
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

  const highQualityCount = images.filter(img => img.quality >= 8).length;
  const averageQuality = Math.round(images.reduce((sum, img) => sum + img.quality, 0) / images.length);

  return (
    <div className="relative">
      {/* Enhanced Section Divider */}
      <div className="absolute -top-12 left-0 right-0 flex items-center justify-center">
        <div className="w-full max-w-2xl h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
      </div>

      <SectionContentCard className="mb-0 overflow-hidden relative">
        {/* Active Section Highlight with Pulse Effect */}
        <div className={`absolute inset-0 bg-gradient-to-br ${accentColor} opacity-0 transition-all duration-700 ${isActive ? 'opacity-100 animate-pulse' : ''}`} />
        
        {/* Enhanced Section Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className={`w-full h-full bg-gradient-to-br ${alternateLayout ? 'from-primary/20 via-transparent to-primary/10' : 'from-transparent via-primary/5 to-primary/15'}`}></div>
        </div>
        
        <div className="relative z-10">
          <div ref={headerRef} className={useAnimationClass(headerVariant, headerVisible)}>
            <div className={`text-center mb-8 sm:mb-12 ${alternateLayout ? 'lg:text-right' : 'lg:text-left'}`}>
              {/* Enhanced Section Header with Stats */}
              <div className="flex items-center justify-center gap-3 mb-4 sm:mb-6">
                <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-primary"></div>
                <div className="flex items-center gap-2">
                  <span className="text-sm sm:text-base text-primary font-medium tracking-wide uppercase">
                    {subtitle}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {images.length} images
                  </Badge>
                </div>
                <div className="w-12 h-0.5 bg-gradient-to-r from-primary to-transparent"></div>
              </div>
              
              {/* Section Title with Quality Indicator */}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-elegant font-bold text-foreground mb-4 sm:mb-6 leading-tight">
                {title}
              </h2>
              
              {/* Quality Stats */}
              <div className="flex justify-center gap-4 sm:gap-6 mb-4 sm:mb-6">
                <div className="text-center">
                  <div className="text-lg sm:text-xl font-bold text-primary">
                    {highQualityCount}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    Premium
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-xl font-bold text-primary">
                    {averageQuality}/10
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    Avg Quality
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-xl font-bold text-primary">
                    {completionPercentage}%
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    Complete
                  </div>
                </div>
              </div>
              
              {/* Description */}
              <p className="text-muted-foreground text-base sm:text-lg lg:text-xl leading-relaxed max-w-4xl mx-auto mb-6 sm:mb-8">
                {description}
              </p>
              
              {/* Enhanced Brand Message */}
              <div className="relative">
                <p className="text-primary font-elegant font-semibold text-lg sm:text-xl italic mb-2">
                  "{brandMessage}"
                </p>
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-32 h-0.5 bg-gradient-to-r from-primary via-primary to-primary/50 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Gallery Grid */}
          <div ref={galleryRef} className={useAnimationClass(galleryVariant, galleryVisible)}>
            <MasonryGalleryGrid
              images={images}
              onImageClick={onImageClick}
              sectionId={id}
              alternateLayout={alternateLayout}
            />
          </div>

          {/* Enhanced Section Footer */}
          <div className="text-center mt-8 sm:mt-12">
            <div className="inline-flex items-center gap-3 text-sm text-muted-foreground bg-muted/30 px-6 py-3 rounded-full border border-border/20">
              <span>Displaying {Math.min(12, images.length)} of {images.length} total images</span>
              <span className="text-primary">•</span>
              <span className="text-primary font-medium">Click any image to explore the full collection</span>
            </div>
          </div>
        </div>
      </SectionContentCard>
    </div>
  );
};
