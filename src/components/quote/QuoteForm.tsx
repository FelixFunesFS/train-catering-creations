import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

const QuoteForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    eventType: "",
    eventDate: "",
    guestCount: "",
    location: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, we'll just show a toast message
    toast({
      title: "Quote Request Submitted!",
      description: "We'll contact you within 24 hours to discuss your event.",
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="text-2xl font-elegant">Event Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <Label htmlFor="name" className="text-sm sm:text-base font-medium text-foreground">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
                className="mt-2 h-12 text-base"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-sm sm:text-base font-medium text-foreground">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                required
                className="mt-2 h-12 text-base"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <Label htmlFor="phone" className="text-sm sm:text-base font-medium text-foreground">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                required
                className="mt-2 h-12 text-base"
              />
            </div>
            <div>
              <Label htmlFor="eventType" className="text-sm sm:text-base font-medium text-foreground">Event Type *</Label>
              <Select onValueChange={(value) => handleChange("eventType", value)} required>
                <SelectTrigger className="mt-2 h-12 text-base">
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent className="z-50 bg-background border-border">
                  <SelectItem value="wedding">Wedding</SelectItem>
                  <SelectItem value="blacktie">Black Tie Event</SelectItem>
                  <SelectItem value="military">Military Function</SelectItem>
                  <SelectItem value="corporate">Corporate Event</SelectItem>
                  <SelectItem value="private">Private Party</SelectItem>
                  <SelectItem value="birthday">Birthday Party</SelectItem>
                  <SelectItem value="babyshower">Baby Shower</SelectItem>
                  <SelectItem value="bereavement">Bereavement</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <Label htmlFor="eventDate" className="text-sm sm:text-base font-medium text-foreground">Event Date *</Label>
              <Input
                id="eventDate"
                type="date"
                value={formData.eventDate}
                onChange={(e) => handleChange("eventDate", e.target.value)}
                required
                className="mt-2 h-12 text-base"
              />
            </div>
            <div>
              <Label htmlFor="guestCount" className="text-sm sm:text-base font-medium text-foreground">Number of Guests *</Label>
              <Input
                id="guestCount"
                type="number"
                placeholder="e.g. 50"
                value={formData.guestCount}
                onChange={(e) => handleChange("guestCount", e.target.value)}
                required
                className="mt-2 h-12 text-base"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="location" className="text-sm sm:text-base font-medium text-foreground">Event Location</Label>
            <Input
              id="location"
              placeholder="Address or venue name"
              value={formData.location}
              onChange={(e) => handleChange("location", e.target.value)}
              className="mt-2 h-12 text-base"
            />
          </div>

          <div>
            <Label htmlFor="message" className="text-sm sm:text-base font-medium text-foreground">Additional Details</Label>
            <Textarea
              id="message"
              placeholder="Tell us about your vision, dietary restrictions, budget range, or any special requests..."
              value={formData.message}
              onChange={(e) => handleChange("message", e.target.value)}
              className="mt-2 min-h-[120px] sm:min-h-[140px] text-base resize-none"
            />
          </div>

          <div className="flex justify-center">
            <Button type="submit" variant="cta" size="responsive-lg" className="w-3/5 sm:w-auto sm:min-w-[16rem]">
              Request Quote
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default QuoteForm;