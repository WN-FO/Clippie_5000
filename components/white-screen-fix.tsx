'use client';

import { useEffect } from 'react';

/**
 * This component attempts to fix white screen issues that can occur
 * when there are invisible/white overlays with high z-index values
 * covering the entire page. Often these issues occur with modals,
 * loading screens, or auth providers.
 */
export default function WhiteScreenFix() {
  useEffect(() => {
    // Add a style that forces high z-index elements to show content
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      /* Force white overlays to be visible or allow clicks through */
      div[style*="position: fixed"][style*="inset: 0"] {
        background-color: transparent !important;
        pointer-events: none !important;
      }
      
      /* Allow clicks through elements with high z-index */
      div[style*="z-index"] {
        pointer-events: none !important;
      }
      
      /* But keep the content inside clickable */
      div[style*="z-index"] * {
        pointer-events: auto !important;
      }
      
      /* Make sure we can see important content */
      body > div, #__next {
        z-index: 9999 !important;
        position: relative !important;
      }
    `;
    
    document.head.appendChild(styleElement);
    
    console.log('🛠️ WhiteScreenFix applied');
    
    return () => {
      document.head.removeChild(styleElement);
      console.log('🛠️ WhiteScreenFix removed');
    };
  }, []);
  
  return null;
} 