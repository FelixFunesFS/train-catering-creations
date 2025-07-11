import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Star, Users, Crown } from "lucide-react";

export const ServicesSection = () => {
  return (
    <section className="py-24 bg-gradient-hero">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-20">
          <h2 className="text-3xl lg:text-4xl font-elegant font-bold text-foreground mb-8">
            Our Catering Services
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From elegant weddings to corporate events, we cater every occasion with care, flavor, and professionalism.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Weddings - Glassmorphism Card */}
          <div className="group relative backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 hover:bg-white/15 hover:border-white/30 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl"></div>
            <div className="relative z-10 text-center">
              <div className="mb-6 flex justify-center">
                <div className="p-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 group-hover:bg-white/20 transition-all duration-300">
                  <Heart className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <h3 className="text-xl font-elegant font-semibold text-foreground mb-4">Weddings</h3>
              <p className="text-muted-foreground mb-6 text-sm leading-relaxed">Elegant receptions and intimate ceremonies with personalized menus</p>
              <Link to="/wedding-menu" className="inline-flex items-center text-primary hover:text-primary-glow font-medium text-sm group-hover:translate-x-1 transition-all duration-300">
                Learn More 
                <span className="ml-1 group-hover:ml-2 transition-all duration-300">→</span>
              </Link>
            </div>
          </div>

          {/* Black Tie Events - Glassmorphism Card */}
          <div className="group relative backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 hover:bg-white/15 hover:border-white/30 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl"></div>
            <div className="relative z-10 text-center">
              <div className="mb-6 flex justify-center">
                <div className="p-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 group-hover:bg-white/20 transition-all duration-300">
                  <Crown className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <h3 className="text-xl font-elegant font-semibold text-foreground mb-4">Black Tie Events</h3>
              <p className="text-muted-foreground mb-6 text-sm leading-relaxed">Sophisticated catering for galas and formal celebrations</p>
              <Link to="/wedding-menu" className="inline-flex items-center text-primary hover:text-primary-glow font-medium text-sm group-hover:translate-x-1 transition-all duration-300">
                Learn More 
                <span className="ml-1 group-hover:ml-2 transition-all duration-300">→</span>
              </Link>
            </div>
          </div>

          {/* Military Functions - Glassmorphism Card */}
          <div className="group relative backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 hover:bg-white/15 hover:border-white/30 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl"></div>
            <div className="relative z-10 text-center">
              <div className="mb-6 flex justify-center">
                <div className="p-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 group-hover:bg-white/20 transition-all duration-300">
                  <Star className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <h3 className="text-xl font-elegant font-semibold text-foreground mb-4">Military Functions</h3>
              <p className="text-muted-foreground mb-6 text-sm leading-relaxed">Honoring service with promotions, ceremonies, and celebrations</p>
              <Link to="/wedding-menu" className="inline-flex items-center text-primary hover:text-primary-glow font-medium text-sm group-hover:translate-x-1 transition-all duration-300">
                Learn More 
                <span className="ml-1 group-hover:ml-2 transition-all duration-300">→</span>
              </Link>
            </div>
          </div>

          {/* Private Events - Glassmorphism Card */}
          <div className="group relative backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 hover:bg-white/15 hover:border-white/30 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl"></div>
            <div className="relative z-10 text-center">
              <div className="mb-6 flex justify-center">
                <div className="p-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 group-hover:bg-white/20 transition-all duration-300">
                  <Users className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <h3 className="text-xl font-elegant font-semibold text-foreground mb-4">Private Events</h3>
              <p className="text-muted-foreground mb-6 text-sm leading-relaxed">Corporate conferences, family gatherings, and special occasions</p>
              <Link to="/menu" className="inline-flex items-center text-primary hover:text-primary-glow font-medium text-sm group-hover:translate-x-1 transition-all duration-300">
                View Menu 
                <span className="ml-1 group-hover:ml-2 transition-all duration-300">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};