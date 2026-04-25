export interface SeoFaqItem {
  question: string;
  answer: string;
}

export interface SeoHighlight {
  title: string;
  description: string;
  icon: "Utensils" | "Heart" | "Star" | "Award" | "Users" | "Calendar" | "MapPin" | "Sparkles";
}

export interface SeoTestimonial {
  quote: string;
  author: string;
  detail: string;
}

export interface SeoPageData {
  slug: string; // route path (e.g., "/catering/weddings")
  pageType: "service" | "location";
  // Head
  metaTitle: string;
  metaDescription: string;
  // Hero
  eyebrow: string; // e.g., "Wedding Catering"
  headline: string; // H1 — keyword + location
  subheadline: string;
  heroImage?: string; // optional override
  // Trust strip
  trustPoints: string[]; // 3-4 short pills
  // Body
  intro: string; // 1-2 paragraph editorial intro
  highlights: SeoHighlight[]; // 3-6 cards
  localProof: {
    title: string;
    body: string;
    venues?: string[]; // optional list of nearby venues / neighborhoods
  };
  testimonials: SeoTestimonial[];
  faqs: SeoFaqItem[];
  // CTAs
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
}
