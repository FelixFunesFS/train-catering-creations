import { useMediaQuery } from "./useMediaQuery";

const MOBILE_BREAKPOINT = 1024;

export function useIsMobile() {
  // Use centralized media query hook to avoid forced reflows
  // from multiple components reading window.innerWidth
  return useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
}
