/**
 * ResponseTemplates - Pre-written responses for common scenarios
 * Speeds up admin processing with consistent messaging
 */

export interface ResponseTemplate {
  id: string;
  label: string;
  category: 'approval' | 'rejection' | 'clarification';
  message: string;
  requiresCostInput?: boolean;
}

export const RESPONSE_TEMPLATES: ResponseTemplate[] = [
  // Approvals
  {
    id: 'approve_menu_swap',
    label: 'Menu Substitution Approved',
    category: 'approval',
    message: 'Perfect! We\'ve updated your menu selections. These substitutions don\'t affect your total price. Your revised estimate is ready to review.'
  },
  {
    id: 'approve_guest_increase',
    label: 'Guest Count Increase',
    category: 'approval',
    message: 'We can absolutely accommodate your additional guests! We\'ve updated your estimate with the new pricing.',
    requiresCostInput: true
  },
  {
    id: 'approve_guest_decrease',
    label: 'Guest Count Decrease',
    category: 'approval',
    message: 'No problem, we\'ve adjusted your guest count and pricing accordingly. Your updated estimate reflects the change.',
    requiresCostInput: true
  },
  {
    id: 'approve_date_change',
    label: 'Date Change Approved',
    category: 'approval',
    message: 'Great news! Your new event date is available and we\'ve updated your estimate. All other details remain the same.'
  },
  {
    id: 'approve_time_change',
    label: 'Time Change Approved',
    category: 'approval',
    message: 'We\'ve confirmed your new event time. Everything else stays as planned!'
  },

  // Rejections / Cannot Accommodate
  {
    id: 'reject_date_unavailable',
    label: 'Date Not Available',
    category: 'rejection',
    message: 'Unfortunately, we\'re already booked for your requested date. However, we have availability on [suggest alternative dates]. Would any of these work for you?'
  },
  {
    id: 'reject_menu_unavailable',
    label: 'Menu Item Unavailable',
    category: 'rejection',
    message: 'We apologize, but that menu item isn\'t available for your event date. We\'d love to suggest some similar alternatives that might work even better!'
  },
  {
    id: 'reject_too_many_guests',
    label: 'Exceeds Capacity',
    category: 'rejection',
    message: 'Unfortunately, this guest count exceeds our standard service capacity. Let\'s schedule a call to discuss how we can best accommodate your needs - we may be able to work something out!'
  },
  {
    id: 'reject_insufficient_notice',
    label: 'Insufficient Lead Time',
    category: 'rejection',
    message: 'We appreciate your interest, but this change is too close to your event date for us to accommodate safely. Let\'s discuss what options we have to make your current booking perfect!'
  },

  // Clarification / Counter-Offers
  {
    id: 'clarify_menu_details',
    label: 'Need Menu Clarification',
    category: 'clarification',
    message: 'We want to make sure we get this exactly right! Could you provide a bit more detail about your menu preferences? Specifically: [list what you need to know]'
  },
  {
    id: 'clarify_guest_count',
    label: 'Guest Count Confirmation',
    category: 'clarification',
    message: 'Just to confirm - you mentioned [X] guests. Is this a firm number or are you still expecting changes? This helps us prepare the right amount of food!'
  },
  {
    id: 'counter_alternative_menu',
    label: 'Suggest Menu Alternative',
    category: 'clarification',
    message: 'We have a wonderful alternative that might work even better! Instead of [original], how about [alternative]? It\'s [describe benefits]. Would you like to see updated pricing for this option?'
  },
  {
    id: 'counter_schedule_call',
    label: 'Schedule Discussion',
    category: 'clarification',
    message: 'Your request involves several changes that we\'d love to discuss with you personally. Can we schedule a quick 10-minute call? This way we can make sure we capture exactly what you need!'
  }
];

export class ResponseTemplateService {
  static getTemplate(id: string): ResponseTemplate | undefined {
    return RESPONSE_TEMPLATES.find(t => t.id === id);
  }

  static getTemplatesByCategory(category: ResponseTemplate['category']): ResponseTemplate[] {
    return RESPONSE_TEMPLATES.filter(t => t.category === category);
  }

  static getAllTemplates(): ResponseTemplate[] {
    return RESPONSE_TEMPLATES;
  }
}
