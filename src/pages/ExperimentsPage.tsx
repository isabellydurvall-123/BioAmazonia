import React, { useState, useEffect } from 'react';
import { ExperimentA_VitaminC } from '../components/experiments/ExperimentA_VitaminC';
import { ExperimentB_EnzymaticBrowning } from '../components/experiments/ExperimentB_EnzymaticBrowning';
import { ExperimentC_AnthocyaninPH } from '../components/experiments/ExperimentC_AnthocyaninPH';
import { 
  FlaskConical, 
  Eye, 
  Sparkles, 
  CheckCircle2
} from 'lucide-react';

export type ExperimentTab = 'vitamina-c' | 'oxidacao-enzimatica' | 'ph-antocianinas';

export const ExperimentsPage: React.FC = () => {
  // Controle de Abas Ativas (Exclusivamente os 3 Experimentos A, B e C)
  const [activeTab, setActiveTab] = useState<ExperimentTab>(() => {
    try {
      const hash = window.location.hash;
      if (hash.includes('tab=b') || hash.includes('tab=oxidacao')) return 'oxidacao-enzimatica';
      if (hash.includes('tab=c') || hash.includes('tab=ph')) return 'ph-antocianinas';
    } catch {
      // fallback
    }
    return 'vitamina-c';
  });

  // Atualizar hash ao alternar de aba
  const handleTabChange = (tab: ExperimentTab) => {
    setActiveTab(tab);
    const tabParam = 
      tab === 'vitamina-c' ? 'exp-a' :
      tab === 'oxidacao-enzimatica' ? 'exp-b' : 'exp-c';
    window.location.hash = `#experimentos?tab=${tabParam}`;
  };

  // Monitorar hashchange para navegação direta pelo browser
  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash;
      if (hash.includes('tab=exp-b') || hash.includes('tab=oxidacao')) setActiveTab('oxidacao-enzimatica');
      else if (hash.includes('tab=exp-c') || hash.includes('tab=ph')) setActiveTab('ph-antocianinas');
      else if (hash.includes('tab=exp-a') || hash.includes('tab=vitamina-c')) setActiveTab('vitamina-c');
    };
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Cabeçalho Geral da Seção de Experimentos */}
      <div className="border-b border-slate-200 pb-6 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-800 font-mono">
              Bancada Experimental · Módulos Práticos
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Ensaios Científicos com Frutos Amazônicos
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-emerald-900 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> 3 Experimentos de Bancada
            </span>
          </div>
        </div>

        <p className="text-sm text-slate-600 max-w-4xl leading-relaxed">
          Plataforma de registro laboratorial, acompanhamento cinético e análise de estabilidade bioquímica de frutos da Amazônia. Navegue entre os três módulos práticos abaixo para registrar titulações, avaliar o escurecimento enzimático e mapear os equilíbrios ácido-base das antocianinas.
        </p>

        {/* Barra de Navegação por Abas: Exclusivamente os 3 Experimentos A, B e C */}
        <div className="pt-4 flex flex-wrap items-center gap-2 border-t border-slate-100">
          
          <button
            onClick={() => handleTabChange('vitamina-c')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-xs transition-all border ${
              activeTab === 'vitamina-c'
                ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs ring-1 ring-emerald-800'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5 text-emerald-400" />
            <span>Exp. A: Estabilidade da Vitamina C</span>
            <span className="hidden sm:inline font-normal text-[11px] opacity-80">(Camu-camu vs Cubiu)</span>
          </button>

          <button
            onClick={() => handleTabChange('oxidacao-enzimatica')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-xs transition-all border ${
              activeTab === 'oxidacao-enzimatica'
                ? 'bg-amber-800 text-white border-amber-800 shadow-xs ring-1 ring-amber-800'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-amber-300" />
            <span>Exp. B: Oxidação Enzimática</span>
            <span className="hidden sm:inline font-normal text-[11px] opacity-80">(Maçã com Buriti e Tucumã)</span>
          </button>

          <button
            onClick={() => handleTabChange('ph-antocianinas')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-xs transition-all border ${
              activeTab === 'ph-antocianinas'
                ? 'bg-purple-900 text-white border-purple-900 shadow-xs ring-1 ring-purple-900'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            <span>Exp. C: Influência do pH</span>
            <span className="hidden sm:inline font-normal text-[11px] opacity-80">(Antocianinas do Açaí)</span>
          </button>

        </div>
      </div>

      {/* Conteúdo Dinâmico Focado Exclusivamente nos 3 Experimentos */}
      <div>
        {activeTab === 'vitamina-c' && (
          <ExperimentA_VitaminC />
        )}

        {activeTab === 'oxidacao-enzimatica' && (
          <ExperimentB_EnzymaticBrowning />
        )}

        {activeTab === 'ph-antocianinas' && (
          <ExperimentC_AnthocyaninPH />
        )}
      </div>

    </div>
  );
};
