import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  X, 
  Plus,
  UtensilsCrossed,
  Cookie,
  Coffee,
  CheckCircle,
  Edit,
  ArrowRight,
  Minus,
  ShoppingCart
} from 'lucide-react';

const MENU_OPTIONS = {
  appetizers: ['Deviled Eggs', 'Pimento Cheese & Crackers', 'Shrimp & Grits Cups', 'Mini Crab Cakes', 'Bacon Wrapped Scallops'],
  sides: ['Mac & Cheese', 'Collard Greens', 'Red Rice', 'Green Bean Casserole', 'Cornbread', 'Mashed Potatoes'],
  desserts: ['Peach Cobbler', 'Sweet Potato Pie', 'Banana Pudding', 'Red Velvet Cake', 'Pralines'],
  drinks: ['Sweet Tea', 'Lemonade', 'Coffee', 'Punch', 'Water', 'Soda'],
  proteins: ['Fried Chicken', 'BBQ Ribs', 'Shrimp & Grits', 'Catfish', 'Pulled Pork', 'Brisket']
};

interface MenuChangeSelectorProps {
  quote: any;
  onChange: (changes: any) => void;
}

export function MenuChangeSelector({ quote, onChange }: MenuChangeSelectorProps) {
  const [menuChanges, setMenuChanges] = useState<any>({
    proteins: { remove: [], add: [], substitute: {} },
    appetizers: { remove: [], add: [], substitute: {} },
    sides: { remove: [], add: [], substitute: {} },
    desserts: { remove: [], add: [], substitute: {} },
    drinks: { remove: [], add: [], substitute: {} },
    dietary_restrictions: { add: [] },
    service_options: {},
    custom_requests: ''
  });
  const [activeTab, setActiveTab] = useState('remove');

  const formatArrayField = (field: any): string[] => {
    if (Array.isArray(field)) return field;
    if (typeof field === 'string') {
      try {
        const parsed = JSON.parse(field);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  const currentAppetizers = formatArrayField(quote.appetizers);
  const currentSides = formatArrayField(quote.sides);
  const currentDesserts = formatArrayField(quote.desserts);
  const currentDrinks = formatArrayField(quote.drinks);

  const handleToggleRemove = (category: string, item: string) => {
    setMenuChanges((prev: any) => {
      const updated = { ...prev };
      const removeList = updated[category].remove || [];
      
      if (removeList.includes(item)) {
        updated[category].remove = removeList.filter((i: string) => i !== item);
      } else {
        updated[category].remove = [...removeList, item];
      }
      
      onChange(updated);
      return updated;
    });
  };

  const handleAddItem = (category: string, item: string) => {
    if (!item) return;
    setMenuChanges((prev: any) => {
      const updated = { ...prev };
      const addList = updated[category].add || [];
      
      if (!addList.includes(item)) {
        updated[category].add = [...addList, item];
      }
      
      onChange(updated);
      return updated;
    });
  };

  const handleRemoveAddition = (category: string, item: string) => {
    setMenuChanges((prev: any) => {
      const updated = { ...prev };
      updated[category].add = (updated[category].add || []).filter((i: string) => i !== item);
      onChange(updated);
      return updated;
    });
  };

  const handleSubstitute = (category: string, oldItem: string, newItem: string) => {
    if (!newItem || newItem === oldItem) return;
    setMenuChanges((prev: any) => {
      const updated = { ...prev };
      updated[category].substitute = {
        ...updated[category].substitute,
        [oldItem]: newItem
      };
      onChange(updated);
      return updated;
    });
  };

  const handleServiceToggle = (service: string, checked: boolean) => {
    setMenuChanges((prev: any) => {
      const updated = {
        ...prev,
        service_options: {
          ...prev.service_options,
          [service]: checked
        }
      };
      onChange(updated);
      return updated;
    });
  };

  const handleCustomRequestChange = (value: string) => {
    setMenuChanges((prev: any) => {
      const updated = { ...prev, custom_requests: value };
      onChange(updated);
      return updated;
    });
  };

  const hasChanges = () => {
    return (
      menuChanges.proteins.remove.length > 0 ||
      menuChanges.proteins.add.length > 0 ||
      Object.keys(menuChanges.proteins.substitute).length > 0 ||
      menuChanges.appetizers.remove.length > 0 ||
      menuChanges.appetizers.add.length > 0 ||
      Object.keys(menuChanges.appetizers.substitute).length > 0 ||
      menuChanges.sides.remove.length > 0 ||
      menuChanges.sides.add.length > 0 ||
      Object.keys(menuChanges.sides.substitute).length > 0 ||
      menuChanges.desserts.remove.length > 0 ||
      menuChanges.desserts.add.length > 0 ||
      Object.keys(menuChanges.desserts.substitute).length > 0 ||
      menuChanges.drinks.remove.length > 0 ||
      menuChanges.drinks.add.length > 0 ||
      Object.keys(menuChanges.drinks.substitute).length > 0 ||
      Object.keys(menuChanges.service_options).length > 0 ||
      menuChanges.custom_requests.trim().length > 0
    );
  };

  const getAvailableItems = (category: string) => {
    const currentItems = formatArrayField(quote[category]);
    const addedItems = menuChanges[category].add || [];
    const allCurrentItems = [...currentItems, ...addedItems];
    
    return MENU_OPTIONS[category as keyof typeof MENU_OPTIONS]?.filter(
      (item: string) => !allCurrentItems.includes(item)
    ) || [];
  };

  const RemoveItemsTab = () => (
    <div className="space-y-6 pt-4">
      <p className="text-sm text-muted-foreground">
        Click on any item below to mark it for removal from your menu
      </p>

      {/* Proteins */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
          <h4 className="font-semibold">Proteins</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {quote.primary_protein && (
            <Badge
              variant={menuChanges.proteins.remove.includes('primary') ? "destructive" : "secondary"}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => handleToggleRemove('proteins', 'primary')}
            >
              {menuChanges.proteins.remove.includes('primary') ? (
                <>
                  <Minus className="h-3 w-3 mr-1" />
                  Removing: {quote.primary_protein}
                </>
              ) : (
                <>
                  Primary: {quote.primary_protein}
                  <X className="h-3 w-3 ml-1 opacity-50" />
                </>
              )}
            </Badge>
          )}
          {quote.secondary_protein && (
            <Badge
              variant={menuChanges.proteins.remove.includes('secondary') ? "destructive" : "secondary"}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => handleToggleRemove('proteins', 'secondary')}
            >
              {menuChanges.proteins.remove.includes('secondary') ? (
                <>
                  <Minus className="h-3 w-3 mr-1" />
                  Removing: {quote.secondary_protein}
                </>
              ) : (
                <>
                  Secondary: {quote.secondary_protein}
                  <X className="h-3 w-3 ml-1 opacity-50" />
                </>
              )}
            </Badge>
          )}
        </div>
      </div>

      {/* Other Categories */}
      {[
        { key: 'appetizers', title: 'Appetizers', icon: Cookie },
        { key: 'sides', title: 'Sides', icon: UtensilsCrossed },
        { key: 'desserts', title: 'Desserts', icon: Cookie },
        { key: 'drinks', title: 'Drinks', icon: Coffee }
      ].map(({ key, title, icon: Icon }) => {
        const items = formatArrayField(quote[key]);
        if (items.length === 0) return null;

        return (
          <div key={key} className="space-y-3">
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-semibold">{title}</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {items.map((item, index) => {
                const isRemoving = menuChanges[key]?.remove?.includes(item);
                return (
                  <Badge
                    key={index}
                    variant={isRemoving ? "destructive" : "secondary"}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => handleToggleRemove(key, item)}
                  >
                    {isRemoving ? (
                      <>
                        <Minus className="h-3 w-3 mr-1" />
                        Removing: {item}
                      </>
                    ) : (
                      <>
                        {item}
                        <X className="h-3 w-3 ml-1 opacity-50" />
                      </>
                    )}
                  </Badge>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );

  const AddItemsTab = () => (
    <div className="space-y-6 pt-4">
      <p className="text-sm text-muted-foreground">
        Select items from our menu to add to your order
      </p>

      {[
        { key: 'appetizers', title: 'Appetizers', icon: Cookie },
        { key: 'sides', title: 'Sides', icon: UtensilsCrossed },
        { key: 'desserts', title: 'Desserts', icon: Cookie },
        { key: 'drinks', title: 'Drinks', icon: Coffee }
      ].map(({ key, title, icon: Icon }) => {
        const availableItems = getAvailableItems(key);
        const addedItems = menuChanges[key].add || [];

        return (
          <div key={key} className="space-y-3">
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-semibold">{title}</h4>
            </div>
            
            {/* Dropdown to add items */}
            <Select onValueChange={(value) => handleAddItem(key, value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={`Add ${title.toLowerCase()}...`} />
              </SelectTrigger>
              <SelectContent>
                {availableItems.length > 0 ? (
                  availableItems.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="_none" disabled>
                    No items available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>

            {/* Display added items */}
            {addedItems.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {addedItems.map((item, index) => (
                  <Badge key={index} variant="default" className="gap-1">
                    <Plus className="h-3 w-3" />
                    {item}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer hover:text-destructive" 
                      onClick={() => handleRemoveAddition(key, item)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Add protein note */}
      <div className="rounded-lg border p-3 bg-muted/50">
        <p className="text-xs text-muted-foreground">
          <strong>Note:</strong> To change proteins, please use the custom requests tab or contact us directly.
        </p>
      </div>
    </div>
  );

  const ServiceOptionsTab = () => {
    const serviceGroups = [
      {
        title: 'Staff & Setup',
        items: [
          { id: 'wait_staff_requested', label: 'Wait Staff', current: quote.wait_staff_requested },
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
                  <div key={service.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
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
                      onCheckedChange={(checked) => handleServiceToggle(service.id, checked)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Request Menu Changes
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Customize your menu selections using the organized tabs below
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="remove" className="text-xs sm:text-sm">
              <Minus className="h-4 w-4 mr-1" />
              Remove Items
            </TabsTrigger>
            <TabsTrigger value="add" className="text-xs sm:text-sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Items
            </TabsTrigger>
            <TabsTrigger value="services" className="text-xs sm:text-sm">
              <CheckCircle className="h-4 w-4 mr-1" />
              Services
            </TabsTrigger>
          </TabsList>

          <TabsContent value="remove">
            <RemoveItemsTab />
          </TabsContent>

          <TabsContent value="add">
            <AddItemsTab />
          </TabsContent>

          <TabsContent value="services">
            <ServiceOptionsTab />
          </TabsContent>
        </Tabs>

        {/* Custom Requests Section */}
        <div className="mt-6 space-y-3">
          <Label htmlFor="custom-requests" className="flex items-center gap-2 font-semibold">
            <Edit className="h-4 w-4" />
            Additional Custom Requests
          </Label>
          <Textarea
            id="custom-requests"
            placeholder="Have a special request? Let us know here! Examples: dietary substitutions, specific preparations, timing requirements, etc."
            value={menuChanges.custom_requests}
            onChange={(e) => handleCustomRequestChange(e.target.value)}
            rows={3}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Describe any special requests not covered above
          </p>
        </div>

        {/* Changes Summary */}
        {hasChanges() && (
          <div className="mt-6 border rounded-lg p-4 bg-accent/50">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="h-4 w-4 text-primary" />
              <h4 className="font-semibold">Your Change Summary</h4>
            </div>
            <div className="space-y-2 text-sm">
              {/* Removals */}
              {['proteins', 'appetizers', 'sides', 'desserts', 'drinks'].map((category) => {
                const removes = menuChanges[category]?.remove || [];
                if (removes.length === 0) return null;
                return (
                  <div key={`remove-${category}`} className="flex items-start gap-2">
                    <Minus className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      Remove {category}: <span className="font-medium text-foreground">{removes.join(', ')}</span>
                    </span>
                  </div>
                );
              })}

              {/* Additions */}
              {['appetizers', 'sides', 'desserts', 'drinks'].map((category) => {
                const adds = menuChanges[category]?.add || [];
                if (adds.length === 0) return null;
                return (
                  <div key={`add-${category}`} className="flex items-start gap-2">
                    <Plus className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      Add {category}: <span className="font-medium text-foreground">{adds.join(', ')}</span>
                    </span>
                  </div>
                );
              })}

              {/* Service Changes */}
              {Object.keys(menuChanges.service_options).length > 0 && (
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">
                    Service updates: <span className="font-medium text-foreground">{Object.keys(menuChanges.service_options).length} change(s)</span>
                  </span>
                </div>
              )}

              {/* Custom Requests */}
              {menuChanges.custom_requests.trim() && (
                <div className="flex items-start gap-2">
                  <Edit className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">
                    Custom requests provided
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
