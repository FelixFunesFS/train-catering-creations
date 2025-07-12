import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, MapPin, Phone, Mail } from "lucide-react";

const ContactInfoCards = () => {
  return (
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
              <p className="text-muted-foreground text-sm mt-1">Call us for immediate consultation</p>
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
          <Button asChild variant="cta-white" size="responsive-sm" className="rounded-full transform hover:scale-105">
            <a href="tel:8439700265">
              Call Now: (843) 970-0265
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactInfoCards;