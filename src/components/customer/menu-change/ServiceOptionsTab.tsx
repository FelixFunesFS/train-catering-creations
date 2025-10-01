/**
 * ServiceOptionsTab - UI component for managing service options
 * Displays grouped service selections with toggle switches
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { MenuChanges } from '@/services/MenuChangeManager';

interface ServiceOptionsTabProps {
  quote: any;
  menuChanges: MenuChanges;
  onServiceToggle: (service: string, checked: boolean) => void;
}

export function ServiceOptionsTab({ quote, menuChanges, onServiceToggle }: ServiceOptionsTabProps) {
  const serviceGroups = [
    {
      title: 'Staff & Setup',
      items: [
        { id: 'wait_staff_requested', label: 'Wait Staff Service', current: quote.wait_staff_requested },
        { id: 'bussing_tables_needed', label: 'Bussing Service', current: quote.bussing_tables_needed },
      ]
    },
    {
      title: 'Serving Equipment',
      items: [
        { id: 'chafers_requested', label: 'Chafers (Food Warmers)', current: quote.chafers_requested },
        { id: 'serving_utensils_requested', label: 'Serving Utensils', current: quote.serving_utensils_requested },
      ]
    },
    {
      title: 'Table Setup',
      items: [
        { id: 'tables_chairs_requested', label: 'Tables & Chairs', current: quote.tables_chairs_requested },
        { id: 'linens_requested', label: 'Linens', current: quote.linens_requested },
      ]
    },
    {
      title: 'Dining Supplies',
      items: [
        { id: 'plates_requested', label: 'Plates', current: quote.plates_requested },
        { id: 'cups_requested', label: 'Cups', current: quote.cups_requested },
        { id: 'napkins_requested', label: 'Napkins', current: quote.napkins_requested },
      ]
    }
  ];

  return (
    <div className="space-y-6 pt-4">
      <p className="text-sm text-muted-foreground">
        Add or remove service options for your event
      </p>

      {serviceGroups.map((group) => (
        <div key={group.title} className="space-y-3">
          <h4 className="font-semibold text-sm">{group.title}</h4>
          <div className="space-y-2">
            {group.items.map((service) => {
              const isChanged = menuChanges.service_options.hasOwnProperty(service.id);
              const currentValue = isChanged 
                ? menuChanges.service_options[service.id]
                : service.current;

              return (
                <div 
                  key={service.id} 
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Label htmlFor={service.id} className="font-normal cursor-pointer">
                      {service.label}
                    </Label>
                    {service.current && !isChanged && (
                      <Badge variant="outline" className="text-xs">
                        Currently included
                      </Badge>
                    )}
                    {isChanged && (
                      <Badge variant="secondary" className="text-xs">
                        {currentValue ? 'Adding' : 'Removing'}
                      </Badge>
                    )}
                  </div>
                  <Switch
                    id={service.id}
                    checked={currentValue}
                    onCheckedChange={(checked) => onServiceToggle(service.id, checked)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
