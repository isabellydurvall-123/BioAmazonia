import React, { useState, useEffect, useMemo } from 'react';
import { FruitSpecies, PageRoute } from '../types';
import { fruitStorageService } from '../services/fruitStorageService';
import { useAuth } from '../contexts/AuthContext';
import { Search, X, ArrowRight, Info, CheckCircle2, AlertCircle } from 'lucide-react';

interface CatalogPageProps {
  onNavigate: (page: PageRoute, fruitId?: string) => void;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({ onNavigate }) => {
  const { currentUser, isResearcher, isAdmin } = useAuth();
  const [fruitsList, setFruitsList] = useState<FruitSpecies[]>(() => {
    return fruitStorageService.listCachedSync('all', currentUser);
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFamily, setSelectedFamily] = useState<string>('Todas');

  useEffect(() => {
    const loadFruits = async () => {
      const data = await fruitStorageService.list('all', currentUser);
      setFruitsList(data);
    };
    loadFruits();
    const unsub = fruitStorageService.subscribe(() => {
      fruitStorageService.list('all', currentUser).then(setFruitsList);
    });
    return () => unsub();
  }, [currentUser]);

  const families = useMemo(() => {
    const list = Array.from(new Set(fruitsList.map(f => f.family)));
    return ['Todas', ...list];
  }, [fruitsList]);

  const filteredFruits = useMemo(() => {
    return fruitsList.filter(fruit => {
      const term = searchTerm.toLowerCase().trim();
      const matchPopular = fruit.popularName.toLowerCase().includes(term);
      const matchScientific = fruit.scientificName.toLowerCase().includes(term);
      const matchSynonyms = fruit.botanicalSynonyms?.some(syn => syn.toLowerCase().includes(term)) ?? false;
      const matchFamily = selectedFamily === 'Todas' || fruit.family === selectedFamily;

      return (matchPopular || matchScientific || matchSynonyms) && matchFamily;
    });
  }, [fruitsList, searchTerm, selectedFamily]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Cabeçalho */}
      <div className="border-b border-slate-200 pb-6">
        <div className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
          Acervo Taxonômico & Fitoquímico
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          Catálogo Funcional de Frutos Amazônicos
        </h1>
        <p className="text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
          Consulta detalhada às espécies botânicas nativas em estudo, caracterização fitoquímica comprovada por literaturas indexadas, fatores de degradação e orientações pós-colheita.
        </p>

        {/* Resumo Dinâmico de Espécies sem pills */}
        <div className="pt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-mono">
          <span>{fruitsList.length} Espécies em Estudo Ativo</span>
          <span aria-hidden="true">·</span>
          <span>Pesquisa por Nome Popular ou Científico</span>
          <span aria-hidden="true">·</span>
          <span>Páginas Individuais Dinâmicas</span>
        </div>
      </div>

      {/* Barra de Pesquisa e Filtros */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          
          {/* Campo de Busca por Nome Popular ou Científico */}
          <div className="md:col-span-8 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar por nome popular (ex: Camu-camu, Tucumã) ou científico (ex: Myrciaria, Solanum)..."
              className="w-full pl-9 pr-8 py-2 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-slate-800"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label="Limpar pesquisa"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filtro por Família Botânica */}
          <div className="md:col-span-4 flex items-center gap-2">
            <span className="text-xs text-slate-500 whitespace-nowrap">Família:</span>
            <select
              value={selectedFamily}
              onChange={(e) => setSelectedFamily(e.target.value)}
              className="w-full py-2 px-2.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-slate-700 font-medium"
            >
              {families.map(fam => (
                <option key={fam} value={fam}>{fam}</option>
              ))}
            </select>
          </div>

        </div>

        {searchTerm && (
          <div className="text-xs text-slate-500 flex items-center justify-between font-mono pt-1">
            <span>Resultados para busca: "{searchTerm}"</span>
            <button
              onClick={() => setSearchTerm('')}
              className="text-emerald-800 font-semibold hover:underline"
            >
              Limpar busca
            </button>
          </div>
        )}
      </div>

      {/* Grade de Frutos ou Mensagem de Nenhum Resultado */}
      {filteredFruits.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200 space-y-3">
          <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
          <h3 className="text-base font-semibold text-slate-900">
            Nenhum fruto encontrado para a pesquisa realizada
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Não encontramos nenhum fruto com o termo <span className="font-semibold text-slate-700">"{searchTerm}"</span> no catálogo. Você pode pesquisar tanto pelo nome comum (como <em>Camu-camu</em>, <em>Açaí</em>, <em>Tucumã</em>, <em>Buriti</em> ou <em>Cubiu</em>) quanto pelo gênero ou epíteto botânico (como <em>Myrciaria</em>, <em>Euterpe</em>, <em>Astrocaryum</em>, <em>Mauritia</em> ou <em>Solanum</em>).
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedFamily('Todas');
              }}
              className="px-4 py-2 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-md text-xs font-semibold hover:bg-emerald-100 transition-colors"
            >
              Exibir todos os frutos cadastrados
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFruits.map((fruit) => (
            <div
              key={fruit.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:border-emerald-700/50 hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                {/* Imagem Autorizada */}
                <div className="aspect-[16/10] bg-slate-100 overflow-hidden relative border-b border-slate-100">
                  {fruit.authorizedPhotographs[0] ? (
                    <img
                      src={fruit.authorizedPhotographs[0].url}
                      alt={fruit.authorizedPhotographs[0].caption}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : null}
                  <div className="absolute top-2.5 right-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-mono px-2 py-0.5 rounded">
                    {fruit.family}
                  </div>
                  <div className="absolute bottom-2.5 left-2.5 bg-emerald-950/80 backdrop-blur-xs text-emerald-100 text-[10px] font-mono px-2 py-0.5 rounded flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>{fruit.publicationStatus}</span>
                  </div>
                </div>

                {/* Conteúdo do Card */}
                <div className="p-5 space-y-3">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      {fruit.popularName}
                    </h2>
                    <p className="text-xs italic text-emerald-950 font-serif mt-0.5">
                      {fruit.scientificName}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {fruit.description}
                  </p>

                  {/* Resumo dos Bioativos Chave */}
                  <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs">
                    <span className="text-[10px] uppercase font-mono text-slate-400 block">
                      Bioativos Documentados Principais
                    </span>
                    <div className="space-y-1">
                      {(fruit.bioactiveCompounds || []).slice(0, 2).map((comp, idx) => (
                        <div key={idx} className="flex justify-between items-center text-slate-700 bg-slate-50 p-1.5 rounded text-[11px]">
                          <span className="font-medium truncate mr-2">{comp.name}</span>
                          <span className="font-mono text-slate-500 text-[10px] shrink-0">{comp.meanConcentration}</span>
                        </div>
                      ))}
                      {(!fruit.bioactiveCompounds || fruit.bioactiveCompounds.length === 0) && (
                        <div className="text-slate-400 italic text-[11px] py-0.5">
                          Metabolômica em validação
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Metadados sem pills */}
                  <div className="pt-2 text-[11px] text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono">
                    <span>{(fruit.scientificReferences || []).length} Artigos Indexados</span>
                    <span aria-hidden="true">·</span>
                    <span>Safra: {fruit.harvestPeriod ? fruit.harvestPeriod.split('(')[0] : 'Sazonal'}</span>
                  </div>
                </div>
              </div>

              {/* Ação: Abrir Página Individual do Fruto */}
              <div className="p-5 pt-0">
                <button
                  onClick={() => onNavigate('fruto', fruit.id)}
                  className="w-full py-2 px-3 text-xs font-semibold rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200/90 hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Acessar Página Completa do Fruto</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Nota de Arquitetura Extensível */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-emerald-800 shrink-0" />
          <span>
            <strong>Estrutura Extensível:</strong> O catálogo gera páginas individuais dinamicamente a partir da base de dados desacoplada. Novos frutos adicionados recebem automaticamente ficha técnica, rotas e filtros.
          </span>
        </div>
      </div>

    </div>
  );
};
