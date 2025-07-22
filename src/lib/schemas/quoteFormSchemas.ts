
import { z } from "zod";

// Base schema shared between both forms
const baseQuoteSchema = z.object({
  // Contact Information
  contactName: z.string().min(2, "Contact name is required"),
  eventName: z.string().min(2, "Event name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  
  // Event Details
  eventDate: z.string().min(1, "Event date is required"),
  eventStartTime: z.string().min(1, "Event start time is required"),
  guestCount: z.string().min(1, "Guest count is required"),
  location: z.string().min(1, "Event location is required"),
  
  // Service Options
  serviceType: z.enum(["full-service", "delivery-only", "delivery-setup"], {
    required_error: "Please select a service type"
  }),
  
  // Serving Details
  servingStartTime: z.string().min(1, "Serving start time is required"),
  
  // Updated Protein Selection
  primaryProtein: z.string().min(1, "Please select a primary protein"),
  secondaryProtein: z.string().optional(),
  bothProteinsAvailable: z.boolean().default(false),
  customMenuRequests: z.string().optional(),
  
  // Dietary Considerations
  dietaryRestrictions: z.array(z.string()).default([]),
  guestCountWithRestrictions: z.string().optional(),
  
  // Wait Staff (conditional)
  waitStaffRequested: z.enum(["yes-full-service", "no"], {
    required_error: "Please specify wait staff requirements"
  }),
  bussingTablesNeeded: z.boolean().default(false),
  
  // Setup Configuration
  waitStaffSetupArea: z.enum(["covered-outdoor", "non-covered-outdoor", "indoor"]).optional(),
  separateServingArea: z.boolean().default(false),
  servingSetupArea: z.enum(["covered-outdoor", "non-covered-outdoor", "indoor"]).optional(),
  
  // Additional Services
  servingUtensils: z.boolean().default(false),
  cups: z.boolean().default(false),
  plates: z.boolean().default(false),
  napkins: z.boolean().default(false),
  foodWarmers: z.boolean().default(false),
  ice: z.boolean().default(false),
  
  // Special Requests
  specialRequests: z.string().optional(),
  
  // How did you hear about us
  hearAboutUs: z.string().min(1, "Please tell us how you heard about us"),
});

// Regular Events Schema
export const regularEventSchema = baseQuoteSchema.extend({
  eventType: z.enum([
    "corporate",
    "private-party", 
    "birthday",
    "baby-shower",
    "bereavement",
    "graduation",
    "retirement",
    "holiday-party",
    "other"
  ], {
    required_error: "Please select an event type"
  }),
});

// Wedding/Black Tie Events Schema
export const weddingEventSchema = baseQuoteSchema.extend({
  eventType: z.enum([
    "wedding",
    "black-tie",
    "military-function",
    "gala",
    "anniversary",
    "engagement-party"
  ], {
    required_error: "Please select an event type"
  }),
  // Additional wedding-specific fields
  ceremonyIncluded: z.boolean().default(false),
  cocktailHour: z.boolean().default(false),
  specialDietaryNeeds: z.string().optional(),
});

export type RegularEventFormData = z.infer<typeof regularEventSchema>;
export type WeddingEventFormData = z.infer<typeof weddingEventSchema>;
