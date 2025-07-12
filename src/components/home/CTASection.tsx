import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

export const CTASection = () => {
  return (
    <section className="py-8 md:py-12 lg:py-16 bg-gradient-primary rounded-lg mx-4 sm:mx-6 lg:mx-8 my-8 shadow-elegant">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl lg:text-4xl font-elegant font-bold text-primary-foreground mb-6">
          Ready to Create Something Amazing?
        </h2>
        <p className="text-xl text-primary-foreground mb-8 lg:mb-12 opacity-90">
          Let Soul Train's Eatery handle the kitchen while you enjoy the moment. Contact us today for a personalized quote.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 max-w-lg mx-auto">
          <Button asChild variant="cta" size="responsive-md">
            <a href="sms:8439700265" className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5" />
              <span>Text (843) 970-0265</span>
            </a>
          </Button>
          <Button asChild variant="cta-white" size="responsive-md">
            <Link to="/request-quote">
              Request Quote
            </Link>
          </Button>
        </div>
        <p className="text-primary-foreground mt-6 lg:mt-8 opacity-75">
          Proudly serving Charleston, SC and the surrounding Lowcountry
        </p>
      </div>
    </section>
  );
};