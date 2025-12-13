import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useCateringAgreement, CateringAgreementTerms, DEFAULT_TERMS } from '@/hooks/useCateringAgreement';
import { PenLine } from 'lucide-react';

interface StandardTermsAndConditionsProps {
  eventType?: 'standard' | 'wedding' | 'government';
  variant?: 'full' | 'compact';
}

export function StandardTermsAndConditions({ 
  eventType = 'standard',
  variant = 'full' 
}: StandardTermsAndConditionsProps) {
  const { data: terms, isLoading } = useCateringAgreement();
  
  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  const agreementTerms = terms || DEFAULT_TERMS;

  // Add government-specific terms if applicable
  const sections = eventType === 'government' 
    ? [...agreementTerms.sections, {
        title: "Government Contract Compliance",
        description: "Payment terms follow Net 30 schedule (100% due 30 days after event completion). Tax-exempt status applies. PO number required for billing."
      }]
    : agreementTerms.sections;
  
  if (variant === 'compact') {
    return (
      <div className="text-sm space-y-2">
        <h4 className="font-semibold text-base">{agreementTerms.agreement_title}</h4>
        <ScrollArea className="h-[200px] border rounded-md p-4">
          <div className="space-y-4 text-xs">
            <p className="text-muted-foreground italic">{agreementTerms.intro_text}</p>
            
            {sections.map((section, idx) => (
              <div key={idx}>
                <h5 className="font-medium text-foreground">{section.title}</h5>
                {section.description && (
                  <p className="text-muted-foreground mt-1">{section.description}</p>
                )}
                {section.items && section.items.length > 0 && (
                  <ul className="list-disc pl-4 mt-1 space-y-1 text-muted-foreground">
                    {section.items.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
            
            <p className="text-muted-foreground font-medium mt-4">{agreementTerms.acceptance_text}</p>
            <p className="text-muted-foreground italic">{agreementTerms.closing_text}</p>
            
            <div className="mt-4 pt-4 border-t">
              <p className="font-medium">{agreementTerms.owner_signature.name}</p>
              <p className="text-muted-foreground text-xs">{agreementTerms.owner_signature.title}</p>
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PenLine className="h-5 w-5 text-primary" />
          {agreementTerms.agreement_title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground italic leading-relaxed">
          {agreementTerms.intro_text}
        </p>
        
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-2">
            <h4 className="font-semibold">{section.title}</h4>
            {section.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {section.description}
              </p>
            )}
            {section.items && section.items.length > 0 && (
              <ul className="list-disc pl-5 space-y-1">
                {section.items.map((item, i) => (
                  <li key={i} className="text-sm text-muted-foreground leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
        
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <p className="text-sm font-medium">{agreementTerms.acceptance_text}</p>
          <p className="text-sm text-muted-foreground italic">{agreementTerms.closing_text}</p>
        </div>
        
        <div className="pt-4 border-t flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <PenLine className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold">{agreementTerms.owner_signature.name}</p>
            <p className="text-sm text-muted-foreground">{agreementTerms.owner_signature.title}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Generate HTML version for emails
export function StandardTermsHTML(eventType: 'standard' | 'wedding' | 'government' = 'standard'): string {
  const terms = DEFAULT_TERMS;
  
  const sections = eventType === 'government' 
    ? [...terms.sections, {
        title: "Government Contract Compliance",
        description: "Payment terms follow Net 30 schedule (100% due 30 days after event completion). Tax-exempt status applies. PO number required for billing."
      }]
    : terms.sections;
  
  return `
    <div style="font-family: Georgia, serif; padding: 24px; background: #f9fafb; border-radius: 12px; margin: 24px 0;">
      <h3 style="color: #DC143C; margin: 0 0 16px 0; font-size: 20px; display: flex; align-items: center; gap: 8px;">
        📝 ${terms.agreement_title}
      </h3>
      
      <p style="color: #666; font-size: 13px; line-height: 1.6; margin: 0 0 20px 0; font-style: italic;">
        ${terms.intro_text}
      </p>
      
      ${sections.map(section => `
        <div style="margin-bottom: 20px;">
          <h4 style="color: #333; font-size: 15px; font-weight: 600; margin: 0 0 8px 0; border-bottom: 2px solid #FFD700; padding-bottom: 4px;">
            ${section.title}
          </h4>
          ${section.description ? `<p style="color: #666; font-size: 13px; line-height: 1.6; margin: 0 0 8px 0;">${section.description}</p>` : ''}
          ${section.items && section.items.length > 0 ? `
            <ul style="margin: 0; padding-left: 20px;">
              ${section.items.map(item => `<li style="color: #666; font-size: 13px; line-height: 1.6; margin-bottom: 6px;">${item}</li>`).join('')}
            </ul>
          ` : ''}
        </div>
      `).join('')}
      
      <div style="background: #fff; padding: 16px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #FFD700;">
        <p style="font-size: 13px; color: #333; margin: 0 0 8px 0; font-weight: 600;">
          ${terms.acceptance_text}
        </p>
        <p style="font-size: 13px; color: #666; margin: 0; font-style: italic;">
          ${terms.closing_text}
        </p>
      </div>
      
      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #ddd; display: flex; align-items: center; gap: 12px;">
        <div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #DC143C, #B01030); display: flex; align-items: center; justify-content: center; color: white; font-size: 20px;">
          ✍️
        </div>
        <div>
          <p style="margin: 0; font-weight: 600; color: #333; font-size: 14px;">${terms.owner_signature.name}</p>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #666;">${terms.owner_signature.title}</p>
        </div>
      </div>
    </div>
  `;
}
