import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

export const CTASection = () => {
  return (
    <section className="py-16 md:py-20 lg:py-24 bg-gradient-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl lg:text-4xl font-elegant font-bold text-primary-foreground mb-6">
          Ready to Create Something Amazing?
        </h2>
        <p className="text-xl text-primary-foreground mb-8 lg:mb-12 opacity-90">
          Let Soul Train's Eatery handle the kitchen while you enjoy the moment. Contact us today for a personalized quote.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-8">
          <Button asChild className="bg-primary hover:bg-primary-glow text-primary-foreground shadow-elegant hover:shadow-lg transform hover:scale-105 transition-all duration-300 px-8 lg:px-10 py-4 lg:py-5 text-base lg:text-lg font-semibold">
            <a href="sms:8439700265" className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5" />
              <span>Text (843) 970-0265</span>
            </a>
          </Button>
          <Link to="/request-quote">
            <Button variant="outline" className="border-2 border-white text-white bg-transparent hover:bg-white/10 hover:border-white/50 transform hover:scale-105 transition-all duration-300 hover:shadow-md px-8 lg:px-10 py-4 lg:py-5 text-base lg:text-lg font-semibold">
              Request Quote
            </Button>
          </Link>
        </div>
        <p className="text-primary-foreground mt-6 lg:mt-8 opacity-75">
          Proudly serving Charleston, SC and the surrounding Lowcountry
        </p>
      </div>
    </section>
  );
};