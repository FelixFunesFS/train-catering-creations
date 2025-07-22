
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface MenuSection {
  id: string;
  title: string;
  shortTitle: string;
}

const menuSections: MenuSection[] = [
  { id: "appetizers", title: "Hors d'Oeuvres & Small Bites", shortTitle: "Appetizers" },
  { id: "entrees", title: "Signature Entrées", shortTitle: "Entrées" },
  { id: "sides", title: "Artful Accompaniments", shortTitle: "Sides" }
];

export const MobileMenuNavigation = () => {
  const [activeSection, setActiveSection] = useState<string>("appetizers");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 400;
      setIsVisible(scrolled);
      
      // Update active section based on scroll position
      for (const section of menuSections) {
        const element = document.getElementById(section.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section.id);
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  return (
    <nav 
      className={cn(
        "fixed top-20 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-b transition-all duration-300 lg:hidden",
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      )}
    >
      <div className="flex justify-center">
        <div className="flex space-x-1 p-2 bg-muted/50 rounded-full m-2">
          {menuSections.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={cn(
                "px-3 py-2 text-sm font-medium rounded-full transition-all duration-200 touch-target-comfortable",
                activeSection === section.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              )}
            >
              {section.shortTitle}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};
