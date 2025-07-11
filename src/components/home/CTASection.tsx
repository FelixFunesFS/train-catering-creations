import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

export const CTASection = () => {
  return (
    <section className="py-24 bg-gradient-primary">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
        <h2 className="text-3xl lg:text-4xl font-elegant font-bold text-primary-foreground mb-8">
          Ready to Create Something Amazing?
        </h2>
        <p className="text-xl text-primary-foreground mb-12 opacity-90">
          Let Soul Train's Eatery handle the kitchen while you enjoy the moment. Contact us today for a personalized quote.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-6 sm:space-y-0 sm:space-x-8">
          <Button asChild className="bg-primary text-white hover:bg-primary-glow shadow-glow px-10 py-5 text-lg">
            <a href="sms:8439700265" className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5" />
              <span>Text (843) 970-0265</span>
            </a>
          </Button>
          <Link to="/request-quote">
            <Button variant="outline" className="border-2 border-white text-white bg-transparent hover:bg-white hover:text-primary px-10 py-5 text-lg">
              Request Quote
            </Button>
          </Link>
        </div>
        <p className="text-primary-foreground mt-8 opacity-75">
          Proudly serving Charleston, SC and the surrounding Lowcountry
        </p>
      </div>
    </section>
  );
};