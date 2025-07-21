
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
          "relative mx-auto sphere-container",
          sizeClasses[size]
        )}
        style={{
          perspective: '400px',
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Outer rotating sphere */}
        <div className="absolute inset-0 sphere-outer">
          {/* Multiple sphere faces for 3D effect */}
          <div className="sphere-face sphere-face-1"></div>
          <div className="sphere-face sphere-face-2"></div>
          <div className="sphere-face sphere-face-3"></div>
          <div className="sphere-face sphere-face-4"></div>
          <div className="sphere-face sphere-face-5"></div>
          <div className="sphere-face sphere-face-6"></div>
        </div>
        
        {/* Inner rotating ring */}
        <div className="absolute inset-0 sphere-inner">
          <div className="sphere-ring sphere-ring-1"></div>
          <div className="sphere-ring sphere-ring-2"></div>
          <div className="sphere-ring sphere-ring-3"></div>
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
        .sphere-container {
          transform-style: preserve-3d;
          animation: sphereFloat 4s ease-in-out infinite;
        }

        .sphere-outer {
          transform-style: preserve-3d;
          animation: sphereRotateY 8s linear infinite;
        }

        .sphere-inner {
          transform-style: preserve-3d;
          animation: sphereRotateX 6s linear infinite reverse;
        }

        .sphere-face {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: linear-gradient(135deg, 
            hsla(0, 80%, 45%, 0.1) 0%, 
            hsla(0, 80%, 60%, 0.05) 50%, 
            hsla(0, 80%, 45%, 0.1) 100%
          );
          border: 1px solid hsla(0, 80%, 45%, 0.2);
          box-shadow: 
            0 0 20px hsla(0, 80%, 45%, 0.1),
            inset 0 0 20px hsla(0, 80%, 45%, 0.05);
        }

        .sphere-face-1 { transform: rotateY(0deg) translateZ(32px); }
        .sphere-face-2 { transform: rotateY(60deg) translateZ(32px); }
        .sphere-face-3 { transform: rotateY(120deg) translateZ(32px); }
        .sphere-face-4 { transform: rotateY(180deg) translateZ(32px); }
        .sphere-face-5 { transform: rotateY(240deg) translateZ(32px); }
        .sphere-face-6 { transform: rotateY(300deg) translateZ(32px); }

        .sphere-ring {
          position: absolute;
          width: 120%;
          height: 120%;
          top: -10%;
          left: -10%;
          border-radius: 50%;
          border: 1px solid hsla(45, 85%, 55%, 0.3);
          box-shadow: 0 0 15px hsla(45, 85%, 55%, 0.2);
        }

        .sphere-ring-1 { 
          transform: rotateX(0deg) rotateY(0deg);
          animation: ringRotate1 10s linear infinite;
        }
        .sphere-ring-2 { 
          transform: rotateX(60deg) rotateY(120deg);
          animation: ringRotate2 12s linear infinite reverse;
        }
        .sphere-ring-3 { 
          transform: rotateX(120deg) rotateY(240deg);
          animation: ringRotate3 14s linear infinite;
        }

        @keyframes sphereRotateY {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }

        @keyframes sphereRotateX {
          0% { transform: rotateX(0deg); }
          100% { transform: rotateX(360deg); }
        }

        @keyframes sphereFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        @keyframes ringRotate1 {
          0% { transform: rotateX(0deg) rotateY(0deg); }
          100% { transform: rotateX(360deg) rotateY(360deg); }
        }

        @keyframes ringRotate2 {
          0% { transform: rotateX(60deg) rotateY(120deg); }
          100% { transform: rotateX(420deg) rotateY(480deg); }
        }

        @keyframes ringRotate3 {
          0% { transform: rotateX(120deg) rotateY(240deg); }
          100% { transform: rotateX(480deg) rotateY(600deg); }
        }

        .sphere-container:hover .sphere-outer {
          animation-duration: 2s;
        }

        .sphere-container:hover .sphere-inner {
          animation-duration: 1.5s;
        }

        .sphere-container:hover .sphere-ring-1 {
          animation-duration: 3s;
        }

        .sphere-container:hover .sphere-ring-2 {
          animation-duration: 2.5s;
        }

        .sphere-container:hover .sphere-ring-3 {
          animation-duration: 2s;
        }

        @media (prefers-reduced-motion: reduce) {
          .sphere-container,
          .sphere-outer,
          .sphere-inner,
          .sphere-ring-1,
          .sphere-ring-2,
          .sphere-ring-3 {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};
