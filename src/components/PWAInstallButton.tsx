import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstalled, install } = usePWAInstall();
  const [installUnavailable, setInstallUnavailable] = useState(false);

  // Se o aplicativo já estiver rodando instalado em modo standalone, oculta o botão
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const outcome = await install();
    setInstallUnavailable(outcome === 'manual_needed');
  };

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-xs transition-colors whitespace-nowrap cursor-pointer active:scale-95 border border-emerald-700/50"
        title="Instalar BioAmazônia diretamente no seu dispositivo"
      >
        <span>Instalar App</span>
      </button>
      {installUnavailable && (
        <p role="status" className="fixed bottom-4 left-1/2 z-[60] -translate-x-1/2 rounded-lg bg-slate-900 px-4 py-3 text-center text-sm text-white shadow-lg">
          A instalação direta não está disponível neste navegador. Abra o site no Chrome ou Edge para instalar o app.
        </p>
      )}
    </>
  );
};
