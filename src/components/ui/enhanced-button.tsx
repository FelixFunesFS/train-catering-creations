import * as React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMagneticEffect } from "@/hooks/useHover";

interface EnhancedButtonProps extends ButtonProps {
  magnetic?: boolean;
  ripple?: boolean;
  loading?: boolean;
}

export const EnhancedButton = React.forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({ className, magnetic = false, ripple = false, loading = false, children, onClick, ...props }, ref) => {
    const { ref: magneticRef, position } = useMagneticEffect(0.15);
    const [ripples, setRipples] = React.useState<Array<{ id: string; x: number; y: number }>>([]);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (ripple && !loading) {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const id = Date.now().toString();
        
        setRipples(prev => [...prev, { id, x, y }]);
        
        setTimeout(() => {
          setRipples(prev => prev.filter(ripple => ripple.id !== id));
        }, 600);
      }
      
      if (onClick && !loading) {
        onClick(event);
      }
    };

    const combinedRef = React.useCallback((node: HTMLButtonElement) => {
      if (magnetic) {
        (magneticRef as React.MutableRefObject<HTMLButtonElement>).current = node;
      }
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    }, [magnetic, magneticRef, ref]);

    return (
      <Button
        ref={combinedRef}
        className={cn(
          "relative overflow-hidden",
          magnetic && "transition-transform duration-300 ease-out",
          loading && "pointer-events-none",
          className
        )}
        style={
          magnetic
            ? { transform: `translate3d(${position.x}px, ${position.y}px, 0)` }
            : undefined
        }
        onClick={handleClick}
        disabled={loading}
        {...props}
      >
        {/* Loading spinner */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-inherit">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
          </div>
        )}
        
        {/* Button content */}
        <span className={cn(loading && "opacity-0")}>
          {children}
        </span>
        
        {/* Ripple effects */}
        {ripples.map(ripple => (
          <span
            key={ripple.id}
            className="absolute animate-ping bg-current opacity-30 rounded-full pointer-events-none"
            style={{
              left: ripple.x - 10,
              top: ripple.y - 10,
              width: 20,
              height: 20,
            }}
          />
        ))}
      </Button>
    );
  }
);

EnhancedButton.displayName = "EnhancedButton";