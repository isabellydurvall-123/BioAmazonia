import { useEffect, useState, useCallback } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

// Module-level prompt capture to prevent losing early beforeinstallprompt events
let capturedPrompt: BeforeInstallPromptEvent | null = null;

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    capturedPrompt = e as BeforeInstallPromptEvent;
  });
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() => capturedPrompt);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isAndroid, setIsAndroid] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    // 1. Detect standalone mode (app already installed and launched from home screen)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes('android-app://');
    
    setIsInstalled(isStandalone);

    // 2. Detect platform & mobile user agent
    const ua = (window.navigator.userAgent || '').toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(ua);
    const isAndroidDevice = /android/.test(ua);
    const isMobileDevice = isIOSDevice || isAndroidDevice || /mobile|tablet/.test(ua);

    setIsIOS(isIOSDevice);
    setIsAndroid(isAndroidDevice);
    setIsMobile(isMobileDevice);

    // 3. Listener for prompt if not captured yet
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      capturedPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      capturedPrompt = null;
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = useCallback(async (): Promise<'prompted' | 'manual_needed'> => {
    const promptToUse = deferredPrompt || capturedPrompt;
    if (!promptToUse) {
      // Native prompt not supported or not triggered yet (standard on iOS and some mobile browsers)
      return 'manual_needed';
    }

    try {
      await promptToUse.prompt();
      capturedPrompt = null;
      setDeferredPrompt(null);
      void promptToUse.userChoice.then(
        ({ outcome }) => {
          if (outcome === 'accepted') {
            setIsInstalled(true);
          }
        },
        (error: unknown) => {
          console.error('Não foi possível obter a resposta à instalação do app:', error);
        },
      );
      return 'prompted';
    } catch (err) {
      console.error('Erro ao disparar prompt de instalação:', err);
      return 'manual_needed';
    }
  }, [deferredPrompt]);

  return {
    isInstallable: !!(deferredPrompt || capturedPrompt),
    isInstalled,
    isIOS,
    isAndroid,
    isMobile,
    install,
    hasPrompt: !!(deferredPrompt || capturedPrompt)
  };
}
