import * as React from "react";
interface SkipToContentProps {
  targetId: string;
  children: React.ReactNode;
}
const SkipToContent = ({
  targetId,
  children
}: SkipToContentProps) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };
  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
    >
      {children}
    </a>
  );
};
export { SkipToContent };