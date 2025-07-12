import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
interface ImageModalProps {
  selectedImage: string | null;
  onClose: () => void;
}
export const ImageModal = ({
  selectedImage,
  onClose
}: ImageModalProps) => {
  return <Dialog open={!!selectedImage} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 bg-transparent border-0">
        <DialogTitle className="sr-only">Gallery Image</DialogTitle>
        <DialogDescription className="sr-only">Full size view of gallery image</DialogDescription>
        <div className="relative">
          <Button variant="ghost" size="sm" className="absolute -top-12 right-0 text-white hover:text-gray-300 z-10" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>
          {selectedImage && (
            <img 
              src={selectedImage} 
              alt="Gallery image" 
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>;
};