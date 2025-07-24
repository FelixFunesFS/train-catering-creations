import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { UtensilsCrossed, Heart, Star, ChevronLeft, ChevronRight } from "lucide-react";

const heroImages = [
  {
    src: "/lovable-uploads/894051bf-31c6-4930-bb88-e3e1d74f7ee1.png",
    alt: "Rustic wedding venue with chandeliers and elegant dining setup",
    title: "Wedding Excellence"
  },
  {
    src: "/lovable-uploads/84f43173-e79d-4c53-b5d4-e8a596d1d614.png", 
    alt: "Elegant venue setup with floral arrangements",
    title: "Formal Events"
  },
  {
    src: "/lovable-uploads/531de58a-4283-4d7c-882c-a78b6cdc97c0.png",
    alt: "Professional patriotic buffet with chafing dishes",
    title: "Corporate Catering"
  },
  {
    src: "/lovable-uploads/a68ac24e-cf0d-4941-9059-568c9b92bebf.png",
    alt: "Grand banquet hall with gold accents and formal table settings",
    title: "Luxury Events"
  }
];

export const MobileFirstHero = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-advance carousel
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentImageIndex(index);
    setIsAutoPlaying(false);
    // Resume auto-play after user interaction
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => {
    setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevSlide = () => {
    setCurrentImageIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      {/* Mobile-First Carousel (< 768px) */}
      <div className="md:hidden">
        {/* Image Carousel */}
        <div className="relative h-screen w-full">
          {heroImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-500 ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <OptimizedImage
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover"
                priority={index === 0}
                containerClassName="absolute inset-0"
              />
            </div>
          ))}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
          
          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 transition-colors"
            aria-label="Next image"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Content Overlay */}
          <div className="absolute inset-0 z-10 flex flex-col">
            {/* Top Brand Section */}
            <div className="flex-none pt-8">
              <div className="px-6">
                {/* Mobile Icons */}
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="p-2 rounded-full bg-white/10 border border-white/20">
                    <UtensilsCrossed className="h-5 w-5 text-white" aria-label="Quality catering" />
                  </div>
                  <div className="p-2 rounded-full bg-white/10 border border-white/20">
                    <Heart className="h-5 w-5 text-white" aria-label="Made with love" />
                  </div>
                  <div className="p-2 rounded-full bg-white/10 border border-white/20">
                    <Star className="h-5 w-5 text-white" aria-label="Excellence" />
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content - Centered */}
            <div className="flex-1 flex items-center">
              <div className="px-6 w-full">
                <div className="text-center max-w-lg mx-auto">
                  {/* Content Card */}
                  <div className="bg-white/10 rounded-3xl p-6 shadow-2xl border border-white/20">
                    <h1 className="text-3xl sm:text-4xl font-sans font-bold text-white leading-tight mb-4">
                      Charleston's Premier Catering Experience
                    </h1>
                    
                    <div className="w-20 h-1 bg-gradient-to-r from-white via-white/80 to-white mx-auto mb-4 rounded-full" />
                    
                    <p className="text-lg text-white/90 font-sans leading-relaxed mb-6">
                      Where every bite is made with love and served with soul!
                    </p>

                    {/* CTA Buttons */}
                    <div className="space-y-3">
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
                </div>
              </div>
            </div>

            {/* Dot Indicators */}
            <div className="flex-none pb-8">
              <div className="flex justify-center space-x-2">
                {heroImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentImageIndex 
                        ? 'bg-white w-6' 
                        : 'bg-white/50 hover:bg-white/70'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tablet Layout (768px-1024px) */}
      <div className="hidden md:block lg:hidden">
        <div className="relative h-screen w-full grid grid-cols-2">
          {/* Left Side - Main Image */}
          <div className="relative">
            <OptimizedImage
              src={heroImages[currentImageIndex].src}
              alt={heroImages[currentImageIndex].alt}
              className="w-full h-full object-cover"
              priority={true}
              containerClassName="absolute inset-0"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
          </div>

          {/* Right Side - Content */}
          <div className="relative bg-gradient-to-b from-black/60 to-black/80 flex items-center">
            <div className="p-8 w-full">
              <div className="text-center">
                <h1 className="text-4xl xl:text-5xl font-sans font-bold text-white leading-tight mb-6">
                  Charleston's Premier Catering Experience
                </h1>
                
                <div className="w-24 h-1 bg-gradient-to-r from-white via-white/80 to-white mx-auto mb-6 rounded-full" />
                
                <p className="text-xl text-white/90 font-sans leading-relaxed mb-8">
                  Where every bite is made with love and served with soul!
                </p>

                <div className="flex flex-col gap-4">
                  <Button asChild size="lg" className="w-full bg-primary hover:bg-primary/90 text-white">
                    <Link to="/request-quote#page-header">
                      Request Quote
                    </Link>
                  </Button>
                  
                  <Button 
                    asChild 
                    variant="outline" 
                    size="lg" 
                    className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white"
                  >
                    <Link to="/gallery#page-header">
                      View Gallery
                    </Link>
                  </Button>
                </div>

                {/* Image Navigation */}
                <div className="flex justify-center space-x-2 mt-8">
                  {heroImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentImageIndex 
                          ? 'bg-white w-8' 
                          : 'bg-white/50 hover:bg-white/70'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout (> 1024px) */}
      <div className="hidden lg:block">
        <div className="relative h-screen w-full">
          {/* Background Image */}
          <OptimizedImage
            src={heroImages[currentImageIndex].src}
            alt={heroImages[currentImageIndex].alt}
            className="w-full h-full object-cover"
            priority={true}
            containerClassName="absolute inset-0"
          />
          
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />

          <div className="relative z-10 h-full flex">
            {/* Left Content */}
            <div className="flex-1 flex items-center">
              <div className="max-w-2xl mx-auto px-12">
                <div className="bg-white/10 rounded-3xl p-12 shadow-2xl border border-white/20">
                  <div className="flex justify-center mb-6">
                    <OptimizedImage
                      src="/lovable-uploads/e9a7fbdd-021d-4e32-9cdf-9a1f20d396e9.png"
                      alt="Soul Train's Eatery Logo"
                      className="w-16 h-16 object-contain hover:scale-110 transition-transform duration-300"
                      priority={true}
                      aspectRatio="aspect-square"
                    />
                  </div>

                  <h1 className="text-5xl xl:text-6xl font-sans font-bold text-white leading-tight mb-6 text-center">
                    Charleston's Premier Catering Experience
                  </h1>
                  
                  <div className="w-32 h-1 bg-gradient-to-r from-white via-white/80 to-white mx-auto mb-6 rounded-full" />
                  
                  <p className="text-2xl lg:text-3xl text-white/90 font-sans leading-relaxed mb-8 text-center">
                    Where every bite is made with love and served with soul!
                  </p>

                  <div className="flex flex-col sm:flex-row justify-center gap-6">
                    <Button asChild size="lg" className="min-w-[180px] bg-primary hover:bg-primary/90 text-white">
                      <Link to="/request-quote#page-header">
                        Request Quote
                      </Link>
                    </Button>
                    
                    <Button 
                      asChild 
                      variant="outline" 
                      size="lg" 
                      className="min-w-[180px] bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white"
                    >
                      <Link to="/gallery#page-header">
                        View Gallery
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Image Gallery */}
            <div className="w-80 xl:w-96 p-8 flex items-center">
              <div className="w-full">
                <div className="grid grid-cols-2 gap-4">
                  {heroImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`relative group overflow-hidden rounded-xl transition-all duration-300 ${
                        index === currentImageIndex 
                          ? 'ring-2 ring-white scale-105' 
                          : 'hover:scale-105 hover:ring-1 hover:ring-white/50'
                      }`}
                    >
                      <OptimizedImage
                        src={image.src}
                        alt={image.alt}
                        className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-110"
                        aspectRatio="aspect-[4/3]"
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-white text-sm font-medium truncate">
                          {image.title}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
                
                {/* Navigation Dots */}
                <div className="flex justify-center space-x-2 mt-6">
                  {heroImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentImageIndex 
                          ? 'bg-white w-6' 
                          : 'bg-white/50 hover:bg-white/70'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};