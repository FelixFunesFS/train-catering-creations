import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NeumorphicCard } from "@/components/ui/neumorphic-card";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useIsMobile } from "@/hooks/use-mobile";
import { Calendar, Users, DollarSign, Send, ArrowRight, Heart, Building2, PartyPopper } from "lucide-react";

export const SimplifiedQuoteFlow = () => {
  const isMobile = useIsMobile();
  const { ref, isVisible } = useScrollAnimation({ 
    variant: 'fade-up',
    threshold: 0.1,
    triggerOnce: true
  });

  const [selectedEventType, setSelectedEventType] = useState("");
  const [guestCount, setGuestCount] = useState(50);
  const [selectedDate, setSelectedDate] = useState("");
  const [estimatedCost, setEstimatedCost] = useState(0);

  const eventTypes = [
    {
      id: "wedding",
      name: "Wedding",
      icon: Heart,
      basePrice: 85,
      description: "Romantic celebrations",
      features: ["Custom menus", "Full service", "Elegant setup"]
    },
    {
      id: "corporate",
      name: "Corporate",
      icon: Building2,
      basePrice: 45,
      description: "Professional events",
      features: ["Business catering", "Meeting setup", "Professional service"]
    },
    {
      id: "private",
      name: "Private Party",
      icon: PartyPopper,
      basePrice: 65,
      description: "Personal celebrations",
      features: ["Family style", "Custom service", "Personal touch"]
    }
  ];

  const guestRanges = [
    { label: "10-25", value: 20 },
    { label: "25-50", value: 35 },
    { label: "50-100", value: 75 },
    { label: "100-200", value: 150 },
    { label: "200+", value: 250 }
  ];

  // Calculate estimated cost
  const calculateEstimate = () => {
    if (!selectedEventType) return 0;
    
    const eventType = eventTypes.find(e => e.id === selectedEventType);
    if (!eventType) return 0;
    
    const baseTotal = eventType.basePrice * guestCount;
    const serviceFee = baseTotal * 0.15; // 15% service fee
    const total = baseTotal + serviceFee;
    
    return Math.round(total);
  };

  const handleEventTypeSelect = (eventId: string) => {
    setSelectedEventType(eventId);
    setEstimatedCost(calculateEstimate());
  };

  const handleGuestCountChange = (count: number) => {
    setGuestCount(count);
    if (selectedEventType) {
      setEstimatedCost(calculateEstimate());
    }
  };

  return (
    <section 
      ref={ref}
      className="py-16 lg:py-24 bg-gradient-pattern-b"
      aria-label="Get instant quote"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-elegant font-bold text-foreground mb-4">
            Get Your Instant Quote
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary via-primary-light to-primary mx-auto mb-6 rounded-full" />
          <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Start planning your perfect event with our quick quote tool. 
            Get an instant estimate and begin your catering journey today.
          </p>
        </div>

        {/* Quote Flow */}
        <div className="max-w-4xl mx-auto">
          
          {/* Step 1: Event Type Selection */}
          <NeumorphicCard level={2} className="p-6 lg:p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <h3 className="text-xl lg:text-2xl font-semibold text-foreground">
                Choose Your Event Type
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {eventTypes.map((eventType) => (
                <button
                  key={eventType.id}
                  onClick={() => handleEventTypeSelect(eventType.id)}
                  className={`p-4 lg:p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                    selectedEventType === eventType.id
                      ? 'border-primary bg-primary/5 neumorphic-card-1'
                      : 'border-border bg-card hover:border-primary/50 hover:bg-primary/2'
                  }`}
                >
                  <eventType.icon className={`h-6 w-6 lg:h-8 lg:w-8 mb-3 ${
                    selectedEventType === eventType.id ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                  
                  <h4 className="font-semibold text-foreground mb-1">
                    {eventType.name}
                  </h4>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    {eventType.description}
                  </p>
                  
                  <div className="text-sm font-semibold text-primary">
                    From ${eventType.basePrice}/person
                  </div>
                </button>
              ))}
            </div>
          </NeumorphicCard>

          {/* Step 2: Guest Count (only show if event type selected) */}
          {selectedEventType && (
            <NeumorphicCard level={2} className="p-6 lg:p-8 mb-8 animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <h3 className="text-xl lg:text-2xl font-semibold text-foreground">
                  How Many Guests?
                </h3>
              </div>

              {isMobile ? (
                // Mobile: Range selector
                <div className="grid grid-cols-2 gap-3">
                  {guestRanges.map((range) => (
                    <button
                      key={range.label}
                      onClick={() => handleGuestCountChange(range.value)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                        guestCount === range.value
                          ? 'border-primary bg-primary/5 neumorphic-card-1'
                          : 'border-border bg-card hover:border-primary/50'
                      }`}
                    >
                      <Users className="h-5 w-5 text-primary mx-auto mb-2" />
                      <div className="text-sm font-semibold text-foreground">
                        {range.label} guests
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                // Desktop: Slider
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {guestCount} guests
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="500"
                      value={guestCount}
                      onChange={(e) => handleGuestCountChange(parseInt(e.target.value))}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-2">
                      <span>10</span>
                      <span>500+</span>
                    </div>
                  </div>
                </div>
              )}
            </NeumorphicCard>
          )}

          {/* Step 3: Estimated Cost & CTA */}
          {selectedEventType && guestCount > 0 && (
            <NeumorphicCard level={2} className="p-6 lg:p-8 animate-fade-in">
              <div className="text-center">
                <DollarSign className="h-12 w-12 text-primary mx-auto mb-4" />
                
                <h3 className="text-2xl lg:text-3xl font-semibold text-foreground mb-2">
                  Estimated Total
                </h3>
                
                <div className="text-4xl lg:text-5xl font-bold text-primary mb-2">
                  ${calculateEstimate().toLocaleString()}
                </div>
                
                <p className="text-sm text-muted-foreground mb-8">
                  Includes service fee and basic setup. Final pricing may vary based on menu selection and additional services.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
                  <Button asChild size="lg" className="w-full">
                    <Link 
                      to={`/request-quote?type=${selectedEventType}&guests=${guestCount}`}
                      className="flex items-center justify-center gap-2"
                    >
                      Get Full Quote
                      <Send className="h-4 w-4" />
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" size="lg" className="w-full">
                    <Link to="/menu" className="flex items-center justify-center gap-2">
                      View Menus
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>

                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-xs text-muted-foreground text-center">
                    Want to speak with our team? Call us at{" "}
                    <a href="tel:+18433224567" className="text-primary hover:underline">
                      (843) 322-4567
                    </a>
                    {" "}or email{" "}
                    <a href="mailto:info@soultrainseatery.com" className="text-primary hover:underline">
                      info@soultrainseatery.com
                    </a>
                  </p>
                </div>
              </div>
            </NeumorphicCard>
          )}
        </div>
      </div>

    </section>
  );
};