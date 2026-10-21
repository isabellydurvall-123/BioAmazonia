import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share2, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // Se já estiver rodando como PWA instalado (standalone), oculta o botão
  if (isInstalled) {
    return null;
  }

  // Fluxo para navegadores Chromium / Android / Desktop com evento nativo
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-xs transition-colors whitespace-nowrap"
        title="Instalar aplicativo BioAmazônia no seu dispositivo"
      >
        <Download className="w-3.5 h-3.5" />
        Instalar App
      </button>
    );
  }

  // Fluxo para iOS Safari (não emite beforeinstallprompt)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-emerald-950/20 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-semibold transition-colors whitespace-nowrap"
        >
          <Share2 className="w-3.5 h-3.5" />
          Instalar no iOS
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl border border-slate-200 text-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-base font-bold text-slate-900">Instalar no iPhone / iPad</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Para ter o <strong>BioAmazônia</strong> como aplicativo na sua tela de início:
              </p>
              <ol className="text-xs text-slate-700 space-y-2 list-decimal pl-4 font-sans">
                <li>Toque no botão <strong>Compartilhar</strong> (ícone do quadrado com seta para cima) na barra do Safari.</li>
                <li>Role as opções para baixo e selecione <strong>Adicionar à Tela de Início</strong>.</li>
                <li>Toque em <strong>Adicionar</strong> no canto superior direito.</li>
              </ol>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-md transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
