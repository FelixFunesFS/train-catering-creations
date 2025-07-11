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
    <div className="min-h-screen bg-gradient-hero py-20">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-4xl lg:text-5xl font-elegant font-bold text-foreground mb-8">
            Request a Quote
          </h1>
          <div className="w-24 h-1 bg-gradient-primary mx-auto mb-10"></div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Let's create something amazing together. Tell us about your event and we'll provide a personalized quote within 24 hours.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Contact Form */}
          <div className="order-2 lg:order-1">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="text-2xl font-elegant">Event Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        required
                        className="mt-2"
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
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        required
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="eventType">Event Type *</Label>
                      <Select onValueChange={(value) => handleChange("eventType", value)} required>
                        <SelectTrigger className="mt-2">
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

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="eventDate">Event Date *</Label>
                      <Input
                        id="eventDate"
                        type="date"
                        value={formData.eventDate}
                        onChange={(e) => handleChange("eventDate", e.target.value)}
                        required
                        className="mt-2"
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
                        className="mt-2"
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
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Additional Details</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us about your vision, dietary restrictions, budget range, or any special requests..."
                      value={formData.message}
                      onChange={(e) => handleChange("message", e.target.value)}
                      className="mt-2 min-h-[140px]"
                    />
                  </div>

                  <Button type="submit" className="w-full bg-primary hover:bg-primary-glow text-primary-foreground font-medium py-4">
                    Request Quote
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="order-1 lg:order-2 space-y-8">
            <Card className="shadow-elegant border-primary/10">
              <CardHeader className="pb-8">
                <CardTitle className="text-2xl font-elegant text-center">Get In Touch</CardTitle>
                <div className="w-16 h-1 bg-gradient-primary mx-auto mt-4"></div>
              </CardHeader>
              <CardContent className="space-y-8 px-8 pb-8">
                <div className="flex items-start space-x-6 group hover:bg-primary-light/30 p-4 rounded-lg transition-all duration-300">
                  <div className="bg-primary/10 p-3 rounded-full group-hover:bg-primary/20 transition-colors">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-lg mb-2">Phone</p>
                    <a href="tel:8439700265" className="text-primary hover:text-primary-glow font-medium text-lg">
                      (843) 970-0265
                    </a>
                    <p className="text-muted-foreground text-sm mt-1">Available for immediate consultation</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-6 group hover:bg-primary-light/30 p-4 rounded-lg transition-all duration-300">
                  <div className="bg-primary/10 p-3 rounded-full group-hover:bg-primary/20 transition-colors">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-lg mb-2">Email</p>
                    <a href="mailto:soultrainseatery@gmail.com" className="text-primary hover:text-primary-glow font-medium break-all">
                      soultrainseatery@gmail.com
                    </a>
                    <p className="text-muted-foreground text-sm mt-1">Send us your event details</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-6 group hover:bg-primary-light/30 p-4 rounded-lg transition-all duration-300">
                  <div className="bg-primary/10 p-3 rounded-full group-hover:bg-primary/20 transition-colors">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-lg mb-2">Service Area</p>
                    <p className="text-foreground font-medium">Charleston, SC & Lowcountry</p>
                    <p className="text-muted-foreground text-sm mt-1">We travel throughout the region</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-elegant bg-gradient-to-br from-primary-light to-primary-light/50 border-primary/20">
              <CardHeader className="pb-6">
                <CardTitle className="text-xl font-elegant text-center text-primary">What to Expect</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 px-8 pb-8">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/20 p-2 rounded-full">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-primary">Quick Response</p>
                    <p className="text-primary/80 text-sm">We'll respond within 24 hours</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/20 p-2 rounded-full">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-primary">Personal Consultation</p>
                    <p className="text-primary/80 text-sm">Detailed discussion of your needs</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/20 p-2 rounded-full">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-primary">Custom Proposal</p>
                    <p className="text-primary/80 text-sm">Tailored pricing and menu options</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-elegant bg-gradient-primary border-0">
              <CardContent className="p-8 text-center">
                <p className="text-primary-foreground font-semibold text-lg mb-2">
                  🎉 Ready to book immediately?
                </p>
                <p className="text-primary-foreground/90 text-sm mb-4">
                  Call us directly for instant assistance and availability!
                </p>
                <a href="tel:8439700265" className="inline-block bg-primary-foreground text-primary px-6 py-3 rounded-full font-semibold hover:shadow-glow transition-all duration-300 transform hover:scale-105">
                  Call Now: (843) 970-0265
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestQuote;