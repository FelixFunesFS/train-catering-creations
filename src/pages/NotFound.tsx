import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, Menu, Calendar, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const popularPages = [
    { name: "Home", href: "/", icon: Home },
    { name: "Menu", href: "/menu", icon: Menu },
    { name: "Request Quote", href: "/request-quote", icon: Calendar },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-foreground mb-2">Page Not Found</h2>
          <p className="text-muted-foreground mb-6">
            Sorry, we couldn't find the page you're looking for. The page may have been moved or doesn't exist.
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <Button asChild variant="default" size="lg" className="w-full">
            <Link to="/" className="flex items-center justify-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Return to Home
            </Link>
          </Button>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground mb-3">Or try one of these popular pages:</p>
          {popularPages.map((page) => {
            const IconComponent = page.icon;
            return (
              <Button
                key={page.name}
                asChild
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Link to={page.href} className="flex items-center justify-center gap-2">
                  <IconComponent className="h-4 w-4" />
                  {page.name}
                </Link>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NotFound;
