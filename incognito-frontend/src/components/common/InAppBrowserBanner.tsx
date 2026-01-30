import React, { useState } from 'react';
import { useInAppBrowser } from '../../hooks/useInAppBrowser';
import { Button } from './Button';

export const InAppBrowserBanner: React.FC = () => {
  const browserInfo = useInAppBrowser();
  const [dismissed, setDismissed] = useState(false);

  if (!browserInfo.isInAppBrowser || dismissed) {
    return null;
  }

  const handleOpenInBrowser = () => {
    const currentUrl = window.location.href;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);

    if (isMobile) {
      // ✅ MOBILE DEVICES: Try Brave → Chrome → Safari (iOS) → Default
      if (isIOS) {
        // iOS: Try Safari first, then fallback
        const safariUrl = `x-safari-${currentUrl}`;
        const chromeUrl = `googlechrome://${currentUrl.replace(/^https?:\/\//, '')}`;
        const braveUrl = `brave://${currentUrl.replace(/^https?:\/\//, '')}`;

        // Try Brave first
        const braveWindow = window.open(braveUrl, '_blank');
        
        // If Brave doesn't open, try Chrome
        setTimeout(() => {
          if (!braveWindow || braveWindow.closed) {
            const chromeWindow = window.open(chromeUrl, '_blank');
            
            // If Chrome doesn't open, fallback to Safari
            setTimeout(() => {
              if (!chromeWindow || chromeWindow.closed) {
                window.location.href = safariUrl;
              }
            }, 500);
          }
        }, 500);
      } else if (isAndroid) {
        // Android: Try Brave → Chrome → Default browser
        const intentUrl = `intent://${currentUrl.replace(/^https?:\/\//, '')}#Intent;scheme=https;end`;
        const braveUrl = `brave://open-url?url=${encodeURIComponent(currentUrl)}`;
        const chromeUrl = `googlechrome://navigate?url=${encodeURIComponent(currentUrl)}`;

        // Try Brave first
        const braveWindow = window.open(braveUrl, '_blank');
        
        setTimeout(() => {
          if (!braveWindow || braveWindow.closed) {
            // Try Chrome
            const chromeWindow = window.open(chromeUrl, '_blank');
            
            setTimeout(() => {
              if (!chromeWindow || chromeWindow.closed) {
                // Fallback to Android Intent
                window.location.href = intentUrl;
              }
            }, 500);
          }
        }, 500);
      }
    } else {
      // ✅ DESKTOP: Open in default browser (new tab)
      window.open(currentUrl, '_blank');
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied! Paste it in your browser to continue.');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-yellow-500/90 backdrop-blur-sm border-b border-yellow-600 p-3 sm:p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-900" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-semibold text-yellow-900 mb-1">
              You're viewing this in {browserInfo.browserName}
            </p>
            <p className="text-[10px] sm:text-xs text-yellow-800 mb-2">
              For the best experience, open this link in your browser (Brave, Chrome, Safari, etc.)
            </p>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleOpenInBrowser}
                className="text-[10px] sm:text-xs font-medium text-yellow-900 bg-yellow-300 hover:bg-yellow-400 px-3 py-1.5 rounded-md transition-colors"
              >
                Open in Browser
              </button>
              <button
                onClick={handleCopyLink}
                className="text-[10px] sm:text-xs font-medium text-yellow-900 bg-yellow-300 hover:bg-yellow-400 px-3 py-1.5 rounded-md transition-colors"
              >
                Copy Link
              </button>
              <button
                onClick={() => setDismissed(true)}
                className="text-[10px] sm:text-xs font-medium text-yellow-900 hover:text-yellow-950 px-2 py-1.5 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
          
          <button
            onClick={() => setDismissed(true)}
            className="flex-shrink-0 text-yellow-900 hover:text-yellow-950 transition-colors"
            aria-label="Close"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};