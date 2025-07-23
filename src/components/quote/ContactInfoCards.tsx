
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, MapPin, Phone, Mail } from "lucide-react";

const ContactInfoCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
      <Card className="shadow-elegant border-primary/10">
        <CardHeader className="pb-6">
          <CardTitle className="text-xl font-elegant text-center">Get In Touch</CardTitle>
          <div className="w-16 h-1 bg-gradient-primary mx-auto mt-3"></div>
        </CardHeader>
        <CardContent className="space-y-6 px-6 pb-6">
          <div className="flex items-start space-x-4 group hover:bg-primary-light/30 p-3 rounded-lg transition-all duration-300">
            <div className="bg-primary/10 p-2 rounded-full group-hover:bg-primary/20 transition-colors">
              <Phone className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-base mb-1">Phone</p>
              <a href="tel:8439700265" className="text-primary hover:text-primary-glow font-medium text-sm break-all">
                (843) 970-0265
              </a>
              <p className="text-muted-foreground text-xs mt-1">Call for immediate consultation</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4 group hover:bg-primary-light/30 p-3 rounded-lg transition-all duration-300">
            <div className="bg-primary/10 p-2 rounded-full group-hover:bg-primary/20 transition-colors">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-base mb-1">Email</p>
              <a href="mailto:soultrainseatery@gmail.com" className="text-primary hover:text-primary-glow font-medium text-xs break-all">
                soultrainseatery@gmail.com
              </a>
              <p className="text-muted-foreground text-xs mt-1">Send us your event details</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4 group hover:bg-primary-light/30 p-3 rounded-lg transition-all duration-300">
            <div className="bg-primary/10 p-2 rounded-full group-hover:bg-primary/20 transition-colors">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-base mb-1">Service Area</p>
              <p className="text-foreground font-medium text-sm">Charleston, SC & Lowcountry</p>
              <p className="text-muted-foreground text-xs mt-1">We travel throughout the region</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-elegant bg-gradient-to-br from-primary-light to-primary-light/50 border-primary/20">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-elegant text-center text-primary">What to Expect</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-6 pb-6">
          <div className="flex items-start space-x-3">
            <div className="bg-primary/20 p-2 rounded-full">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium text-primary text-sm">Quick Response</p>
              <p className="text-primary/80 text-xs">We'll respond within 24 hours</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-primary/20 p-2 rounded-full">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium text-primary text-sm">Personal Consultation</p>
              <p className="text-primary/80 text-xs">Detailed discussion of your needs</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-primary/20 p-2 rounded-full">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium text-primary text-sm">Custom Proposal</p>
              <p className="text-primary/80 text-xs">Tailored pricing and menu options</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-elegant bg-gradient-primary border-0 md:col-span-2 lg:col-span-1">
        <CardContent className="p-6 text-center">
          <p className="text-primary-foreground font-semibold text-base mb-2">
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
