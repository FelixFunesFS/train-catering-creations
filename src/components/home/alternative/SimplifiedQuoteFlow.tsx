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
  return;
};