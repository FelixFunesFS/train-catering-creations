
import { FeaturedServiceCard } from "./FeaturedServiceCard";
import { SupportingServiceCard } from "./SupportingServiceCard";
import { Briefcase, Users, Utensils } from "lucide-react";

export const ServicesSection = () => {
  return (
    <section className="bg-gradient-card/30 border-t border-border/10">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-8 sm:py-10 lg:py-12 xl:py-16">
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-elegant font-bold text-foreground mb-3 sm:mb-4 leading-tight text-fade-up">
            Our Catering Services
          </h2>
          <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-fade-up-delay-1">
            Elegant weddings, heartfelt celebrations, and corporate events—catered with care, Southern soul, and impeccable service.
          </p>
        </div>

        <div className="grid gap-6 lg:gap-8">
          {/* Featured Wedding Service - Full width on desktop */}
          <div className="w-full">
            <FeaturedServiceCard delay={0} />
          </div>

          {/* Supporting Services - 3 cards in horizontal row on desktop, 2x2 grid on tablet, vertical stack on mobile */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <SupportingServiceCard
              title="Black Tie Events"
              description="Sophisticated catering for galas, fundraisers, and formal celebrations with impeccable presentation."
              image="/lovable-uploads/63832488-46ff-4d71-ade5-f871173c28ab.png"
              imageAlt="Black Tie Event Catering"
              link="/wedding-menu#page-header"
              delay={150}
              icon={Briefcase}
              feature="Premium Service"
            />
            
            <SupportingServiceCard
              title="Corporate Events"
              description="Professional catering for conferences, meetings, and business celebrations with seamless service."
              image="/lovable-uploads/6cd766e3-21ce-4e88-a3a4-6c8835dc9654.png"
              imageAlt="Corporate Event Catering"
              link="/menu#page-header"
              delay={300}
              icon={Users}
              feature="Business Focused"
            />
            
            <div className="md:col-span-2 lg:col-span-1">
              <SupportingServiceCard
                title="Military Functions"
                description="Honoring service with specialized catering for promotions, ceremonies, and military celebrations."
                image="/lovable-uploads/3226c955-a9b7-4c8d-a4c2-e5e7fc206f6f.png"
                imageAlt="Military Function Catering"
                link="/wedding-menu#page-header"
                delay={450}
                icon={Utensils}
                feature="Honor & Respect"
              />
            </div>
          </div>
        </div>

        {/* Additional CTA section */}
        <div className="mt-12 lg:mt-16 text-center">
          <p className="text-muted-foreground mb-4">
            Don't see your event type? We cater all occasions.
          </p>
          <a
            href="/request-quote#page-header"
            className="inline-flex items-center gap-2 bg-gradient-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200"
          >
            Get Custom Quote
            <span>→</span>
          </a>
        </div>
      </div>
    </section>
  );
};
