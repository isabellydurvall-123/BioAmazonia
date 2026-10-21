import React, { useState, useEffect } from 'react';
import { PageRoute, FruitSpecies } from '../types';
import { FRUITS_CATALOG } from '../data/fruitsCatalogData';
import { fruitStorageService } from '../services/fruitStorageService';
import { ArrowRight, BookOpen, FlaskConical, Leaf, LineChart, Shield, Sparkles } from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: PageRoute, fruitId?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [fruitsList, setFruitsList] = useState<FruitSpecies[]>(() => {
    const cached = fruitStorageService.listCachedSync('publicado');
    return cached.length > 0 ? cached : FRUITS_CATALOG;
  });

  useEffect(() => {
    const loadFruits = async () => {
      const data = await fruitStorageService.list('publicado');
      setFruitsList(data);
    };
    loadFruits();
    const unsub = fruitStorageService.subscribe(() => {
      fruitStorageService.list('publicado').then(setFruitsList);
    });
    return () => unsub();
  }, []);
  return (
    <div className="space-y-16 py-6 sm:py-10">
      
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Coluna de Texto */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 tracking-wide uppercase font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              Plataforma de Bioquímica e Botânica Aplicada
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]" style={{ textWrap: 'balance' }}>
              Bioquímica, Estabilidade e Conservação de <span className="text-emerald-800">Frutos da Amazônia</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              Base de dados técnico-científica dedicada ao estudo fitoquímico de espécies nativas amazônicas, caracterização de compostos bioativos, fatores de degradação nutricional e bioeconomia sustentável.
            </p>

            {/* Ações principais */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('catalogo')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-semibold shadow-xs transition-colors"
              >
                Explorar Catálogo ({fruitsList.length} Espécies)
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('estabilidade')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-colors"
              >
                Tabela de Estabilidade
              </button>
            </div>
          </div>

          {/* Imagem da Biodiversidade Amazônica Ampliada */}
          <div className="lg:col-span-6">
            <div className="relative rounded-2xl overflow-hidden border border-emerald-950/10 shadow-md bg-slate-100 w-full min-h-[340px] sm:min-h-[420px] lg:min-h-[460px] aspect-[16/10] sm:aspect-[4/3] lg:aspect-[5/4] transition-all">
              <img
                src="/imagens/bioamazonia_hero_forest_1792170877846.jpg"
                alt="Dossel da floresta amazônica com bacia fluvial e biodiversidade botânica"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/25 to-transparent flex flex-col justify-end p-6 sm:p-7 text-white">
                <span className="text-xs font-mono tracking-wider text-emerald-300 uppercase font-bold">
                  Biodiversidade Amazônica
                </span>
                <p className="text-sm sm:text-base font-medium text-slate-100 mt-1.5 max-w-md">
                  Metabólitos secundários e riqueza fitoquímica sob rigor científico.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Seção Educativa: O Conceito de Antioxidantes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-emerald-950/5 border border-emerald-950/10 rounded-xl p-6 sm:p-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800 font-mono">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              Fundamentação Fitoquímica
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              O que são Antioxidantes e por que a Amazônia se destaca?
            </h2>

            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              Antioxidantes são substâncias moleculares capazes de retardar ou inibir significativamente a oxidação de substratos celulares oxidáveis (lipídios, proteínas e DNA). Nas células vivas, o metabolismo gera continuamente espécies reativas de oxigênio (ROS), como o radical superóxido (<span className="font-mono text-xs">O₂•⁻</span>) e o radical hidroxila (<span className="font-mono text-xs">•OH</span>).
            </p>

            <div className="pt-2">
              <button
                onClick={() => onNavigate('bioquimica')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 transition-colors"
              >
                Aprofundar nos mecanismos moleculares de radicais livres e enzimas antioxidantes
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Os Cinco Frutos Estudados em Destaque */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 font-mono">
              Amostragem Botânica em Estudo
            </span>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
              Os Frutos Amazônicos
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Clique em qualquer fruto para acessar sua ficha individual completa com dados nutricionais e referências.
            </p>
          </div>
          <button
            onClick={() => onNavigate('catalogo')}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1"
          >
            Ver catálogo completo com busca
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {fruitsList.map((fruit) => (
            <div
              key={fruit.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:border-emerald-700/60 hover:shadow-sm transition-all flex flex-col justify-between group cursor-pointer"
              onClick={() => onNavigate('fruto', fruit.id)}
            >
              <div>
                {/* Imagem */}
                <div className="aspect-[4/3] bg-slate-100 overflow-hidden relative border-b border-slate-100">
                  {fruit.authorizedPhotographs[0] && (
                    <img
                      src={fruit.authorizedPhotographs[0].url}
                      alt={fruit.authorizedPhotographs[0].caption}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                  )}
                  <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded">
                    {fruit.family}
                  </div>
                </div>

                {/* Conteúdo */}
                <div className="p-4 space-y-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                      {fruit.popularName}
                    </h3>
                    <p className="text-xs italic text-emerald-950 font-serif">
                      {fruit.scientificName}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-[11px] space-y-1">
                    <span className="text-[10px] uppercase font-mono text-slate-400 block">Composto Chave:</span>
                    <span className="font-medium text-slate-800 line-clamp-1">
                      {fruit.bioactiveCompounds[0]?.name}
                    </span>
                    <span className="font-mono text-emerald-800 text-[10px] block">
                      {fruit.bioactiveCompounds[0]?.meanConcentration.split('(')[0]}
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-4 pb-4 pt-1 flex items-center justify-between text-xs font-semibold text-emerald-800">
                <span>Abrir Ficha Científica</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Acessos Rápidos da Plataforma */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 font-mono">
            Navegação da Plataforma
          </span>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Módulos de Investigação Científica
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            onClick={() => onNavigate('bioquimica')}
            className="bg-white p-6 rounded-xl border border-slate-200 hover:border-emerald-700/40 hover:shadow-xs transition-all cursor-pointer space-y-3"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <FlaskConical className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Bioquímica Molecular
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Mecanismos HAT e SET, vias de peroxidação lipídica e estabilização de radicais livres por polifenóis amazônicos.
            </p>
            <div className="text-xs font-semibold text-emerald-800 inline-flex items-center gap-1 pt-1">
              Explorar mecanismos <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div
            onClick={() => onNavigate('experimentos')}
            className="bg-white p-6 rounded-xl border border-slate-200 hover:border-emerald-700/40 hover:shadow-xs transition-all cursor-pointer space-y-3"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <FlaskConical className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Experimentos de Bancada
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Módulos práticos de estabilidade da Vitamina C (Camu-camu vs Cubiu), oxidação enzimática com Buriti/Tucumã e influência do pH nas antocianinas do Açaí.
            </p>
            <div className="text-xs font-semibold text-emerald-800 inline-flex items-center gap-1 pt-1">
              Acessar experimentos <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div
            onClick={() => onNavigate('estabilidade')}
            className="bg-white p-6 rounded-xl border border-slate-200 hover:border-emerald-700/40 hover:shadow-xs transition-all cursor-pointer space-y-3"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Estabilidade Nutricional
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tabela pública dos resultados científicos publicados nos 3 experimentos: estabilidade da vitamina C, oxidação enzimática e influência do pH nas antocianinas.
            </p>
            <div className="text-xs font-semibold text-emerald-800 inline-flex items-center gap-1 pt-1">
              Ver tabela de estabilidade <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
