import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NeumorphicCard } from "@/components/ui/neumorphic-card";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { useIsMobile } from "@/hooks/use-mobile";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";

interface StorySegment {
  image: string;
  title: string;
  description: string;
  duration: number;
  category: string;
  action?: {
    text: string;
    href: string;
  };
}

const storySegments: StorySegment[] = [
  {
    image: "/lovable-uploads/3c354402-a75f-4382-a187-10cb1a68d044.png",
    title: "Farm to Table Journey",
    description: "Fresh ingredients sourced directly from local Charleston farms",
    duration: 4000,
    category: "sourcing",
    action: { text: "View Our Sourcing", href: "/about" }
  },
  {
    image: "/lovable-uploads/56fe8fa6-d303-4982-b800-a4825d7bddd4.png",
    title: "Culinary Artistry",
    description: "Master chefs crafting each dish with precision and passion",
    duration: 4000,
    category: "preparation",
    action: { text: "Meet Our Chefs", href: "/about" }
  },
  {
    image: "/lovable-uploads/8186e520-1d63-4d6a-837b-2cf905ee002c.png",
    title: "Perfect Presentation",
    description: "Every event becomes an unforgettable culinary experience",
    duration: 4000,
    category: "service",
    action: { text: "Request Quote", href: "/quote" }
  },
  {
    image: "/lovable-uploads/995f0f1c-4128-48ca-a653-ac0ef9667f0c.png",
    title: "Celebration Moments",
    description: "Creating memories that last a lifetime through exceptional food",
    duration: 4000,
    category: "celebration",
    action: { text: "View Gallery", href: "/gallery" }
  }
];

export const ImmersiveStoryHero = () => {
  const [currentStory, setCurrentStory] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const isMobile = useIsMobile();
  const { ref, isVisible } = useScrollAnimation({ 
    variant: 'fade-up',
    threshold: 0.2
  });
  const animationClass = useAnimationClass('fade-up', isVisible);
  
  const progressInterval = useRef<NodeJS.Timeout>();
  const storyTimeout = useRef<NodeJS.Timeout>();

  // Auto-progress through stories
  useEffect(() => {
    if (!isPlaying) return;

    const currentSegment = storySegments[currentStory];
    const interval = 50; // Update every 50ms for smooth progress
    const increment = (interval / currentSegment.duration) * 100;

    progressInterval.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          // Move to next story
          setCurrentStory(current => (current + 1) % storySegments.length);
          return 0;
        }
        return prev + increment;
      });
    }, interval);

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [currentStory, isPlaying]);

  // Touch/swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
    setIsDragging(true);
    setIsPlaying(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart || !isDragging) return;
    
    const currentTouch = e.touches[0].clientX;
    const diff = touchStart - currentTouch;
    
    // Visual feedback during drag
    if (Math.abs(diff) > 20) {
      (e.currentTarget as HTMLElement).style.transform = `translateX(${-diff * 0.1}px)`;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart || !isDragging) return;
    
    const currentTouch = e.changedTouches[0].clientX;
    const diff = touchStart - currentTouch;
    
    (e.currentTarget as HTMLElement).style.transform = 'translateX(0)';
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swipe left - next story
        nextStory();
      } else {
        // Swipe right - previous story
        previousStory();
      }
    } else {
      // Tap - toggle play/pause
      setIsPlaying(!isPlaying);
    }
    
    setTouchStart(null);
    setIsDragging(false);
  };

  const nextStory = () => {
    setCurrentStory((prev) => (prev + 1) % storySegments.length);
    setProgress(0);
  };

  const previousStory = () => {
    setCurrentStory((prev) => (prev - 1 + storySegments.length) % storySegments.length);
    setProgress(0);
  };

  const currentSegment = storySegments[currentStory];

  return (
    <section 
      ref={ref}
      className={`relative h-screen w-full overflow-hidden ${animationClass}`}
    >
      {/* Background Image with Parallax Effect */}
      <div className="absolute inset-0 z-0">
        <OptimizedImage
          src={currentSegment.image}
          alt={currentSegment.title}
          className="h-full w-full object-cover transition-all duration-1000 ease-out"
          style={{
            transform: `scale(${isDragging ? 1.05 : 1.02})`,
            filter: `brightness(${isDragging ? 0.8 : 0.7}) blur(${isDragging ? 1 : 0}px)`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
      </div>

      {/* Story Progress Bars */}
      <div className="absolute top-4 left-4 right-4 z-20 flex gap-1">
        {storySegments.map((_, index) => (
          <div 
            key={index}
            className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden backdrop-blur-sm"
          >
            <div 
              className="h-full bg-primary transition-all duration-100 ease-out"
              style={{ 
                width: index === currentStory ? `${progress}%` : index < currentStory ? '100%' : '0%'
              }}
            />
          </div>
        ))}
      </div>

      {/* Story Controls */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsPlaying(!isPlaying)}
          className="bg-black/20 backdrop-blur-sm border-white/20 text-white hover:bg-black/30"
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsMuted(!isMuted)}
          className="bg-black/20 backdrop-blur-sm border-white/20 text-white hover:bg-black/30"
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
      </div>

      {/* Interactive Story Content */}
      <div 
        className="absolute inset-0 z-10 flex items-end justify-center p-6 cursor-pointer select-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => !isMobile && setIsPlaying(!isPlaying)}
      >
        <NeumorphicCard 
          level={2}
          className="w-full max-w-lg bg-background/80 backdrop-blur-md border-white/10 transform transition-all duration-300"
          style={{
            transform: `translateY(${isDragging ? '10px' : '0'}) scale(${isDragging ? 0.98 : 1})`
          }}
        >
          <div className="text-center space-y-4">
            <div className="inline-block px-3 py-1 bg-primary/20 text-primary text-sm font-medium rounded-full">
              {currentSegment.category.charAt(0).toUpperCase() + currentSegment.category.slice(1)}
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {currentSegment.title}
            </h1>
            
            <p className="text-muted-foreground leading-relaxed">
              {currentSegment.description}
            </p>

            {currentSegment.action && (
              <div className="pt-2">
                <Button 
                  variant="cta"
                  size="lg"
                  className="w-full sm:w-auto"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = currentSegment.action!.href;
                  }}
                >
                  {currentSegment.action.text}
                </Button>
              </div>
            )}
          </div>
        </NeumorphicCard>
      </div>

      {/* Desktop Navigation */}
      {!isMobile && (
        <>
          <Button
            variant="secondary"
            size="lg"
            onClick={previousStory}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-20 bg-black/20 backdrop-blur-sm border-white/20 text-white hover:bg-black/30"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          
          <Button
            variant="secondary"
            size="lg"
            onClick={nextStory}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-20 bg-black/20 backdrop-blur-sm border-white/20 text-white hover:bg-black/30"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {/* Mobile Tap Zones */}
      {isMobile && (
        <>
          <div 
            className="absolute left-0 top-0 w-1/3 h-full z-15"
            onTouchEnd={(e) => {
              e.stopPropagation();
              previousStory();
            }}
          />
          <div 
            className="absolute right-0 top-0 w-1/3 h-full z-15"
            onTouchEnd={(e) => {
              e.stopPropagation();
              nextStory();
            }}
          />
        </>
      )}
    </section>
  );
};