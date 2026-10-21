import React from 'react';
import { PageRoute } from '../types';

interface FooterProps {
  onNavigate: (page: PageRoute) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Coluna 1: Sobre */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-emerald-700 flex items-center justify-center text-white font-bold text-xs">
                BA
              </div>
              <span className="font-bold text-white text-base tracking-tight font-display">
                BioAmazônia
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Plataforma científica para caracterização fitoquímica, cinética de degradação antioxidante e bioeconomia sustentável de espécies nativas do bioma amazônico.
            </p>
          </div>

          {/* Coluna 2: Navegação Científica */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Módulos do Projeto
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Página Inicial
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('catalogo')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Catálogo de Frutos Nativos
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('bioquimica')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Bioquímica de Antioxidantes
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('experimentos')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Protocolos Experimentais
                </button>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Análise e Literatura */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Estabilidade & Manejo
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('estabilidade')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Tabela de Estabilidade Nutricional
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('conservacao')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Guia de Conservação & SAFs
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('referencias')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Referências & Periódicos
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('login')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Área de Pesquisa Restrita
                </button>
              </li>
            </ul>
          </div>

          {/* Coluna 4: Aviso Metodológico */}
          <div className="space-y-2 text-xs text-slate-400">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Rigor Metodológico
            </h4>
            <p className="leading-relaxed">
              Os dados e curvas cinéticas apresentados apoiam-se em literatura científica indexada (INPA, Embrapa, Food Chemistry).
            </p>
            <p className="text-[11px] text-slate-400 border-t border-slate-800 pt-2">
              Ambiente em etapa de estruturação de interface.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© 2026 BioAmazônia. Ciência, biodiversidade e conservação da bacia amazônica.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Uso Acadêmico & Educativo</span>
            <span>·</span>
            <span>Acesso Aberto</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
