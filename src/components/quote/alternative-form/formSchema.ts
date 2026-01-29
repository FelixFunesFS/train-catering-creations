import { z } from "zod";

export const formSchema = z.object({
  // Contact Information
  contact_name: z.string().min(1, "Contact name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(1, "Phone number is required"),
  
  // Event Details
  event_name: z.string().min(1, "Event name is required"),
  event_type: z.enum([
    "birthday",
    "corporate",
    "anniversary",
    "graduation",
    "retirement",
    "other",
    "private_party",
    "baby_shower",
    "bereavement",
    "holiday_party",
    "wedding",
    "black_tie",
    "military_function"
  ]),
  event_date: z.string()
    .min(1, "Event date is required")
    .refine((dateStr) => {
      // Parse as local date to avoid timezone shifts
      const [year, month, day] = dateStr.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const minDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
      const maxDate = new Date(now.getTime() + 18 * 30 * 24 * 60 * 60 * 1000); // 18 months
      return date >= minDate && date <= maxDate;
    }, {
      message: "Event date must be at least 24 hours in the future and within 18 months"
    })
    .refine((dateStr) => {
      const [year, month, day] = dateStr.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return !isNaN(date.getTime());
    }, {
      message: "Please enter a valid date"
    }),
  start_time: z.string()
    .min(1, "Start time is required")
    .refine((time) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time), {
      message: "Please enter a valid time (HH:MM format)"
    }),
  guest_count: z.number()
    .min(1, "Guest count must be at least 1")
    .max(500, "Maximum guest count is 500. For larger events, please contact us directly")
    .int("Guest count must be a whole number"),
  location: z.string().min(1, "Location is required"),
  
  // Service Details  
  service_type: z.enum(["full-service", "delivery-setup", "delivery-only"], {
    required_error: "Please select a service type"
  }),
  serving_start_time: z.string()
    .optional()
    .nullable()
    .refine((time) => {
      if (!time) return true; // optional field
      return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
    }, {
      message: "Please enter a valid time (HH:MM format)"
    }),
  
  // Menu Selections
  proteins: z.array(z.string()).max(2, "Maximum 2 protein selections allowed. Additional proteins can be added in Special Requests.").default([]),
  both_proteins_available: z.boolean().default(false),
  appetizers: z.array(z.string()).default([]),
  sides: z.array(z.string()).default([]),
  desserts: z.array(z.string()).default([]),
  drinks: z.array(z.string()).default([]),
  dietary_restrictions: z.array(z.string()).default([]),
  vegetarian_entrees: z.array(z.string()).default([]),
  guest_count_with_restrictions: z.string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const num = parseInt(val, 10);
      return !isNaN(num) && num >= 0 && num <= 500;
    }, {
      message: "Must be a valid number between 0 and 500"
    }),
  
  // Additional Services
  plates_requested: z.boolean().default(false),
  cups_requested: z.boolean().default(false),
  napkins_requested: z.boolean().default(false),
  serving_utensils_requested: z.boolean().default(false),
  chafers_requested: z.boolean().default(false),
  ice_requested: z.boolean().default(false),
  utensils: z.array(z.string()).default([]),
  extras: z.array(z.string()).default([]),
  
  // Setup Requirements
  separate_serving_area: z.boolean().default(false),
  serving_setup_area: z.string().optional(),
  bussing_tables_needed: z.boolean().default(false),
  
  // Military-specific field (optional)
  military_organization: z.string().optional(),
  
  // Additional Information
  special_requests: z.string().optional(),
  referral_source: z.enum([
    "google_search",
    "social_media", 
    "friend_family_referral",
    "previous_customer",
    "local_business_referral",
    "website",
    "other"
  ]).optional(),
  theme_colors: z.string().optional(),
  
  // Wedding-specific fields (optional)
  ceremony_included: z.boolean().optional(),
  cocktail_hour: z.boolean().optional(),
}).refine((data) => {
  // Cross-field validation: serving time must be after or equal to start time
  if (data.serving_start_time && data.start_time) {
    const timeToMinutes = (time: string): number => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };
    const startMinutes = timeToMinutes(data.start_time);
    const servingMinutes = timeToMinutes(data.serving_start_time);
    return servingMinutes >= startMinutes;
  }
  return true;
}, {
  message: "Serving start time must be after or equal to event start time",
  path: ["serving_start_time"]
});