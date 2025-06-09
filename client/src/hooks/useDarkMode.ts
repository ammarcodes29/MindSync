import { useEffect } from "react";
import { useTheme } from "next-themes";

/**
 * Custom hook for managing dark mode
 * Wraps next-themes' useTheme hook for easier use
 */
export function useDarkMode() {
  const { theme, setTheme, systemTheme } = useTheme();
  
  // Ensure theme is synced with system on initial load
  useEffect(() => {
    // If theme hasn't been set yet and we're in a browser environment
    if (typeof window !== 'undefined' && !theme) {
      // Get system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, [theme, setTheme]);
  
  // Determine if dark mode is currently active
  const isDarkMode = theme === 'dark' || (theme === 'system' && systemTheme === 'dark');
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };
  
  // Explicitly set dark mode on or off
  const enableDarkMode = () => setTheme('dark');
  const disableDarkMode = () => setTheme('light');
  
  return {
    isDarkMode,
    toggleDarkMode,
    enableDarkMode,
    disableDarkMode,
    theme,
    setTheme,
  };
}
