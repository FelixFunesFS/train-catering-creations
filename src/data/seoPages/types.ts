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

export interface SeoGalleryItem {
  src: string;
  alt: string;
}

export interface SeoPageData {
  slug: string;
  pageType: "service" | "location";
  // Head
  metaTitle: string;
  metaDescription: string;
  // Hero
  eyebrow: string;
  headline: string;
  subheadline: string;
  heroImage: string;
  heroImageAlt: string;
  // Trust strip
  trustPoints: string[];
  // Body
  intro: string;
  highlights: SeoHighlight[];
  gallery: SeoGalleryItem[]; // exactly 3 recommended
  localProof: {
    title: string;
    body: string;
    venues?: string[];
  };
  testimonials: SeoTestimonial[];
  faqs: SeoFaqItem[];
  // CTAs
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  ctaBackgroundImage?: string;
}
