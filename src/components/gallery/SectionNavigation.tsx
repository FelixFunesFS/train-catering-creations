
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";

interface SectionNavigationProps {
  sections: Array<{
    id: string;
    title: string;
    count: number;
    completion: number;
  }>;
  activeSection: string | null;
  onSectionClick: (sectionId: string) => void;
}

export const SectionNavigation = ({ 
  sections, 
  activeSection, 
  onSectionClick 
}: SectionNavigationProps) => {
  const [isSticky, setIsSticky] = useState(false);
  
  const { ref: navRef, isVisible: navVisible, variant: navVariant } = useScrollAnimation({ 
    delay: 0, 
    variant: 'fade-up',
    mobile: { variant: 'fade-up', delay: 0 },
    desktop: { variant: 'ios-spring', delay: 0 }
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest' 
      });
    }
    onSectionClick(sectionId);
  };

  return (
    <nav 
      ref={navRef}
      className={`
        ${useAnimationClass(navVariant, navVisible)}
        transition-all duration-300 z-40
        ${isSticky 
          ? 'fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-b border-border/20 shadow-lg' 
          : 'relative bg-transparent'
        }
      `}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        <div className="flex justify-center py-3 sm:py-4">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {sections.map((section) => (
              <Button
                key={section.id}
                variant={activeSection === section.id ? "default" : "outline"}
                size="sm"
                onClick={() => scrollToSection(section.id)}
                className={`
                  text-xs sm:text-sm font-medium transition-all duration-300 relative
                  ${activeSection === section.id 
                    ? 'bg-primary text-primary-foreground shadow-md scale-105' 
                    : 'hover:bg-primary/10 hover:border-primary/30 hover:scale-102'
                  }
                `}
              >
                <span className="mr-2">{section.title}</span>
                <Badge 
                  variant="secondary" 
                  className={`
                    text-xs px-1.5 py-0.5 
                    ${activeSection === section.id 
                      ? 'bg-primary-foreground/20 text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                    }
                  `}
                >
                  {section.count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};
