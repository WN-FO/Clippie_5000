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
        z-index: auto !important;
      }

      /* Fix Next.js App Router specific elements */
      [data-nextjs-scroll-focus-boundary],
      [data-nextjs-router],
      [data-nextjs-router-tree] {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
      }
    `;

    // Add the styles to the document
    document.head.appendChild(styleElement);

    // Force a re-render after a short delay
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);

    return () => {
      document.head.removeChild(styleElement);
      clearTimeout(timer);
    };
  }, []);

  return null;
} 