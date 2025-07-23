
import { useState, useEffect, useRef } from "react";
import { GalleryImage } from "@/data/gallery/types";
import { ThemeSection } from "./ThemeSection";
import { SectionNavigation } from "./SectionNavigation";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";

interface SectionedGalleryProps {
  images: GalleryImage[];
  onImageClick: (imageSrc: string) => void;
}

export const SectionedGallery = ({ images, onImageClick }: SectionedGalleryProps) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const { ref: sectionsRef, isVisible: sectionsVisible, variant: sectionsVariant } = useScrollAnimation({ 
    delay: 200, 
    variant: 'ios-spring',
    mobile: { variant: 'medium', delay: 100 },
    desktop: { variant: 'ios-spring', delay: 200 }
  });

  // Enhanced image categorization with quality filtering and balanced distribution
  const filterHighQuality = (categoryImages: GalleryImage[], maxCount: number) => {
    return categoryImages
      .filter(img => img.quality >= 6) // Filter out low quality images
      .sort((a, b) => b.quality - a.quality) // Sort by quality descending
      .slice(0, maxCount); // Limit to target count
  };

  const eventCelebrations = filterHighQuality(
    images.filter(img => img.category === 'wedding' || img.category === 'formal'), 
    15
  );
  
  const militaryCorporate = filterHighQuality(
    images.filter(img => img.category === 'corporate' || img.category === 'military'), 
    12
  );
  
  const privateEvents = filterHighQuality(
    images.filter(img => img.category === 'family' || img.category === 'private'), 
    10
  );
  
  const culinaryShowcases = filterHighQuality(
    images.filter(img => 
      img.category === 'desserts' || img.category === 'grazing' || 
      img.category === 'team' || img.category === 'buffet' || 
      img.category === 'bbq' || img.category === 'signatureDishes'
    ), 
    12
  );

  const sections = [
    {
      id: 'celebrations',
      title: 'Event Celebrations',
      subtitle: 'Weddings & Black Tie Events',
      description: 'Elegant celebrations where every detail reflects the sophistication and joy of your special moments. From intimate wedding receptions to grand black-tie galas, we craft experiences that honor tradition while embracing your unique vision.',
      brandMessage: 'Creating unforgettable memories, one celebration at a time',
      images: eventCelebrations,
      accentColor: 'from-pink-500/20 to-purple-500/20',
      targetCount: 15
    },
    {
      id: 'military',
      title: 'Military & Corporate Functions',
      subtitle: 'Professional Excellence',
      description: 'Honoring service and celebrating corporate achievements with precision and respect. Our military and corporate catering reflects the dignity and professionalism these occasions deserve.',
      brandMessage: 'Serving those who serve with honor and distinction',
      images: militaryCorporate,
      accentColor: 'from-blue-500/20 to-indigo-500/20',
      targetCount: 12
    },
    {
      id: 'private',
      title: 'Private Events & Gatherings',
      subtitle: 'Intimate Celebrations',
      description: 'Personal milestones and family gatherings deserve the same attention to detail as our grandest events. We bring warmth and flavor to your most treasured moments.',
      brandMessage: 'Making every gathering feel like family',
      images: privateEvents,
      accentColor: 'from-green-500/20 to-teal-500/20',
      targetCount: 10
    },
    {
      id: 'culinary',
      title: 'Culinary Showcases',
      subtitle: 'Desserts, Appetizers & Our Team',
      description: 'Behind every exceptional event is exceptional cuisine. Meet our passionate team and explore the artistry that goes into every dish, from delicate appetizers to show-stopping desserts.',
      brandMessage: 'Crafting culinary excellence with passion and pride',
      images: culinaryShowcases,
      accentColor: 'from-orange-500/20 to-red-500/20',
      targetCount: 12
    }
  ];

  // Filter out empty sections and add completion indicators
  const nonEmptySections = sections.filter(section => section.images.length > 0).map(section => ({
    ...section,
    completionPercentage: Math.round((section.images.length / section.targetCount) * 100)
  }));

  // Section intersection observer
  useEffect(() => {
    const observers = nonEmptySections.map(section => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(section.id);
          }
        },
        { threshold: 0.3, rootMargin: '-100px 0px -100px 0px' }
      );

      const element = sectionRefs.current[section.id];
      if (element) {
        observer.observe(element);
      }

      return observer;
    });

    return () => {
      observers.forEach(observer => observer.disconnect());
    };
  }, [nonEmptySections]);

  return (
    <div className="space-y-8 sm:space-y-12">
      <SectionNavigation 
        sections={nonEmptySections.map(s => ({ 
          id: s.id, 
          title: s.title, 
          count: s.images.length,
          completion: s.completionPercentage 
        }))}
        activeSection={activeSection}
        onSectionClick={setActiveSection}
      />
      
      <div ref={sectionsRef} className={useAnimationClass(sectionsVariant, sectionsVisible)}>
        {/* Gallery Stats Overview */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            {nonEmptySections.map((section, index) => (
              <div key={section.id} className="text-center">
                <div className="text-xl sm:text-2xl font-elegant font-bold text-primary mb-1">
                  {section.images.length}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  {section.title.split(' & ')[0]}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-16 lg:space-y-20">
          {nonEmptySections.map((section, index) => (
            <div
              key={section.id}
              id={section.id}
              ref={el => sectionRefs.current[section.id] = el}
            >
              <ThemeSection
                {...section}
                onImageClick={onImageClick}
                isActive={activeSection === section.id}
                onSectionFocus={() => setActiveSection(section.id)}
                alternateLayout={index % 2 === 1}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
