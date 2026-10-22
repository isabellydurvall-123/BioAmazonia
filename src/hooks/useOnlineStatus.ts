import { useEffect, useState, useCallback, useRef } from 'react';

// Heartbeat ping interval: 3 seconds for fast detection when Wi-Fi is toggled on laptops/desktops
const HEARTBEAT_INTERVAL_MS = 3000;
const PING_TIMEOUT_MS = 2500;

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  const isCheckingRef = useRef(false);

  // Active connectivity checker via lightweight cache-busted fetch
  const verifyConnectivity = useCallback(async () => {
    if (isCheckingRef.current) return;
    isCheckingRef.current = true;

    // Fast path: if OS directly reports offline, trust it immediately
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setIsOnline(false);
      isCheckingRef.current = false;
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);

      // Fetch a tiny static asset with cache-bust to ensure real network roundtrip
      const response = await fetch(`/favicon.png?_ping=${Date.now()}`, {
        method: 'HEAD',
        cache: 'no-store',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok || response.status === 304 || response.type === 'opaque') {
        setIsOnline(true);
      } else {
        // Non-200/304 response might still indicate server reachable, but if 5xx or offline
        setIsOnline(true);
      }
    } catch {
      // Network error, Failed to fetch, DNS resolution failure, AbortError -> OFFLINE!
      // This catches when Wi-Fi is turned off on notebooks even if virtual adapters exist.
      setIsOnline(false);
    } finally {
      isCheckingRef.current = false;
    }
  }, []);

  useEffect(() => {
    const handleNativeOnline = () => {
      // Re-verify immediately to ensure internet route is truly established
      verifyConnectivity();
    };

    const handleNativeOffline = () => {
      // Instant switch on native offline event (standard on mobile)
      setIsOnline(false);
    };

    const handleFocusOrVisible = () => {
      if (document.visibilityState === 'visible') {
        verifyConnectivity();
      }
    };

    // 1. Native DOM window events
    window.addEventListener('online', handleNativeOnline);
    window.addEventListener('offline', handleNativeOffline);
    window.addEventListener('focus', handleFocusOrVisible);
    document.addEventListener('visibilitychange', handleFocusOrVisible);

    // 2. Network Information API change event (if supported)
    const nav = navigator as any;
    if (nav?.connection && typeof nav.connection.addEventListener === 'function') {
      nav.connection.addEventListener('change', verifyConnectivity);
    }

    // 3. Initial check on mount
    verifyConnectivity();

    // 4. Regular heartbeat interval for desktop/notebooks with virtual network adapters
    const timer = setInterval(() => {
      verifyConnectivity();
    }, HEARTBEAT_INTERVAL_MS);

    return () => {
      window.removeEventListener('online', handleNativeOnline);
      window.removeEventListener('offline', handleNativeOffline);
      window.removeEventListener('focus', handleFocusOrVisible);
      document.removeEventListener('visibilitychange', handleFocusOrVisible);
      if (nav?.connection && typeof nav.connection.removeEventListener === 'function') {
        nav.connection.removeEventListener('change', verifyConnectivity);
      }
      clearInterval(timer);
    };
  }, [verifyConnectivity]);

  return isOnline;
}
