import React, { useState, useEffect } from 'react';
import { FruitSpecies, PageRoute, ScientificReference, ConservationGuideline } from '../types';
import { fruitStorageService } from '../services/fruitStorageService';
import { referenceStorageService } from '../services/referenceStorageService';
import { conservationStorageService } from '../services/conservationStorageService';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowLeft, 
  ExternalLink, 
  Calendar, 
  Leaf, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  ShieldAlert, 
  FileText,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  ThermometerSnowflake,
  ShieldCheck,
  Copy,
  Check,
  X,
  ArrowRight
} from 'lucide-react';

interface FruitDetailPageProps {
  fruitId: string;
  onNavigate: (page: PageRoute, fruitId?: string) => void;
}

export const FruitDetailPage: React.FC<FruitDetailPageProps> = ({ fruitId, onNavigate }) => {
  const { currentUser } = useAuth();
  
  // Obter imediatamente do cache local síncrono para render instantâneo sem nenhum flash de tela
  const initialFruit = fruitStorageService.getCachedSync(fruitId);
  const initialList = fruitStorageService.listCachedSync('all', currentUser);

  const [allFruits, setAllFruits] = useState<FruitSpecies[]>(initialList);
  const [fruit, setFruit] = useState<FruitSpecies | null>(initialFruit);
  const [isLoading, setIsLoading] = useState<boolean>(!initialFruit);

  const [dynamicReferences, setDynamicReferences] = useState<ScientificReference[]>([]);
  const [dynamicGuidelines, setDynamicGuidelines] = useState<ConservationGuideline[]>([]);
  const [selectedReferenceModal, setSelectedReferenceModal] = useState<ScientificReference | null>(null);
  const [copiedCitation, setCopiedCitation] = useState<boolean>(false);

  useEffect(() => {
    let isCurrent = true;

    // Se o fruitId mudar, atualiza imediatamente com base no cache síncrono
    const cached = fruitStorageService.getCachedSync(fruitId);
    if (cached) {
      setFruit(cached);
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }

    const fetchFruit = async () => {
      try {
        const list = await fruitStorageService.list('all', currentUser);
        if (!isCurrent) return;
        setAllFruits(list);
        const cleanId = (fruitId || '').trim().toLowerCase();
        const found = list.find(f => f.id.toLowerCase() === cleanId) || null;
        setFruit(found);
      } catch (err) {
        console.error('Erro ao consultar espécime:', err);
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    };
    fetchFruit();

    const unsub = fruitStorageService.subscribe(() => {
      if (isCurrent) {
        fetchFruit();
      }
    });

    return () => {
      isCurrent = false;
      unsub();
    };
  }, [fruitId, currentUser]);

  useEffect(() => {
    if (!fruit) return;
    referenceStorageService.getByFruit(fruit.id).then(setDynamicReferences);
    conservationStorageService.getByFruit(fruit.id).then(setDynamicGuidelines);
  }, [fruit?.id]);

  const currentIndex = allFruits.findIndex(f => f.id.toLowerCase() === (fruit?.id || fruitId).toLowerCase());
  const prevFruit = currentIndex > 0 ? allFruits[currentIndex - 1] : null;
  const nextFruit = currentIndex >= 0 && currentIndex < allFruits.length - 1 ? allFruits[currentIndex + 1] : null;

  const handleCopyCitation = (ref: ScientificReference) => {
    const citation = `${ref.authors} (${ref.year}). ${ref.title}. ${ref.journal}${ref.volumeAndPages ? `, ${ref.volumeAndPages}` : ''}.${ref.doi ? ` https://doi.org/${ref.doi}` : ''}`;
    navigator.clipboard.writeText(citation);
    setCopiedCitation(true);
    setTimeout(() => setCopiedCitation(false), 2000);
  };

  // Enquanto estiver carregando e ainda não tiver o fruto, exibe indicador de carregamento botânico elegante
  if (isLoading && !fruit) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-emerald-800 border-t-transparent" />
        <h2 className="text-base font-semibold text-slate-800">Carregando Ficha Catalográfica...</h2>
        <p className="text-xs text-slate-500">
          Recuperando dados taxonômicos, fitoquímicos e literatura científica do acervo.
        </p>
      </div>
    );
  }

  // Apenas se a consulta já terminou E o fruto realmente não existe
  if (!fruit) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-amber-600 mx-auto" />
        <h1 className="text-2xl font-bold text-slate-900">Espécime Não Encontrado no Acervo</h1>
        <p className="text-xs text-slate-600">
          O fruto solicitado não consta na amostragem botânica catalogada desta etapa.
        </p>
        <button
          onClick={() => onNavigate('catalogo')}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-md bg-emerald-800 text-white hover:bg-emerald-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar ao Catálogo de Frutos
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Barra de Navegação Superior e Retorno */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <button
          onClick={() => onNavigate('catalogo')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-900 hover:text-emerald-950 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retornar ao Catálogo ({allFruits.length} Espécies)
        </button>
      </div>

      {/* Cabeçalho do Fruto com Fotografia e Metadados */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Fotografia Autorizada */}
        <div className="lg:col-span-5 space-y-2">
          <div className="rounded-xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100 aspect-[4/3] relative">
            {fruit.authorizedPhotographs[0] ? (
              <img
                src={fruit.authorizedPhotographs[0].url}
                alt={fruit.authorizedPhotographs[0].caption}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-slate-400 text-center">
                <Leaf className="w-8 h-8 mb-2" />
                <span className="text-xs">Fotografia em processo de autorização botânica</span>
              </div>
            )}
          </div>
          {fruit.authorizedPhotographs[0] && (
            <p className="text-[11px] text-slate-500 italic leading-relaxed px-1">
              {fruit.authorizedPhotographs[0].caption} · <span className="font-mono text-slate-400 not-italic">{fruit.authorizedPhotographs[0].authorOrProvenance}</span>
            </p>
          )}
        </div>

        {/* Informações Taxonômicas e Resumo */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-slate-500">
            <span className="text-emerald-800 font-semibold">{fruit.family}</span>
            <span aria-hidden="true">·</span>
            <span>ID: {fruit.id}</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              Atualizado em {fruit.updatedAt}
            </span>
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {fruit.popularName}
            </h1>
            <p className="text-base sm:text-lg italic text-emerald-950 font-serif mt-1">
              {fruit.scientificName}
            </p>
            {fruit.botanicalSynonyms && fruit.botanicalSynonyms.length > 0 && (
              <p className="text-xs text-slate-400 font-mono mt-1">
                Sinônimos botânicos: {fruit.botanicalSynonyms.join(' · ')}
              </p>
            )}
          </div>

          {/* Status de Publicação Científica */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded border text-xs font-mono font-medium bg-emerald-50 text-emerald-900 border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>Estado da Ficha: {fruit.publicationStatus}</span>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            {fruit.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Ocorrência Natural</span>
              <span className="text-slate-800 font-medium">{fruit.habitat}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Período de Safra / Coleta</span>
              <span className="text-slate-800 font-medium">{fruit.harvestPeriod}</span>
            </div>
          </div>

        </div>

      </div>

      {/* Seção 1: Morfologia Botânica */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-2 shadow-xs">
        <h2 className="text-sm font-bold uppercase font-mono tracking-wider text-slate-900 flex items-center gap-2">
          <Leaf className="w-4 h-4 text-emerald-800" />
          Características Morfológicas
        </h2>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          {fruit.morphology}
        </p>
      </div>

      {/* Seção 2: Compostos Bioativos Documentados */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-6">
        <div className="border-b border-slate-100 pb-3">
          <span className="text-xs font-mono text-emerald-800 uppercase font-semibold">
            Metabolômica Secundária
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-0.5">
            Compostos Bioativos Documentados
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Cada molécula associada à sua respectiva classe química, concentração média experimental e nível de evidência científica.
          </p>
        </div>

        <div className="space-y-3">
          {(!fruit.bioactiveCompounds || fruit.bioactiveCompounds.length === 0) ? (
            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 text-xs text-center italic">
              Nenhum composto bioativo documentado nesta ficha preliminar.
            </div>
          ) : fruit.bioactiveCompounds.map((comp, idx) => {
            const isPreliminary = comp.evidenceLevel.includes('Requer Verificação');
            return (
              <div
                key={idx}
                className={`p-4 rounded-lg border transition-all space-y-2 text-xs ${
                  isPreliminary
                    ? 'bg-amber-50/40 border-amber-200/80'
                    : 'bg-slate-50/70 border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-slate-900 text-sm">{comp.name}</span>
                    <span className="text-slate-500 font-mono text-[11px] block sm:inline sm:ml-2">
                      ({comp.chemicalClass})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {comp.meanConcentration}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                      isPreliminary
                        ? 'bg-amber-100 text-amber-900 font-semibold'
                        : 'bg-emerald-100 text-emerald-900'
                    }`}>
                      {comp.evidenceLevel}
                    </span>
                  </div>
                </div>

                <p className="text-slate-700 leading-relaxed">
                  <span className="font-semibold text-slate-800">Ação Bioquímica Primária: </span>
                  {comp.primaryAction}
                </p>

                {comp.verificationNotice && (
                  <div className="p-2 bg-amber-100/70 rounded border border-amber-200 text-amber-900 font-mono text-[11px] flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span><strong>Nota de Verificação:</strong> {comp.verificationNotice}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Seção 3: Informações Nutricionais com Fontes Verificáveis */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-6">
        <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-mono text-emerald-800 uppercase font-semibold">
              Bromatologia & Composição Centesimal
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">
              Informações Nutricionais Disponíveis
            </h2>
          </div>
          <div className="text-xs font-mono text-slate-500">
            Base: 100g de polpa fresca integral
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase font-mono">
                <th className="py-2.5 px-3">Componente Bromatológico</th>
                <th className="py-2.5 px-3">Teor Quantificado</th>
                <th className="py-2.5 px-3">Unidade</th>
                <th className="py-2.5 px-3">Status de Validação</th>
                <th className="py-2.5 px-3">Fonte / Referência Oficial</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-sans">
              {(!fruit.nutritionalInfo || fruit.nutritionalInfo.length === 0) ? (
                <tr>
                  <td colSpan={5} className="py-4 px-3 text-center text-slate-400 italic">
                    Dados centesimais em fase de compilação laboratorial.
                  </td>
                </tr>
              ) : fruit.nutritionalInfo.map((nutri, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70">
                  <td className="py-2.5 px-3 font-medium text-slate-900">
                    {nutri.component}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900 tabular-nums">
                    {nutri.valuePer100g}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-500">
                    {nutri.unit}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-mono ${
                      nutri.status === 'Confirmado'
                        ? 'text-emerald-800 bg-emerald-50 border border-emerald-200'
                        : 'text-amber-800 bg-amber-50 border border-amber-200 font-semibold'
                    }`}>
                      {nutri.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 text-[11px] font-mono">
                    {nutri.sourceReference}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Seção 4: Fatores que Influenciam a Estabilidade */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs p-6 space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <span className="text-xs font-mono text-emerald-800 uppercase font-semibold">
            Termodinâmica & Cinética
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-0.5">
            Fatores que Influenciam a Estabilidade dos Compostos
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Vulnerabilidades físico-químicas de degradação durante manipulação, transporte e armazenamento pós-colheita.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(!fruit.stabilityFactors || fruit.stabilityFactors.length === 0) ? (
            <div className="col-span-2 p-4 bg-slate-50 rounded-lg border border-slate-200 text-slate-500 text-xs text-center italic">
              Fatores de sensibilidade cinética em validação laboratorial.
            </div>
          ) : fruit.stabilityFactors.map((factor, idx) => (
            <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">{factor.factor}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                  factor.sensitivityLevel === 'Muito Alta'
                    ? 'bg-rose-100 text-rose-800'
                    : factor.sensitivityLevel === 'Alta'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  Sensibilidade: {factor.sensitivityLevel}
                </span>
              </div>
              <div className="text-slate-600 font-mono text-[11px]">
                <strong className="text-slate-700">Limiar Crítico:</strong> {factor.criticalThreshold}
              </div>
              <p className="text-slate-600 leading-relaxed">
                {factor.impactDescription}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Seção 5: Orientações de Conservação & Cadeia de Frio */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <span className="text-xs font-mono text-emerald-800 uppercase font-semibold">
              Manejo Pós-Colheita &amp; Cadeia de Frio
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">
              Orientações Técnicas de Conservação
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Diretrizes validadas para preservar a concentração fitoquímica de {fruit.popularName}.
            </p>
          </div>
          <button
            onClick={() => onNavigate('conservacao')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors shrink-0 self-start sm:self-auto font-mono"
          >
            Abrir Guia Digital Completo <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Recomendações Práticas Básicas */}
        <div className="space-y-3 text-xs">
          <div>
            <h3 className="font-bold text-slate-900 mb-1.5">Boas Práticas de Colheita e Transporte:</h3>
            <ul className="space-y-1 pl-2 text-slate-700">
              {(fruit.conservationGuidelines?.harvestBestPractices || ['Colheita manual em ponto ótimo de maturação.']).map((bp, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-700 font-bold">•</span>
                  <span>{bp}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Condição Térmica Ideal</span>
              <span className="text-slate-800 font-medium block mt-0.5">{fruit.conservationGuidelines?.idealStorageCondition || 'Refrigeração protegida da luz.'}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Recomendação de Embalagem</span>
              <span className="text-slate-800 font-medium block mt-0.5">{fruit.conservationGuidelines?.packagingRecommendation || 'Embalagem com barreira de oxigênio.'}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Estimativa de Vida Útil</span>
              <span className="text-slate-800 font-medium block mt-0.5">{fruit.conservationGuidelines?.shelfLifeEstimate || 'Conforme condições de armazenamento.'}</span>
            </div>
          </div>
        </div>

        {/* Diretrizes Específicas do Guia de Conservação */}
        {dynamicGuidelines.length > 0 && (
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <h3 className="text-xs font-bold font-mono text-slate-800 uppercase flex items-center gap-1.5">
              <ThermometerSnowflake className="w-3.5 h-3.5 text-emerald-700" />
              Diretrizes Indexadas no Guia Oficial ({dynamicGuidelines.length})
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {dynamicGuidelines.map((guideline) => (
                <div key={guideline.id} className="p-4 rounded-lg bg-slate-50/70 border border-slate-200 space-y-2 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-slate-900 font-mono">
                      {guideline.storageCondition}
                    </span>
                    <span className="text-[11px] font-mono text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      {guideline.compoundTarget}
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed font-sans">
                    {guideline.recommendation}
                  </p>
                  <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded text-[11px] text-amber-950 flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                    <span><strong>Limitações de Aplicação:</strong> {guideline.applicationLimitations}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono flex items-center justify-between pt-1">
                    <span>Fonte: {guideline.sourceCitation}</span>
                    <span>Atualizado: {guideline.updatedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Seção 6: Referências Científicas Associadas */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <span className="text-xs font-mono text-emerald-800 uppercase font-semibold">
              Literatura Indexada
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">
              Referências Científicas Relacionadas
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Publicações revisadas por pares e compêndios oficiais que embasam os parâmetros fitoquímicos de {fruit.popularName}.
            </p>
          </div>
          <button
            onClick={() => onNavigate('referencias')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors shrink-0 self-start sm:self-auto font-mono"
          >
            Consultar Acervo Completo <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {/* Combinar referências de catálogo e dinâmicas evitando duplicidades */}
          {(() => {
            const map = new Map<string, any>();
            fruit.scientificReferences.forEach(r => map.set(r.title.toLowerCase().trim(), r));
            dynamicReferences.forEach(r => map.set(r.title.toLowerCase().trim(), r));
            const allRefs = Array.from(map.values());

            return allRefs.map((ref: any) => (
              <div 
                key={ref.id || ref.title} 
                className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:border-emerald-700/40 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-emerald-800 font-semibold text-[11px] block">
                      {ref.journal} ({ref.year})
                    </span>
                    {ref.verificationStatus && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900">
                        {ref.verificationStatus}
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {ref.title}
                  </h4>
                  <p className="text-slate-600">
                    {ref.authors}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {ref.doi && (
                    <a
                      href={`https://doi.org/${ref.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-md hover:bg-slate-100 transition-colors font-medium font-mono"
                    >
                      <span>DOI</span>
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                    </a>
                  )}

                  {ref.abstract && (
                    <button
                      onClick={() => setSelectedReferenceModal(ref)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-md hover:bg-emerald-100 transition-colors font-semibold font-mono"
                    >
                      <BookOpen className="w-3 h-3 text-emerald-700" />
                      Ficha
                    </button>
                  )}
                </div>
              </div>
            ));
          })()}
        </div>
      </div>

      {/* Modal de Detalhes da Referência Selecionada */}
      {selectedReferenceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-emerald-900 uppercase bg-emerald-100 px-2 py-0.5 rounded">
                  {selectedReferenceModal.publicationType || 'Literatura Científica'}
                </span>
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {selectedReferenceModal.title}
                </h3>
                <span className="text-xs text-slate-500 font-mono block">
                  {selectedReferenceModal.journal} · {selectedReferenceModal.year}
                </span>
              </div>
              <button
                onClick={() => setSelectedReferenceModal(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Autores:</span>
                <p className="text-slate-800 font-medium">{selectedReferenceModal.authors}</p>
              </div>

              {selectedReferenceModal.abstract && (
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Resumo Científico:</span>
                  <p className="text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed text-[11px] font-sans">
                    {selectedReferenceModal.abstract}
                  </p>
                </div>
              )}

              {selectedReferenceModal.doi && (
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                  <span className="font-mono text-slate-600 text-[11px]">DOI: {selectedReferenceModal.doi}</span>
                  <a
                    href={`https://doi.org/${selectedReferenceModal.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-800 hover:underline font-bold"
                  >
                    Acessar Artigo <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {/* Caixa de Citação */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Citação Formatada:</span>
                <div className="p-3 bg-slate-900 text-slate-200 rounded-lg font-mono text-[11px] leading-relaxed">
                  {selectedReferenceModal.authors} ({selectedReferenceModal.year}). {selectedReferenceModal.title}. {selectedReferenceModal.journal}{selectedReferenceModal.volumeAndPages ? `, ${selectedReferenceModal.volumeAndPages}` : ''}.{selectedReferenceModal.doi ? ` https://doi.org/${selectedReferenceModal.doi}` : ''}
                </div>
                <button
                  onClick={() => handleCopyCitation(selectedReferenceModal)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                >
                  {copiedCitation ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Citação Copiada!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" /> Copiar Citação (ABNT/APA)
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedReferenceModal(null)}
                className="px-4 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors text-xs"
              >
                Fechar Ficha
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rodapé de Navegação Sequencial e Retorno */}
      <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => onNavigate('catalogo')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-900 hover:text-emerald-950 transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          Retornar ao Catálogo ({allFruits.length} Espécies)
        </button>

        <div className="flex items-center gap-2 text-xs font-mono self-end sm:self-auto">
          {prevFruit && (
            <button
              onClick={() => onNavigate('fruto', prevFruit.id)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
              title={`Ver ${prevFruit.popularName}`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>{prevFruit.popularName}</span>
            </button>
          )}
          {nextFruit && (
            <button
              onClick={() => onNavigate('fruto', nextFruit.id)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
              title={`Ver ${nextFruit.popularName}`}
            >
              <span>{nextFruit.popularName}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

    </div>
  );
};
