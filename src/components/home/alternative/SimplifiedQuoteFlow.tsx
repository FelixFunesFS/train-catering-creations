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
    <div className="w-full py-16 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12" ref={ref}>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Get Your Quote in Minutes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tell us about your event and get an instant estimate
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <NeumorphicCard className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Event Details</h3>
                
                {/* Event Type Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3">Event Type</label>
                  <div className="grid grid-cols-1 gap-3">
                    {eventTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => handleEventTypeSelect(type.id)}
                        className={`p-4 rounded-lg border text-left transition-all ${
                          selectedEventType === type.id
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <type.icon className="h-5 w-5" />
                          <div>
                            <div className="font-medium">{type.name}</div>
                            <div className="text-sm text-muted-foreground">
                              ${type.basePrice}/person
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Guest Count */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3">Guest Count</label>
                  <div className="grid grid-cols-2 gap-2">
                    {guestRanges.map((range) => (
                      <button
                        key={range.label}
                        onClick={() => handleGuestCountChange(range.value)}
                        className={`p-3 rounded-lg border text-center transition-all ${
                          guestCount === range.value
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        {range.label} guests
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Instant Estimate</h3>
                
                {selectedEventType ? (
                  <div className="bg-primary/5 rounded-lg p-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-2">
                        ${calculateEstimate().toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground mb-4">
                        Estimated total for {guestCount} guests
                      </div>
                      
                      <Button className="w-full" size="lg">
                        <Send className="h-4 w-4 mr-2" />
                        Request Detailed Quote
                      </Button>
                      
                      <p className="text-xs text-muted-foreground mt-3">
                        Final pricing may vary based on menu selection and additional services
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-muted/50 rounded-lg p-6 text-center">
                    <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      Select an event type to see your estimate
                    </p>
                  </div>
                )}
              </div>
            </div>
          </NeumorphicCard>
        </div>
      </div>
    </div>
  );
};