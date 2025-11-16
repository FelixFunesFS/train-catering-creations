import { Badge } from "@/components/ui/badge";

interface Quote {
  event_type: string;
  service_type: string;
  primary_protein?: string;
  secondary_protein?: string;
  both_proteins_available?: boolean;
  sides?: string[];
  appetizers?: string[];
  desserts?: string[];
  drinks?: string[];
  dietary_restrictions?: string[];
  special_requests?: string;
  wait_staff_requested?: boolean;
  ceremony_included?: boolean;
  cocktail_hour?: boolean;
}

interface QuoteMenuDisplayProps {
  quote: Quote;
}

const formatLabel = (value: string) => {
  return value
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export function QuoteMenuDisplay({ quote }: QuoteMenuDisplayProps) {
  return (
    <div className="space-y-3 text-sm">
      {/* Service Info */}
      <div className="flex gap-2 flex-wrap">
        <Badge variant="secondary">
          {formatLabel(quote.service_type)}
        </Badge>
        <Badge variant="outline">
          {formatLabel(quote.event_type)}
        </Badge>
      </div>

      {/* Proteins */}
      {(quote.primary_protein || quote.secondary_protein) && (
        <div>
          <label className="font-medium text-muted-foreground block mb-1">Proteins</label>
          <div className="flex flex-wrap gap-1">
            {quote.primary_protein && (
              <Badge variant="default">{formatLabel(quote.primary_protein)}</Badge>
            )}
            {quote.secondary_protein && (
              <Badge variant="default">{formatLabel(quote.secondary_protein)}</Badge>
            )}
            {quote.both_proteins_available && (
              <Badge variant="outline" className="text-xs">Both Available</Badge>
            )}
          </div>
        </div>
      )}

      {/* Sides */}
      {quote.sides && quote.sides.length > 0 && (
        <div>
          <label className="font-medium text-muted-foreground block mb-1">
            Sides ({quote.sides.length})
          </label>
          <p className="text-foreground/80">{quote.sides.map(formatLabel).join(', ')}</p>
        </div>
      )}

      {/* Appetizers */}
      {quote.appetizers && quote.appetizers.length > 0 && (
        <div>
          <label className="font-medium text-muted-foreground block mb-1">
            Appetizers ({quote.appetizers.length})
          </label>
          <p className="text-foreground/80">{quote.appetizers.map(formatLabel).join(', ')}</p>
        </div>
      )}

      {/* Desserts */}
      {quote.desserts && quote.desserts.length > 0 && (
        <div>
          <label className="font-medium text-muted-foreground block mb-1">
            Desserts ({quote.desserts.length})
          </label>
          <p className="text-foreground/80">{quote.desserts.map(formatLabel).join(', ')}</p>
        </div>
      )}

      {/* Drinks */}
      {quote.drinks && quote.drinks.length > 0 && (
        <div>
          <label className="font-medium text-muted-foreground block mb-1">
            Beverages ({quote.drinks.length})
          </label>
          <p className="text-foreground/80">{quote.drinks.map(formatLabel).join(', ')}</p>
        </div>
      )}

      {/* Dietary Restrictions */}
      {quote.dietary_restrictions && quote.dietary_restrictions.length > 0 && (
        <div>
          <label className="font-medium text-muted-foreground block mb-1">
            Dietary Restrictions
          </label>
          <div className="flex flex-wrap gap-1">
            {quote.dietary_restrictions.map((restriction, i) => (
              <Badge key={i} variant="destructive">{formatLabel(restriction)}</Badge>
            ))}
          </div>
        </div>
      )}

      {/* Add-ons & Services */}
      {(quote.wait_staff_requested || quote.ceremony_included || quote.cocktail_hour) && (
        <div>
          <label className="font-medium text-muted-foreground block mb-1">
            Additional Services
          </label>
          <div className="flex flex-wrap gap-1">
            {quote.wait_staff_requested && <Badge variant="outline">Wait Staff</Badge>}
            {quote.ceremony_included && <Badge variant="outline">Ceremony Service</Badge>}
            {quote.cocktail_hour && <Badge variant="outline">Cocktail Hour</Badge>}
          </div>
        </div>
      )}

      {/* Special Requests */}
      {quote.special_requests && (
        <div>
          <label className="font-medium text-muted-foreground block mb-1">
            Special Requests
          </label>
          <p className="text-foreground/80 text-sm">{quote.special_requests}</p>
        </div>
      )}
    </div>
  );
}
