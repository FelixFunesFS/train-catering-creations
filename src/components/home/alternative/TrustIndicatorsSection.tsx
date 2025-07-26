import { useState, useEffect } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { useIsMobile } from "@/hooks/use-mobile";
import { NeumorphicCard } from "@/components/ui/neumorphic-card";
import { Quote, Star, Users, Calendar, Award } from "lucide-react";
export const TrustIndicatorsSection = () => {
  const isMobile = useIsMobile();
  const {
    ref,
    isVisible
  } = useScrollAnimation({
    variant: 'slide-up',
    threshold: 0.2,
    triggerOnce: true
  });
  const animationClass = useAnimationClass('slide-up', isVisible);

  // Animated counters
  const [animatedStats, setAnimatedStats] = useState({
    years: 0,
    events: 0,
    clients: 0
  });
  const finalStats = {
    years: 15,
    events: 2500,
    clients: 850
  };
  useEffect(() => {
    if (isVisible) {
      const duration = 2000; // 2 seconds
      const interval = 50; // Update every 50ms
      const steps = duration / interval;
      let step = 0;
      const timer = setInterval(() => {
        step++;
        const progress = step / steps;
        const easeOut = 1 - Math.pow(1 - progress, 3); // Cubic ease-out

        setAnimatedStats({
          years: Math.floor(finalStats.years * easeOut),
          events: Math.floor(finalStats.events * easeOut),
          clients: Math.floor(finalStats.clients * easeOut)
        });
        if (step >= steps) {
          setAnimatedStats(finalStats);
          clearInterval(timer);
        }
      }, interval);
      return () => clearInterval(timer);
    }
  }, [isVisible]);
  const testimonials = [{
    text: "Soul Train's catering made our wedding absolutely perfect. The food was incredible and the service was flawless.",
    author: "Sarah & Michael",
    event: "Wedding Reception",
    rating: 5
  }, {
    text: "Professional, reliable, and the food always exceeds expectations. They've catered multiple corporate events for us.",
    author: "Charleston Chamber of Commerce",
    event: "Corporate Events",
    rating: 5
  }, {
    text: "The attention to detail and Southern hospitality really sets them apart. Our guests are still talking about the food!",
    author: "Jennifer L.",
    event: "Private Party",
    rating: 5
  }];
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);
  const stats = [{
    icon: Calendar,
    value: animatedStats.years,
    suffix: "+",
    label: "Years in Business",
    description: "Serving Charleston"
  }, {
    icon: Users,
    value: animatedStats.events,
    suffix: "+",
    label: "Events Catered",
    description: "Memorable occasions"
  }, {
    icon: Award,
    value: animatedStats.clients,
    suffix: "+",
    label: "Happy Clients",
    description: "Five-star reviews"
  }];
  return;
};