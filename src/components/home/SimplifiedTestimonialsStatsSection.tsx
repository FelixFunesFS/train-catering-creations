import { useState } from "react";
import { Calendar, Utensils, Trophy, Quote, Clock, Users, Heart, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const SimplifiedTestimonialsStatsSection = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  
  const stats = [
    {
      number: "750+",
      label: "Events Catered",
      icon: Calendar,
      color: "text-blue-500"
    }, 
    {
      number: "8,200+",
      label: "Meals Served",
      icon: Utensils,
      color: "text-green-500"
    },
    {
      number: "20+",
      label: "Years Experience",
      icon: Clock,
      color: "text-purple-500"
    },
    {
      number: "100%",
      label: "Client Satisfaction",
      icon: Heart,
      color: "text-red-500"
    }
  ];

  const testimonials = [
    {
      quote: "Soul Train's Eatery catered our wedding and it was absolutely perfect! The mac and cheese was the talk of the night, and every guest asked for the caterer's information.",
      author: "Sarah & Michael's Wedding",
      location: "Charleston, SC",
      rating: 5
    },
    {
      quote: "Professional, delicious, and exceeded all expectations. Chef Train and his team made our corporate event memorable with incredible food and flawless service.",
      author: "Corporate Client",
      location: "Mount Pleasant, SC",
      rating: 5
    },
    {
      quote: "The military ceremony catering was respectful, elegant, and perfectly executed. They understand the importance of honoring our service members.",
      author: "Military Function",
      location: "Joint Base Charleston",
      rating: 5
    }
  ];

  return (
    <section className="py-8 sm:py-12 lg:py-16 bg-gradient-card/30 border-t border-border/10">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <div className="flex justify-center items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-primary" />
            <Award className="w-4 h-4 text-primary" />
            <Trophy className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-elegant font-bold text-foreground mb-3 sm:mb-4 leading-tight">
            Proven Performance
          </h2>
          <div className="w-16 h-1 bg-gradient-primary mx-auto mb-4 sm:mb-6 rounded-full" />
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Two decades of culinary excellence backed by satisfied clients and memorable celebrations across the Lowcountry.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 items-stretch">
          {/* Enhanced Statistics Section - 60% width on desktop */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="neumorphic-card-2 hover:neumorphic-card-3 transition-all duration-300 hover:scale-105 group rounded-xl">
                  <div className="p-4 sm:p-6 text-center">
                    <stat.icon className={`h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 ${stat.color} mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-200`} />
                    <div className="text-xl sm:text-2xl lg:text-3xl font-elegant font-bold text-foreground mb-2 sm:mb-3">
                      {stat.number}
                    </div>
                    <p className="text-xs sm:text-sm lg:text-base text-muted-foreground font-medium leading-tight">
                      {stat.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Achievement Badges */}
            <div className="neumorphic-card-2 rounded-xl p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-elegant font-bold text-foreground mb-4 text-center">
                Recognition & Achievements
              </h3>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                <Badge variant="outline" className="bg-gradient-primary text-primary-foreground">
                  <Award className="w-3 h-3 mr-1" />
                  Family Owned & Operated
                </Badge>
                <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200">
                  <Trophy className="w-3 h-3 mr-1" />
                  Lowcountry Favorite
                </Badge>
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
                  <Users className="w-3 h-3 mr-1" />
                  Military Preferred
                </Badge>
                <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-200">
                  <Heart className="w-3 h-3 mr-1" />
                  Wedding Specialist
                </Badge>
              </div>
            </div>
          </div>

          {/* Enhanced Testimonial Section - 40% width on desktop */}
          <div className="neumorphic-card-2 hover:neumorphic-card-3 rounded-2xl p-4 sm:p-6 lg:p-8 transition-all duration-300 hover:scale-105 group flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <Quote className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-primary group-hover:scale-110 transition-transform duration-200" />
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <div 
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      i === currentTestimonial ? 'bg-primary' : 'bg-muted-foreground/30'
                    }`}
                    onClick={() => setCurrentTestimonial(i)}
                  />
                ))}
              </div>
            </div>
            
            <blockquote className="text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed mb-6 sm:mb-8 flex-1">
              "{testimonials[currentTestimonial].quote}"
            </blockquote>
            
            <div>
              <div className="flex items-center space-x-1 sm:space-x-2 mb-4 sm:mb-6">
                {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                  <div key={i} className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:w-6 text-primary">⭐</div>
                ))}
              </div>
              
              <div className="border-t border-border pt-4 sm:pt-6">
                <p className="text-base sm:text-lg lg:text-xl font-elegant font-semibold text-foreground">
                  {testimonials[currentTestimonial].author}
                </p>
                <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">
                  {testimonials[currentTestimonial].location}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};