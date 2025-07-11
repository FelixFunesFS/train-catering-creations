import { FileText } from "lucide-react";

const QuoteHeader = () => {
  return (
    <div className="text-center mb-20">
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <FileText className="w-8 h-8 text-primary" />
        </div>
      </div>
      <h1 className="text-4xl lg:text-5xl font-elegant font-bold text-foreground mb-8">
        Request a Quote
      </h1>
      <div className="w-24 h-1 bg-gradient-primary mx-auto mb-10"></div>
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
        Let's create something amazing together. Tell us about your event and we'll provide a personalized quote within 24 hours.
      </p>
    </div>
  );
};

export default QuoteHeader;