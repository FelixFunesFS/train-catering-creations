import { useState, useEffect } from "react";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Instagram, 
  Facebook, 
  MessageCircle,
  Star,
  ChefHat,
  Calendar,
  Award,
  Users,
  ArrowUp,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NeumorphicCard } from "@/components/ui/neumorphic-card";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { useIsMobile } from "@/hooks/use-mobile";

interface FooterContext {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  userEngagement: 'low' | 'medium' | 'high';
  deviceType: 'mobile' | 'tablet' | 'desktop';
  scrollDepth: number;
}

export const AdaptiveFooterExperience = () => {
  const [footerContext, setFooterContext] = useState<FooterContext>({
    timeOfDay: 'afternoon',
    userEngagement: 'medium',
    deviceType: 'desktop',
    scrollDepth: 0
  });
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [interactionCount, setInteractionCount] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);

  const isMobile = useIsMobile();
  const { ref, isVisible } = useScrollAnimation({ 
    variant: 'fade-up',
    threshold: 0.3
  });
  const animationClass = useAnimationClass('fade-up', isVisible);

  // Context detection
  useEffect(() => {
    const updateContext = () => {
      const hour = new Date().getHours();
      let timeOfDay: FooterContext['timeOfDay'] = 'afternoon';
      
      if (hour < 12) timeOfDay = 'morning';
      else if (hour < 18) timeOfDay = 'afternoon';
      else if (hour < 22) timeOfDay = 'evening';
      else timeOfDay = 'night';

      const scrollDepth = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      
      setFooterContext(prev => ({
        ...prev,
        timeOfDay,
        deviceType: isMobile ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop',
        scrollDepth
      }));

      setShowBackToTop(scrollDepth > 50);
    };

    updateContext();
    window.addEventListener('scroll', updateContext);
    window.addEventListener('resize', updateContext);

    return () => {
      window.removeEventListener('scroll', updateContext);
      window.removeEventListener('resize', updateContext);
    };
  }, [isMobile]);

  // User engagement tracking
  useEffect(() => {
    const trackInteraction = () => setInteractionCount(prev => prev + 1);
    
    document.addEventListener('click', trackInteraction);
    document.addEventListener('scroll', trackInteraction);
    
    const sessionTimer = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);

    return () => {
      document.removeEventListener('click', trackInteraction);
      document.removeEventListener('scroll', trackInteraction);
      clearInterval(sessionTimer);
    };
  }, []);

  // Update engagement level
  useEffect(() => {
    let engagement: FooterContext['userEngagement'] = 'low';
    
    if (interactionCount > 20 || sessionTime > 120) engagement = 'high';
    else if (interactionCount > 10 || sessionTime > 60) engagement = 'medium';

    setFooterContext(prev => ({ ...prev, userEngagement: engagement }));
  }, [interactionCount, sessionTime]);

  // Context-aware content
  const getContextualCTA = () => {
    const { timeOfDay, userEngagement } = footerContext;
    
    if (userEngagement === 'high') {
      return {
        title: "Ready to Create Something Amazing?",
        description: "You've explored our services - let's bring your vision to life!",
        primaryAction: { text: "Start Planning", href: "/quote", urgent: true },
        secondaryAction: { text: "Call Now", href: "tel:+1234567890" }
      };
    }

    switch (timeOfDay) {
      case 'morning':
        return {
          title: "Start Your Day Right",
          description: "Planning a breakfast meeting or brunch event?",
          primaryAction: { text: "Plan Breakfast Event", href: "/quote" },
          secondaryAction: { text: "View Morning Menu", href: "/menu" }
        };
      case 'afternoon':
        return {
          title: "Perfect Timing for Lunch Planning",
          description: "Corporate lunch or afternoon gathering on your mind?",
          primaryAction: { text: "Book Corporate Catering", href: "/quote" },
          secondaryAction: { text: "Browse Services", href: "/about" }
        };
      case 'evening':
        return {
          title: "Evening Elegance Awaits",
          description: "Time to plan that special dinner or evening celebration",
          primaryAction: { text: "Plan Evening Event", href: "/wedding-quote" },
          secondaryAction: { text: "View Gallery", href: "/gallery" }
        };
      case 'night':
        return {
          title: "Dreaming of Your Perfect Event?",
          description: "Save your ideas and we'll help bring them to life tomorrow",
          primaryAction: { text: "Get Quote", href: "/quote" },
          secondaryAction: { text: "Save for Later", href: "#" }
        };
    }
  };

  const contextualContent = getContextualCTA();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const quickStats = [
    { icon: Star, value: "4.9", label: "Average Rating", suffix: "/5" },
    { icon: ChefHat, value: "500+", label: "Events Catered", suffix: "" },
    { icon: Users, value: "98%", label: "Client Satisfaction", suffix: "" },
    { icon: Award, value: "15+", label: "Years Experience", suffix: "" }
  ];

  const quickLinks = [
    { icon: Calendar, text: "Book Consultation", href: "/quote", priority: 'high' },
    { icon: Phone, text: "Call Now", href: "tel:+1234567890", priority: 'medium' },
    { icon: Mail, text: "Email Us", href: "mailto:info@example.com", priority: 'medium' },
    { icon: MessageCircle, text: "Live Chat", href: "#", priority: 'low' }
  ];

  return (
    <footer 
      ref={ref}
      className={`relative bg-gradient-to-br from-background via-muted/5 to-background border-t border-border/50 ${animationClass}`}
    >
      {/* Back to Top Button */}
      {showBackToTop && (
        <Button
          variant="secondary"
          size="lg"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 rounded-full w-12 h-12 p-0 shadow-lg bg-background/80 backdrop-blur-sm border border-border/50 hover:scale-110 transition-all duration-300"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}

      {/* Contextual CTA Section */}
      <div className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <NeumorphicCard 
            level={3}
            className={`
              p-8 md:p-12 text-center 
              ${contextualContent.primaryAction.urgent ? 'bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20' : ''}
            `}
          >
            <div className="max-w-3xl mx-auto space-y-6">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
                {contextualContent.title}
              </h2>
              
              <p className="text-lg text-muted-foreground">
                {contextualContent.description}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button 
                  variant={contextualContent.primaryAction.urgent ? "cta" : "default"}
                  size="lg"
                  className={`
                    min-w-[200px] 
                    ${contextualContent.primaryAction.urgent ? 'animate-pulse shadow-lg' : ''}
                  `}
                  onClick={() => window.location.href = contextualContent.primaryAction.href}
                >
                  {contextualContent.primaryAction.text}
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
                
                <Button 
                  variant="outline"
                  size="lg"
                  className="min-w-[200px]"
                  onClick={() => window.location.href = contextualContent.secondaryAction.href}
                >
                  {contextualContent.secondaryAction.text}
                </Button>
              </div>
            </div>
          </NeumorphicCard>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="py-12 px-4 border-t border-border/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {quickStats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <NeumorphicCard 
                  key={stat.label}
                  level={2}
                  className="p-6 text-center transition-all duration-300 hover:scale-105"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateY(0)' : 'translateY(20px)'
                  }}
                >
                  <IconComponent className="h-6 w-6 text-primary mx-auto mb-3" />
                  <div className="text-2xl font-bold text-foreground">
                    {stat.value}
                    <span className="text-sm text-muted-foreground">{stat.suffix}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {stat.label}
                  </div>
                </NeumorphicCard>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Content */}
      <div className="py-12 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground">Charleston Catering Co.</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Creating exceptional culinary experiences throughout Charleston with passion, 
              precision, and Southern hospitality.
            </p>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Charleston, SC</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Mon-Sun: 8AM-10PM</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3 pt-2">
              {[
                { icon: Instagram, href: "#", label: "Instagram" },
                { icon: Facebook, href: "#", label: "Facebook" }
              ].map(social => {
                const IconComponent = social.icon;
                return (
                  <Button
                    key={social.label}
                    variant="outline"
                    size="sm"
                    className="w-10 h-10 p-0 rounded-full"
                  >
                    <IconComponent className="h-4 w-4" />
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground">Quick Actions</h3>
            <div className="grid gap-2">
              {quickLinks
                .filter(link => 
                  footerContext.userEngagement === 'high' || 
                  link.priority !== 'low'
                )
                .map(link => {
                  const IconComponent = link.icon;
                  return (
                    <Button
                      key={link.text}
                      variant="ghost"
                      className="justify-start h-auto p-3 text-left"
                      onClick={() => window.location.href = link.href}
                    >
                      <IconComponent className="h-4 w-4 mr-3" />
                      {link.text}
                    </Button>
                  );
                })}
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground">Explore</h3>
            <div className="grid gap-2 text-sm">
              {[
                { text: "Our Services", href: "/about" },
                { text: "View Menu", href: "/menu" },
                { text: "Photo Gallery", href: "/gallery" },
                { text: "Customer Reviews", href: "/reviews" },
                { text: "Get Quote", href: "/quote" }
              ].map(link => (
                <a
                  key={link.text}
                  href={link.href}
                  className="text-muted-foreground hover:text-foreground transition-colors duration-200 block py-1"
                >
                  {link.text}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-border/50 py-6 px-4">
        <div className="max-w-7xl mx-auto text-center text-xs text-muted-foreground">
          <p>&copy; 2024 Charleston Catering Co. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-2">
            <a href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-foreground transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>

      {/* Context Debug Info (Development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-20 left-4 bg-background/90 backdrop-blur-sm border border-border rounded-lg p-2 text-xs max-w-xs">
          <div><strong>Context:</strong></div>
          <div>Time: {footerContext.timeOfDay}</div>
          <div>Engagement: {footerContext.userEngagement}</div>
          <div>Device: {footerContext.deviceType}</div>
          <div>Scroll: {Math.round(footerContext.scrollDepth)}%</div>
          <div>Interactions: {interactionCount}</div>
          <div>Session: {sessionTime}s</div>
        </div>
      )}
    </footer>
  );
};