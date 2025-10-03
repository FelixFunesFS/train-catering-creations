interface CalendarEventData {
  eventName: string;
  eventDate: string;
  startTime?: string;
  location?: string;
  description?: string;
  contactName?: string;
}

export const generateICSFile = (data: CalendarEventData): string => {
  const {
    eventName,
    eventDate,
    startTime = '12:00',
    location = '',
    description = '',
    contactName = ''
  } = data;

  // Parse date and time
  const eventDateTime = new Date(`${eventDate}T${startTime}`);
  const endDateTime = new Date(eventDateTime.getTime() + 4 * 60 * 60 * 1000); // +4 hours default

  // Format dates for ICS (YYYYMMDDTHHmmss)
  const formatICSDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Soul Train\'s Eatery//Quote Request//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `DTSTART:${formatICSDate(eventDateTime)}`,
    `DTEND:${formatICSDate(endDateTime)}`,
    `DTSTAMP:${formatICSDate(new Date())}`,
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

  const eventDateTime = new Date(`${eventDate}T${startTime}`);
  const endDateTime = new Date(eventDateTime.getTime() + 4 * 60 * 60 * 1000);

  const formatGoogleDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${eventName} - Soul Train's Eatery Catering`,
    dates: `${formatGoogleDate(eventDateTime)}/${formatGoogleDate(endDateTime)}`,
    details: `Catering event for ${contactName || 'your event'}. ${description}\n\nContact: Soul Train's Eatery\nPhone: (843) 970-0265\nEmail: soultrainseatery@gmail.com`,
    location: location
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};
