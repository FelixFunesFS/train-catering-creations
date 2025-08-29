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
    "holiday_party"
  ]),
  event_date: z.string().min(1, "Event date is required"),
  start_time: z.string().min(1, "Start time is required"),
  guest_count: z.number().min(1, "Guest count must be at least 1"),
  location: z.string().min(1, "Location is required"),
  
  // Service Details  
  service_type: z.enum(["full-service", "delivery-setup", "drop-off"]),
  serving_start_time: z.string().optional(),
  wait_staff_requested: z.boolean().default(false),
  wait_staff_requirements: z.string().optional(),
  wait_staff_setup_areas: z.string().optional(),
  
  // Menu Selections
  primary_protein: z.array(z.string()).default([]),
  secondary_protein: z.array(z.string()).default([]),
  both_proteins_available: z.boolean().default(false),
  appetizers: z.array(z.string()).default([]),
  sides: z.array(z.string()).default([]),
  desserts: z.array(z.string()).default([]),
  drinks: z.array(z.string()).default([]),
  dietary_restrictions: z.array(z.string()).default([]),
  guest_count_with_restrictions: z.string().optional(),
  custom_menu_requests: z.string().optional(),
  
  // Additional Services
  tables_chairs_requested: z.boolean().default(false),
  linens_requested: z.boolean().default(false),
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
  
  // Additional Information
  special_requests: z.string().optional(),
  referral_source: z.string().optional(),
  theme_colors: z.string().optional(),
});