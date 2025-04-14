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
    // Function to force content visibility
    const forceVisibility = () => {
      // Add styles to fix various white screen causes
      const styleElement = document.createElement('style');
      styleElement.innerHTML = `
        /* Force all root elements to be visible and stacked properly */
        html, body, #__next, [data-nextjs-root-layout], #app-root, #root, div[id^="__next"] {
          display: block !important;
          opacity: 1 !important;
          visibility: visible !important;
          pointer-events: auto !important;
          background: #FFFFFF !important;
          min-height: 100vh !important;
          position: relative !important;
          z-index: 1 !important;
          overflow: visible !important;
        }

        /* Force all child content to be visible */
        body > *, #__next > *, [data-nextjs-root-layout] > *, #app-root > * {
          display: block !important;
          opacity: 1 !important;
          visibility: visible !important;
          pointer-events: auto !important;
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

        /* Ensure content is always above overlays and visible */
        main, [role="main"], #main-content {
          position: relative !important;
          z-index: 100000 !important;
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          background: #FFFFFF !important;
        }
        
        /* Fix for Vercel blank screen issues */
        #__vercel, #__vercel-loading-overlay {
          opacity: 1 !important;
          visibility: visible !important;
        }
        
        /* Ensure app container is visible */
        div#app-root {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          z-index: 999999 !important;
        }
        
        /* Ensure title is always rendered */
        head title {
          display: block !important;
        }

        /* Fix for Next.js app router hiding content */
        [data-nextjs-scroll-focus-boundary], 
        [tabindex="-1"],
        [data-nextjs-router-tree],
        [data-nextjs-router] {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
        }

        /* Prevent empty divs from hiding content */
        div:empty {
          display: none !important;
        }
      `;
      
      document.head.appendChild(styleElement);
      
      // Try to remove any overlay elements that might be causing issues
      const removeOverlays = () => {
        const possibleOverlays = document.querySelectorAll('div[style*="position: fixed"][style*="inset: 0"]');
        possibleOverlays.forEach(overlay => {
          (overlay as HTMLElement).style.display = 'none';
        });
      };
      
      removeOverlays();
      
      return styleElement;
    };

    // Fix for local storage issues with isWhitelisted that can cause blank screens
    try {
      if (localStorage.getItem('isWhitelisted')) {
        localStorage.removeItem('isWhitelisted');
      }
    } catch (e) {
      console.log('Unable to access localStorage');
    }
    
    // Check if title element exists, create one if it doesn't
    const ensureTitleExists = () => {
      if (!document.querySelector('title')) {
        const titleElement = document.createElement('title');
        titleElement.textContent = 'Clippie 5000 - AI-Powered Video Clip Generator';
        document.head.appendChild(titleElement);
      }
    };
    
    // Force document body to be visible
    const forceBodyVisible = () => {
      if (document.body) {
        document.body.style.display = 'block';
        document.body.style.visibility = 'visible';
        document.body.style.opacity = '1';
        document.body.style.background = '#FFFFFF';
      }
    };
    
    // Check if main landmark exists
    const ensureMainExists = () => {
      if (!document.querySelector('main, [role="main"]')) {
        console.warn('No main landmark found in the document');
        // Create main if it doesn't exist
        const mainElement = document.createElement('main');
        mainElement.id = 'main-content';
        mainElement.setAttribute('role', 'main');
        mainElement.style.display = 'block';
        mainElement.style.visibility = 'visible';
        mainElement.style.opacity = '1';
        mainElement.style.zIndex = '100000';
        mainElement.style.position = 'relative';
        
        // Move all content from body to main if needed
        if (document.body && document.body.children.length > 0) {
          const fragment = document.createDocumentFragment();
          Array.from(document.body.children).forEach(child => {
            if (child.tagName !== 'SCRIPT' && child.tagName !== 'STYLE') {
              fragment.appendChild(child.cloneNode(true));
            }
          });
          mainElement.appendChild(fragment);
          document.body.appendChild(mainElement);
        }
      }
    };
    
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
      
      ensureTitleExists();
      ensureMainExists();
      forceBodyVisible();
    };

    // Apply fixes immediately
    const styleElement = forceVisibility();
    checkForIssues();
    
    // Apply fixes again after a delay to catch hydration issues
    const timers = [
      setTimeout(checkForIssues, 100),
      setTimeout(checkForIssues, 500),
      setTimeout(checkForIssues, 1000),
      setTimeout(checkForIssues, 2000)
    ];
    
    // Force a window resize to trigger responsive layouts
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
    
    return () => {
      // Clean up
      document.head.removeChild(styleElement);
      timers.forEach(timer => clearTimeout(timer));
    };
  }, []);
  
  return (
    <div id="white-screen-fix-marker" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: -1,
      opacity: 0
    }} />
  );
} 