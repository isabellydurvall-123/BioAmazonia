import React, { useState, useMemo, useEffect } from 'react';
import { BIOCHEMISTRY_TOPICS } from '../data/biochemistryTopicsData';
import { SCIENTIFIC_REFERENCES } from '../data/referencesData';
import { BiochemistryTopic, PageRoute, TopicCategory, ScientificReference } from '../types';
import { topicStorageService } from '../services/topicStorageService';
import { referenceStorageService } from '../services/referenceStorageService';
import { useAuth } from '../contexts/AuthContext';
import { 
  Sparkles, 
  BookOpen, 
  ArrowRight, 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  SlidersHorizontal,
  Calendar,
  FlaskConical,
  Compass,
  Copy,
  Check
} from 'lucide-react';

interface BiochemistryPageProps {
  initialTopicId?: string | null;
  onNavigate: (page: PageRoute, targetId?: string) => void;
}

export const BiochemistryPage: React.FC<BiochemistryPageProps> = ({ initialTopicId, onNavigate }) => {
  const { currentUser } = useAuth();
  const [topicsList, setTopicsList] = useState<BiochemistryTopic[]>(() => {
    try {
      const cached = topicStorageService.listCachedSync('all', currentUser);
      return cached.length > 0 ? cached : BIOCHEMISTRY_TOPICS;
    } catch {
      return BIOCHEMISTRY_TOPICS;
    }
  });
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(initialTopicId || null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchTopics = async () => {
      const data = await topicStorageService.list('all', currentUser);
      setTopicsList(data);
    };
    fetchTopics();
    const unsub = topicStorageService.subscribe(fetchTopics);
    return () => unsub();
  }, [currentUser]);

  const categories: ('Todas' | TopicCategory)[] = [
    'Todas',
    'Fundamentos Moleculares',
    'Classes Fitoquímicas',
    'Cinética & Estabilidade'
  ];

  const filteredTopics = useMemo(() => {
    return topicsList.filter(t => {
      const matchCategory = selectedCategory === 'Todas' || t.category === selectedCategory;
      const term = searchTerm.toLowerCase().trim();
      const matchSearch = 
        t.title.toLowerCase().includes(term) ||
        t.shortSummary.toLowerCase().includes(term) ||
        t.accessibleExplanation.toLowerCase().includes(term);

      return matchCategory && matchSearch;
    });
  }, [topicsList, selectedCategory, searchTerm]);

  const activeTopic = useMemo(() => {
    if (!selectedTopicId) return null;
    return topicsList.find(t => t.id === selectedTopicId) || null;
  }, [topicsList, selectedTopicId]);

  const [topicReferences, setTopicReferences] = useState<ScientificReference[]>([]);
  const [copiedCitationId, setCopiedCitationId] = useState<string | null>(null);
  const [totalStudiesCount, setTotalStudiesCount] = useState<number>(SCIENTIFIC_REFERENCES.length);

  useEffect(() => {
    const fetchReferencesCount = async () => {
      const allRefs = await referenceStorageService.list();
      setTotalStudiesCount(allRefs.length);
    };
    fetchReferencesCount();
    const unsub = referenceStorageService.subscribe(fetchReferencesCount);
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!activeTopic) return;
    referenceStorageService.list().then(all => {
      const topicId = activeTopic.id.toLowerCase();
      const filtered = all.filter(r => 
        r.relatedContents.some(c => c.toLowerCase().includes(topicId) || topicId.includes(c.toLowerCase())) ||
        (r.keywords && r.keywords.some(k => activeTopic.title.toLowerCase().includes(k.toLowerCase()) || activeTopic.shortSummary.toLowerCase().includes(k.toLowerCase())))
      );
      setTopicReferences(filtered);
    });
  }, [activeTopic?.id]);

  const handleCopyCitation = (authors: string, year: number, title: string, journal: string, doi?: string, id?: string) => {
    const citation = `${authors} (${year}). ${title}. ${journal}.${doi ? ` https://doi.org/${doi}` : ''}`;
    navigator.clipboard.writeText(citation);
    if (id) {
      setCopiedCitationId(id);
      setTimeout(() => setCopiedCitationId(null), 2000);
    }
  };

  const currentIndex = activeTopic ? topicsList.findIndex(t => t.id === activeTopic.id) : -1;
  const prevTopic = currentIndex > 0 ? topicsList[currentIndex - 1] : null;
  const nextTopic = currentIndex >= 0 && currentIndex < topicsList.length - 1 ? topicsList[currentIndex + 1] : null;

  const displayRelatedTopics = useMemo(() => {
    if (!activeTopic) return [];
    if (activeTopic.relatedTopicIds && activeTopic.relatedTopicIds.length > 0) {
      const explicit = activeTopic.relatedTopicIds
        .map(id => topicsList.find(t => t.id === id))
        .filter(Boolean) as BiochemistryTopic[];
      if (explicit.length > 0) return explicit;
    }
    // Fallback inteligente: sugere outros tópicos da mesma categoria ou da lista
    const sameCategory = topicsList.filter(t => t.id !== activeTopic.id && t.category === activeTopic.category);
    if (sameCategory.length > 0) return sameCategory.slice(0, 4);
    return topicsList.filter(t => t.id !== activeTopic.id).slice(0, 4);
  }, [activeTopic, topicsList]);

  const handleSelectTopic = (id: string) => {
    setSelectedTopicId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    setSelectedTopicId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Visualização de Tópico Individual */}
      {activeTopic ? (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-150">
          
          {/* Barra Superior de Retorno ao Índice Educativo */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <button
              onClick={handleBackToList}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-900 hover:text-emerald-950 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retornar ao Índice Educativo ({topicsList.length} Assuntos)
            </button>
          </div>

          {/* Cabeçalho do Conteúdo */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-slate-500">
              <span className="text-emerald-800 font-semibold">{activeTopic.category}</span>
              <span aria-hidden="true">·</span>
              <span>Tópico {activeTopic.order} de {topicsList.length}</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                Atualizado em {activeTopic.updatedAt}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {activeTopic.title}
            </h1>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono bg-emerald-50 text-emerald-900 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>{activeTopic.verificationStatus}</span>
            </div>

            {(activeTopic.introduction || activeTopic.shortSummary) ? (
              <p className="text-sm sm:text-base text-slate-700 font-medium leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                {activeTopic.introduction || activeTopic.shortSummary}
              </p>
            ) : (
              <p className="text-sm sm:text-base text-slate-700 font-medium leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                Módulo conceitual estruturado para a compreensão dos fundamentos fitoquímicos e cinéticos de {activeTopic.title} nos frutos nativos amazônicos.
              </p>
            )}
          </div>

          {/* Seção 1: Explicação Científica em Linguagem Acessível */}
          <div className="bg-white p-6 sm:p-7 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-800" />
              Compreendendo o Conceito
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {activeTopic.accessibleExplanation}
            </p>
          </div>

          {/* Seção 2: Detalhamento Físico-Químico e Mecanístico */}
          <div className="bg-white p-6 sm:p-7 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-800" />
              Mecanismos Bioquímicos e Vias Moleculares
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
              {activeTopic.scientificDetail}
            </p>
          </div>

          {/* Seção 3: Exemplos Relacionados aos Frutos Estudados */}
          <div className="bg-white p-6 sm:p-7 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div>
              <span className="text-[11px] font-mono text-emerald-800 uppercase font-semibold">
                Biodiversidade em Foco
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                Ocorrência e Papel nos Frutos Amazônicos
              </h2>
            </div>

            {activeTopic.fruitExamples && activeTopic.fruitExamples.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeTopic.fruitExamples.map((ex, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-bold text-slate-900 text-sm">{ex.fruitName}</span>
                        <span className="font-serif italic text-emerald-950 text-[11px]">{ex.scientificName}</span>
                      </div>
                      <p className="text-slate-600 mt-1 leading-relaxed">
                        {ex.description}
                      </p>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => onNavigate('fruto', ex.fruitId)}
                        className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1"
                      >
                        Ver ficha completa de {ex.fruitName}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-2">
                <p>
                  Este módulo temático aborda princípios bioquímicos transversais com aplicação e relevância documentada nas matrizes vegetais catalogadas pelo BioAmazônia.
                </p>
                <div className="pt-1">
                  <button
                    onClick={() => onNavigate('catalogo')}
                    className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1"
                  >
                    Explorar espécies amazônicas no catálogo
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Seção 4: Relação com os Protocolos de Experimentos */}
          <div className="bg-emerald-950/5 p-6 rounded-xl border border-emerald-950/10 space-y-3">
            <h2 className="text-sm font-bold uppercase font-mono tracking-wider text-emerald-950 flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-emerald-800" />
              Relação com os Experimentos e Métodos de Bancada
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {activeTopic.experimentalRelevance}
            </p>
            <div className="pt-1">
              <button
                onClick={() => onNavigate('experimentos')}
                className="text-xs font-semibold text-emerald-900 hover:text-emerald-950 inline-flex items-center gap-1.5"
              >
                Consultar os protocolos de bancada (DPPH, Folin, ABTS)
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Seção 5: Limitações Científicas e Rigor Metodológico */}
          <div className="bg-amber-50/70 p-6 rounded-xl border border-amber-200/90 space-y-2 text-xs text-amber-950">
            <div className="flex items-center gap-2 font-bold uppercase font-mono text-[11px] text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
              Fronteira Epistêmica & Limitações Científicas
            </div>
            <p className="leading-relaxed">
              {activeTopic.scientificLimitations}
            </p>
          </div>

          {/* Seção 6: Navegação entre Conteúdos Relacionados */}
          {displayRelatedTopics.length > 0 && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-3 shadow-xs">
              <h3 className="text-xs font-mono uppercase font-semibold text-slate-400">
                Conteúdos Relacionados Recomendados
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {displayRelatedTopics.map((relTopic) => (
                  <button
                    key={relTopic.id}
                    onClick={() => handleSelectTopic(relTopic.id)}
                    className="p-3 text-left bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-700/40 rounded-lg transition-all group"
                  >
                    <span className="text-[10px] font-mono text-emerald-800 uppercase block">
                      {relTopic.category}
                    </span>
                    <span className="font-bold text-slate-900 text-xs group-hover:text-emerald-900 block mt-0.5">
                      {relTopic.title}
                    </span>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-1">
                      {relTopic.shortSummary}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Seção 7: Referências Bibliográficas Verificáveis & Acervo Indexado */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold uppercase font-mono tracking-wider text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-800" />
                  Literatura Científica Utilizada &amp; Acervo Indexado
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Artigos científicos, teses e revisões por pares que fundamentam este tópico bioquímico.
                </p>
              </div>
              <button
                onClick={() => onNavigate('referencias')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors font-mono shrink-0 self-start sm:self-auto"
              >
                Consultar Acervo Geral <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Referências Diretas do Tópico */}
              {activeTopic.references.map((ref, idx) => (
                <div key={`curated-${idx}`} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5 flex-1">
                    <span className="font-mono text-emerald-800 font-semibold text-[11px] block">
                      {ref.journal} ({ref.year})
                    </span>
                    <span className="font-bold text-slate-900 block text-xs">{ref.title}</span>
                    <span className="text-slate-600 block text-[11px]">{ref.authors}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {ref.doi && (
                      <a
                        href={`https://doi.org/${ref.doi}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-100 transition-colors font-medium font-mono"
                      >
                        <span>DOI</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    )}
                    <button
                      onClick={() => handleCopyCitation(ref.authors, ref.year, ref.title, ref.journal, ref.doi, `curated-${idx}`)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-600 hover:bg-slate-100 transition-colors font-mono text-[11px]"
                      title="Copiar Citação"
                    >
                      {copiedCitationId === `curated-${idx}` ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" /> Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-400" /> Copiar
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}

              {/* Referências Dinâmicas Adicionais do Acervo relacionadas ao Tópico */}
              {topicReferences
                .filter(tr => !activeTopic.references.some(cr => cr.title.toLowerCase().trim() === tr.title.toLowerCase().trim()))
                .map((tr) => (
                  <div key={tr.id} className="p-3.5 bg-emerald-50/40 rounded-lg border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-emerald-900 font-bold text-[11px]">
                          {tr.journal} ({tr.year})
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-900 border border-emerald-200">
                          {tr.verificationStatus}
                        </span>
                      </div>
                      <span className="font-bold text-slate-900 block text-xs">{tr.title}</span>
                      <span className="text-slate-600 block text-[11px]">{tr.authors}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {tr.doi && (
                        <a
                          href={`https://doi.org/${tr.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-100 transition-colors font-medium font-mono"
                        >
                          <span>DOI</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      )}
                      <button
                        onClick={() => handleCopyCitation(tr.authors, tr.year, tr.title, tr.journal, tr.doi, tr.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-600 hover:bg-slate-100 transition-colors font-mono text-[11px]"
                        title="Copiar Citação"
                      >
                        {copiedCitationId === tr.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" /> Copiado
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-slate-400" /> Copiar
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Rodapé de Retorno e Navegação Sequencial */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <button
              onClick={handleBackToList}
              className="text-emerald-900 font-semibold hover:underline inline-flex items-center gap-1.5 self-start"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Retornar ao Índice Educativo ({topicsList.length} Assuntos)
            </button>

            <div className="flex items-center gap-2 font-mono self-end sm:self-auto">
              {prevTopic && (
                <button
                  onClick={() => handleSelectTopic(prevTopic.id)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
                  title={`Anterior: ${prevTopic.title}`}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{prevTopic.title}</span>
                  <span className="sm:hidden">Anterior</span>
                </button>
              )}
              {nextTopic && (
                <button
                  onClick={() => handleSelectTopic(nextTopic.id)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
                  title={`Próximo: ${nextTopic.title}`}
                >
                  <span className="hidden sm:inline">{nextTopic.title}</span>
                  <span className="sm:hidden">Próximo</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

        </div>
      ) : (
        /* Visualização da Lista Geral de Conteúdos */
        <div className="space-y-8">
          
          {/* Cabeçalho da Seção */}
          <div className="border-b border-slate-200 pb-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-800 font-mono">
              Educação Científica & Fundamentação Molecular
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Bioquímica dos Antioxidantes Amazônicos
            </h1>
            <p className="text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
              Explore os fundamentos físico-químicos, as espécies reativas, as principais classes de bioativos e os fatores termodinâmicos que regulam a conservação nutricional dos frutos da floresta.
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-mono">
              <span className="text-slate-600">
                {filteredTopics.length !== topicsList.length
                  ? `${filteredTopics.length} de ${topicsList.length} Módulos Didáticos`
                  : `${topicsList.length} Módulos Didáticos Próprios`}
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-600">
                {totalStudiesCount} Estudos & Artigos Científicos no Banco de Dados
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-600">Rigor Físico-Químico e Botânico</span>
            </div>
          </div>

          {/* Barra de Filtros por Categoria e Busca */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              {/* Segmented Category Buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-slate-500 mr-1 flex items-center gap-1">
                  <SlidersHorizontal className="w-3.5 h-3.5" /> Área:
                </span>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      selectedCategory === cat
                        ? 'bg-emerald-800 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Busca Rápida de Conteúdo */}
              <div className="w-full md:w-72">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Pesquisar por assunto ou conceito..."
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-slate-800"
                />
              </div>

            </div>
          </div>

          {/* Grade com os Conteúdos Educativos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTopics.map((topic) => (
              <div
                key={topic.id}
                onClick={() => handleSelectTopic(topic.id)}
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:border-emerald-700/50 hover:shadow-sm transition-all flex flex-col justify-between group cursor-pointer space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-emerald-800 font-semibold uppercase">
                      {topic.category}
                    </span>
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-mono text-xs flex items-center justify-center font-bold">
                      {topic.order}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-slate-900 group-hover:text-emerald-900 transition-colors">
                    {topic.title}
                  </h2>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {topic.shortSummary}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5">
                    <span>{topic.fruitExamples.length} Frutos Associados</span>
                    <span aria-hidden="true">·</span>
                    <span>{topic.references.length} Referências</span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-semibold text-emerald-800 pt-1">
                    <span>Estudar Assunto</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Aviso Epistêmico de Rigor Científico */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
            <span className="font-bold text-slate-900 block font-mono uppercase text-[11px] text-emerald-900">
              Princípio Epistêmico do BioAmazônia: Da Reação In Vitro à Fisiologia Humana
            </span>
            <p className="leading-relaxed">
              O projeto BioAmazônia adota estrita diferenciação entre <em>mecanismos reacionais químicos</em> (ensaios em solventes como metanol e etanol em bancada), <em>ensaios celulares in vitro</em> e <em>desfechos clínicos em humanos</em>. A potente capacidade de neutralizar radicais em tubo de ensaio é um indicador fitoquímico de riqueza vegetal, mas não autoriza alegações terapêuticas milagrosas sem ensaios clínicos controlados e randomizados.
            </p>
          </div>

        </div>
      )}

    </div>
  );
};
