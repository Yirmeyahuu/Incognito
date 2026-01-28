import { useState, useEffect } from 'react';

export interface BrowserInfo {
  isInAppBrowser: boolean;
  isInstagram: boolean;
  isFacebook: boolean;
  isMessenger: boolean;
  isTwitter: boolean;
  isTikTok: boolean;
  browserName: string;
}

export const useInAppBrowser = (): BrowserInfo => {
  const [browserInfo, setBrowserInfo] = useState<BrowserInfo>({
    isInAppBrowser: false,
    isInstagram: false,
    isFacebook: false,
    isMessenger: false,
    isTwitter: false,
    isTikTok: false,
    browserName: 'unknown',
  });

  useEffect(() => {
    const detectBrowser = () => {
      const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
      
      const isInstagram = /Instagram/i.test(ua);
      const isFacebook = /FBAN|FBAV/i.test(ua);
      const isMessenger = /FB_IAB|MESSENGER/i.test(ua);
      const isTwitter = /Twitter/i.test(ua);
      const isTikTok = /TikTok/i.test(ua);
      
      const isInAppBrowser = isInstagram || isFacebook || isMessenger || isTwitter || isTikTok;
      
      let browserName = 'unknown';
      if (isInstagram) browserName = 'Instagram';
      else if (isFacebook) browserName = 'Facebook';
      else if (isMessenger) browserName = 'Messenger';
      else if (isTwitter) browserName = 'Twitter';
      else if (isTikTok) browserName = 'TikTok';
      else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browserName = 'Safari';
      else if (/Chrome/i.test(ua)) browserName = 'Chrome';
      else if (/Firefox/i.test(ua)) browserName = 'Firefox';
      
      setBrowserInfo({
        isInAppBrowser,
        isInstagram,
        isFacebook,
        isMessenger,
        isTwitter,
        isTikTok,
        browserName,
      });
    };

    detectBrowser();
  }, []);

  return browserInfo;
};