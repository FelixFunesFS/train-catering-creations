import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ImageMenuCardProps {
  title: string;
  subtitle: string;
  items: string[];
  sections?: Array<{
    title: string;
    items: string[];
    color: string;
  }>;
  backgroundImage: string;
  overlayColor?: string;
}

const ImageMenuCard = ({ 
  title, 
  subtitle, 
  items, 
  sections, 
  backgroundImage, 
  overlayColor = "bg-black/40" 
}: ImageMenuCardProps) => {
  return (
    <Card className="overflow-hidden shadow-elegant hover:shadow-glow transition-all duration-500 border-primary/20">
      {/* Header with background image */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={backgroundImage} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
        <div className={cn("absolute inset-0", overlayColor)} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        <CardHeader className="absolute bottom-0 left-0 right-0 text-white p-6">
          <CardTitle className="text-3xl font-elegant">{title}</CardTitle>
          <p className="text-white/90 italic">{subtitle}</p>
        </CardHeader>
      </div>

      <CardContent className="p-6">
        {sections ? (
          <div className="space-y-8">
            {sections.map((section, index) => (
              <div key={index} className={cn(
                "rounded-xl p-6 border transition-all duration-300 hover:shadow-md",
                section.color
              )}>
                <h3 className="text-xl font-elegant text-center text-foreground mb-6 relative">
                  {section.title}
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-current/60 rounded-full" />
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {section.items.map((item, itemIndex) => (
                    <div 
                      key={itemIndex} 
                      className="bg-background/50 backdrop-blur-sm p-4 rounded-lg border border-white/10 hover:bg-background/70 transition-all duration-200 group"
                    >
                      <h4 className="text-base font-medium text-foreground group-hover:text-primary transition-colors">
                        {item}
                      </h4>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {items.map((item, index) => (
              <div 
                key={index} 
                className="bg-primary/5 p-4 rounded-lg border border-primary/10 hover:bg-primary/10 transition-all duration-200 group"
              >
                <h4 className="text-base font-medium text-foreground group-hover:text-primary transition-colors">
                  {item}
                </h4>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImageMenuCard;