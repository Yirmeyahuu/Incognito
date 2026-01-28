import { useEffect } from 'react';
import { preventClickjacking } from '../utils/security';

/**
 * Custom hook for security measures
 */
export const useSecurity = () => {
  useEffect(() => {
    // Prevent clickjacking
    preventClickjacking();

    // Disable right-click in production (optional)
    if (import.meta.env.PROD) {
      const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();
      };
      document.addEventListener('contextmenu', handleContextMenu);
      
      return () => {
        document.removeEventListener('contextmenu', handleContextMenu);
      };
    }
  }, []);

  // Prevent console access in production (optional)
  useEffect(() => {
    if (import.meta.env.PROD) {
      const disableConsole = () => {
        console.log = () => {};
        console.warn = () => {};
        console.error = () => {};
      };
      disableConsole();
    }
  }, []);
};