import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface StandardTermsAndConditionsProps {
  eventType?: 'standard' | 'wedding' | 'government';
  variant?: 'full' | 'compact';
}

export function StandardTermsAndConditions({ 
  eventType = 'standard',
  variant = 'full' 
}: StandardTermsAndConditionsProps) {
  const terms = getTermsByType(eventType);
  
  if (variant === 'compact') {
    return (
      <div className="text-sm space-y-2">
        <h4 className="font-semibold text-base">Terms & Conditions</h4>
        <ScrollArea className="h-[200px] border rounded-md p-4">
          <div className="space-y-3 text-xs">
            {terms.map((section, idx) => (
              <div key={idx}>
                <h5 className="font-medium">{section.title}</h5>
                <p className="text-muted-foreground">{section.content}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Terms & Conditions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {terms.map((section, idx) => (
          <div key={idx} className="space-y-2">
            <h4 className="font-semibold">{section.title}</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {section.content}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function getTermsByType(eventType: 'standard' | 'wedding' | 'government') {
  const baseTerms = [
    {
      title: '1. Payment Terms',
      content: 'A deposit of 50% is required to secure your event date. The remaining balance is due 10 days prior to your event. Accepted payment methods include credit card, debit card, or bank transfer.'
    },
    {
      title: '2. Cancellation Policy',
      content: 'Cancellations made more than 30 days before the event will receive a full refund minus a $100 processing fee. Cancellations made 15-30 days before will receive a 50% refund. Cancellations made less than 15 days before the event are non-refundable.'
    },
    {
      title: '3. Guest Count Changes',
      content: 'Final guest count must be confirmed 7 days prior to the event. You will be charged for the confirmed guest count or actual guests served, whichever is greater. Additional guests above the confirmed count will be charged at the per-person rate.'
    },
    {
      title: '4. Service & Delivery',
      content: 'Soul Train\'s Eatery will arrive at the designated time to set up and serve. Client is responsible for providing adequate space, access, and facilities. Any special requirements must be communicated in advance.'
    },
    {
      title: '5. Food Safety & Liability',
      content: 'All food is prepared in licensed kitchen facilities following food safety regulations. Client assumes responsibility for any food allergies or dietary restrictions not communicated in advance. Soul Train\'s Eatery is not liable for food left unrefrigerated after service.'
    },
    {
      title: '6. Equipment & Rentals',
      content: 'Standard serving equipment, chafing dishes, and utensils are included. Specialty rentals (tables, chairs, linens) are available for an additional fee and must be arranged in advance.'
    }
  ];

  if (eventType === 'wedding') {
    return [
      ...baseTerms,
      {
        title: '7. Wedding Specific Terms',
        content: 'A tasting session is included for events over 100 guests. Menu changes must be finalized 30 days before the event. Coordination with venue and other vendors is required. Setup time may vary based on venue access.'
      }
    ];
  }

  if (eventType === 'government') {
    return [
      ...baseTerms,
      {
        title: '7. Government Contract Compliance',
        content: 'All services rendered comply with applicable government procurement regulations. Proper documentation and invoicing will be provided as required. Additional compliance requirements must be specified in writing.'
      }
    ];
  }

  return baseTerms;
}

export function StandardTermsHTML(eventType: 'standard' | 'wedding' | 'government' = 'standard'): string {
  const terms = getTermsByType(eventType);
  
  return `
    <div style="font-family: Georgia, serif; padding: 20px; background: #f9fafb; border-radius: 8px;">
      <h3 style="color: #DC143C; margin-bottom: 20px;">Terms & Conditions</h3>
      ${terms.map(section => `
        <div style="margin-bottom: 15px;">
          <h4 style="color: #333; font-size: 14px; font-weight: 600; margin-bottom: 5px;">${section.title}</h4>
          <p style="color: #666; font-size: 13px; line-height: 1.6; margin: 0;">${section.content}</p>
        </div>
      `).join('')}
      <p style="font-size: 12px; color: #999; margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd;">
        By accepting this estimate, you acknowledge that you have read and agree to these terms and conditions.
      </p>
    </div>
  `;
}