
import React, { useState } from "react";
import { Phone, MessageSquare, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export const QuickActionButton = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const actions = [
    {
      icon: Phone,
      label: "Call Now",
      href: "tel:8439700265",
      className: "bg-green-500 hover:bg-green-600 text-white"
    },
    {
      icon: MessageSquare,
      label: "Get Quote",
      href: "/request-quote#page-header",
      className: "bg-primary hover:bg-primary-dark text-primary-foreground"
    },
    {
      icon: Heart,
      label: "Save Menu",
      onClick: () => {
        localStorage.setItem('savedMenu', 'true');
        alert('Menu saved to favorites!');
      },
      className: "bg-red-500 hover:bg-red-600 text-white"
    }
  ];

  return (
    <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 lg:hidden">
      <div className={cn(
        "flex flex-col-reverse space-y-reverse space-y-2 sm:space-y-3 transition-all duration-300",
        isExpanded ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
      )}>
        {actions.map((action, index) => (
          <div key={action.label} style={{ transitionDelay: `${index * 50}ms` }}>
            {action.href ? (
              <a
                href={action.href}
                className={cn(
                  "flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full shadow-lg transition-all duration-200 hover:scale-110",
                  action.className
                )}
                title={action.label}
              >
                <action.icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>
            ) : (
              <button
                onClick={action.onClick}
                className={cn(
                  "flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full shadow-lg transition-all duration-200 hover:scale-110",
                  action.className
                )}
                title={action.label}
              >
                <action.icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            )}
          </div>
        ))}
      </div>
      
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-primary text-primary-foreground rounded-full shadow-lg transition-all duration-300 hover:scale-110 mt-2 sm:mt-3",
          isExpanded && "rotate-45"
        )}
        aria-label="Quick Actions"
      >
        <div className="relative">
          <div className="w-4 h-0.5 sm:w-5 sm:h-0.5 bg-current absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          <div className="w-0.5 h-4 sm:w-0.5 sm:h-5 bg-current absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
      </button>
    </div>
  );
};
