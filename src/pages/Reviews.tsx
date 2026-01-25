import { Star } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { CTASection } from "@/components/ui/cta-section";
import { NeumorphicCard } from "@/components/ui/neumorphic-card";
import { PageSection } from "@/components/ui/page-section";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { ReviewsImageStrip } from "@/components/reviews/ReviewsImageStrip";

// Icon components for third-party verification
const GoogleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const Reviews = () => {
  const { ref: headerRef, isVisible: headerVisible, variant: headerVariant } = useScrollAnimation({ 
    variant: 'ios-spring', 
    delay: 0,
    mobile: { delay: 0 },
    desktop: { delay: 100 }
  });

  const headerAnimationClass = useAnimationClass(headerVariant, headerVisible);

  // Sample reviews - these would come from a real review system
  const reviews = [
    {
      name: "Sarah M.",
      event: "Wedding Reception",
      rating: 5,
      text: "Soul Train's Eatery made our wedding day absolutely perfect! The food was incredible - our guests are still talking about the shrimp alfredo and brisket. Chef Train and Tanya were so professional and the service was flawless.",
      date: "2 months ago"
    },
    {
      name: "Colonel Johnson",
      event: "Military Promotion Ceremony", 
      rating: 5,
      text: "Outstanding service for our promotion ceremony. The team understood the importance of the event and delivered exceptional food and service. The jamaican jerk chicken was a hit with everyone!",
      date: "3 months ago"
    },
    {
      name: "Jennifer L.",
      event: "Corporate Event",
      rating: 5,
      text: "We hired Soul Train's for our company's annual gala. The presentation was elegant, the food was delicious, and they handled everything professionally. Tanya's desserts were the perfect ending to a perfect evening.",
      date: "4 months ago"
    },
    {
      name: "Mike & Lisa R.",
      event: "Anniversary Party",
      rating: 5,
      text: "Amazing experience from start to finish! The mac and cheese was the smoothest we've ever had, and the slow-smoked brisket was fall-off-the-bone tender. Highly recommend for any special occasion.",
      date: "1 month ago"
    },
    {
      name: "Amanda K.",
      event: "Baby Shower",
      rating: 5,
      text: "Chef Train catered my baby shower and it was wonderful! The variety of dishes accommodated all our dietary needs, and the vegetarian options were just as delicious as everything else. Thank you!",
      date: "5 months ago"
    },
    {
      name: "David P.",
      event: "Birthday Celebration",
      rating: 5,
      text: "Soul Train's Eatery turned my 50th birthday into an unforgettable event. The red beans and rice reminded me of my grandmother's cooking, and the service was impeccable. Will definitely use them again!",
      date: "6 months ago"
    }
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-primary fill-current' : 'text-muted-foreground'}`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header Section */}
      <PageSection pattern="a">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={headerRef} className={headerAnimationClass}>
            <PageHeader
              badge={{
                icon: <Star className="h-5 w-5" />,
                text: "Testimonials"
              }}
              title="Client Reviews"
              subtitle="Real Stories, Real Satisfaction"
              description="See what our clients say about their experience with Soul Train's Eatery"
              buttons={[{ text: "About Us", href: "/about", variant: "cta" }]}
            />
            
            {/* Image Strip - Moved inside hero, after CTA */}
            <div className="mt-6 sm:mt-8">
              <ReviewsImageStrip />
            </div>
            
            {/* Star Rating - Now after images */}
            <div className="text-center mt-6 max-w-4xl mx-auto">
              <div className="flex justify-center items-center space-x-2 mb-3 sm:mb-4">
                {renderStars(5)}
                <span className="text-xl sm:text-2xl font-bold text-primary ml-2">5.0</span>
              </div>
              
              {/* Verification Links */}
              <div className="flex justify-center items-center gap-4 mt-3 mb-3">
                <a 
                  href="https://g.page/r/YOUR_GOOGLE_PLACE_ID/review"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <GoogleIcon className="h-4 w-4" />
                  <span>Verified on Google</span>
                </a>
                <span className="text-muted-foreground/50">|</span>
                <a 
                  href="https://facebook.com/soultrainseatery/reviews"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <FacebookIcon className="h-4 w-4" />
                  <span>Verified on Facebook</span>
                </a>
              </div>
              
              <p className="text-base sm:text-lg text-muted-foreground subtitle-hover-motion">
                Based on {reviews.length}+ reviews from satisfied clients
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2 subtitle-hover-motion">
                Serving Charleston, SC and the Lowcountry for over 8 years
              </p>
            </div>
          </div>
        </div>
      </PageSection>

      {/* Reviews Section */}
      <PageSection pattern="b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {reviews.map((review, index) => {
              const { ref: cardRef, isVisible: cardVisible, variant: cardVariant } = useScrollAnimation({ 
                variant: 'elastic', 
                delay: index * 100,
                mobile: { delay: index * 75 },
                desktop: { delay: index * 100 }
              });
              const cardAnimationClass = useAnimationClass(cardVariant, cardVisible);
              
              return (
                <NeumorphicCard key={index} ref={cardRef} level={2} className={`hover:scale-105 transition-transform duration-300 ${cardAnimationClass}`}>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-base sm:text-lg font-elegant font-semibold text-foreground">{review.name}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">{review.event}</p>
                      </div>
                      <div className="flex space-x-1">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    <p className="text-sm sm:text-base text-foreground mb-2 sm:mb-3 leading-relaxed">
                      "{review.text}"
                    </p>
                    <p className="text-xs text-muted-foreground">{review.date}</p>
                  </div>
                </NeumorphicCard>
              );
            })}
          </div>
        </div>
      </PageSection>

      <CTASection
        title="Ready to Create Your Own Success Story?"
        description="Join our growing list of satisfied clients. Let us make your next event unforgettable."
        buttons={[
          {
            text: "Request Quote",
            href: "/request-quote#page-header",
            variant: "cta"
          },
          {
            text: "Call (843) 970-0265",
            href: "tel:8439700265",
            variant: "cta-white"
          }
        ]}
        footer="Proudly serving Charleston, SC and the surrounding Lowcountry"
      />
    </div>
  );
};

export default Reviews;
