import { useState, useEffect, useRef } from "react";
import { 
  ChefHat, 
  Calendar, 
  Heart, 
  Building2, 
  Users, 
  Sparkles,
  ArrowRight,
  Star,
  MapPin,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NeumorphicCard } from "@/components/ui/neumorphic-card";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useStaggeredAnimation } from "@/hooks/useStaggeredAnimation";
import { useIsMobile } from "@/hooks/use-mobile";

interface DiscoveryPod {
  id: string;
  icon: typeof ChefHat;
  title: string;
  description: string;
  features: string[];
  image: string;
  color: string;
  bgGradient: string;
  connections: string[]; // IDs of connected pods
  stats: {
    rating: number;
    events: number;
    availability: string;
  };
  cta: {
    text: string;
    href: string;
  };
}

const discoveryPods: DiscoveryPod[] = [
  {
    id: "weddings",
    icon: Heart,
    title: "Wedding Excellence",
    description: "Transform your special day into an unforgettable culinary journey",
    features: ["Custom Menu Design", "Tasting Sessions", "Full Service Staff", "Venue Coordination"],
    image: "/lovable-uploads/f569af07-9bdd-4e2f-8fa0-50f4f58284fc.png",
    color: "text-pink-500",
    bgGradient: "from-pink-500/10 to-rose-500/10",
    connections: ["corporate", "private"],
    stats: { rating: 4.9, events: 200, availability: "Available" },
    cta: { text: "Plan Wedding", href: "/wedding-quote" }
  },
  {
    id: "corporate",
    icon: Building2,
    title: "Corporate Catering",
    description: "Professional dining solutions for your business events",
    features: ["Executive Meetings", "Company Parties", "Product Launches", "Team Building"],
    image: "/lovable-uploads/31195e1f-92d1-4d88-9466-00bb2d439661.png",
    color: "text-blue-500",
    bgGradient: "from-blue-500/10 to-cyan-500/10",
    connections: ["weddings", "private"],
    stats: { rating: 4.8, events: 350, availability: "Available" },
    cta: { text: "Corporate Quote", href: "/quote" }
  },
  {
    id: "private",
    icon: Users,
    title: "Private Events",
    description: "Intimate gatherings crafted with personal attention to detail",
    features: ["Birthday Celebrations", "Anniversary Dinners", "Holiday Parties", "Family Reunions"],
    image: "/lovable-uploads/ba9526e9-a12e-4ea8-8e2a-450595002e23.png",
    color: "text-purple-500",
    bgGradient: "from-purple-500/10 to-indigo-500/10",
    connections: ["weddings", "corporate"],
    stats: { rating: 4.9, events: 180, availability: "Limited" },
    cta: { text: "Plan Event", href: "/quote" }
  },
  {
    id: "signature",
    icon: ChefHat,
    title: "Signature Experiences",
    description: "Exclusive culinary adventures designed by our master chefs",
    features: ["Tasting Menus", "Wine Pairings", "Chef's Table", "Cooking Classes"],
    image: "/lovable-uploads/40cb2280-5e07-4433-a4cd-dd8df5c5e472.png",
    color: "text-amber-500",
    bgGradient: "from-amber-500/10 to-orange-500/10",
    connections: ["specialty", "seasonal"],
    stats: { rating: 5.0, events: 95, availability: "Exclusive" },
    cta: { text: "Book Experience", href: "/quote" }
  },
  {
    id: "specialty",
    icon: Sparkles,
    title: "Specialty Services",
    description: "Unique offerings that make your event truly extraordinary",
    features: ["Grazing Tables", "Interactive Stations", "Themed Catering", "Dietary Accommodations"],
    image: "/lovable-uploads/2bb3a6cf-e13c-4405-9b69-2cf610ae8411.png",
    color: "text-emerald-500",
    bgGradient: "from-emerald-500/10 to-green-500/10",
    connections: ["signature", "seasonal"],
    stats: { rating: 4.8, events: 120, availability: "Available" },
    cta: { text: "Explore Options", href: "/menu" }
  },
  {
    id: "seasonal",
    icon: Calendar,
    title: "Seasonal Menus",
    description: "Fresh, local ingredients celebrating Charleston's seasonal bounty",
    features: ["Spring Refresh", "Summer Harvest", "Fall Comfort", "Winter Warmth"],
    image: "/lovable-uploads/3c354402-a75f-4382-a187-10cb1a68d044.png",
    color: "text-teal-500",
    bgGradient: "from-teal-500/10 to-cyan-500/10",
    connections: ["signature", "specialty"],
    stats: { rating: 4.9, events: 160, availability: "Seasonal" },
    cta: { text: "View Seasonal Menu", href: "/menu" }
  }
];

export const FloatingDiscoveryPods = () => {
  const [activePod, setActivePod] = useState<string | null>(null);
  const [hoveredPod, setHoveredPod] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [connectionLines, setConnectionLines] = useState<Array<{from: string, to: string, opacity: number}>>([]);
  
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { ref, isVisible } = useScrollAnimation({ 
    variant: 'fade-up',
    threshold: 0.2
  });
  
  const { 
    visibleItems, 
    getItemClassName, 
    getItemStyle 
  } = useStaggeredAnimation({
    itemCount: discoveryPods.length,
    staggerDelay: 150,
    variant: 'scale-fade'
  });

  // Mouse movement for parallax effect
  useEffect(() => {
    if (isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      
      setMousePosition({ x, y });
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      return () => container.removeEventListener('mousemove', handleMouseMove);
    }
  }, [isMobile]);

  // Connection line animations
  useEffect(() => {
    if (!hoveredPod) {
      setConnectionLines([]);
      return;
    }

    const pod = discoveryPods.find(p => p.id === hoveredPod);
    if (!pod) return;

    const lines = pod.connections.map(connectionId => ({
      from: hoveredPod,
      to: connectionId,
      opacity: 0.6
    }));

    setConnectionLines(lines);
  }, [hoveredPod]);

  const handlePodInteraction = (podId: string, action: 'hover' | 'click' | 'leave') => {
    switch (action) {
      case 'hover':
        setHoveredPod(podId);
        break;
      case 'click':
        setActivePod(activePod === podId ? null : podId);
        break;
      case 'leave':
        if (!isMobile) {
          setHoveredPod(null);
        }
        break;
    }
  };

  const getParallaxTransform = (index: number) => {
    if (isMobile) return '';
    
    const offsetX = (mousePosition.x - 0.5) * 20 * (1 + index * 0.1);
    const offsetY = (mousePosition.y - 0.5) * 20 * (1 + index * 0.1);
    
    return `translate(${offsetX}px, ${offsetY}px)`;
  };

  return (
    <section 
      ref={ref}
      className="py-20 px-4 relative overflow-hidden bg-gradient-to-br from-background via-muted/5 to-background"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            Discover Our Services
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our interconnected world of culinary excellence through interactive discovery pods
          </p>
        </div>

        {/* Discovery Pods Grid */}
        <div 
          ref={containerRef}
          className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {/* Connection Lines (Desktop Only) */}
          {!isMobile && connectionLines.map((line, index) => (
            <svg
              key={`${line.from}-${line.to}-${index}`}
              className="absolute inset-0 pointer-events-none z-10"
              style={{ opacity: line.opacity }}
            >
              <line
                x1="33%"
                y1="33%"
                x2="66%"
                y2="66%"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                strokeDasharray="5,5"
                className="animate-pulse"
              />
            </svg>
          ))}

          {/* Pods */}
          {discoveryPods.map((pod, index) => {
            const IconComponent = pod.icon;
            const isActive = activePod === pod.id;
            const isHovered = hoveredPod === pod.id;
            const isConnected = connectionLines.some(line => line.to === pod.id);

            return (
              <div
                key={pod.id}
                className={`relative ${getItemClassName(index)}`}
                style={{
                  ...getItemStyle(index),
                  transform: `${getParallaxTransform(index)}`
                }}
              >
                <NeumorphicCard
                  level={isActive ? 4 : isHovered ? 3 : 2}
                  interactive
                  className={`
                    h-full transition-all duration-500 cursor-pointer overflow-hidden
                    ${isActive ? 'ring-2 ring-primary' : ''}
                    ${isConnected ? 'ring-1 ring-primary/50' : ''}
                    bg-gradient-to-br ${pod.bgGradient}
                  `}
                  onMouseEnter={() => handlePodInteraction(pod.id, 'hover')}
                  onMouseLeave={() => handlePodInteraction(pod.id, 'leave')}
                  onClick={() => handlePodInteraction(pod.id, 'click')}
                  style={{
                    transform: `scale(${isActive ? 1.05 : isHovered ? 1.02 : 1}) rotate(${isHovered ? '1deg' : '0deg'})`
                  }}
                >
                  {/* Pod Header */}
                  <div className="relative z-20 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-full bg-background/80 backdrop-blur-sm ${pod.color}`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      
                      <div className="text-right text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{pod.stats.rating}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3" />
                          <span>{pod.stats.events}+ events</span>
                        </div>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-foreground mb-2">
                      {pod.title}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {pod.description}
                    </p>

                    {/* Availability Badge */}
                    <div className="mt-4">
                      <span className={`
                        inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium
                        ${pod.stats.availability === 'Available' ? 'bg-green-500/20 text-green-600' :
                          pod.stats.availability === 'Limited' ? 'bg-yellow-500/20 text-yellow-600' :
                          'bg-purple-500/20 text-purple-600'}
                      `}>
                        <Clock className="h-3 w-3" />
                        {pod.stats.availability}
                      </span>
                    </div>
                  </div>

                  {/* Expandable Content */}
                  <div className={`
                    relative z-20 px-6 transition-all duration-500 overflow-hidden
                    ${isActive ? 'max-h-96 pb-6' : 'max-h-0 pb-0'}
                  `}>
                    {/* Features */}
                    <div className="space-y-3 mb-6">
                      {pod.features.map((feature, featureIndex) => (
                        <div 
                          key={feature}
                          className="flex items-center gap-2 text-sm text-muted-foreground"
                          style={{
                            opacity: isActive ? 1 : 0,
                            transform: isActive ? 'translateX(0)' : 'translateX(-20px)',
                            transitionDelay: `${featureIndex * 100}ms`
                          }}
                        >
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                          {feature}
                        </div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <Button 
                      variant="cta"
                      size="sm"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = pod.cta.href;
                      }}
                    >
                      {pod.cta.text}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>

                  {/* Background Image */}
                  <div className="absolute inset-0 z-10 opacity-10">
                    <OptimizedImage
                      src={pod.image}
                      alt={pod.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Hover Effect Overlay */}
                  <div className={`
                    absolute inset-0 z-15 bg-gradient-to-t from-primary/20 via-transparent to-transparent
                    transition-opacity duration-300
                    ${isHovered ? 'opacity-100' : 'opacity-0'}
                  `} />
                </NeumorphicCard>
              </div>
            );
          })}
        </div>

        {/* Mobile Instructions */}
        {isMobile && (
          <div className="text-center mt-12">
            <p className="text-sm text-muted-foreground">
              Tap any pod to explore its services and features
            </p>
          </div>
        )}
      </div>
    </section>
  );
};