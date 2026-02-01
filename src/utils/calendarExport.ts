interface CalendarEventData {
  eventName: string;
  eventDate: string;
  startTime?: string;
  location?: string;
  description?: string;
  contactName?: string;
}

// Format date as local floating time (no timezone suffix)
const formatICSDateLocal = (date: Date): string => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
};

// Format menu IDs to readable text
const formatMenuId = (id: string): string => {
  const specialCases: Record<string, string> = {
    'mac-cheese': 'Mac & Cheese',
    'green-beans-potatoes': 'Green Beans & Potatoes',
    'collard-greens': 'Collard Greens',
    'fried-chicken': 'Fried Chicken',
    'turkey-wings': 'Turkey Wings',
    'pulled-pork': 'Pulled Pork',
    'smoked-brisket': 'Smoked Brisket',
    'fried-fish': 'Fried Fish',
    'candied-yams': 'Candied Yams',
    'potato-salad': 'Potato Salad',
    'coleslaw': 'Coleslaw',
    'baked-beans': 'Baked Beans',
    'corn-on-cob': 'Corn on the Cob',
    'sweet-tea': 'Sweet Tea',
    'fresh-lemonade': 'Fresh Lemonade',
    'peach-cobbler': 'Peach Cobbler',
    'banana-pudding': 'Banana Pudding',
    'gluten-free': 'Gluten-Free',
    'dairy-free': 'Dairy-Free',
    'nut-free': 'Nut-Free',
    'vegan': 'Vegan',
    'vegetarian': 'Vegetarian',
  };
  return specialCases[id] || id.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

// Format service type to readable text
const formatServiceType = (type: string): string => {
  const labels: Record<string, string> = {
    'full-service': 'Full Service',
    'delivery-only': 'Delivery Only',
    'drop-off': 'Drop-Off',
    'buffet': 'Buffet',
    'plated': 'Plated',
    'family-style': 'Family Style',
  };
  return labels[type] || type.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

// Format event type to readable text
const formatEventType = (type: string): string => {
  const labels: Record<string, string> = {
    'private_party': 'Private Party',
    'birthday': 'Birthday',
    'military_function': 'Military Function',
    'wedding': 'Wedding',
    'corporate': 'Corporate',
    'graduation': 'Graduation',
  };
  return labels[type] || type.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

export const generateICSFile = (data: CalendarEventData): string => {
  const {
    eventName,
    eventDate,
    startTime = '12:00',
    location = '',
    description = '',
    contactName = ''
  } = data;

  // Parse date and time using local components
  const [year, month, day] = eventDate.split('-').map(Number);
  const [hours, minutes] = startTime.split(':').map(Number);
  
  const eventDateTime = new Date(year, month - 1, day, hours, minutes, 0);
  const endDateTime = new Date(eventDateTime.getTime() + 4 * 60 * 60 * 1000); // +4 hours default

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Soul Train\'s Eatery//Quote Request//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `DTSTART:${formatICSDateLocal(eventDateTime)}`,
    `DTEND:${formatICSDateLocal(endDateTime)}`,
    `DTSTAMP:${formatICSDateLocal(new Date())}`,
    `UID:${crypto.randomUUID()}@soultrainseatery.com`,
    `SUMMARY:${eventName} - Soul Train's Eatery Catering`,
    `DESCRIPTION:Catering event for ${contactName || 'your event'}. ${description}\\n\\nContact: Soul Train's Eatery\\nPhone: (843) 970-0265\\nEmail: soultrainseatery@gmail.com`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'DESCRIPTION:Reminder: Event tomorrow',
    'ACTION:DISPLAY',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  return icsContent;
};

export const downloadICSFile = (data: CalendarEventData): void => {
  const icsContent = generateICSFile(data);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${data.eventName.replace(/[^a-z0-9]/gi, '_')}_catering.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

export const getGoogleCalendarUrl = (data: CalendarEventData): string => {
  const {
    eventName,
    eventDate,
    startTime = '12:00',
    location = '',
    description = '',
    contactName = ''
  } = data;

  // Parse date and time using local components
  const [year, month, day] = eventDate.split('-').map(Number);
  const [hours, minutes] = startTime.split(':').map(Number);
  
  const eventDateTime = new Date(year, month - 1, day, hours, minutes, 0);
  const endDateTime = new Date(eventDateTime.getTime() + 4 * 60 * 60 * 1000);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${eventName} - Soul Train's Eatery Catering`,
    dates: `${formatICSDateLocal(eventDateTime)}/${formatICSDateLocal(endDateTime)}`,
    details: `Catering event for ${contactName || 'your event'}. ${description}\n\nContact: Soul Train's Eatery\nPhone: (843) 970-0265\nEmail: soultrainseatery@gmail.com`,
    location: location
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

// Staff-specific calendar event data (excludes pricing)
interface StaffCalendarEventData {
  eventName: string;
  eventDate: string;
  eventStartTime?: string;
  staffArrivalTime?: string;
  location?: string;
  guestCount?: number;
  serviceType?: string;
  eventType?: string;
  notes?: string;
  
  // Menu (all categories)
  proteins?: string[];
  sides?: string[];
  appetizers?: string[];
  desserts?: string[];
  drinks?: string[];
  vegetarianOptions?: string[];
  dietaryRestrictions?: string[];
  specialRequests?: string | null;
  
  // Equipment (boolean flags)
  chafersRequested?: boolean;
  platesRequested?: boolean;
  cupsRequested?: boolean;
  napkinsRequested?: boolean;
  servingUtensilsRequested?: boolean;
  iceRequested?: boolean;
  
  // Services
  waitStaffRequested?: boolean;
  bussingTablesNeeded?: boolean;
  cocktailHour?: boolean;
  
  // Staff assignments (replaces staffRole)
  staffAssignments?: Array<{
    name: string;
    role: string;
  }>;
}

const SITE_URL = 'https://www.soultrainseatery.com';

export const generateStaffICSFile = (data: StaffCalendarEventData): string => {
  const {
    eventName,
    eventDate,
    eventStartTime,
    staffArrivalTime,
    location = '',
    guestCount,
    serviceType,
    eventType,
    proteins = [],
    sides = [],
    appetizers = [],
    desserts = [],
    drinks = [],
    vegetarianOptions = [],
    dietaryRestrictions = [],
    specialRequests,
    chafersRequested,
    platesRequested,
    cupsRequested,
    napkinsRequested,
    servingUtensilsRequested,
    iceRequested,
    waitStaffRequested,
    bussingTablesNeeded,
    cocktailHour,
    staffAssignments = [],
    notes = ''
  } = data;

  // Use arrival time as the calendar event start (staff perspective)
  const startTime = staffArrivalTime || eventStartTime || '12:00';
  
  // Parse date and time using local components
  const [year, month, day] = eventDate.split('-').map(Number);
  const [hours, minutes] = startTime.split(':').map(Number);
  
  const eventDateTime = new Date(year, month - 1, day, hours, minutes, 0);
  const endDateTime = new Date(eventDateTime.getTime() + 6 * 60 * 60 * 1000); // +6 hours for staff

  // Build maps URL
  const mapsUrl = location ? `https://maps.google.com/?q=${encodeURIComponent(location)}` : '';

  // Build equipment list
  const equipmentList: string[] = [];
  if (chafersRequested) equipmentList.push('Chafers');
  if (platesRequested) equipmentList.push('Plates');
  if (cupsRequested) equipmentList.push('Cups');
  if (napkinsRequested) equipmentList.push('Napkins');
  if (servingUtensilsRequested) equipmentList.push('Serving Utensils');
  if (iceRequested) equipmentList.push('Ice');

  // Build services list
  const servicesList: string[] = [];
  if (waitStaffRequested) servicesList.push('Wait Staff');
  if (bussingTablesNeeded) servicesList.push('Bussing Tables');
  if (cocktailHour) servicesList.push('Cocktail Hour');

  // Format time for display
  const formatTimeDisplay = (time: string): string => {
    const [h, m] = time.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    return `${displayHour}:${String(m).padStart(2, '0')} ${period}`;
  };

  // Check if menu items exist
  const hasMenuItems = proteins.length > 0 || sides.length > 0 || appetizers.length > 0 || 
                       desserts.length > 0 || drinks.length > 0 || vegetarianOptions.length > 0;

  // Build staff-focused description with visual sections
  const descriptionParts: string[] = [
    // Address shown as readable text, with shorter maps link
    location ? `Address: ${location}` : '',
    location ? `Get Directions: maps.google.com/?q=${encodeURIComponent(location)}` : '',
    `Staff View: soultrainseatery.com/staff`,
    '',
    // Staff Assigned section
    staffAssignments.length > 0 
      ? `Staff Assigned: ${staffAssignments.map(s => `${s.name} (${s.role})`).join(', ')}`
      : '',
    '',
    // Event Details section with separator
    '--------',
    'EVENT DETAILS',
    '--------',
    eventStartTime ? `Event starts: ${formatTimeDisplay(eventStartTime)}` : '',
    guestCount ? `Guests: ${guestCount}` : '',
    serviceType ? `Service: ${formatServiceType(serviceType)}` : '',
    eventType ? `Type: ${formatEventType(eventType)}` : '',
    '',
    // Equipment & Services section (conditional)
    ...(equipmentList.length > 0 || servicesList.length > 0 ? [
      '--------',
      'EQUIPMENT & SERVICES',
      '--------',
      equipmentList.length > 0 ? `Equipment: ${equipmentList.join(', ')}` : '',
      servicesList.length > 0 ? `Services: ${servicesList.join(', ')}` : '',
      ''
    ] : []),
    // Menu section (conditional)
    ...(hasMenuItems ? [
      '--------',
      'MENU',
      '--------',
      proteins.length > 0 ? `Proteins: ${proteins.map(formatMenuId).join(', ')}` : '',
      sides.length > 0 ? `Sides: ${sides.map(formatMenuId).join(', ')}` : '',
      appetizers.length > 0 ? `Appetizers: ${appetizers.map(formatMenuId).join(', ')}` : '',
      desserts.length > 0 ? `Desserts: ${desserts.map(formatMenuId).join(', ')}` : '',
      drinks.length > 0 ? `Drinks: ${drinks.map(formatMenuId).join(', ')}` : '',
      vegetarianOptions.length > 0 ? `Vegetarian: ${vegetarianOptions.map(formatMenuId).join(', ')}` : '',
      ''
    ] : []),
    // Special Notes section (conditional)
    ...(dietaryRestrictions.length > 0 || specialRequests || notes ? [
      '--------',
      'SPECIAL NOTES',
      '--------',
      dietaryRestrictions.length > 0 
        ? `DIETARY: ${dietaryRestrictions.map(formatMenuId).join(', ')}`
        : '',
      specialRequests ? `Special Requests: ${specialRequests}` : '',
      notes ? `Notes: ${notes}` : '',
      ''
    ] : []),
    // Contact footer
    `Contact: Soul Train's Eatery`,
    `(843) 970-0265 | soultrainseatery@gmail.com`
  ].filter(Boolean);

  // Escape special characters for ICS format
  const escapeICS = (text: string): string => {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Soul Train\'s Eatery//Staff Schedule//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `DTSTART:${formatICSDateLocal(eventDateTime)}`,
    `DTEND:${formatICSDateLocal(endDateTime)}`,
    `DTSTAMP:${formatICSDateLocal(new Date())}`,
    `UID:${crypto.randomUUID()}@soultrainseatery.com`,
    `SUMMARY:${escapeICS(eventName)}`,
    `DESCRIPTION:${escapeICS(descriptionParts.join('\n'))}`,
    `LOCATION:${escapeICS(location)}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'BEGIN:VALARM',
    'TRIGGER:-PT2H',
    'DESCRIPTION:Reminder: Arrive in 2 hours',
    'ACTION:DISPLAY',
    'END:VALARM',
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'DESCRIPTION:Reminder: Event tomorrow',
    'ACTION:DISPLAY',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  return icsContent;
};

export const downloadStaffICSFile = (data: StaffCalendarEventData): void => {
  const icsContent = generateStaffICSFile(data);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  
  const safeName = data.eventName.replace(/[^a-z0-9]/gi, '_');
  link.download = `${safeName}_staff_event.ics`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

export type { StaffCalendarEventData };
