import * as React from "react";

const SMALL_BREAKPOINT = 640;
const MEDIUM_BREAKPOINT = 1024;

export type ScreenSize = "small" | "medium" | "large";

export function useScreenSize() {
  const [screenSize, setScreenSize] = React.useState<ScreenSize | undefined>(
    undefined
  );

  React.useEffect(() => {
    const getScreenSize = (): ScreenSize => {
      const width = window.innerWidth;
      if (width < SMALL_BREAKPOINT) return "small";
      if (width < MEDIUM_BREAKPOINT) return "medium";
      return "large";
    };

    const onChange = () => {
      setScreenSize(getScreenSize());
    };

    // Create media queries for both breakpoints
    const smallMql = window.matchMedia(
      `(max-width: ${SMALL_BREAKPOINT - 1}px)`
    );
    const mediumMql = window.matchMedia(
      `(min-width: ${SMALL_BREAKPOINT}px) and (max-width: ${
        MEDIUM_BREAKPOINT - 1
      }px)`
    );

    // Add listeners
    smallMql.addEventListener("change", onChange);
    mediumMql.addEventListener("change", onChange);

    // Set initial value
    setScreenSize(getScreenSize());

    return () => {
      smallMql.removeEventListener("change", onChange);
      mediumMql.removeEventListener("change", onChange);
    };
  }, []);

  return screenSize || "large"; // Default to large if undefined
}

// Keep your original hook as well if you need it elsewhere
const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined
  );

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}
