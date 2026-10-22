import React from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstalled, isIOS, install } = usePWAInstall();

  // Se o aplicativo já estiver rodando instalado em modo standalone, oculta o botão
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // 1. Aciona diretamente a instalação nativa do navegador (Chromium, Android, Edge, Chrome)
    const outcome = await install();

    // 2. Se for iOS Safari (onde a Apple bloqueia beforeinstallprompt), aciona o menu nativo de compartilhamento
    if (outcome === 'manual_needed' && isIOS && typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: 'BioAmazônia',
          text: 'Instalar aplicativo BioAmazônia na tela de início',
          url: window.location.href,
        });
      } catch {
        // Usuário apenas cancelou o share sheet nativo
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleInstallClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-xs transition-colors whitespace-nowrap cursor-pointer active:scale-95 border border-emerald-700/50"
      title="Instalar BioAmazônia diretamente no seu dispositivo"
    >
      <img
        src="/icon.svg"
        alt=""
        aria-hidden="true"
        className="w-4 h-4 rounded-xs shadow-2xs object-cover"
      />
      <span>Instalar App</span>
    </button>
  );
};
