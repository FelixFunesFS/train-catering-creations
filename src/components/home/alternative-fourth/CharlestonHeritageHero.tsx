import { useState, useEffect } from "react";
import { NeumorphicButton } from "@/components/ui/neumorphic-button";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { ResponsiveWrapper } from "@/components/ui/responsive-wrapper";
import { Heart, MapPin, Users, Clock } from "lucide-react";
// Using existing uploaded image for Charleston heritage background

export const CharlestonHeritageHero = () => {
  const { ref, isVisible } = useScrollAnimation({
    threshold: 0.1,
    variant: 'fade-up'
  });

  const [currentMilestone, setCurrentMilestone] = useState(0);

  const milestones = [
    {
      year: "2002",
      title: "Family Dream Begins",
      description: "Chef Train & Tanya Ward start their Charleston journey"
    },
    {
      year: "2005",
      title: "First Rainbow Row Event",
      description: "Catering our first historic Charleston venue"
    },
    {
      year: "2010",
      title: "Lowcountry Recognition",
      description: "Becoming Charleston's trusted family caterer"
    },
    {
      year: "2024",
      title: "Two Decades Strong",
      description: "Over 20 years of Charleston family traditions"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMilestone((prev) => (prev + 1) % milestones.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Charleston Background */}
      <div className="absolute inset-0">
        <OptimizedImage
          src="/lovable-uploads/26d2d500-6017-41a2-99b2-b7050cefedba.png"
          alt="Historic Charleston Rainbow Row with cobblestone streets"
          containerClassName="w-full h-full"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
      </div>

      <ResponsiveWrapper>
        <div ref={ref} className="relative z-10 text-center text-white py-12 lg:py-24">
          
          {/* Heritage Badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Heart className="w-4 h-4 text-red-400" />
            <span className="text-sm font-medium">Charleston Family Legacy Since 2002</span>
          </div>

          {/* Main Title */}
          <h1 className={`font-playfair text-4xl md:text-6xl lg:text-8xl font-bold mb-6 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            Soul Train's
            <span className="block font-dancing text-red-400 text-3xl md:text-5xl lg:text-6xl mt-2">
              Charleston Heritage
            </span>
          </h1>

          {/* Story Introduction */}
          <p className={`text-lg md:text-xl lg:text-2xl max-w-4xl mx-auto mb-8 leading-relaxed transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            Born from a deep love of Southern cooking and a commitment to bringing families together around exceptional food. 
            <span className="block mt-2 font-dancing text-xl md:text-2xl lg:text-3xl text-red-400">
              From Rainbow Row to Lowcountry plantations
            </span>
          </p>

          {/* Family Stats */}
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-12 transition-all duration-700 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <Clock className="w-6 h-6 text-red-400 mx-auto mb-2" />
              <div className="text-2xl font-bold">20+</div>
              <div className="text-sm opacity-80">Years</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <Users className="w-6 h-6 text-red-400 mx-auto mb-2" />
              <div className="text-2xl font-bold">1000+</div>
              <div className="text-sm opacity-80">Families Served</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <MapPin className="w-6 h-6 text-red-400 mx-auto mb-2" />
              <div className="text-2xl font-bold">50+</div>
              <div className="text-sm opacity-80">Charleston Venues</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <Heart className="w-6 h-6 text-red-400 mx-auto mb-2" />
              <div className="text-2xl font-bold">100%</div>
              <div className="text-sm opacity-80">Family-Owned</div>
            </div>
          </div>

          {/* Interactive Timeline */}
          <div className={`max-w-2xl mx-auto mb-12 transition-all duration-700 delay-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex justify-center mb-4">
                {milestones.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentMilestone(index)}
                    className={`w-3 h-3 rounded-full mx-1 transition-all duration-300 ${
                      currentMilestone === index ? 'bg-red-400 scale-125' : 'bg-white/40 hover:bg-white/60'
                    }`}
                  />
                ))}
              </div>
              <div className="text-center min-h-[120px] flex flex-col justify-center">
                <div className="text-3xl font-bold text-red-400 font-playfair mb-2">
                  {milestones[currentMilestone].year}
                </div>
                <div className="text-xl font-semibold mb-2">
                  {milestones[currentMilestone].title}
                </div>
                <div className="text-white/80">
                  {milestones[currentMilestone].description}
                </div>
              </div>
            </div>
          </div>

          {/* Heritage CTAs */}
          <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center transition-all duration-700 delay-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <NeumorphicButton
              size="lg"
              variant="primary"
              className="bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 min-w-[200px]"
            >
              <Heart className="w-5 h-5" />
              Our Charleston Story
            </NeumorphicButton>
            <NeumorphicButton
              size="lg"
              variant="outline"
              className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 min-w-[200px]"
            >
              <MapPin className="w-5 h-5" />
              Charleston Venues
            </NeumorphicButton>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse" />
            </div>
          </div>
        </div>
      </ResponsiveWrapper>
    </section>
  );
};