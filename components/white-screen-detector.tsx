'use client';

import { useEffect, useState } from 'react';

/**
 * WhiteScreenDetector actively monitors for issues that might cause white screens
 * and attempts to fix them in real-time.
 */
export default function WhiteScreenDetector() {
  const [hasFixedIssue, setHasFixedIssue] = useState(false);

  useEffect(() => {
    // Function to detect and fix white screen issues
    const detectAndFixWhiteScreen = () => {
      // Check if body or main content is not visible
      const body = document.body;
      const mainContent = document.getElementById('main-content');
      const appRoot = document.getElementById('app-root');
      
      if (!body || !mainContent || !appRoot) return;
      
      const bodyStyle = window.getComputedStyle(body);
      const mainStyle = window.getComputedStyle(mainContent);
      const appStyle = window.getComputedStyle(appRoot);
      
      // Only fix visibility if elements are actually hidden
      const hasVisibilityIssue = 
        bodyStyle.display === 'none' || 
        bodyStyle.visibility === 'hidden' || 
        mainStyle.display === 'none' || 
        mainStyle.visibility === 'hidden' || 
        appStyle.display === 'none' || 
        appStyle.visibility === 'hidden';
      
      // Check for problematic overlays (white background with high z-index)
      const potentialOverlays = document.querySelectorAll('div[style*="position: fixed"]:not([role="dialog"]):not([data-radix-portal]):not([class*="toaster"])');
      let overlayIssueDetected = false;
      
      potentialOverlays.forEach(overlay => {
        const style = window.getComputedStyle(overlay);
        const zIndex = parseInt(style.zIndex, 10);
        
        // Only fix white overlays with very high z-index that cover the whole screen
        // and are not part of a legitimate UI component
        if (!isNaN(zIndex) && zIndex > 1000) {
          const bgColor = style.backgroundColor;
          const isFullScreen = style.width === '100%' && style.height === '100%';
          const opacity = parseFloat(style.opacity);
          
          // Check if this is likely an unwanted overlay
          const isUnwantedOverlay = 
            bgColor.includes('255, 255, 255') && // is white
            isFullScreen && // covers whole screen
            opacity > 0.9 && // is mostly opaque
            !overlay.hasAttribute('role') && // not a semantic element
            !overlay.id?.includes('portal') && // not a portal
            !overlay.className?.includes('modal') && // not a modal
            !overlay.className?.includes('dialog') && // not a dialog
            !overlay.className?.includes('toast'); // not a toast
          
          if (isUnwantedOverlay) {
            (overlay as HTMLElement).style.display = 'none';
            overlayIssueDetected = true;
            console.log('Fixed problematic overlay:', overlay);
          }
        }
      });
      
      // Fix visibility issues if detected
      if (hasVisibilityIssue) {
        if (bodyStyle.display === 'none') body.style.display = 'block';
        if (bodyStyle.visibility === 'hidden') body.style.visibility = 'visible';
        
        if (mainContent) {
          if (mainStyle.display === 'none') mainContent.style.display = 'block';
          if (mainStyle.visibility === 'hidden') mainContent.style.visibility = 'visible';
        }
        
        if (appRoot) {
          if (appStyle.display === 'none') appRoot.style.display = 'block';
          if (appStyle.visibility === 'hidden') appRoot.style.visibility = 'visible';
        }
        
        console.log('Fixed visibility issues');
        setHasFixedIssue(true);
      }
      
      return hasVisibilityIssue || overlayIssueDetected;
    };
    
    // Initial check after a short delay to allow for hydration
    const initialTimer = setTimeout(() => {
      detectAndFixWhiteScreen();
    }, 100);
    
    // Set up periodic check with a longer interval
    const intervalId = setInterval(detectAndFixWhiteScreen, 2000);
    
    // Also check after route changes
    const handleRouteChange = () => {
      setTimeout(detectAndFixWhiteScreen, 100);
    };
    
    window.addEventListener('popstate', handleRouteChange);
    
    // Clean up
    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalId);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);
  
  return null;
} 