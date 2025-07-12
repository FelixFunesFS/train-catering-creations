import { Camera, Images, Eye } from "lucide-react";

export const GalleryHeader = () => {
  return (
    <div className="text-center mb-16">
      <div className="flex justify-center mb-4">
        <Camera className="h-8 w-8 text-primary mr-2" />
        <Images className="h-8 w-8 text-primary mx-2" />
        <Eye className="h-8 w-8 text-primary ml-2" />
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