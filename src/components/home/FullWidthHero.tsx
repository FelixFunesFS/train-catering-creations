import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, Heart, Star, ArrowDown } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export const FullWidthHero = () => {
  const { ref: contentRef, isVisible } = useScrollAnimation({
    variant: 'fade-up',
    delay: 300,
    mobile: { variant: 'slide-up', delay: 200 }
  });

  const { ref: buttonsRef, isVisible: buttonsVisible } = useScrollAnimation({
    variant: 'fade-up',
    delay: 600,
    mobile: { variant: 'slide-up', delay: 400 }
  });

  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        {/* Mobile Background */}
        <div className="block md:hidden">
          <img 
            src="/lovable-uploads/f6f0cdc2-cd71-4392-984e-ed9609103e42.png"
            alt="Elegant wedding reception venue background" 
            className="w-full h-full object-cover"
            loading="eager"
          />
        </div>
        
        {/* Desktop Background */}
        <div className="hidden md:block">
          <img 
            src="/lovable-uploads/adfb4ea8-c62c-4f6d-b7dd-b562466c2c31.png"
            alt="Elegant catering display background" 
            className="w-full h-full object-cover"
            loading="eager"
          />
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70 md:bg-gradient-to-r md:from-black/70 md:via-black/50 md:to-black/30" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top Brand Section */}
        <div className="flex-none pt-8 md:pt-12">
          <div className="max-w-7xl mx-auto px-6 xl:px-12">
            {/* Mobile Icons */}
            <div className="flex md:hidden items-center justify-center gap-4 mb-4">
              <div className="p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                <UtensilsCrossed className="h-5 w-5 text-white" aria-label="Quality catering" />
              </div>
              <div className="p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                <Heart className="h-5 w-5 text-white" aria-label="Made with love" />
              </div>
              <div className="p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                <Star className="h-5 w-5 text-white" aria-label="Excellence" />
              </div>
            </div>

            {/* Desktop Logo */}
            <div className="hidden md:flex justify-start">
              <div className="p-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                <div className="h-12 w-12 lg:h-16 lg:w-16 relative">
                  <img 
                    src="/lovable-uploads/e9a7fbdd-021d-4e32-9cdf-9a1f20d396e9.png" 
                    alt="Soul Train's Eatery Logo" 
                    className="w-full h-full object-contain hover:scale-110 transition-transform duration-300" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Centered */}
        <div className="flex-1 flex items-center">
          <div className="max-w-7xl mx-auto px-6 xl:px-12 w-full">
            <div 
              ref={contentRef}
              className={`text-center md:text-left max-w-2xl mx-auto md:mx-0 transition-all duration-700 ${
                isVisible 
                  ? 'opacity-100 transform translate-y-0' 
                  : 'opacity-0 transform translate-y-8'
              }`}
            >
              {/* Floating Content Card */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 md:p-10 lg:p-12 shadow-2xl">
                {/* Main Heading */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-elegant font-bold text-white leading-tight mb-6">
                  Charleston's Premier Catering Experience
                </h1>
                
                {/* Decorative Divider */}
                <div className="w-20 md:w-24 lg:w-32 h-1 bg-gradient-to-r from-white via-white/80 to-white mx-auto md:mx-0 mb-6 rounded-full" />
                
                {/* Subtext */}
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/90 font-elegant leading-relaxed mb-8">
                  Where every bite is made with love and served with soul!
                </p>

                {/* Desktop CTA Buttons */}
                <div className="hidden md:flex flex-col sm:flex-row justify-center md:justify-start items-center gap-4 lg:gap-6">
                  <Button asChild size="lg" className="w-full sm:w-auto min-w-[180px] bg-primary hover:bg-primary/90 text-white border-0">
                    <Link to="/request-quote#page-header">
                      Request Quote
                    </Link>
                  </Button>
                  
                  <Button 
                    asChild 
                    variant="outline" 
                    size="lg" 
                    className="w-full sm:w-auto min-w-[180px] bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white"
                  >
                    <Link to="/gallery#page-header">
                      View Gallery
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile CTA Buttons - Bottom Fixed */}
        <div className="flex-none md:hidden">
          <div 
            ref={buttonsRef}
            className={`fixed bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/90 via-black/70 to-transparent backdrop-blur-sm p-6 transition-all duration-700 ${
              buttonsVisible 
                ? 'opacity-100 transform translate-y-0' 
                : 'opacity-0 transform translate-y-8'
            }`}
          >
            <div className="max-w-lg mx-auto space-y-3">
              <Button asChild className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90">
                <Link to="/request-quote#page-header">
                  Get Your Quote
                </Link>
              </Button>
              
              <Button 
                asChild 
                variant="outline" 
                className="w-full h-12 text-base font-semibold bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white"
              >
                <Link to="/gallery#page-header">
                  View Gallery
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Spacer for fixed buttons */}
          <div className="h-32" />
        </div>

        {/* Scroll Indicator - Desktop Only */}
        <div className="hidden md:block flex-none pb-8">
          <div className="max-w-7xl mx-auto px-6 xl:px-12">
            <div className="flex justify-center">
              <div className="animate-bounce">
                <ArrowDown className="h-6 w-6 text-white/60" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};