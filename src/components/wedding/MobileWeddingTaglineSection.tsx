import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Crown, Heart, Sparkles } from "lucide-react";

export const MobileWeddingTaglineSection = () => {
  return (
    <section className="block md:hidden bg-gradient-to-b from-muted/30 via-background to-muted/30 py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="neumorphic-card-2 rounded-2xl p-6 text-center relative overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
          <div className="absolute top-4 right-4 opacity-10">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <div className="absolute bottom-4 left-4 opacity-10">
            <Heart className="h-6 w-6 text-primary" />
          </div>
          
          {/* Content */}
          <div className="relative z-10">
            {/* Decorative Icon */}
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
                <Crown className="h-6 w-6 text-primary" />
              </div>
            </div>
            
            {/* Tagline */}
            <h2 className="text-xl sm:text-2xl font-elegant font-semibold text-foreground leading-relaxed mb-6">
              Create Unforgettable Moments With Sophisticated Menus Crafted For Your Special Day
            </h2>
            
            {/* Decorative Divider */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full" />
            </div>
            
            {/* Call-to-Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
              <Button asChild className="w-4/5 sm:w-auto px-6 py-2.5 min-w-[160px]">
                <Link to="/request-quote#page-header">
                  Request Quote
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-4/5 sm:w-auto px-6 py-2.5 min-w-[160px]">
                <Link to="/gallery#page-header">
                  View Gallery
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};