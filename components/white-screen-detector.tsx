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
      
      // Check for visibility issues
      const hasVisibilityIssue = 
        bodyStyle.display === 'none' || 
        bodyStyle.visibility === 'hidden' || 
        bodyStyle.opacity === '0' ||
        mainStyle.display === 'none' || 
        mainStyle.visibility === 'hidden' || 
        mainStyle.opacity === '0' ||
        appStyle.display === 'none' || 
        appStyle.visibility === 'hidden' || 
        appStyle.opacity === '0';
      
      // Check for overlay issues (elements with high z-index covering content)
      const potentialOverlays = document.querySelectorAll('div[style*="position: fixed"], div[style*="position: absolute"]');
      let overlayIssueDetected = false;
      
      potentialOverlays.forEach(overlay => {
        const style = window.getComputedStyle(overlay);
        const zIndex = parseInt(style.zIndex, 10);
        
        // Look for white overlays with high z-index
        if (!isNaN(zIndex) && zIndex > 100) {
          const bgColor = style.backgroundColor;
          const opacity = parseFloat(style.opacity);
          
          // Check if it's a white or transparent overlay with high z-index
          if ((bgColor.includes('255, 255, 255') || bgColor.includes('rgba(0, 0, 0, 0)')) && 
              style.width.includes('100') && 
              style.height.includes('100')) {
            
            // Fix overlay by making it transparent or removing it
            (overlay as HTMLElement).style.backgroundColor = 'transparent';
            (overlay as HTMLElement).style.display = 'none';
            (overlay as HTMLElement).style.zIndex = '-1';
            overlayIssueDetected = true;
            console.log('Fixed overlay issue:', overlay);
          }
        }
      });
      
      // Fix visibility issues
      if (hasVisibilityIssue) {
        body.style.display = 'block';
        body.style.visibility = 'visible';
        body.style.opacity = '1';
        
        if (mainContent) {
          mainContent.style.display = 'block';
          mainContent.style.visibility = 'visible';
          mainContent.style.opacity = '1';
        }
        
        if (appRoot) {
          appRoot.style.display = 'block';
          appRoot.style.visibility = 'visible';
          appRoot.style.opacity = '1';
        }
        
        console.log('Fixed visibility issues');
        setHasFixedIssue(true);
      }
      
      // Check if any fixes were applied
      if (hasVisibilityIssue || overlayIssueDetected) {
        return true;
      }
      
      return false;
    };
    
    // Run detection immediately
    const initialCheck = detectAndFixWhiteScreen();
    
    // Set up continuous monitoring
    const intervalId = setInterval(detectAndFixWhiteScreen, 1000);
    
    // Set up event listeners to detect issues after navigation or user interaction
    const checkAfterInteraction = () => {
      setTimeout(detectAndFixWhiteScreen, 100);
    };
    
    document.addEventListener('click', checkAfterInteraction);
    window.addEventListener('popstate', checkAfterInteraction);
    
    return () => {
      clearInterval(intervalId);
      document.removeEventListener('click', checkAfterInteraction);
      window.removeEventListener('popstate', checkAfterInteraction);
    };
  }, []);
  
  return null;
} 