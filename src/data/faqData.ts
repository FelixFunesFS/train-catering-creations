export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  keywords: string[];
}

export interface FAQCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const faqCategories: FAQCategory[] = [
  {
    id: "general",
    name: "General Services",
    description: "Basic information about our catering services",
    icon: "Info"
  },
  {
    id: "military",
    name: "Military Base Services", 
    description: "Specialized services for military installations",
    icon: "Shield"
  },
  {
    id: "menu",
    name: "Menu & Dietary",
    description: "Questions about our food offerings and dietary accommodations",
    icon: "Utensils"
  },
  {
    id: "pricing",
    name: "Pricing & Payment",
    description: "Information about costs, quotes, and payment options",
    icon: "DollarSign"
  },
  {
    id: "planning",
    name: "Event Planning",
    description: "Help with planning and coordinating your event",
    icon: "Calendar"
  },
  {
    id: "policies",
    name: "Policies & Procedures",
    description: "Cancellation policies, terms, and procedures",
    icon: "FileText"
  }
];

export const faqData: FAQItem[] = [
  // General Services
  {
    id: "what-services",
    question: "What types of catering services do you offer?",
    answer: "We provide full-service catering for a wide variety of events including weddings, corporate functions, military base events, private parties, holiday celebrations, and funeral repasts. Our services include menu planning, food preparation, delivery, setup, and cleanup.",
    category: "general",
    keywords: ["services", "catering", "events", "weddings", "corporate", "private", "parties"]
  },
  {
    id: "service-area",
    question: "What areas do you serve?",
    answer: "We proudly serve the Charleston, SC metro area and all surrounding communities. We also have special authorization to cater events on military bases throughout the region. For events outside our standard service area, please contact us to discuss arrangements.",
    category: "general",
    keywords: ["service area", "charleston", "delivery", "location", "travel"]
  },
  {
    id: "group-sizes",
    question: "What group sizes can you accommodate?",
    answer: "We cater events of all sizes, from intimate gatherings of 10 people to large celebrations of 500+ guests. Our team will work with you to customize the service level and menu options based on your specific group size and needs.",
    category: "general",
    keywords: ["group size", "guests", "capacity", "small", "large", "events"]
  },
  {
    id: "advance-notice",
    question: "How far in advance should I book your services?",
    answer: "We recommend booking at least 2-3 weeks in advance for most events. For large events (100+ guests), weddings, or holiday celebrations, we suggest booking 4-6 weeks ahead. However, we understand that sometimes events come up quickly, so please call us even for last-minute needs.",
    category: "general",
    keywords: ["booking", "advance notice", "scheduling", "timeline", "last minute"]
  },

  // Military Base Services
  {
    id: "military-access",
    question: "Can you cater events on military bases?",
    answer: "Yes! We are authorized to provide catering services on military base installations throughout the Charleston area. We have all necessary security clearances and documentation to access military facilities safely and efficiently.",
    category: "military",
    keywords: ["military", "base", "installation", "clearance", "access", "security"]
  },
  {
    id: "military-documentation",
    question: "What documentation do you need for military base events?",
    answer: "For military base events, we need the event details, point of contact information, and any specific base requirements at least 72 hours in advance. We handle all security clearance documentation and coordinate with base personnel to ensure smooth access.",
    category: "military",
    keywords: ["documentation", "security", "clearance", "military", "base access", "requirements"]
  },
  {
    id: "base-restrictions",
    question: "Are there any restrictions for military base catering?",
    answer: "Each military base has specific guidelines regarding outside vendors. We're familiar with these requirements and ensure all our staff and equipment meet base standards. We coordinate directly with base personnel to handle any special protocols or security measures.",
    category: "military",
    keywords: ["restrictions", "guidelines", "military base", "security", "protocols", "standards"]
  },

  // Menu & Dietary
  {
    id: "menu-customization",
    question: "Can you customize menus for dietary restrictions?",
    answer: "Absolutely! We accommodate various dietary needs including vegetarian, vegan, gluten-free, dairy-free, and other allergies or restrictions. Our chefs can modify existing dishes or create special items to ensure all your guests can enjoy the meal.",
    category: "menu",
    keywords: ["dietary restrictions", "vegetarian", "vegan", "gluten-free", "allergies", "custom menu"]
  },
  {
    id: "signature-dishes",
    question: "What are your signature dishes?",
    answer: "Our signature soul food dishes include our famous fried chicken, slow-cooked pulled pork, mac and cheese, collard greens, cornbread, and homemade desserts. We also offer seafood options, vegetarian dishes, and can prepare traditional comfort foods with our unique soul food twist.",
    category: "menu",
    keywords: ["signature dishes", "soul food", "fried chicken", "pulled pork", "mac and cheese", "specialties"]
  },
  {
    id: "tasting-available",
    question: "Do you offer tastings before the event?",
    answer: "Yes, we offer tastings for events of 50+ guests or for weddings. Tastings are typically scheduled 2-3 weeks before your event and include samples of your selected menu items. There is a small fee for tastings that can be applied toward your final bill.",
    category: "menu",
    keywords: ["tasting", "food samples", "wedding", "large events", "menu preview"]
  },

  // Pricing & Payment
  {
    id: "pricing-structure",
    question: "How is your pricing structured?",
    answer: "Our pricing is based on the number of guests, menu selections, service level, and event location. We provide detailed quotes that include food, service staff, equipment, and any additional services. All pricing is transparent with no hidden fees.",
    category: "pricing",
    keywords: ["pricing", "cost", "quote", "transparent", "no hidden fees", "guest count"]
  },
  {
    id: "payment-terms",
    question: "What are your payment terms?",
    answer: "We follow a tiered payment schedule: A 10% non-refundable deposit secures your date. 50% of the total (including your deposit) must be paid by 30 days before your event, meaning an additional 40% is due at that time. The remaining 50% balance is due 14 days before. We accept cash, check, credit/debit cards, ACH bank transfer, Venmo, and Zelle. A 3% processing fee applies to credit card payments over $1,000.",
    category: "pricing",
    keywords: ["payment", "deposit", "balance", "credit cards", "payment plan", "terms"]
  },
  {
    id: "additional-fees",
    question: "Are there any additional fees I should know about?",
    answer: "Our quotes include all standard services. Additional fees may apply for events outside our service area (travel fees), last-minute changes, or special requests like extended service hours or premium linens. All potential additional fees are discussed upfront.",
    category: "pricing",
    keywords: ["additional fees", "travel fees", "extra charges", "special requests", "service hours"]
  },
  {
    id: "quote-validity",
    question: "How long is my quote valid?",
    answer: "Quotes are valid for 7 days from the date issued. For events approaching quickly, validity may be shorter due to ingredient pricing and availability. We recommend securing your booking promptly to lock in your quoted price. Once your deposit is received, the quoted price is honored.",
    category: "pricing",
    keywords: ["quote validity", "price guarantee", "market prices", "booking deadline"]
  },

  // Event Planning
  {
    id: "planning-assistance",
    question: "Do you help with event planning beyond the food?",
    answer: "While we focus on the culinary experience, we can recommend trusted partners for rentals, decorations, and entertainment. Our team also provides guidance on timing, layout, and coordination to ensure your event runs smoothly.",
    category: "planning",
    keywords: ["event planning", "coordination", "timing", "layout", "vendor recommendations"]
  },
  {
    id: "equipment-provided",
    question: "What equipment and supplies do you provide?",
    answer: "We provide all necessary serving equipment, chafing dishes, serving utensils, plates, napkins, and basic linens. For enhanced presentations, we can arrange upgraded linens, centerpieces, and specialty serving pieces for an additional fee.",
    category: "planning",
    keywords: ["equipment", "supplies", "serving", "plates", "linens", "chafing dishes"]
  },
  {
    id: "setup-cleanup",
    question: "Do you handle setup and cleanup?",
    answer: "Yes! Our full-service catering includes setup before your event and complete cleanup afterward. We arrive early to set up the food stations and serving areas, and we handle all cleanup so you can focus on enjoying your event.",
    category: "planning",
    keywords: ["setup", "cleanup", "full service", "food stations", "serving areas"]
  },
  {
    id: "staff-provided",
    question: "Do you provide serving staff?",
    answer: "Yes, we provide professional serving staff for all events. The number of staff depends on your guest count and service style. Our team is experienced, professionally dressed, and trained to provide excellent hospitality.",
    category: "planning",
    keywords: ["staff", "servers", "professional", "hospitality", "service style"]
  },

  // Policies & Procedures
  {
    id: "cancellation-policy",
    question: "What is your cancellation policy?",
    answer: "Cancellations more than 14 days before your event forfeit the deposit only. Cancellations 8-14 days prior forfeit 50% of the total amount. Cancellations within 7 days of the event forfeit 100% of the total amount. Rescheduling requests must be made at least 14 days in advance, and one complimentary reschedule is allowed per booking, subject to availability.",
    category: "policies",
    keywords: ["cancellation", "refund", "deposit", "rescheduling", "forfeiture"]
  },
  {
    id: "weather-policy",
    question: "What happens if weather affects my outdoor event?",
    answer: "For outdoor events, we recommend having a backup indoor location or tent rental. We monitor weather closely and will work with you to adjust plans if needed. Our equipment is suitable for covered outdoor areas, and we can modify service style to accommodate weather conditions.",
    category: "policies",
    keywords: ["weather", "outdoor events", "backup plan", "tent", "covered areas"]
  },
  {
    id: "insurance-licensing",
    question: "Are you licensed and insured?",
    answer: "Yes, Soul Train's Eatery is fully licensed and insured. We carry comprehensive liability insurance and maintain all required health department certifications. We can provide certificates of insurance when required by venues.",
    category: "policies",
    keywords: ["licensed", "insured", "liability", "health department", "certifications"]
  },
  {
    id: "food-safety",
    question: "How do you ensure food safety?",
    answer: "Food safety is our top priority. Our kitchen is health department certified, our staff is trained in safe food handling, and we follow strict temperature control and sanitation procedures. We use insulated transport equipment to maintain proper food temperatures during delivery and service.",
    category: "policies",
    keywords: ["food safety", "health department", "temperature control", "sanitation", "certified kitchen"]
  }
];