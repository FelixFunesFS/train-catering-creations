import { z } from "zod";

// Temporary schemas to replace the deleted quoteFormSchemas.ts
// These are simplified versions to prevent build errors

const baseQuoteSchema = z.object({
  contactName: z.string().min(2, "Contact name is required"),
  eventName: z.string().min(2, "Event name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone number is required"),
  eventDate: z.string().min(1, "Event date is required"),
  eventStartTime: z.string().min(1, "Event start time is required"),
  guestCount: z.string().min(1, "Guest count is required"),
  location: z.string().min(1, "Event location is required"),
  serviceType: z.enum(["full-service", "delivery-only", "delivery-setup"]),
  servingStartTime: z.string().min(1, "Serving start time is required"),
  primaryProtein: z.string().min(1, "Please select a primary protein"),
  secondaryProtein: z.string().optional(),
  bothProteinsAvailable: z.boolean().default(false),
  customMenuRequests: z.string().optional(),
  selectedAppetizers: z.array(z.string()).default([]),
  selectedSides: z.array(z.string()).default([]),
  selectedDesserts: z.array(z.string()).default([]),
  selectedDrinks: z.array(z.string()).default([]),
  selectedUtensils: z.array(z.string()).default([]),
  selectedExtras: z.array(z.string()).default([]),
  dietaryRestrictions: z.array(z.string()).default([]),
  guestCountWithRestrictions: z.string().optional(),
  waitStaffRequested: z.enum(["yes-full-service", "no"]).optional(),
  bussingTablesNeeded: z.boolean().default(false),
  waitStaffSetupArea: z.enum(["covered-outdoor", "non-covered-outdoor", "indoor"]).optional(),
  separateServingArea: z.boolean().default(false),
  servingSetupArea: z.enum(["covered-outdoor", "non-covered-outdoor", "indoor"]).optional(),
  servingUtensils: z.boolean().default(false),
  cups: z.boolean().default(false),
  plates: z.boolean().default(false),
  napkins: z.boolean().default(false),
  foodWarmers: z.boolean().default(false),
  ice: z.boolean().default(false),
  specialRequests: z.string().optional(),
  hearAboutUs: z.string().min(1, "Please tell us how you heard about us"),
});

export const regularEventSchema = baseQuoteSchema.extend({
  eventType: z.enum([
    "corporate",
    "private_party", 
    "birthday",
    "baby_shower",
    "bereavement",
    "graduation",
    "retirement",
    "holiday_party",
    "other"
  ]),
});

export const weddingEventSchema = baseQuoteSchema.extend({
  eventType: z.enum([
    "wedding",
    "black_tie",
    "military_function",
    "gala",
    "anniversary",
    "engagement_party"
  ]),
  ceremonyIncluded: z.boolean().default(false),
  cocktailHour: z.boolean().default(false),
  specialDietaryNeeds: z.string().optional(),
});

export type RegularEventFormData = z.infer<typeof regularEventSchema>;
export type WeddingEventFormData = z.infer<typeof weddingEventSchema>;