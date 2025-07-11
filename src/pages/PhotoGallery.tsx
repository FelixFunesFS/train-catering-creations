import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const PhotoGallery = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const images = [
    {
      src: "/lovable-uploads/0d103574-55d4-4eca-8b24-99fb579cc931.png",
      category: "buffet",
      title: "Elegant Buffet Setup",
      description: "Beautifully arranged buffet with multiple hot dishes in a home setting"
    },
    {
      src: "/lovable-uploads/b96e2d67-0d45-4824-82f6-38dd17e7a41e.png", 
      category: "family",
      title: "Family Gathering",
      description: "Happy guests enjoying our catered meal in a warm home environment"
    },
    {
      src: "/lovable-uploads/3883ad1a-118b-4bd9-bc82-5dc40893df99.png",
      category: "formal",
      title: "Formal Event Catering",
      description: "Professional buffet setup with chafing dishes for elegant events"
    },
    {
      src: "/lovable-uploads/531de58a-4283-4d7c-882c-a78b6cdc97c0.png",
      category: "grazing",
      title: "Artisan Grazing Board",
      description: "Beautifully crafted charcuterie and fruit display"
    },
    {
      src: "/lovable-uploads/eecf9726-8cce-48e5-8abb-f0dd78ebcb4e.png",
      category: "grazing", 
      title: "Gourmet Spread",
      description: "Elaborate grazing table with premium cheeses, meats, and fresh fruits"
    },
    {
      src: "/lovable-uploads/df73f6e3-5169-401d-9ad5-7d2aa39602d5.png",
      category: "grazing",
      title: "Elegant Display",
      description: "Sophisticated arrangement with croissants, berries, and artisanal items"
    },
    {
      src: "/lovable-uploads/eca9632d-b79e-4584-8287-00cc36515fc6.png",
      category: "wedding",
      title: "Wedding Reception Setup",
      description: "Beautiful round table setup for elegant wedding reception"
    },
    {
      src: "/lovable-uploads/84f43173-e79d-4c53-b5d4-e8a596d1d614.png",
      category: "wedding",
      title: "Wedding Venue Dining",
      description: "Elegant venue setup with floral arrangements and formal place settings"
    },
    {
      src: "/lovable-uploads/1cd54e2e-3991-4795-ad2a-6e8c18fb530f.png",
      category: "wedding",
      title: "Wedding Cake Display",
      description: "Custom wedding cake and dessert station by Tanya Ward"
    },
    {
      src: "/lovable-uploads/798ca3d5-326a-4cdf-9e5b-1e4c87d2bc93.png",
      category: "desserts",
      title: "Elegant Dessert Station",
      description: "Beautiful presentation of pastries and dessert selections"
    },
    {
      src: "/lovable-uploads/afb2bfef-c686-4fa3-bfcd-df7f2d12c92e.png",
      category: "signature-dishes",
      title: "Grilled Chicken Perfection",
      description: "Our signature grilled chicken with herbs and seasonings"
    },
    {
      src: "/lovable-uploads/fae1f99f-7d00-43be-bad2-e09bc5799e81.png",
      category: "signature-dishes",
      title: "Seasoned Fish Fillet",
      description: "Expertly prepared fish with our special seasoning blend"
    },
    {
      src: "/lovable-uploads/b56a4ba1-e2d4-4ec1-ad09-0263e41cc8d3.png",
      category: "formal",
      title: "Military Formal Event",
      description: "Professional catering for military ceremonies and formal gatherings"
    },
    {
      src: "/lovable-uploads/37d6fe45-f7aa-4e87-9672-10110aba73e2.png",
      category: "buffet",
      title: "Elegant Buffet with Florals",
      description: "Beautifully decorated buffet station with fresh floral arrangements"
    },
    {
      src: "/lovable-uploads/1a2796ea-0092-4372-b642-30d6b55f1cec.png",
      category: "wedding",
      title: "Wedding Reception Hall",
      description: "Stunning wedding reception setup with elegant table arrangements"
    },
    {
      src: "/lovable-uploads/faf45827-ad08-47fe-b5f2-20fa674631a4.png",
      category: "wedding",
      title: "Wedding Venue Setup",
      description: "Beautiful wedding venue with professional table service"
    },
    {
      src: "/lovable-uploads/1780e8c6-e881-437a-af97-4cc25247052b.png",
      category: "formal",
      title: "Large Community Event",
      description: "Catering for large-scale community gatherings and celebrations"
    },
    {
      src: "/lovable-uploads/b2e3fc50-415e-40bf-80d8-f6da7b47fcb9.png",
      category: "team",
      title: "Chef and Team",
      description: "Meet our talented culinary team led by Chef Dominick Ward"
    },
    {
      src: "/lovable-uploads/4394caa2-fdc2-48ca-b62a-3a9fd58b76dd.png",
      category: "bbq",
      title: "Outdoor BBQ Setup",
      description: "Chef Dominick with our outdoor grilling and BBQ catering services"
    },
    {
      src: "/lovable-uploads/48473662-ac84-4137-aa84-261848dfba4c.png",
      category: "team",
      title: "Team with Elegant Buffet Setup",
      description: "Professional team serving at formal indoor event"
    },
    {
      src: "/lovable-uploads/d3f15374-fef1-4f79-b573-1aba60d1d65f.png",
      category: "team",
      title: "Professional Service Team",
      description: "Second angle of the elegant buffet service"
    },
    {
      src: "/lovable-uploads/1a5c721b-7419-4c66-aecf-ae6903a31e4a.png",
      category: "bbq",
      title: "Outdoor Catering Spread",
      description: "BBQ and outdoor catering with chicken and sides"
    },
    {
      src: "/lovable-uploads/e224366b-8e66-4725-a0ef-d9aa7fe1b5f9.png",
      category: "corporate",
      title: "Corporate Beverage Station",
      description: "Professional corporate event with beverage service"
    },
    {
      src: "/lovable-uploads/2cf1a495-207f-4269-9636-bd48b60d431b.png",
      category: "corporate",
      title: "Large Corporate Event Buffet",
      description: "Extensive spread for corporate/military events"
    }
  ];

  const categories = [
    { id: "all", name: "All Photos" },
    { id: "wedding", name: "Weddings" },
    { id: "formal", name: "Formal Events" },
    { id: "grazing", name: "Grazing Boards" },
    { id: "buffet", name: "Buffet Service" },
    { id: "desserts", name: "Desserts" },
    { id: "signature-dishes", name: "Signature Dishes" },
    { id: "team", name: "Team" },
    { id: "bbq", name: "BBQ & Outdoor" },
    { id: "corporate", name: "Corporate Events" },
    { id: "family", name: "Family Events" }
  ];

  const filteredImages = selectedCategory === "all" 
    ? images 
    : images.filter(img => img.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-hero py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-elegant font-bold text-foreground mb-6">
            Photo Gallery
          </h1>
          <div className="w-24 h-1 bg-gradient-primary mx-auto mb-8"></div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            See our culinary artistry in action. From intimate gatherings to grand celebrations, every event is crafted with care.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              className={selectedCategory === category.id 
                ? "bg-primary text-primary-foreground" 
                : "text-muted-foreground hover:text-primary"
              }
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* Photo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredImages.map((image, index) => (
            <Card 
              key={index} 
              className="shadow-card hover:shadow-elegant transition-shadow cursor-pointer group"
              onClick={() => setSelectedImage(image.src)}
            >
              <CardContent className="p-0">
                <div className="relative overflow-hidden rounded-lg aspect-square">
                  <img
                    src={image.src}
                    alt={image.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      console.error(`Failed to load image: ${image.src}`, e);
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                      e.currentTarget.alt = 'Image failed to load';
                    }}
                    onLoad={() => console.log(`Successfully loaded: ${image.src}`)}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-end">
                    <div className="p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <h3 className="font-elegant font-semibold">{image.title}</h3>
                      <p className="text-sm">{image.description}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <Card className="shadow-elegant bg-gradient-card">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-elegant font-bold text-foreground mb-4">
              Ready to Create Beautiful Memories?
            </h3>
            <p className="text-muted-foreground mb-6">
              Let us bring the same level of elegance and delicious food to your next event.
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
                Call Us Today
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Image Modal */}
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-4xl p-0 bg-transparent border-0">
            <DialogTitle className="sr-only">Gallery Image</DialogTitle>
            <DialogDescription className="sr-only">Full size view of gallery image</DialogDescription>
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="absolute -top-12 right-0 text-white hover:text-gray-300 z-10"
                onClick={() => setSelectedImage(null)}
              >
                <X className="h-6 w-6" />
              </Button>
              {selectedImage && (
                <img
                  src={selectedImage}
                  alt="Gallery image"
                  className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
                  onError={(e) => {
                    console.error(`Failed to load modal image: ${selectedImage}`, e);
                  }}
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default PhotoGallery;