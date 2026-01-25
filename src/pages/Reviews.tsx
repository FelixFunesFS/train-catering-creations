import { Star, Heart, ThumbsUp } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { CTASection } from "@/components/ui/cta-section";
import { NeumorphicCard } from "@/components/ui/neumorphic-card";
import { PageSection } from "@/components/ui/page-section";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { ReviewsImageStrip } from "@/components/reviews/ReviewsImageStrip";
import { ReviewsTeamSection } from "@/components/reviews/ReviewsTeamSection";

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

      {/* Team Photo Section */}
      <ReviewsTeamSection />

      {/* Feedback Section */}
      <PageSection pattern="c">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <NeumorphicCard level={3} className="bg-primary-light relative overflow-hidden">
              {/* Watermark Logo */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <img 
                  src="/lovable-uploads/e9a7fbdd-021d-4e32-9cdf-9a1f20d396e9.png" 
                  alt="" 
                  aria-hidden="true"
                  className="w-24 h-24 object-contain opacity-[0.06]"
                />
              </div>
              <div className="p-4 sm:p-6">
                <h4 className="text-base sm:text-lg font-elegant font-semibold text-primary mb-2">
                  Worked with us recently?
                </h4>
                <p className="text-primary text-xs sm:text-sm">
                  We'd love to hear about your experience! Contact us to share your feedback.
                </p>
              </div>
            </NeumorphicCard>
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
