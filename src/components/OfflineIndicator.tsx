import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg bg-emerald-950/90 text-white px-3.5 py-2 text-xs font-medium shadow-lg border border-emerald-800 backdrop-blur-xs animate-in slide-in-from-bottom-2">
      <WifiOff className="w-4 h-4 text-emerald-400 shrink-0" />
      <span>Modo Offline — O catálogo e os dados em cache continuam disponíveis.</span>
    </div>
  );
};
