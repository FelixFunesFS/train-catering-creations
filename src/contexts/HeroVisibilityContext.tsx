import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface HeroVisibilityContextType {
  isHeroVisible: boolean;
  setIsHeroVisible: (visible: boolean) => void;
}

const HeroVisibilityContext = createContext<HeroVisibilityContextType | undefined>(undefined);

export const HeroVisibilityProvider = ({ children }: { children: ReactNode }) => {
  const [isHeroVisible, setIsHeroVisible] = useState(true);

  return (
    <HeroVisibilityContext.Provider value={{ isHeroVisible, setIsHeroVisible }}>
      {children}
    </HeroVisibilityContext.Provider>
  );
};

export const useHeroVisibility = () => {
  const context = useContext(HeroVisibilityContext);
  if (!context) {
    // Return default values when not inside provider (non-home pages)
    return { isHeroVisible: false, setIsHeroVisible: () => {} };
  }
  return context;
};
