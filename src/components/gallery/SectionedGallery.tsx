
import { useState } from "react";
import { GalleryImage } from "@/data/gallery/types";
import { ThemeSection } from "./ThemeSection";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";

interface SectionedGalleryProps {
  images: GalleryImage[];
  onImageClick: (imageSrc: string) => void;
}

export const SectionedGallery = ({ images, onImageClick }: SectionedGalleryProps) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const { ref: sectionsRef, isVisible: sectionsVisible, variant: sectionsVariant } = useScrollAnimation({ 
    delay: 200, 
    variant: 'ios-spring',
    mobile: { variant: 'medium', delay: 100 },
    desktop: { variant: 'ios-spring', delay: 200 }
  });

  // Organize images by theme
  const eventCelebrations = images.filter(img => 
    img.category === 'wedding' || img.category === 'formal'
  );
  
  const militaryCorporate = images.filter(img => 
    img.category === 'corporate' || img.category === 'military'
  );
  
  const privateEvents = images.filter(img => 
    img.category === 'family' || img.category === 'private'
  );
  
  const culinaryShowcases = images.filter(img => 
    img.category === 'desserts' || img.category === 'grazing' || 
    img.category === 'team' || img.category === 'buffet' || 
    img.category === 'bbq' || img.category === 'signatureDishes'
  );

  const sections = [
    {
      id: 'celebrations',
      title: 'Event Celebrations',
      subtitle: 'Weddings & Black Tie Events',
      description: 'Elegant celebrations where every detail reflects the sophistication and joy of your special moments. From intimate wedding receptions to grand black-tie galas, we craft experiences that honor tradition while embracing your unique vision.',
      brandMessage: 'Creating unforgettable memories, one celebration at a time',
      images: eventCelebrations,
      accentColor: 'from-pink-500/20 to-purple-500/20'
    },
    {
      id: 'military',
      title: 'Military & Corporate Functions',
      subtitle: 'Professional Excellence',
      description: 'Honoring service and celebrating corporate achievements with precision and respect. Our military and corporate catering reflects the dignity and professionalism these occasions deserve.',
      brandMessage: 'Serving those who serve with honor and distinction',
      images: militaryCorporate,
      accentColor: 'from-blue-500/20 to-indigo-500/20'
    },
    {
      id: 'private',
      title: 'Private Events & Gatherings',
      subtitle: 'Intimate Celebrations',
      description: 'Personal milestones and family gatherings deserve the same attention to detail as our grandest events. We bring warmth and flavor to your most treasured moments.',
      brandMessage: 'Making every gathering feel like family',
      images: privateEvents,
      accentColor: 'from-green-500/20 to-teal-500/20'
    },
    {
      id: 'culinary',
      title: 'Culinary Showcases',
      subtitle: 'Desserts, Appetizers & Our Team',
      description: 'Behind every exceptional event is exceptional cuisine. Meet our passionate team and explore the artistry that goes into every dish, from delicate appetizers to show-stopping desserts.',
      brandMessage: 'Crafting culinary excellence with passion and pride',
      images: culinaryShowcases,
      accentColor: 'from-orange-500/20 to-red-500/20'
    }
  ];

  return (
    <div ref={sectionsRef} className={useAnimationClass(sectionsVariant, sectionsVisible)}>
      <div className="space-y-16 lg:space-y-20">
        {sections.map((section, index) => (
          <ThemeSection
            key={section.id}
            {...section}
            onImageClick={onImageClick}
            isActive={activeSection === section.id}
            onSectionFocus={() => setActiveSection(section.id)}
            alternateLayout={index % 2 === 1}
          />
        ))}
      </div>
    </div>
  );
};
