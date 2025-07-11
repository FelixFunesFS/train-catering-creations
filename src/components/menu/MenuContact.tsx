import { Card, CardContent } from "@/components/ui/card";

const MenuContact = () => {
  return (
    <Card className="shadow-elegant bg-gradient-card">
      <CardContent className="p-8 text-center">
        <h3 className="text-2xl font-elegant font-bold text-foreground mb-4">
          Custom Menu Planning
        </h3>
        <p className="text-muted-foreground mb-6">
          Every event is unique. Let us create a customized menu that perfectly fits your occasion, dietary needs, and budget.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-8">
          <a href="sms:8439700265" className="text-primary hover:text-primary-glow font-medium">
            Text (843) 970-0265
          </a>
          <a href="mailto:soultrainseatery@gmail.com" className="text-primary hover:text-primary-glow font-medium">
            Email Us
          </a>
        </div>
      </CardContent>
    </Card>
  );
};

export default MenuContact;