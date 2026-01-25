import { cn } from "@/lib/utils";

interface WaveDividerProps {
  position?: 'top' | 'bottom';
  color?: string;
  height?: number;
  flip?: boolean;
  className?: string;
}

export const WaveDivider = ({
  position = 'bottom',
  color = 'hsl(var(--background))',
  height = 60,
  flip = false,
  className
}: WaveDividerProps) => {
  const isTop = position === 'top';
  
  return (
    <div 
      className={cn(
        "absolute left-0 right-0 w-full overflow-hidden pointer-events-none",
        isTop ? "top-0" : "bottom-0",
        className
      )}
      style={{ height: `${height}px` }}
      aria-hidden="true"
    >
      <svg
        className={cn(
          "absolute w-full h-full",
          flip && "scale-x-[-1]",
          isTop && "rotate-180"
        )}
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,0 C240,80 480,20 720,50 C960,80 1200,20 1440,60 L1440,100 L0,100 Z"
          fill={color}
        />
      </svg>
    </div>
  );
};
