import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Heart, ThumbsUp } from "lucide-react";

const Reviews = () => {
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
    <div className="min-h-screen bg-gradient-hero py-16 md:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-4">
            <Star className="h-8 w-8 text-primary mr-2" />
            <Heart className="h-8 w-8 text-primary mx-2" />
            <ThumbsUp className="h-8 w-8 text-primary ml-2" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-elegant font-bold text-foreground mb-6">
            Client Reviews
          </h1>
          <div className="w-24 h-1 bg-gradient-primary mx-auto mb-8"></div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            See what our clients say about their experience with Soul Train's Eatery
          </p>
        </div>

        {/* Overall Rating */}
        <Card className="shadow-elegant mb-12 text-center">
          <CardContent className="p-8">
            <div className="flex justify-center items-center space-x-2 mb-4">
              {renderStars(5)}
              <span className="text-2xl font-bold text-primary ml-2">5.0</span>
            </div>
            <p className="text-lg text-muted-foreground">
              Based on {reviews.length}+ reviews from satisfied clients
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Serving Charleston, SC and the Lowcountry for over 8 years
            </p>
          </CardContent>
        </Card>

        {/* Reviews Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {reviews.map((review, index) => (
            <Card key={index} className="shadow-card">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-elegant">{review.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{review.event}</p>
                  </div>
                  <div className="flex space-x-1">
                    {renderStars(review.rating)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3 leading-relaxed">
                  "{review.text}"
                </p>
                <p className="text-xs text-muted-foreground">{review.date}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <Card className="shadow-elegant bg-gradient-card">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-elegant font-bold text-foreground mb-4">
              Ready to Create Your Own Success Story?
            </h3>
            <p className="text-muted-foreground mb-6">
              Join our growing list of satisfied clients. Let us make your next event unforgettable.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <a 
                href="/request-quote" 
                className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary-glow transition-colors shadow-glow"
              >
                Request Quote
              </a>
              <a 
                href="tel:8439700265" 
                className="border border-primary text-primary px-8 py-3 rounded-lg font-medium hover:bg-primary-light transition-colors"
              >
                Call (843) 970-0265
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Leave a Review */}
        <div className="text-center mt-12">
          <Card className="shadow-card bg-primary-light">
            <CardContent className="p-6">
              <h4 className="text-lg font-elegant font-semibold text-primary mb-2">
                Worked with us recently?
              </h4>
              <p className="text-primary-foreground text-sm">
                We'd love to hear about your experience! Contact us to share your feedback.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Reviews;