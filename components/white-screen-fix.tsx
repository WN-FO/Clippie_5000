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
    // Add styles to fix various white screen causes
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      /* Ensure the root elements are always visible */
      html, body, #__next, [data-nextjs-root-layout], #app-root {
        display: block !important;
        opacity: 1 !important;
        visibility: visible !important;
        pointer-events: auto !important;
        background: transparent !important;
        min-height: 100vh !important;
        position: relative !important;
      }

      /* Handle fixed position overlays */
      div[style*="position: fixed"],
      div[style*="position:fixed"] {
        background: transparent !important;
        pointer-events: none !important;
      }

      /* Make high z-index elements transparent but keep their children interactive */
      div[style*="z-index: 9999"],
      div[style*="z-index:9999"],
      div[style*="z-index: 99999"],
      div[style*="z-index:99999"] {
        background: transparent !important;
        pointer-events: none !important;
      }
      
      /* Keep modal content and auth forms clickable */
      div[style*="z-index"] > * {
        pointer-events: auto !important;
      }

      /* Ensure content is always above overlays */
      main, [role="main"] {
        position: relative !important;
        z-index: 100000 !important;
      }
      
      /* Fix for Vercel blank screen issues */
      #__vercel {
        opacity: 1 !important;
        visibility: visible !important;
      }
      
      /* Ensure app container is visible */
      div#app-root {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
      }
    `;
    
    document.head.appendChild(styleElement);
    
    // Fix for local storage issues with isWhitelisted that can cause blank screens
    try {
      if (localStorage.getItem('isWhitelisted')) {
        localStorage.removeItem('isWhitelisted');
      }
    } catch (e) {
      console.log('Unable to access localStorage');
    }
    
    // Log potential issues
    const checkForIssues = () => {
      const overlays = document.querySelectorAll('div[style*="position: fixed"]');
      const highZIndex = document.querySelectorAll('div[style*="z-index"]');
      
      if (overlays.length > 0) {
        console.log('🔍 Found fixed position overlays:', overlays.length);
      }
      
      if (highZIndex.length > 0) {
        console.log('🔍 Found high z-index elements:', highZIndex.length);
      }
    };

    // Check immediately and after a short delay
    checkForIssues();
    setTimeout(checkForIssues, 1000);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
  
  // Force a re-render after mount to help with hydration
  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  return null;
} 