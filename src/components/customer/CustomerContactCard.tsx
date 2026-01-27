import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Phone, Leaf } from "lucide-react";
import { formatPhoneLink, formatEmailLink } from "@/utils/linkFormatters";

interface CustomerContactCardProps {
  contactName: string;
  email: string;
  phone: string;
  guestCountWithRestrictions?: string | null;
}

export function CustomerContactCard({
  contactName,
  email,
  phone,
  guestCountWithRestrictions,
}: CustomerContactCardProps) {
  const phoneLink = formatPhoneLink(phone);
  const emailLink = formatEmailLink(email);

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card/90">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Your Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Name */}
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="font-medium text-foreground truncate">{contactName}</span>
          </div>

          {/* Email */}
          <div className="flex items-center gap-2 min-w-0">
            <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
            {emailLink ? (
              <a
                href={emailLink}
                className="text-primary hover:underline truncate"
              >
                {email}
              </a>
            ) : (
              <span className="text-foreground truncate">{email}</span>
            )}
          </div>

          {/* Phone */}
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
            {phoneLink ? (
              <a
                href={phoneLink}
                className="text-primary hover:underline"
              >
                {phone}
              </a>
            ) : (
              <span className="text-foreground">{phone}</span>
            )}
          </div>

          {/* Vegetarian Guest Count */}
          {guestCountWithRestrictions && (
            <div className="flex items-center gap-2">
              <Leaf className="h-4 w-4 text-green-600 shrink-0" />
              <span className="text-sm text-green-700 dark:text-green-400">
                {guestCountWithRestrictions} vegetarian portions
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
