'use client';

import { useState, useEffect } from 'react';

/**
 * DebuggerTool provides a floating utility for diagnosing white screen issues
 * in production environments. Press F12 to activate.
 */
export default function DebuggerTool() {
  const [isVisible, setIsVisible] = useState(false);
  const [diagnostics, setDiagnostics] = useState<string[]>([]);
  
  useEffect(() => {
    // Add keyboard shortcut to toggle the debugger (F12)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F12') {
        e.preventDefault();
        setIsVisible(!isVisible);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    // Run diagnostics when visible
    if (isVisible) {
      runDiagnostics();
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible]);
  
  const runDiagnostics = () => {
    const results: string[] = [];
    
    // Check body visibility
    const body = document.body;
    const bodyStyle = window.getComputedStyle(body);
    results.push(`Body visibility: ${bodyStyle.visibility}, display: ${bodyStyle.display}, opacity: ${bodyStyle.opacity}`);
    
    // Check app-root
    const appRoot = document.getElementById('app-root');
    if (appRoot) {
      const appRootStyle = window.getComputedStyle(appRoot);
      results.push(`App root visibility: ${appRootStyle.visibility}, display: ${appRootStyle.display}, opacity: ${appRootStyle.opacity}, z-index: ${appRootStyle.zIndex}`);
    } else {
      results.push('App root element not found!');
    }
    
    // Check main content
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      const mainContentStyle = window.getComputedStyle(mainContent);
      results.push(`Main content visibility: ${mainContentStyle.visibility}, display: ${mainContentStyle.display}, opacity: ${mainContentStyle.opacity}, z-index: ${mainContentStyle.zIndex}`);
    } else {
      results.push('Main content element not found!');
    }
    
    // Find potential overlay elements
    const overlays = document.querySelectorAll('div[style*="position: fixed"], div[style*="position: absolute"]');
    results.push(`Found ${overlays.length} potential overlay elements`);
    
    // Check top 5 overlays with highest z-index
    const overlayArray = Array.from(overlays);
    const highZIndexOverlays = overlayArray
      .map(el => ({ 
        el, 
        zIndex: parseInt(window.getComputedStyle(el).zIndex, 10) || 0,
        bgColor: window.getComputedStyle(el).backgroundColor
      }))
      .filter(item => !isNaN(item.zIndex) && item.zIndex > 0)
      .sort((a, b) => b.zIndex - a.zIndex)
      .slice(0, 5);
    
    highZIndexOverlays.forEach((item, index) => {
      results.push(`Overlay ${index+1}: z-index ${item.zIndex}, background: ${item.bgColor}, classes: ${(item.el as HTMLElement).className}`);
    });
    
    // Check window dimensions
    results.push(`Window dimensions: ${window.innerWidth}x${window.innerHeight}`);
    
    // Check if we're in an iframe (common cause of issues)
    results.push(`In iframe: ${window.self !== window.top}`);
    
    setDiagnostics(results);
  };
  
  const fixWhiteScreen = () => {
    // Apply aggressive fixes
    document.body.style.display = 'block';
    document.body.style.visibility = 'visible';
    document.body.style.opacity = '1';
    
    const appRoot = document.getElementById('app-root');
    if (appRoot) {
      appRoot.style.display = 'block';
      appRoot.style.visibility = 'visible';
      appRoot.style.opacity = '1';
      appRoot.style.zIndex = '10';
    }
    
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.style.display = 'block';
      mainContent.style.visibility = 'visible';
      mainContent.style.opacity = '1';
      mainContent.style.zIndex = '10';
    }
    
    // Find and fix overlay elements
    const overlays = document.querySelectorAll('div[style*="position: fixed"], div[style*="position: absolute"]');
    overlays.forEach(overlay => {
      const style = window.getComputedStyle(overlay);
      const zIndex = parseInt(style.zIndex, 10);
      
      if (!isNaN(zIndex) && zIndex > 100) {
        // Check if it's a white overlay
        const bgColor = style.backgroundColor;
        if (bgColor.includes('255, 255, 255')) {
          (overlay as HTMLElement).style.backgroundColor = 'transparent';
          (overlay as HTMLElement).style.display = 'none';
        }
      }
    });
    
    setDiagnostics([...diagnostics, 'Applied white screen fixes!']);
  };
  
  if (!isVisible) return null;
  
  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '400px',
        maxHeight: '80vh',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        zIndex: 99999,
        padding: '15px',
        borderRadius: '8px',
        fontFamily: 'monospace',
        fontSize: '12px',
        overflowY: 'auto',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)'
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '14px' }}>
        White Screen Debugger
      </div>
      
      <button 
        onClick={runDiagnostics}
        style={{
          backgroundColor: '#4a4a4a',
          border: 'none',
          color: 'white',
          padding: '5px 10px',
          borderRadius: '4px',
          marginRight: '10px',
          cursor: 'pointer'
        }}
      >
        Run Diagnostics
      </button>
      
      <button 
        onClick={fixWhiteScreen}
        style={{
          backgroundColor: '#38a169',
          border: 'none',
          color: 'white',
          padding: '5px 10px',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Fix White Screen
      </button>
      
      <div style={{ marginTop: '15px' }}>
        {diagnostics.map((message, index) => (
          <div key={index} style={{ marginBottom: '5px', lineHeight: '1.4' }}>
            &gt; {message}
          </div>
        ))}
      </div>
    </div>
  );
} 