import { Camera } from "lucide-react";

export const GalleryHeader = () => {
  return (
    <div className="text-center mb-16">
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Camera className="w-8 h-8 text-primary" />
        </div>
      </div>
      <h1 className="text-4xl lg:text-5xl font-elegant font-bold text-foreground mb-6">
        Photo Gallery
      </h1>
      <div className="w-24 h-1 bg-gradient-primary mx-auto mb-8"></div>
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
        See our culinary artistry in action. From intimate gatherings to grand celebrations, every event is crafted with care.
      </p>
    </div>
  );
};