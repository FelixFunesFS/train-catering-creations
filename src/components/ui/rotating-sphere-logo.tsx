
import { cn } from "@/lib/utils";

interface RotatingSphereLogo {
  className?: string;
  logoSrc: string;
  logoAlt: string;
  size?: 'sm' | 'md' | 'lg';
}

export const RotatingSphereLogo = ({ 
  className, 
  logoSrc, 
  logoAlt, 
  size = 'md' 
}: RotatingSphereLogo) => {
  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16',
    lg: 'h-20 w-20'
  };

  return (
    <div className={cn("relative", className)}>
      {/* Main sphere container */}
      <div 
        className={cn(
          "relative mx-auto glass-sphere-container",
          sizeClasses[size]
        )}
        style={{
          perspective: '400px',
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Single Glass Sphere */}
        <div className="glass-sphere">
          {/* Inner glass layer for depth */}
          <div className="glass-sphere-inner"></div>
          
          {/* Outer glass layer */}
          <div className="glass-sphere-outer"></div>
          
          {/* Subtle reflection highlights */}
          <div className="glass-sphere-highlight"></div>
        </div>
        
        {/* Logo at center */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="relative">
            <img 
              src={logoSrc} 
              alt={logoAlt}
              className="w-8 h-8 object-contain drop-shadow-lg"
            />
          </div>
        </div>
      </div>

      <style>{`
        .glass-sphere-container {
          transform-style: preserve-3d;
          animation: sphereFloat 4s ease-in-out infinite;
        }

        .glass-sphere {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          transform-style: preserve-3d;
          animation: sphereRotate 12s linear infinite;
        }

        .glass-sphere-inner {
          position: absolute;
          inset: 4px;
          border-radius: 50%;
          background: linear-gradient(135deg, 
            hsla(0, 0%, 100%, 0.1) 0%, 
            hsla(210, 5%, 85%, 0.05) 50%, 
            hsla(0, 0%, 100%, 0.1) 100%
          );
          border: 1px solid hsla(210, 5%, 85%, 0.3);
          backdrop-filter: blur(8px);
          box-shadow: 
            inset 0 0 20px hsla(0, 0%, 100%, 0.2),
            inset 0 0 40px hsla(210, 5%, 85%, 0.1);
        }

        .glass-sphere-outer {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: linear-gradient(135deg, 
            hsla(0, 0%, 100%, 0.15) 0%, 
            hsla(210, 5%, 85%, 0.08) 50%, 
            hsla(0, 0%, 100%, 0.15) 100%
          );
          border: 1px solid hsla(210, 5%, 85%, 0.2);
          backdrop-filter: blur(12px);
          box-shadow: 
            0 0 20px hsla(210, 5%, 85%, 0.15),
            0 0 40px hsla(210, 5%, 85%, 0.08),
            inset 0 2px 4px hsla(0, 0%, 100%, 0.3),
            inset 0 -2px 4px hsla(210, 5%, 75%, 0.2);
        }

        .glass-sphere-highlight {
          position: absolute;
          top: 15%;
          left: 15%;
          width: 30%;
          height: 30%;
          border-radius: 50%;
          background: linear-gradient(135deg, 
            hsla(0, 0%, 100%, 0.4) 0%, 
            hsla(0, 0%, 100%, 0.1) 100%
          );
          filter: blur(2px);
          opacity: 0.6;
        }

        @keyframes sphereRotate {
          0% { 
            transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg);
          }
          33% { 
            transform: rotateX(120deg) rotateY(120deg) rotateZ(120deg);
          }
          66% { 
            transform: rotateX(240deg) rotateY(240deg) rotateZ(240deg);
          }
          100% { 
            transform: rotateX(360deg) rotateY(360deg) rotateZ(360deg);
          }
        }

        @keyframes sphereFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        .glass-sphere-container:hover .glass-sphere {
          animation-duration: 4s;
        }

        .glass-sphere-container:hover .glass-sphere-outer {
          box-shadow: 
            0 0 30px hsla(210, 5%, 85%, 0.25),
            0 0 60px hsla(210, 5%, 85%, 0.15),
            inset 0 2px 4px hsla(0, 0%, 100%, 0.4),
            inset 0 -2px 4px hsla(210, 5%, 75%, 0.3);
        }

        .glass-sphere-container:hover .glass-sphere-highlight {
          opacity: 0.8;
        }

        @media (prefers-reduced-motion: reduce) {
          .glass-sphere-container,
          .glass-sphere {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};
