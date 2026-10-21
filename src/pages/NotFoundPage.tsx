import React from 'react';
import { PageRoute } from '../types';
import { Compass, ArrowLeft } from 'lucide-react';

interface NotFoundPageProps {
  onNavigate: (page: PageRoute) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto">
        <Compass className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-mono font-semibold text-emerald-800 uppercase tracking-wider">
          Erro 404 · Rota Não Localizada
        </span>
        <h1 className="text-2xl font-bold text-slate-900">
          Espécime ou Página Não Encontrada
        </h1>
        <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
          O endereço solicitado não corresponde a nenhuma rota botânica ou módulo fitoquímico ativo na plataforma BioAmazônia.
        </p>
      </div>

      <div className="pt-2 flex justify-center gap-3">
        <button
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md bg-emerald-800 text-white hover:bg-emerald-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Retornar à Página Inicial
        </button>
        <button
          onClick={() => onNavigate('catalogo')}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Explorar Catálogo
        </button>
      </div>
    </div>
  );
};
