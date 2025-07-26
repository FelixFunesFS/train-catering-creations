import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NeumorphicCard } from "@/components/ui/neumorphic-card";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useIsMobile } from "@/hooks/use-mobile";
import { Calendar, Users, DollarSign, Send, ArrowRight, Heart, Building2, PartyPopper } from "lucide-react";
export const SimplifiedQuoteFlow = () => {
  const isMobile = useIsMobile();
  const {
    ref,
    isVisible
  } = useScrollAnimation({
    variant: 'fade-up',
    threshold: 0.1,
    triggerOnce: true
  });
  const [selectedEventType, setSelectedEventType] = useState("");
  const [guestCount, setGuestCount] = useState(50);
  const [selectedDate, setSelectedDate] = useState("");
  const [estimatedCost, setEstimatedCost] = useState(0);
  const eventTypes = [{
    id: "wedding",
    name: "Wedding",
    icon: Heart,
    basePrice: 85,
    description: "Romantic celebrations",
    features: ["Custom menus", "Full service", "Elegant setup"]
  }, {
    id: "corporate",
    name: "Corporate",
    icon: Building2,
    basePrice: 45,
    description: "Professional events",
    features: ["Business catering", "Meeting setup", "Professional service"]
  }, {
    id: "private",
    name: "Private Party",
    icon: PartyPopper,
    basePrice: 65,
    description: "Personal celebrations",
    features: ["Family style", "Custom service", "Personal touch"]
  }];
  const guestRanges = [{
    label: "10-25",
    value: 20
  }, {
    label: "25-50",
    value: 35
  }, {
    label: "50-100",
    value: 75
  }, {
    label: "100-200",
    value: 150
  }, {
    label: "200+",
    value: 250
  }];

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
      className={`py-12 sm:py-16 lg:py-20 bg-gradient-subtle ${isVisible ? 'animate-fade-in' : ''}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-elegant text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-ruby-primary bg-clip-text text-transparent mb-4">
            Get Your Quote in Minutes
          </h2>
          <p className="font-clean text-lg text-muted-foreground max-w-2xl mx-auto">
            Start planning your perfect event with our simplified quote process
          </p>
        </div>
        
        <NeumorphicCard level={2} className="max-w-4xl mx-auto p-6 sm:p-8">
          <div className="space-y-8">
            {/* Event Type Selection */}
            <div>
              <h3 className="font-elegant text-xl font-semibold mb-4">Select Event Type</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {eventTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => handleEventTypeSelect(type.id)}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                        selectedEventType === type.id
                          ? 'border-ruby-primary bg-ruby-primary/10'
                          : 'border-border hover:border-ruby-light'
                      }`}
                    >
                      <Icon className="w-8 h-8 mx-auto mb-2 text-ruby-primary" />
                      <h4 className="font-semibold">{type.name}</h4>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Quote CTA */}
            <div className="text-center">
              <Button asChild variant="cta" size="lg">
                <Link to="/request-quote">
                  <Send className="w-5 h-5 mr-2" />
                  Get Detailed Quote
                </Link>
              </Button>
            </div>
          </div>
        </NeumorphicCard>
      </div>
    </section>
  );
};