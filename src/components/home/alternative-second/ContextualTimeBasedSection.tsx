import { useState, useEffect } from "react";
import { Coffee, Sun, Moon, Calendar, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NeumorphicCard } from "@/components/ui/neumorphic-card";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { useIsMobile } from "@/hooks/use-mobile";

interface TimeBasedContent {
  timeRange: string;
  icon: typeof Coffee;
  title: string;
  description: string;
  services: string[];
  image: string;
  ctaText: string;
  ctaHref: string;
  gradient: string;
}

const timeBasedContent: TimeBasedContent[] = [
  {
    timeRange: "6AM - 11AM",
    icon: Coffee,
    title: "Morning Elegance",
    description: "Start your day with our exquisite breakfast and brunch catering",
    services: ["Continental Breakfast", "Brunch Buffets", "Coffee Service", "Pastry Platters"],
    image: "/lovable-uploads/40cb2280-5e07-4433-a4cd-dd8df5c5e472.png",
    ctaText: "Plan Breakfast Event",
    ctaHref: "/quote",
    gradient: "from-orange-400/20 to-yellow-400/20"
  },
  {
    timeRange: "11AM - 3PM",
    icon: Sun,
    title: "Midday Excellence",
    description: "Professional lunch solutions for corporate events and gatherings",
    services: ["Executive Lunches", "Box Lunches", "Corporate Catering", "Meeting Packages"],
    image: "/lovable-uploads/31195e1f-92d1-4d88-9466-00bb2d439661.png",
    ctaText: "Book Corporate Lunch",
    ctaHref: "/quote",
    gradient: "from-blue-400/20 to-green-400/20"
  },
  {
    timeRange: "3PM - 8PM",
    icon: Moon,
    title: "Evening Sophistication",
    description: "Elegant dinner service for weddings, galas, and special celebrations",
    services: ["Wedding Receptions", "Gala Dinners", "Cocktail Events", "Private Dinners"],
    image: "/lovable-uploads/f569af07-9bdd-4e2f-8fa0-50f4f58284fc.png",
    ctaText: "Plan Evening Event",
    ctaHref: "/wedding-quote",
    gradient: "from-purple-400/20 to-pink-400/20"
  },
  {
    timeRange: "Weekends",
    icon: Calendar,
    title: "Celebration Specialists",
    description: "Family gatherings, parties, and milestone celebrations made memorable",
    services: ["Birthday Parties", "Family Reunions", "Holiday Catering", "Celebration Buffets"],
    image: "/lovable-uploads/ba9526e9-a12e-4ea8-8e2a-450595002e23.png",
    ctaText: "Celebrate With Us",
    ctaHref: "/quote",
    gradient: "from-red-400/20 to-orange-400/20"
  }
];

export const ContextualTimeBasedSection = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeContent, setActiveContent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  
  const isMobile = useIsMobile();
  const { ref, isVisible } = useScrollAnimation({ 
    variant: 'slide-up',
    threshold: 0.3
  });
  const animationClass = useAnimationClass('slide-up', isVisible);

  // Update current time and determine active content
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now);
      
      const hour = now.getHours();
      const isWeekend = now.getDay() === 0 || now.getDay() === 6;
      
      if (isWeekend) {
        setActiveContent(3); // Weekend content
      } else if (hour >= 6 && hour < 11) {
        setActiveContent(0); // Morning
      } else if (hour >= 11 && hour < 15) {
        setActiveContent(1); // Midday
      } else {
        setActiveContent(2); // Evening
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const current = timeBasedContent[activeContent];
  const IconComponent = current.icon;

  return (
    <section 
      ref={ref}
      className={`py-20 px-4 relative overflow-hidden ${animationClass}`}
    >
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${current.gradient} transition-all duration-1000`} />
      
      <div className="max-w-7xl mx-auto">
        {/* Time Indicator */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-background/80 backdrop-blur-sm rounded-full border border-border/50">
            <Clock className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              Current Time in Charleston
            </span>
            <span className="text-lg font-bold text-foreground">
              {formatTime(currentTime)}
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content Side */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-full">
                  <IconComponent className="h-6 w-6 text-primary" />
                </div>
                <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                  {current.timeRange}
                </span>
              </div>
              
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
                {current.title}
              </h2>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                {current.description}
              </p>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-2 gap-4">
              {current.services.map((service, index) => (
                <NeumorphicCard 
                  key={service}
                  level={1}
                  className="p-4 text-center transition-all duration-300 hover:scale-105 cursor-pointer"
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                    transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                    opacity: isVisible ? 1 : 0
                  }}
                >
                  <p className="text-sm font-medium text-foreground">{service}</p>
                </NeumorphicCard>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                variant="cta" 
                size="lg"
                className="flex-1 sm:flex-none"
                onClick={() => window.location.href = current.ctaHref}
              >
                {current.ctaText}
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="flex-1 sm:flex-none"
                onClick={() => window.location.href = "/gallery"}
              >
                View Examples
              </Button>
            </div>

            {/* Location Context */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background/50 backdrop-blur-sm p-3 rounded-lg border border-border/50">
              <MapPin className="h-4 w-4" />
              <span>Serving Charleston and surrounding areas</span>
            </div>
          </div>

          {/* Image Side */}
          <div 
            className="relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <NeumorphicCard 
              level={3}
              className="overflow-hidden transition-all duration-500 transform"
              style={{
                transform: isHovered ? 'scale(1.02) rotate(1deg)' : 'scale(1) rotate(0deg)'
              }}
            >
              <OptimizedImage
                src={current.image}
                alt={current.title}
                className="w-full h-[400px] md:h-[500px] object-cover transition-all duration-700"
                style={{
                  transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                  filter: isHovered ? 'brightness(1.1) saturate(1.2)' : 'brightness(1) saturate(1)'
                }}
              />
              
              {/* Overlay Info */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
                <div 
                  className="text-white transform transition-all duration-300"
                  style={{
                    transform: isHovered ? 'translateY(0)' : 'translateY(10px)',
                    opacity: isHovered ? 1 : 0.8
                  }}
                >
                  <h3 className="text-xl font-bold mb-2">{current.title}</h3>
                  <p className="text-sm opacity-90">Perfect for {current.timeRange.toLowerCase()}</p>
                </div>
              </div>
            </NeumorphicCard>

            {/* Time-based indicator dots */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {timeBasedContent.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveContent(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === activeContent 
                      ? 'bg-primary scale-125' 
                      : 'bg-border hover:bg-primary/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};