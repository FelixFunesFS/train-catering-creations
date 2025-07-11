import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useEffect } from "react";

const heroImages = [
  {
    src: "/lovable-uploads/894051bf-31c6-4930-bb88-e3e1d74f7ee1.png",
    alt: "Rustic wedding venue with chandeliers, string lights, and elegant dining setup"
  },
  {
    src: "/lovable-uploads/26d2d500-6017-41a2-99b2-b7050cefedba.png", 
    alt: "Elegant outdoor wedding tent with chandeliers and formal table service"
  },
  {
    src: "/lovable-uploads/a68ac24e-cf0d-4941-9059-568c9b92bebf.png",
    alt: "Grand banquet hall with luxurious gold linens and elegant setup"
  },
  {
    src: "/lovable-uploads/84f43173-e79d-4c53-b5d4-e8a596d1d614.png",
    alt: "Elegant wedding venue dining with crystal chandeliers and beautiful floral arrangements"
  },
  {
    src: "/lovable-uploads/6aec2d18-641f-46aa-8c0e-e39f4e604fd6.png",
    alt: "Charming brick wall venue with purple linens and intimate atmosphere"
  }
];

export const HeroSection = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: false })
  ]);

  useEffect(() => {
    if (emblaApi) {
      // Preload all images for smooth transitions
      heroImages.forEach(image => {
        const img = new Image();
        img.src = image.src;
      });
    }
  }, [emblaApi]);

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background Image Carousel */}
      <div className="absolute inset-0">
        <Carousel
          className="w-full h-full"
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 5000,
              stopOnInteraction: false,
            }),
          ]}
        >
          <CarouselContent className="h-screen">
            {heroImages.map((image, index) => (
              <CarouselItem key={index} className="relative h-full">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover transition-opacity duration-1000"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        
        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-black/40 z-10"></div>
      </div>

      {/* Content */}
      <div className="relative z-20 min-h-screen flex flex-col items-center justify-center p-6 sm:p-8 lg:p-12 text-center">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-4xl lg:text-6xl xl:text-7xl font-elegant font-bold text-white mb-6">
            Soul Train's <span className="text-primary">Eatery</span>
          </h1>
          <p className="text-lg lg:text-xl text-white/90 leading-relaxed max-w-3xl">
            Where passion meets Southern hospitality. Elegant catering for weddings, black tie events, and memorable celebrations in Charleston's Lowcountry.
          </p>
        </div>

        {/* Call-to-Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <Link to="/request-quote">
            <Button className="bg-primary hover:bg-primary-glow text-primary-foreground px-8 py-4 text-lg font-medium shadow-glow w-full sm:w-auto">
              Request a Quote
            </Button>
          </Link>
          <Link to="/gallery">
            <Button variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/30 hover:border-white/50 px-8 py-4 text-lg font-medium backdrop-blur-sm w-full sm:w-auto">
              View Our Work
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};