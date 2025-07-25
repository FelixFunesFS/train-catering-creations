import { useState, useEffect, useRef, ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface MicroInteractionZonesProps {
  children: ReactNode;
}

interface InteractionZone {
  x: number;
  y: number;
  size: number;
  opacity: number;
  id: string;
}

export const MicroInteractionZones = ({ children }: MicroInteractionZonesProps) => {
  const [interactionZones, setInteractionZones] = useState<InteractionZone[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isInteracting, setIsInteracting] = useState(false);
  const [deviceTilt, setDeviceTilt] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Mouse/cursor tracking for desktop
  useEffect(() => {
    if (isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      setMousePosition({ x, y });
      setIsInteracting(true);
      
      // Create interaction zone
      const newZone: InteractionZone = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        size: Math.random() * 50 + 30,
        opacity: 0.6,
        id: Date.now().toString()
      };

      setInteractionZones(prev => [...prev.slice(-4), newZone]);
    };

    const handleMouseLeave = () => {
      setIsInteracting(false);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', handleMouseLeave);
      
      return () => {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, [isMobile]);

  // Device orientation tracking for mobile
  useEffect(() => {
    if (!isMobile) return;

    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && e.beta !== null) {
        setDeviceTilt({
          x: Math.max(-30, Math.min(30, e.gamma)) / 30, // Normalize to -1 to 1
          y: Math.max(-30, Math.min(30, e.beta)) / 30
        });
      }
    };

    // Request permission for iOS devices
    if (typeof DeviceOrientationEvent !== 'undefined' && 'requestPermission' in DeviceOrientationEvent) {
      (DeviceOrientationEvent as any).requestPermission()
        .then((permission: string) => {
          if (permission === 'granted') {
            window.addEventListener('deviceorientation', handleDeviceOrientation);
          }
        });
    } else {
      window.addEventListener('deviceorientation', handleDeviceOrientation);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
    };
  }, [isMobile]);

  // Touch interaction for mobile
  useEffect(() => {
    if (!isMobile) return;

    const handleTouchMove = (e: TouchEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const touch = e.touches[0];
      
      if (touch) {
        const newZone: InteractionZone = {
          x: touch.clientX - rect.left,
          y: touch.clientY - rect.top,
          size: Math.random() * 40 + 20,
          opacity: 0.4,
          id: Date.now().toString()
        };

        setInteractionZones(prev => [...prev.slice(-2), newZone]);
        setIsInteracting(true);
      }
    };

    const handleTouchEnd = () => {
      setIsInteracting(false);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('touchmove', handleTouchMove);
      container.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isMobile]);

  // Clean up old interaction zones
  useEffect(() => {
    const interval = setInterval(() => {
      setInteractionZones(prev => 
        prev.map(zone => ({
          ...zone,
          opacity: zone.opacity * 0.95,
          size: zone.size * 1.02
        })).filter(zone => zone.opacity > 0.1)
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Calculate parallax effect
  const getParallaxStyle = () => {
    if (isMobile) {
      // Use device tilt for mobile parallax
      return {
        transform: `translate(${deviceTilt.x * 10}px, ${deviceTilt.y * 10}px)`,
        transition: 'transform 0.3s ease-out'
      };
    } else {
      // Use mouse position for desktop parallax
      const offsetX = (mousePosition.x - 50) * 0.1;
      const offsetY = (mousePosition.y - 50) * 0.1;
      return {
        transform: `translate(${offsetX}px, ${offsetY}px)`,
        transition: isInteracting ? 'none' : 'transform 0.3s ease-out'
      };
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative overflow-hidden"
      style={{
        cursor: !isMobile && isInteracting ? 'none' : 'default'
      }}
    >
      {/* Parallax Background Elements */}
      <div 
        className="absolute inset-0 pointer-events-none z-0"
        style={getParallaxStyle()}
      >
        {/* Floating geometric shapes */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-primary/5 rounded-full blur-sm animate-pulse" />
        <div className="absolute top-1/3 right-20 w-16 h-16 bg-secondary/5 rounded-full blur-sm animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/4 left-1/4 w-12 h-12 bg-accent/5 rounded-full blur-sm animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-muted/10 rounded-full blur-sm animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>

      {/* Interaction Zones */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {interactionZones.map(zone => (
          <div
            key={zone.id}
            className="absolute rounded-full bg-gradient-radial from-primary/20 to-transparent animate-ping"
            style={{
              left: zone.x - zone.size / 2,
              top: zone.y - zone.size / 2,
              width: zone.size,
              height: zone.size,
              opacity: zone.opacity,
              animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite'
            }}
          />
        ))}
      </div>

      {/* Custom Cursor for Desktop */}
      {!isMobile && isInteracting && (
        <div
          className="fixed w-8 h-8 rounded-full bg-primary/30 backdrop-blur-sm border border-primary/50 pointer-events-none z-50 mix-blend-difference"
          style={{
            left: mousePosition.x + '%',
            top: mousePosition.y + '%',
            transform: 'translate(-50%, -50%)',
            transition: 'all 0.1s ease-out'
          }}
        />
      )}

      {/* Haptic Feedback Simulation for Mobile */}
      {isMobile && isInteracting && (
        <div className="absolute inset-0 pointer-events-none z-20">
          <div className="w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 animate-pulse" />
        </div>
      )}

      {/* Main Content */}
      <div 
        className="relative z-30"
        style={{
          filter: isInteracting ? 'contrast(1.05) saturate(1.1)' : 'none',
          transition: 'filter 0.3s ease-out'
        }}
      >
        {children}
      </div>

      {/* Ambient Background Gradient */}
      <div 
        className="absolute inset-0 pointer-events-none z-5"
        style={{
          background: isMobile 
            ? `radial-gradient(circle at ${50 + deviceTilt.x * 20}% ${50 + deviceTilt.y * 20}%, hsl(var(--primary) / 0.05) 0%, transparent 70%)`
            : `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, hsl(var(--primary) / 0.05) 0%, transparent 70%)`,
          transition: 'background 0.3s ease-out'
        }}
      />
    </div>
  );
};