import { Camera, Sparkles, Heart } from "lucide-react";

export const GalleryHeader = () => {
  return (
    <div className="text-center py-12 sm:py-16 lg:py-20 relative">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/10 to-transparent pointer-events-none" />
      
      {/* Animated icons */}
      <div className="flex justify-center gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <Camera className="h-8 w-8 sm:h-10 sm:w-10 text-primary/70" />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 text-accent/70" />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <Heart className="h-8 w-8 sm:h-10 sm:w-10 text-secondary/70" />
        </div>
      </div>

      {/* Main title with enhanced typography */}
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4 sm:mb-6 animate-fade-in leading-tight">
        Our Events in Flavor & Color
      </h1>
      
      {/* Subtitle with storytelling */}
      <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto px-4 mb-6 sm:mb-8 animate-fade-in leading-relaxed" style={{ animationDelay: '0.4s' }}>
        Where culinary artistry meets visual poetry. Every dish tells a story, every event becomes a cherished memory.
      </p>

      {/* Additional descriptive text */}
      <p className="text-base sm:text-lg text-muted-foreground/80 max-w-2xl mx-auto px-4 mb-8 sm:mb-10 animate-fade-in" style={{ animationDelay: '0.5s' }}>
        From intimate family gatherings to grand celebrations, witness how we transform moments into masterpieces of taste and elegance.
      </p>

      {/* CTA Button */}
      <div className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
        <a 
          href="/request-quote" 
          className="inline-flex items-center gap-2 bg-gradient-primary text-primary-foreground px-8 py-4 rounded-full font-semibold text-lg hover:shadow-glow transition-all duration-300 hover:scale-105"
        >
          Start Your Story
          <Heart className="h-5 w-5" />
        </a>
      </div>
    </div>
  );
};