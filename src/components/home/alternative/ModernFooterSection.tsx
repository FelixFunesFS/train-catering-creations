import { useState } from "react";
import { Link } from "react-router-dom";
import { NeumorphicCard } from "@/components/ui/neumorphic-card";
import { useIsMobile } from "@/hooks/use-mobile";
import { MapPin, Phone, Mail, Clock, ChevronDown, ChevronUp, Instagram, Facebook, Twitter, Heart, Star } from "lucide-react";
export const ModernFooterSection = () => {
  const isMobile = useIsMobile();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };
  const footerSections = [{
    id: "services",
    title: "Our Services",
    links: [{
      label: "Wedding Catering",
      href: "/wedding-menu"
    }, {
      label: "Corporate Events",
      href: "/menu"
    }, {
      label: "Private Parties",
      href: "/request-quote"
    }, {
      label: "Holiday Catering",
      href: "/menu"
    }]
  }, {
    id: "company",
    title: "Company",
    links: [{
      label: "About Us",
      href: "/about"
    }, {
      label: "Photo Gallery",
      href: "/gallery"
    }, {
      label: "Reviews",
      href: "/reviews"
    }, {
      label: "FAQ",
      href: "/faq"
    }]
  }, {
    id: "legal",
    title: "Legal",
    links: [{
      label: "Privacy Policy",
      href: "/privacy-policy"
    }, {
      label: "Terms & Conditions",
      href: "/terms-conditions"
    }]
  }];
  const contactInfo = {
    address: "Charleston, SC",
    phone: "(843) 322-4567",
    email: "info@soultrainseatery.com",
    hours: "Mon-Fri: 8AM-6PM, Sat-Sun: 9AM-4PM"
  };
  const socialLinks = [{
    icon: Instagram,
    href: "#",
    label: "Instagram"
  }, {
    icon: Facebook,
    href: "#",
    label: "Facebook"
  }, {
    icon: Twitter,
    href: "#",
    label: "Twitter"
  }];
  return;
};