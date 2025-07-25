import React from 'react';

export const LoadingFallback: React.FC = () => {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-accent/10 flex items-center justify-center">
      <div className="text-center">
        {/* Loading Train Animation */}
        <div className="mb-8">
          <div className="relative">
            {/* Train cars */}
            <div className="flex items-center justify-center space-x-2 animate-pulse">
              <div className="w-12 h-8 bg-primary rounded-lg"></div>
              <div className="w-10 h-6 bg-secondary rounded-lg"></div>
              <div className="w-8 h-5 bg-accent rounded-lg"></div>
            </div>
            
            {/* Steam animation */}
            <div className="absolute -top-4 left-2 flex space-x-1">
              {[0, 0.5, 1].map((delay, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-muted-foreground/30 rounded-full animate-bounce"
                  style={{ animationDelay: `${delay}s` }}
                ></div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Loading Text */}
        <h2 className="text-2xl font-bold text-foreground mb-4 font-['Dancing_Script']">
          All aboard!
        </h2>
        <p className="text-muted-foreground mb-6">
          Loading your premium catering experience...
        </p>
        
        {/* Progress Bar */}
        <div className="w-64 h-2 bg-muted rounded-full overflow-hidden mx-auto">
          <div className="h-full bg-primary rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};