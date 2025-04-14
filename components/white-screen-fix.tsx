'use client';

import { useEffect, useState } from 'react';

// Declare window type
declare global {
  interface Window {
    __INITIAL_STATE__: {
      hydrated: boolean;
      auth: any;
    };
  }
}

/**
 * Enhanced WhiteScreenFix component that addresses multiple causes of white screens:
 * 1. Invisible overlays with high z-index
 * 2. Race conditions during hydration
 * 3. Modal backdrops that may block content
 * 4. Auth provider overlays
 * 5. Vercel deployment issues with blank pages
 */
export default function WhiteScreenFix() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Mark as hydrated after initial render
    setIsHydrated(true);
    
    // Initialize state
    if (typeof window !== 'undefined') {
      window.__INITIAL_STATE__ = {
        ...window.__INITIAL_STATE__,
        hydrated: true
      };
    }

    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      /* Core fixes for white screen issues */
      html, body {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        background: #FFFFFF !important;
        min-height: 100vh !important;
        overflow: visible !important;
        position: relative !important;
        z-index: 0 !important;
      }

      /* Ensure Next.js root elements are visible */
      #__next,
      [data-nextjs-root-layout],
      #app-root,
      main,
      [role="main"] {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        min-height: 100vh !important;
        position: relative !important;
        z-index: 1 !important;
        background: #FFFFFF !important;
      }

      /* Fix Next.js App Router specific elements */
      [data-nextjs-scroll-focus-boundary],
      [data-nextjs-router],
      [data-nextjs-router-tree] {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        position: relative !important;
        z-index: 1 !important;
      }

      /* Remove any potential overlay issues */
      .overlay, .backdrop, [class*="overlay"], [class*="backdrop"] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }

      /* Ensure all content is visible */
      * {
        visibility: visible !important;
        opacity: 1 !important;
      }
    `;

    // Add the styles to the document
    document.head.appendChild(styleElement);

    // Check for and remove any potential overlay elements
    const checkForOverlays = () => {
      const overlays = document.querySelectorAll('div[style*="position: fixed"][style*="inset: 0"]');
      overlays.forEach(overlay => {
        const style = window.getComputedStyle(overlay);
        const zIndex = parseInt(style.zIndex, 10);
        if (!isNaN(zIndex) && zIndex > 1000) {
          overlay.remove();
        }
      });
    };

    // Run initial check
    checkForOverlays();

    // Force a re-render after a short delay
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
      checkForOverlays();
    }, 100);

    // Add a mutation observer to watch for new elements
    const observer = new MutationObserver(checkForOverlays);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.head.removeChild(styleElement);
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  // Only render after hydration
  if (!isHydrated) {
    return null;
  }

  return null;
} 