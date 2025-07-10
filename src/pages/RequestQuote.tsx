import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Users, MapPin, Phone, Mail } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const RequestQuote = () => {
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
    <div className="min-h-screen bg-gradient-hero py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-elegant font-bold text-foreground mb-6">
            Request a Quote
          </h1>
          <div className="w-24 h-1 bg-gradient-primary mx-auto mb-8"></div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Let's create something amazing together. Tell us about your event and we'll provide a personalized quote within 24 hours.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="text-2xl font-elegant">Event Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="eventType">Event Type *</Label>
                      <Select onValueChange={(value) => handleChange("eventType", value)} required>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select event type" />
                        </SelectTrigger>
                        <SelectContent>
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

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="eventDate">Event Date *</Label>
                      <Input
                        id="eventDate"
                        type="date"
                        value={formData.eventDate}
                        onChange={(e) => handleChange("eventDate", e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="guestCount">Number of Guests *</Label>
                      <Input
                        id="guestCount"
                        type="number"
                        placeholder="e.g. 50"
                        value={formData.guestCount}
                        onChange={(e) => handleChange("guestCount", e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="location">Event Location</Label>
                    <Input
                      id="location"
                      placeholder="Address or venue name"
                      value={formData.location}
                      onChange={(e) => handleChange("location", e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Additional Details</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us about your vision, dietary restrictions, budget range, or any special requests..."
                      value={formData.message}
                      onChange={(e) => handleChange("message", e.target.value)}
                      className="mt-1 min-h-[120px]"
                    />
                  </div>

                  <Button type="submit" className="w-full bg-primary hover:bg-primary-glow text-primary-foreground font-medium py-3">
                    Request Quote
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-xl font-elegant">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <a href="tel:8439700265" className="text-primary hover:text-primary-glow">
                      (843) 970-0265
                    </a>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Email</p>
                    <a href="mailto:soultrainseatery@gmail.com" className="text-primary hover:text-primary-glow text-sm">
                      soultrainseatery@gmail.com
                    </a>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Service Area</p>
                    <p className="text-muted-foreground text-sm">Charleston, SC & Lowcountry</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-xl font-elegant">What to Expect</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start space-x-2">
                  <Calendar className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>We'll respond within 24 hours</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Users className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Personal consultation to discuss your needs</span>
                </div>
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Customized proposal with pricing</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card bg-primary-light">
              <CardContent className="p-4 text-center">
                <p className="text-primary font-medium text-sm">
                  🎉 Ready to book? Call us directly for immediate assistance!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestQuote;