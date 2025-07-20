
import * as React from "react";

interface SkipToContentProps {
  targetId: string;
  children: React.ReactNode;
}

const SkipToContent = ({ targetId, children }: SkipToContentProps) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <a
      href={`#${targetId}`}
      className="skip-to-content"
      onClick={handleClick}
    >
      {children}
    </a>
  );
};

export { SkipToContent };
