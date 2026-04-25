import type { SeoPageData } from "./types";

const BASE = "https://www.soultrainseatery.com";

const callCta = { label: "Call (843) 970-0265", href: "tel:8439700265" };
const quoteCta = { label: "Request a Free Quote", href: "/request-quote#page-header" };
const weddingQuoteCta = { label: "Start Your Wedding Quote", href: "/request-quote/wedding" };

// ─────────────────────────── SERVICE PAGES ───────────────────────────

export const weddingsPage: SeoPageData = {
  slug: "/catering/weddings",
  pageType: "service",
  metaTitle: "Wedding Catering Charleston SC | Soul Train's Eatery",
  metaDescription:
    "Charleston wedding catering with authentic Lowcountry soul food. Family-run, full-service plated, buffet & stations. Serving the Lowcountry — request a free quote.",
  eyebrow: "Wedding Catering",
  headline: "Charleston Wedding Catering Made From the Heart",
  subheadline:
    "Soulful Southern menus, gracious service, and stress-free planning for couples celebrating across the Lowcountry.",
  trustPoints: ["Family-Run Since Day One", "Licensed & Insured", "Lowcountry Locals", "Custom Menus"],
  intro:
    "Your wedding day deserves food guests will talk about for years — and a team that handles every detail with warmth and precision. Soul Train's Eatery brings authentic Charleston soul food to weddings of every size, from intimate backyard ceremonies on Johns Island to grand receptions downtown. We collaborate closely with you, your planner, and your venue so the only thing you have to do is enjoy the moment.",
  highlights: [
    { title: "Plated, Buffet & Stations", description: "Choose the service style that fits your venue, timeline, and vibe — we'll guide you through each option.", icon: "Utensils" },
    { title: "Tastings & Custom Menus", description: "We tailor menus around your story, dietary needs, and family traditions — vegetarian and gluten-aware options included.", icon: "Heart" },
    { title: "Full-Service Staffing", description: "Professional servers, attendants, and on-site chefs keep your reception running flawlessly.", icon: "Users" },
    { title: "Trusted by Charleston Venues", description: "Experience working with the Lowcountry's most-loved wedding venues, from waterfront estates to historic halls.", icon: "Award" },
    { title: "Stress-Free Planning", description: "Clear estimates, transparent pricing, and a single point of contact from first call through last bite.", icon: "Calendar" },
    { title: "Soul on Every Plate", description: "Slow-smoked meats, garden-fresh sides, and from-scratch desserts rooted in real Southern tradition.", icon: "Sparkles" },
  ],
  localProof: {
    title: "Catering Weddings Across the Charleston Lowcountry",
    body: "We proudly serve couples in Mount Pleasant, Daniel Island, Isle of Palms, Sullivan's Island, Johns Island, Kiawah, Folly Beach, Summerville, and downtown Charleston. Our team knows the local venues — load-in routes, kitchen access, timing — so setup is seamless and your guests are served on schedule.",
    venues: ["Mount Pleasant", "Daniel Island", "Downtown Charleston", "Kiawah Island", "Johns Island", "Summerville"],
  },
  testimonials: [
    { quote: "From planning to the final plate, every detail was handled with care and love. Our guests are still talking about the food!", author: "The Williams Family", detail: "Charleston Wedding" },
    { quote: "The team felt like family by the end of the night. Beautiful presentation, incredible flavor.", author: "Jasmine & Marcus", detail: "Mount Pleasant Reception" },
  ],
  faqs: [
    { question: "How far in advance should we book wedding catering?", answer: "We recommend booking 6–12 months in advance for peak Charleston wedding season (March–June, September–November). Off-season dates are often available with shorter notice — just give us a call." },
    { question: "Do you offer tastings?", answer: "Yes. Once your estimate is approved, we coordinate a tasting so you can finalize your menu with confidence." },
    { question: "Can you accommodate dietary restrictions?", answer: "Absolutely. We offer vegetarian, gluten-aware, and allergen-conscious selections, and we'll work with your guest list to ensure every guest is taken care of." },
    { question: "Do you provide staff, rentals, and setup?", answer: "We offer full-service catering including professional servers, on-site attendants, and coordination with your rental company. Setup, replenishing, and cleanup are included." },
    { question: "What areas do you serve?", answer: "We cater weddings throughout the Charleston Lowcountry — Mount Pleasant, Daniel Island, Kiawah, Johns Island, Summerville, downtown Charleston, and surrounding areas." },
  ],
  primaryCta: weddingQuoteCta,
  secondaryCta: callCta,
};

export const corporatePage: SeoPageData = {
  slug: "/catering/corporate",
  pageType: "service",
  metaTitle: "Corporate Catering Charleston SC | Soul Train's Eatery",
  metaDescription:
    "Charleston corporate catering for meetings, conferences, and office events. On-time delivery, hot soul food, full-service options. Get a quote today.",
  eyebrow: "Corporate Catering",
  headline: "Corporate Catering Charleston Teams Look Forward To",
  subheadline:
    "From boxed lunches to executive luncheons and all-hands events — reliable, hot, and unforgettable Lowcountry comfort food.",
  trustPoints: ["On-Time Delivery", "Tax-Receipt Invoicing", "Scalable Headcounts", "Repeat-Client Favorite"],
  intro:
    "Feeding your team should be easy. Soul Train's Eatery delivers hot, beautifully presented soul food to Charleston offices, training sessions, board meetings, and conferences — on time, every time. We handle the logistics so your team can focus on the work.",
  highlights: [
    { title: "Boxed Lunches & Drop-Off", description: "Individually packed meals or hot buffets delivered set-up ready.", icon: "Utensils" },
    { title: "Recurring Orders", description: "Standing weekly or monthly orders with simplified billing.", icon: "Calendar" },
    { title: "Scales With Your Headcount", description: "Confident execution from 10-person meetings to 300+ company events.", icon: "Users" },
    { title: "Clear, Itemized Invoicing", description: "Easy approvals, PO-friendly invoices, and transparent pricing.", icon: "Award" },
  ],
  localProof: {
    title: "Trusted by Charleston-Area Businesses",
    body: "We deliver to offices and corporate campuses across North Charleston, downtown, Mount Pleasant, Daniel Island, and the Boeing/airport corridor. Our team understands building access, loading docks, and tight meeting windows.",
  },
  testimonials: [
    { quote: "Our team requests Soul Train every quarter. Always on time, always delicious.", author: "Operations Director", detail: "Charleston Tech Company" },
  ],
  faqs: [
    { question: "What's your minimum order?", answer: "We cater corporate orders starting around 15 guests. Reach out for smaller specialty requests." },
    { question: "How much notice do you need?", answer: "We recommend 5–7 business days for hot buffets. Boxed lunches can often be turned around in 48–72 hours depending on availability." },
    { question: "Do you provide setup and breakdown?", answer: "Yes — full-service setup is available, or we can do a clean drop-off with disposable serving ware." },
    { question: "Can you invoice our company directly?", answer: "Yes. We provide itemized invoices with clear line items, tax, and gratuity." },
  ],
  primaryCta: quoteCta,
  secondaryCta: callCta,
};

export const militaryPage: SeoPageData = {
  slug: "/catering/military",
  pageType: "service",
  metaTitle: "Military Catering Charleston SC | Ceremonies & Functions",
  metaDescription:
    "Charleston military catering for retirements, promotions, change-of-command, and unit functions. Respectful service, base-experienced team. Request a quote.",
  eyebrow: "Military Functions",
  headline: "Military Function Catering With Honor and Soul",
  subheadline:
    "Promotions, retirements, change-of-command, and unit celebrations — handled with the discipline and respect they deserve.",
  trustPoints: ["Base-Experienced Team", "Punctual & Professional", "Custom Menus", "Lowcountry Roots"],
  intro:
    "We're proud to serve Charleston's military community. From Joint Base Charleston ceremonies to retirement gatherings at private venues, our team brings the same precision and warmth our service members give every day. Coordination, timing, and presentation — we know how it has to be done.",
  highlights: [
    { title: "Ceremonies & Receptions", description: "Promotions, retirements, change-of-command, ball, and family days.", icon: "Award" },
    { title: "Base & Off-Base", description: "Comfortable working with base access procedures and private venues alike.", icon: "MapPin" },
    { title: "Scalable Service", description: "Confident execution from intimate gatherings to large unit events.", icon: "Users" },
    { title: "Soulful Southern Menu", description: "Menus that feel like home for service members and families from anywhere.", icon: "Heart" },
  ],
  localProof: {
    title: "Proudly Supporting Joint Base Charleston & the Lowcountry Military Community",
    body: "We've catered functions for service members across Joint Base Charleston, Naval Weapons Station, and surrounding venues. Our team is familiar with base access protocols and the timelines military events demand.",
  },
  testimonials: [
    { quote: "They handled my retirement ceremony like absolute pros. Showed up early, served on time, food was outstanding.", author: "Retired SMSgt", detail: "Joint Base Charleston" },
  ],
  faqs: [
    { question: "Can you cater on base?", answer: "Yes. We'll coordinate with your point of contact on access procedures, vehicle passes, and timing." },
    { question: "Do you offer military discounts?", answer: "We work hard to offer fair pricing for service members and unit funds. Contact us to discuss your event." },
    { question: "How quickly can you turn around a ceremony?", answer: "Depending on availability, we can often accommodate ceremonies with 2–3 weeks of notice. Reach out and we'll do our best." },
  ],
  primaryCta: quoteCta,
  secondaryCta: callCta,
};

export const privateEventsPage: SeoPageData = {
  slug: "/catering/private-events",
  pageType: "service",
  metaTitle: "Private Event Catering Charleston SC | Soul Train's Eatery",
  metaDescription:
    "Charleston private event catering for birthdays, anniversaries, graduations, and family gatherings. Authentic soul food, full-service. Request a quote.",
  eyebrow: "Private Events",
  headline: "Private Event Catering for Charleston's Most Memorable Moments",
  subheadline:
    "Birthdays, graduations, anniversaries, reunions, and celebrations of life — soul food that brings everyone closer to the table.",
  trustPoints: ["Family-Run", "Custom Menus", "Full-Service or Drop-Off", "Lowcountry Locals"],
  intro:
    "The best moments happen around food. Whether you're celebrating a milestone birthday, hosting a graduation party, or gathering family for a reunion, we'll build a menu that feels like home and a service experience that lets you stay present with your guests.",
  highlights: [
    { title: "Birthdays & Milestones", description: "From sweet sixteens to 80th birthdays — soulful menus for every generation.", icon: "Sparkles" },
    { title: "Graduations & Reunions", description: "Buffet stations and family-style spreads built for celebration.", icon: "Users" },
    { title: "Anniversaries & Showers", description: "Elegant plated service or beautifully styled buffets, your choice.", icon: "Heart" },
    { title: "Celebrations of Life", description: "Compassionate, organized service for repasts and memorial gatherings.", icon: "Star" },
  ],
  localProof: {
    title: "Hosting Private Events Throughout the Lowcountry",
    body: "We cater private events at homes, venues, parks, and community spaces across Charleston, Mount Pleasant, Summerville, North Charleston, and surrounding areas.",
  },
  testimonials: [
    { quote: "Our family reunion was the best one we've had in twenty years. Tanya and the team made it effortless.", author: "The Johnson Family", detail: "Charleston Family Reunion" },
  ],
  faqs: [
    { question: "What's the minimum guest count?", answer: "Most private events start around 25 guests, but we're happy to discuss smaller intimate gatherings." },
    { question: "Can we do drop-off instead of full service?", answer: "Yes — we offer both full-service catering and clean drop-off options with disposable serving ware." },
    { question: "Do you handle setup and cleanup?", answer: "Full-service catering includes setup, replenishment during service, and cleanup of catering areas." },
  ],
  primaryCta: quoteCta,
  secondaryCta: callCta,
};

export const holidaysPage: SeoPageData = {
  slug: "/catering/holidays",
  pageType: "service",
  metaTitle: "Holiday Catering Charleston SC | Thanksgiving & Christmas",
  metaDescription:
    "Charleston holiday catering for Thanksgiving, Christmas, Easter, and seasonal parties. Smoked turkey, dressing, soul-food sides. Book your holiday menu.",
  eyebrow: "Holiday Catering",
  headline: "Charleston Holiday Catering With Soul, Tradition & Heart",
  subheadline:
    "Thanksgiving, Christmas, Easter, Juneteenth, and corporate holiday parties — let us handle the cooking so you can host the moment.",
  trustPoints: ["Limited Holiday Slots", "Family-Style or Plated", "Pickup or Delivery", "Pre-Order Ready"],
  intro:
    "Holidays are about gathering — not stressing in the kitchen. From smoked turkey and cornbread dressing to honey ham, collards, mac & cheese, and from-scratch pies, we'll bring the comfort of a Southern holiday table straight to your home, office, or event venue.",
  highlights: [
    { title: "Thanksgiving Spreads", description: "Smoked turkey, dressing, gravy, and all the fixings — pickup or delivered.", icon: "Utensils" },
    { title: "Christmas Dinners", description: "Honey-glazed ham, prime rib options, sides, and desserts.", icon: "Sparkles" },
    { title: "Office Holiday Parties", description: "Buffets and stations that turn a workday into a celebration.", icon: "Users" },
    { title: "À La Carte Trays", description: "Order just sides, just desserts, or build your own holiday menu.", icon: "Heart" },
  ],
  localProof: {
    title: "Holiday Catering Across Charleston",
    body: "Pickup from our Charleston operations and delivery available throughout the Lowcountry. Holiday slots are limited — reserve your menu early.",
  },
  testimonials: [
    { quote: "We've ordered our Thanksgiving dinner from them three years in a row. Always perfect.", author: "Charleston Family", detail: "Annual Thanksgiving Order" },
  ],
  faqs: [
    { question: "When should I book holiday catering?", answer: "Thanksgiving and Christmas slots fill up fast — we recommend reserving 4–6 weeks ahead. Office parties: 6–8 weeks." },
    { question: "Can I order just sides or desserts?", answer: "Absolutely. We offer à la carte trays so you can build the menu that fits your gathering." },
    { question: "Do you deliver on holidays?", answer: "Yes, with limited delivery windows. Pickup is also available — we'll confirm timing when you book." },
  ],
  primaryCta: quoteCta,
  secondaryCta: callCta,
};

// ─────────────────────────── LOCATION PAGES ───────────────────────────

export const mountPleasantPage: SeoPageData = {
  slug: "/catering-charleston/mount-pleasant",
  pageType: "location",
  metaTitle: "Catering Mount Pleasant SC | Soul Food | Soul Train's Eatery",
  metaDescription:
    "Mount Pleasant catering for weddings, corporate, and private events. Authentic Charleston soul food delivered to your venue or home. Request a quote.",
  eyebrow: "Serving Mount Pleasant",
  headline: "Catering Mount Pleasant Trusts for Soul-Food Hospitality",
  subheadline:
    "From Old Village receptions to Boone Hall weddings and corporate events on Long Point Road — soulful menus, gracious service.",
  trustPoints: ["Local Lowcountry Team", "Venue-Experienced", "Full-Service or Drop-Off", "Custom Menus"],
  intro:
    "Mount Pleasant is one of our home neighborhoods. We know the venues, the timing of waterfront ceremonies, and how to make every gathering feel effortless. Whether you're hosting at Boone Hall, the Old Village, Patriots Point, or a private home along Shem Creek, we'll bring authentic Charleston soul food and full-service hospitality.",
  highlights: [
    { title: "Weddings & Receptions", description: "Beautifully styled service for waterfront and historic Mount Pleasant venues.", icon: "Heart" },
    { title: "Corporate & Office Catering", description: "Hot buffets and boxed lunches delivered to Long Point and Towne Centre offices.", icon: "Utensils" },
    { title: "Private Events at Home", description: "Backyard gatherings, birthdays, and celebrations across the Old Village and beyond.", icon: "Users" },
    { title: "Local Knowledge", description: "Familiar with venue load-in, parking, and kitchen access across Mount Pleasant.", icon: "MapPin" },
  ],
  localProof: {
    title: "Mount Pleasant Venues & Neighborhoods We Serve",
    body: "We regularly cater across Mount Pleasant — from waterfront estates and Boone Hall Plantation to private residences in I'On, the Old Village, Park West, and Carolina Park. Our team understands what each setting needs.",
    venues: ["Boone Hall Plantation", "Old Village", "I'On", "Park West", "Carolina Park", "Patriots Point"],
  },
  testimonials: [
    { quote: "They catered our wedding at Boone Hall and it was flawless. Loved every bite.", author: "Mount Pleasant Couple", detail: "Boone Hall Wedding" },
  ],
  faqs: [
    { question: "Do you have experience with Mount Pleasant venues?", answer: "Yes — we cater regularly at Boone Hall, Patriots Point, the Old Village, and private residences throughout Mount Pleasant." },
    { question: "Is there a delivery fee to Mount Pleasant?", answer: "Delivery is included for most full-service catering in Mount Pleasant. Drop-off pricing is provided in your custom estimate." },
    { question: "Can you accommodate beach or outdoor events?", answer: "Absolutely. We've catered beach ceremonies on Sullivan's and Isle of Palms and outdoor events throughout the area." },
  ],
  primaryCta: quoteCta,
  secondaryCta: callCta,
};

export const danielIslandPage: SeoPageData = {
  slug: "/catering-charleston/daniel-island",
  pageType: "location",
  metaTitle: "Catering Daniel Island SC | Soul Food | Soul Train's Eatery",
  metaDescription:
    "Daniel Island catering for weddings, club events, and private gatherings. Authentic Lowcountry soul food, full-service team. Request a quote.",
  eyebrow: "Serving Daniel Island",
  headline: "Catering Daniel Island Hosts With Soul & Style",
  subheadline:
    "Club events, weddings, corporate gatherings, and private parties — soulful menus and full-service hospitality across Daniel Island.",
  trustPoints: ["Club & Venue Experience", "Full-Service Team", "Custom Menus", "Lowcountry Roots"],
  intro:
    "Daniel Island has become one of Charleston's most sought-after event destinations — and we love working there. From the Daniel Island Club to private waterfront homes, our team brings warm, professional service and a menu that adds genuine Lowcountry soul to every gathering.",
  highlights: [
    { title: "Club & Private Venue Catering", description: "Experienced working alongside venue staff and event coordinators.", icon: "Award" },
    { title: "Weddings & Receptions", description: "Plated, buffet, and station service for Daniel Island weddings.", icon: "Heart" },
    { title: "Corporate Functions", description: "Boardrooms, off-sites, and team gatherings handled cleanly.", icon: "Utensils" },
    { title: "Local Coordination", description: "We know island access, parking, and timing — no surprises on event day.", icon: "MapPin" },
  ],
  localProof: {
    title: "Catering Across Daniel Island",
    body: "We serve Daniel Island Club events, waterfront homes, corporate offices, and private celebrations across the island. Our crew knows the venues and the rhythms of an island event.",
    venues: ["Daniel Island Club", "Waterfront Park", "Codner's Ferry", "Smythe Park"],
  },
  testimonials: [
    { quote: "Effortless from the first call. The food and the team were both spectacular.", author: "Daniel Island Bride", detail: "Daniel Island Wedding" },
  ],
  faqs: [
    { question: "Do you cater at the Daniel Island Club?", answer: "We cater private events on Daniel Island and coordinate closely with venues and planners. Reach out and we'll confirm logistics." },
    { question: "How far in advance should I book?", answer: "For weddings, 6–12 months. For private and corporate events, 4–8 weeks is ideal." },
    { question: "Do you offer tastings?", answer: "Yes, tastings are available once your estimate is approved." },
  ],
  primaryCta: quoteCta,
  secondaryCta: callCta,
};

export const downtownCharlestonPage: SeoPageData = {
  slug: "/catering-charleston/downtown",
  pageType: "location",
  metaTitle: "Catering Downtown Charleston SC | Soul Train's Eatery",
  metaDescription:
    "Downtown Charleston catering for weddings, corporate events, and private parties. Soul food rooted in the Lowcountry. Request a free quote today.",
  eyebrow: "Serving Downtown Charleston",
  headline: "Downtown Charleston Catering With Real Lowcountry Soul",
  subheadline:
    "Historic venues, rooftop receptions, corporate suites, and private homes south of Calhoun — we bring the soul, you enjoy the moment.",
  trustPoints: ["Historic Venue Experience", "Tight-Timeline Pros", "Custom Menus", "Family-Run Locals"],
  intro:
    "Downtown Charleston has its own rhythm — narrow streets, historic kitchens, strict load-in windows. We've been doing this long enough to make it look easy. Whether you're hosting at a historic mansion, a King Street rooftop, or a private courtyard south of Broad, our team arrives prepared and serves with grace.",
  highlights: [
    { title: "Historic Venue Catering", description: "Comfortable in venues with limited kitchens and historic restrictions.", icon: "Award" },
    { title: "Rooftop & Courtyard Events", description: "Logistics-savvy crew for vertical load-in and tight setups.", icon: "MapPin" },
    { title: "Wedding Receptions", description: "Plated, buffet, and family-style service tailored to your venue.", icon: "Heart" },
    { title: "Corporate Downtown", description: "Office catering and event hospitality across the peninsula.", icon: "Utensils" },
  ],
  localProof: {
    title: "Catering Across the Charleston Peninsula",
    body: "We cater weddings, corporate events, and private parties throughout downtown Charleston — from South of Broad to Upper King and the Medical District. Our team understands historic venue requirements and downtown logistics.",
    venues: ["South of Broad", "King Street", "Historic District", "Upper King", "The Battery", "Medical District"],
  },
  testimonials: [
    { quote: "They handled a tricky downtown venue like absolute pros. The food was incredible and service was warm.", author: "Downtown Couple", detail: "Historic Venue Wedding" },
  ],
  faqs: [
    { question: "Can you work in venues with limited kitchen access?", answer: "Yes — we plan menus and logistics around each venue's specific kitchen capabilities and timing." },
    { question: "Do you handle parking and load-in for downtown events?", answer: "We coordinate with your venue on load-in, parking permits where needed, and timing to keep everything smooth." },
    { question: "What's the average price range?", answer: "Pricing varies by guest count, service style, and menu. Request a free quote and we'll provide a clear, itemized estimate." },
  ],
  primaryCta: quoteCta,
  secondaryCta: callCta,
};

// ─────────────────────────── REGISTRY ───────────────────────────

export const allSeoPages: SeoPageData[] = [
  weddingsPage,
  corporatePage,
  militaryPage,
  privateEventsPage,
  holidaysPage,
  mountPleasantPage,
  danielIslandPage,
  downtownCharlestonPage,
];

export const getSeoPageBySlug = (slug: string): SeoPageData | undefined =>
  allSeoPages.find((p) => p.slug === slug);

export const buildCanonical = (slug: string): string => `${BASE}${slug}`;
