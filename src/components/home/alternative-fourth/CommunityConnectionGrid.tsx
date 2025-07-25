import { useState } from "react";
import { SectionContentCard } from "@/components/ui/section-content-card";
import { ResponsiveWrapper } from "@/components/ui/responsive-wrapper";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useStaggeredAnimation } from "@/hooks/useStaggeredAnimation";
import { Heart, Quote, Star, Calendar, Users, MapPin, Phone, ChevronLeft, ChevronRight } from "lucide-react";

export const CommunityConnectionGrid = () => {
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation({
    threshold: 0.1,
    variant: 'fade-up'
  });

  const { ref: testimonialsRef, getItemClassName, getItemStyle } = useStaggeredAnimation({
    itemCount: 6,
    staggerDelay: 150,
    variant: 'scale-fade'
  });

  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      name: "The Morrison Family",
      event: "Wedding Reception - Boone Hall Plantation",
      date: "September 2023",
      rating: 5,
      quote: "Chef Train and Chef Tanya made our Charleston wedding absolutely magical. The Lowcountry boil was a hit with all our guests from out of town!",
      relationship: "3rd Generation Charleston Family",
      location: "Mount Pleasant, SC"
    },
    {
      name: "Charleston Harbor Resort",
      event: "Corporate Annual Gala",
      date: "November 2023",
      rating: 5,
      quote: "Soul Train's has been our exclusive caterer for 8 years. Their consistency and Charleston expertise keeps our guests coming back year after year.",
      relationship: "Corporate Partner Since 2015",
      location: "Charleston Harbor"
    },
    {
      name: "The Williams-Johnson Wedding",
      event: "Garden Wedding - Rainbow Row",
      date: "April 2023",
      rating: 5,
      quote: "From our first tasting to the last dance, every detail was perfect. Tanya's wedding cake was the talk of Charleston for weeks!",
      relationship: "Charleston Natives",
      location: "Historic District"
    },
    {
      name: "Magnolia Plantation Events",
      event: "Historic Venue Partnership",
      date: "Ongoing Since 2010",
      rating: 5,
      quote: "Soul Train's understands the unique needs of historic venues. Their respect for our grounds and exceptional service makes them our preferred caterer.",
      relationship: "Venue Partner - 13 Years",
      location: "Magnolia Plantation"
    },
    {
      name: "The Henderson Anniversary",
      event: "50th Anniversary Celebration",
      date: "August 2023",
      rating: 5,
      quote: "After 50 years in Charleston, we've seen many caterers. Soul Train's brought together five generations of our family with food that honored our Southern roots.",
      relationship: "Charleston Family Since 1960s",
      location: "Private Estate"
    },
    {
      name: "Charleston Country Club",
      event: "Member Events & Tournaments",
      date: "Ongoing Partnership",
      rating: 5,
      quote: "The level of service and quality Chef Train's team provides consistently exceeds our high standards. Our members expect excellence, and they deliver every time.",
      relationship: "Preferred Caterer Since 2008",
      location: "James Island"
    }
  ];

  const communityStats = [
    {
      number: "2,500+",
      label: "Charleston Families Served",
      icon: Users,
      description: "Generations of Charleston families trust us"
    },
    {
      number: "150+",
      label: "Annual Community Events",
      icon: Calendar,
      description: "Supporting local charities and organizations"
    },
    {
      number: "50+",
      label: "Historic Venues",
      icon: MapPin,
      description: "Trusted by Charleston's finest locations"
    },
    {
      number: "20+",
      label: "Years in Charleston",
      icon: Heart,
      description: "Deep roots in the Lowcountry community"
    }
  ];

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-accent/5 to-background">
      <ResponsiveWrapper>
        
        {/* Section Header */}
        <div ref={titleRef} className="text-center mb-16">
          <h2 className={`font-playfair text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 transition-all duration-700 ${titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            Charleston
            <span className="block font-dancing text-red-600 text-2xl md:text-4xl lg:text-5xl mt-2">
              Community Stories
            </span>
          </h2>
          <p className={`text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto transition-all duration-700 delay-200 ${titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            For over two decades, we've had the honor of being part of Charleston's most meaningful moments. 
            Here are just a few stories from the families and venues we call home.
          </p>
        </div>

        {/* Community Impact Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {communityStats.map((stat, index) => (
            <SectionContentCard
              key={index}
              className="text-center"
            >
              <stat.icon className="w-8 h-8 text-red-600 mx-auto mb-4" />
              <div className="text-2xl md:text-3xl font-bold font-playfair text-foreground mb-2">
                {stat.number}
              </div>
              <div className="text-sm font-semibold text-red-600 mb-2">
                {stat.label}
              </div>
              <div className="text-xs text-muted-foreground">
                {stat.description}
              </div>
            </SectionContentCard>
          ))}
        </div>

        {/* Featured Testimonial Carousel */}
        <div className="mb-16">
          <SectionContentCard className="max-w-4xl mx-auto">
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Quote className="w-6 h-6 text-red-600" />
                  <span className="text-sm font-medium text-red-600 uppercase tracking-wider">
                    Featured Story
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={prevTestimonial}
                    className="p-2 rounded-full bg-red-600/10 text-red-600 hover:bg-red-600/20 transition-colors duration-200"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={nextTestimonial}
                    className="p-2 rounded-full bg-red-600/10 text-red-600 hover:bg-red-600/20 transition-colors duration-200"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="text-center">
                <div className="flex justify-center mb-4">
                  {Array.from({ length: testimonials[currentTestimonial].rating }, (_, i) => (
                    <Star key={i} className="w-5 h-5 text-red-600 fill-current" />
                  ))}
                </div>

                <blockquote className="text-lg md:text-xl text-foreground mb-6 leading-relaxed font-medium">
                  "{testimonials[currentTestimonial].quote}"
                </blockquote>

                <div className="text-center">
                  <div className="font-playfair text-xl font-bold text-foreground mb-1">
                    {testimonials[currentTestimonial].name}
                  </div>
                  <div className="text-red-600 font-medium mb-2">
                    {testimonials[currentTestimonial].event}
                  </div>
                  <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{testimonials[currentTestimonial].date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{testimonials[currentTestimonial].location}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Testimonial Dots */}
              <div className="flex justify-center mt-8 gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      currentTestimonial === index ? 'bg-red-600 w-6' : 'bg-red-600/30 hover:bg-red-600/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </SectionContentCard>
        </div>

        {/* Testimonials Grid */}
        <div ref={testimonialsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <SectionContentCard
              key={index}
              className={`${getItemClassName(index)} cursor-pointer transition-all duration-300 hover:scale-105 ${
                currentTestimonial === index ? 'ring-2 ring-red-600/50 shadow-lg' : ''
              }`}
              style={getItemStyle(index)}
              onClick={() => setCurrentTestimonial(index)}
              interactive
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex">
                  {Array.from({ length: testimonial.rating }, (_, i) => (
                    <Star key={i} className="w-4 h-4 text-red-600 fill-current" />
                  ))}
                </div>
                <Quote className="w-5 h-5 text-red-600/40" />
              </div>

              <h4 className="font-playfair text-lg font-bold mb-2">{testimonial.name}</h4>
              <p className="text-sm text-red-600 font-medium mb-3">{testimonial.event}</p>
              
              <blockquote className="text-muted-foreground text-sm mb-4 line-clamp-3 leading-relaxed">
                "{testimonial.quote}"
              </blockquote>

              <div className="pt-4 border-t border-border/50">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{testimonial.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{testimonial.location}</span>
                  </div>
                </div>
                <div className="text-xs text-red-600 mt-2 font-medium">
                  {testimonial.relationship}
                </div>
              </div>
            </SectionContentCard>
          ))}
        </div>

        {/* Community Contact CTA */}
        <div className="text-center mt-16">
          <SectionContentCard className="max-w-2xl mx-auto">
            <Phone className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="font-playfair text-2xl font-bold mb-4">
              Join Our Charleston Family
            </h3>
            <p className="text-muted-foreground mb-6">
              Whether you're planning a family celebration, corporate event, or intimate gathering, 
              we'd love to be part of your Charleston story.
            </p>
            <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200">
              Start Planning Your Event
            </button>
          </SectionContentCard>
        </div>
      </ResponsiveWrapper>
    </section>
  );
};