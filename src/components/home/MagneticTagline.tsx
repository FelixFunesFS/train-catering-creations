
import { motion, useAnimation } from 'framer-motion';
import { useEffect, useState } from 'react';

interface MagneticTaglineProps {
  text: string;
  className?: string;
  onAnimationComplete?: () => void;
}

export const MagneticTagline = ({ text, className = '', onAnimationComplete }: MagneticTaglineProps) => {
  const [showCursor, setShowCursor] = useState(false);
  const controls = useAnimation();
  
  const letters = text.split('');
  
  useEffect(() => {
    const animateLetters = async () => {
      // Start the typewriter effect
      await controls.start('visible');
      
      // Show cursor briefly
      setShowCursor(true);
      setTimeout(() => {
        setShowCursor(false);
        onAnimationComplete?.();
      }, 1000);
    };
    
    animateLetters();
  }, [controls, onAnimationComplete]);

  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
        delayChildren: 0.2
      }
    }
  };

  const letterVariants = {
    hidden: {
      opacity: 0,
      y: 10,
      scale: 0.8
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200
      }
    }
  };

  const magneticHover = {
    scale: 1.05,
    y: -2,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  };

  return (
    <motion.div
      className={`flex flex-wrap justify-center items-center perspective-1000 leading-relaxed ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate={controls}
    >
      {letters.map((letter, index) => (
        <motion.span
          key={index}
          className={`inline-block text-lg sm:text-xl lg:text-2xl font-elegant leading-relaxed bg-gradient-tagline bg-clip-text text-transparent bg-[length:200%_200%] cursor-default select-none will-change-transform ${
            letter === ' ' ? 'w-1' : ''
          }`}
          variants={letterVariants}
          whileHover={magneticHover}
          style={{
            display: 'inline-block',
            transformOrigin: 'center'
          }}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
      
      {/* Animated cursor */}
      {showCursor && (
        <motion.span
          className="inline-block w-0.5 h-6 sm:h-7 lg:h-8 bg-primary ml-1"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
};
