'use client';

import { useEffect } from 'react';

/**
 * Enhanced WhiteScreenFix component that addresses multiple causes of white screens:
 * 1. Invisible overlays with high z-index
 * 2. Race conditions during hydration
 * 3. Modal backdrops that may block content
 * 4. Auth provider overlays
 * 5. Vercel deployment issues with blank pages
 */
export default function WhiteScreenFix() {
  useEffect(() => {
    // Create a cleanup function that will run periodically to detect and fix white screen overlays
    const cleanupOverlays = () => {
      // Find potential overlay elements that might be causing the white screen
      const overlays = document.querySelectorAll('div[style*="position: fixed"][style*="inset: 0"]');
      overlays.forEach(overlay => {
        const style = window.getComputedStyle(overlay);
        // Check if this overlay has a high z-index and is potentially blocking content
        if (parseInt(style.zIndex, 10) > 1000 && style.backgroundColor.includes('rgb(255, 255, 255)')) {
          // Make it invisible or remove it
          (overlay as HTMLElement).style.backgroundColor = 'transparent';
          (overlay as HTMLElement).style.zIndex = '-1';
          console.log('Fixed a white overlay element');
        }
      });
    };

    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      /* Core fixes for white screen issues */
      html, body {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        background: #FFFFFF !important;
        min-height: 100vh !important;
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
        z-index: 10 !important;
      }

      /* Fix Next.js App Router specific elements */
      [data-nextjs-scroll-focus-boundary],
      [data-nextjs-router],
      [data-nextjs-router-tree] {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
      }

      /* Target hidden white overlays */
      div[style*="position: fixed"][style*="inset: 0"] {
        pointer-events: none;
      }

      /* Ensure modals are always visible when they should be */
      [role="dialog"],
      .modal,
      .dialog {
        z-index: 9999 !important;
        visibility: visible !important;
        display: block !important;
      }
    `;

    // Add the styles to the document
    document.head.appendChild(styleElement);

    // Run initial cleanup
    cleanupOverlays();

    // Force a re-render after a short delay
    const initialTimer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
      cleanupOverlays();
    }, 100);

    // Set up a periodic check to clean up overlays that might appear after navigation
    const periodicTimer = setInterval(() => {
      cleanupOverlays();
    }, 1000);

    // Add click handler to catch and fix overlay issues immediately after user interaction
    const clickHandler = () => {
      setTimeout(cleanupOverlays, 50);
    };
    document.addEventListener('click', clickHandler);

    return () => {
      document.head.removeChild(styleElement);
      clearTimeout(initialTimer);
      clearInterval(periodicTimer);
      document.removeEventListener('click', clickHandler);
    };
  }, []);

  return null;
} 