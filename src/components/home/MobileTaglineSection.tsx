import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Star, Sparkles } from "lucide-react";
export const MobileTaglineSection = () => {
  return <section className="block md:hidden bg-gradient-to-b from-muted/30 via-background to-muted/30 py-[30px]">
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
                <Star className="h-6 w-6 text-primary" />
              </div>
            </div>
            
            {/* Tagline */}
            <h2 className="text-xl sm:text-2xl font-elegant font-semibold text-foreground leading-relaxed mb-6">
              Where Every Bite Is Made With Love And Served With Soul!
            </h2>
            
            {/* Decorative Divider */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full" />
            </div>
            
            {/* Call-to-Action Button */}
            <div className="flex justify-center">
              <Button asChild className="w-4/5 sm:w-auto px-8 py-3 min-w-[180px]">
                <Link to="/menu#page-header">
                  View Menu
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>;
};