import React, { useState, useEffect, useMemo } from 'react';
import { ConservationGuideline, ConservationSourceType, ScientificReference, FruitSpecies } from '../types';
import { conservationStorageService } from '../services/conservationStorageService';
import { referenceStorageService } from '../services/referenceStorageService';
import { fruitStorageService } from '../services/fruitStorageService';
import { useAuth } from '../contexts/AuthContext';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  RotateCcw, 
  ExternalLink, 
  BookOpen, 
  AlertTriangle, 
  CheckCircle2, 
  ThermometerSnowflake, 
  Layers, 
  Table as TableIcon, 
  LayoutGrid, 
  Copy, 
  Check, 
  X, 
  Download,
  Plus,
  Edit3,
  Trash2,
  Calendar,
  Sparkles,
  Info
} from 'lucide-react';

export const ConservationPage: React.FC = () => {
  const { currentUser, isResearcher, isAdmin } = useAuth();

  // Dados carregados dos serviços dinâmicos
  const [guidelines, setGuidelines] = useState<ConservationGuideline[]>([]);
  const [references, setReferences] = useState<ScientificReference[]>([]);
  const [fruits, setFruits] = useState<FruitSpecies[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filtros
  const [selectedFruit, setSelectedFruit] = useState<string>('all');
  const [selectedSourceType, setSelectedSourceType] = useState<string>('all');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Modal de Referência Científica Vinculada
  const [activeReference, setActiveReference] = useState<ScientificReference | null>(null);
  const [copiedCitation, setCopiedCitation] = useState<boolean>(false);

  // Modal de Criação / Edição de Diretriz (Pesquisadores & Admins)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingGuideline, setEditingGuideline] = useState<ConservationGuideline | null>(null);
  const [formFruitId, setFormFruitId] = useState<string>('camu-camu');
  const [formStorageCondition, setFormStorageCondition] = useState<string>('');
  const [formRecommendation, setFormRecommendation] = useState<string>('');
  const [formCompoundTarget, setFormCompoundTarget] = useState<string>('');
  const [formSourceType, setFormSourceType] = useState<ConservationSourceType>('Literatura Indexada');
  const [formSourceCitation, setFormSourceCitation] = useState<string>('');
  const [formSourceUrl, setFormSourceUrl] = useState<string>('');
  const [formRelatedReferenceId, setFormRelatedReferenceId] = useState<string>('');
  const [formApplicationLimitations, setFormApplicationLimitations] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Exclusão Segura com Modal no Aplicativo (Substitui window.confirm e window.alert)
  const [guidelineToDelete, setGuidelineToDelete] = useState<ConservationGuideline | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [feedbackNotice, setFeedbackNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Carregar dados
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [guidelinesData, referencesData, fruitsData] = await Promise.all([
        conservationStorageService.list(),
        referenceStorageService.list(),
        fruitStorageService.list('all', currentUser)
      ]);
      setGuidelines(guidelinesData);
      setReferences(referencesData);
      setFruits(fruitsData);
      if (fruitsData.length > 0 && !formFruitId) {
        setFormFruitId(fruitsData[0].id);
      }
    } catch (err) {
      console.warn('Erro ao carregar dados do guia de conservação:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsubCons = conservationStorageService.subscribe(() => {
      conservationStorageService.list().then(setGuidelines);
    });
    const unsubRef = referenceStorageService.subscribe(() => {
      referenceStorageService.list().then(setReferences);
    });
    const unsubFruit = fruitStorageService.subscribe(() => {
      fruitStorageService.list('all', currentUser).then(setFruits);
    });
    return () => {
      unsubCons();
      unsubRef();
      unsubFruit();
    };
  }, [currentUser]);

  // Lista dinâmica de condições de armazenamento presentes
  const storageConditionsList = useMemo(() => {
    const set = new Set(guidelines.map(g => (g.storageCondition || '').trim()).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [guidelines]);

  // Filtragem dos dados
  const filteredGuidelines = useMemo(() => {
    return guidelines.filter(item => {
      if (selectedFruit !== 'all' && item.fruitId !== selectedFruit) {
        return false;
      }
      if (selectedSourceType !== 'all' && item.sourceType !== selectedSourceType) {
        return false;
      }
      if (selectedCondition !== 'all' && item.storageCondition !== selectedCondition) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchFruit = item.fruitCommonName.toLowerCase().includes(query) || item.scientificName.toLowerCase().includes(query);
        const matchRec = item.recommendation.toLowerCase().includes(query);
        const matchCompound = item.compoundTarget.toLowerCase().includes(query);
        const matchCondition = item.storageCondition.toLowerCase().includes(query);
        const matchSource = item.sourceCitation.toLowerCase().includes(query);
        const matchLimits = item.applicationLimitations.toLowerCase().includes(query);

        if (!matchFruit && !matchRec && !matchCompound && !matchCondition && !matchSource && !matchLimits) {
          return false;
        }
      }
      return true;
    });
  }, [guidelines, selectedFruit, selectedSourceType, selectedCondition, searchQuery]);

  const handleResetFilters = () => {
    setSelectedFruit('all');
    setSelectedSourceType('all');
    setSelectedCondition('all');
    setSearchQuery('');
  };

  const hasActiveFilters = selectedFruit !== 'all' || selectedSourceType !== 'all' || selectedCondition !== 'all' || searchQuery !== '';

  const openReferenceModal = (refId?: string) => {
    if (!refId) return;
    const found = references.find(r => r.id === refId);
    if (found) {
      setActiveReference(found);
      setCopiedCitation(false);
    }
  };

  const handleCopyCitation = (ref: ScientificReference) => {
    const citation = `${ref.authors} (${ref.year}). ${ref.title}. ${ref.journal}${ref.volumeAndPages ? `, ${ref.volumeAndPages}` : ''}.${ref.doi ? ` https://doi.org/${ref.doi}` : ''}`;
    navigator.clipboard.writeText(citation);
    setCopiedCitation(true);
    setTimeout(() => setCopiedCitation(false), 2000);
  };

  const handleOpenCreateModal = () => {
    setEditingGuideline(null);
    setFormFruitId('camu-camu');
    setFormStorageCondition('');
    setFormRecommendation('');
    setFormCompoundTarget('');
    setFormSourceType('Literatura Indexada');
    setFormSourceCitation('');
    setFormSourceUrl('');
    setFormRelatedReferenceId('');
    setFormApplicationLimitations('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: ConservationGuideline) => {
    setEditingGuideline(item);
    setFormFruitId(item.fruitId);
    setFormStorageCondition(item.storageCondition);
    setFormRecommendation(item.recommendation);
    setFormCompoundTarget(item.compoundTarget);
    setFormSourceType(item.sourceType);
    setFormSourceCitation(item.sourceCitation);
    setFormSourceUrl(item.sourceUrl || '');
    setFormRelatedReferenceId(item.relatedReferenceId || '');
    setFormApplicationLimitations(item.applicationLimitations);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleRequestDelete = (item: ConservationGuideline) => {
    setGuidelineToDelete(item);
  };

  const handleConfirmDelete = async () => {
    if (!guidelineToDelete) return;
    setIsDeleting(true);
    try {
      await conservationStorageService.delete(guidelineToDelete.id, currentUser);
      setFeedbackNotice({
        type: 'success',
        message: `Diretriz de conservação para "${guidelineToDelete.fruitCommonName}" excluída com sucesso.`
      });
      setGuidelineToDelete(null);
      const updated = await conservationStorageService.list();
      setGuidelines(updated);
      setTimeout(() => setFeedbackNotice(null), 4000);
    } catch (err: any) {
      setFeedbackNotice({
        type: 'error',
        message: err.message || 'Falha ao remover diretriz de conservação.'
      });
      setTimeout(() => setFeedbackNotice(null), 5000);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const selectedFruitObj = fruits.find(f => f.id.toLowerCase() === formFruitId.toLowerCase());
      const fruitCommonName = selectedFruitObj ? selectedFruitObj.popularName : (formFruitId || 'Fruto Amazônico');
      const scientificName = selectedFruitObj ? selectedFruitObj.scientificName : '';

      if (editingGuideline) {
        await conservationStorageService.update({
          ...editingGuideline,
          fruitId: formFruitId,
          fruitCommonName,
          scientificName,
          storageCondition: formStorageCondition.trim(),
          recommendation: formRecommendation.trim(),
          compoundTarget: formCompoundTarget.trim(),
          sourceType: formSourceType,
          sourceCitation: formSourceCitation.trim(),
          sourceUrl: formSourceUrl.trim() || undefined,
          relatedReferenceId: formRelatedReferenceId || undefined,
          applicationLimitations: formApplicationLimitations.trim()
        }, currentUser);
      } else {
        await conservationStorageService.create({
          fruitId: formFruitId,
          fruitCommonName,
          scientificName,
          storageCondition: formStorageCondition.trim(),
          recommendation: formRecommendation.trim(),
          compoundTarget: formCompoundTarget.trim(),
          sourceType: formSourceType,
          sourceCitation: formSourceCitation.trim(),
          sourceUrl: formSourceUrl.trim() || undefined,
          relatedReferenceId: formRelatedReferenceId || undefined,
          applicationLimitations: formApplicationLimitations.trim()
        }, currentUser);
      }

      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Erro ao salvar diretriz.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    if (filteredGuidelines.length === 0) return;
    const headers = ['ID', 'Fruto', 'Nome_Cientifico', 'Condicao_Armazenamento', 'Composto_Alvo', 'Recomendacao_Tecnica', 'Tipo_Fonte', 'Citacao_Fonte', 'Limitacoes_Aplicacao', 'Data_Atualizacao'];
    const rows = filteredGuidelines.map(g => [
      `"${g.id}"`,
      `"${g.fruitCommonName}"`,
      `"${g.scientificName}"`,
      `"${g.storageCondition.replace(/"/g, '""')}"`,
      `"${g.compoundTarget.replace(/"/g, '""')}"`,
      `"${g.recommendation.replace(/"/g, '""')}"`,
      `"${g.sourceType}"`,
      `"${g.sourceCitation.replace(/"/g, '""')}"`,
      `"${g.applicationLimitations.replace(/"/g, '""')}"`,
      `"${g.updatedAt}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bioamazonia_guia_conservacao_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSourceBadge = (type: ConservationSourceType) => {
    switch (type) {
      case 'Literatura Indexada':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200">
            <BookOpen className="w-3 h-3 text-emerald-700" /> Literatura Científica Indexada
          </span>
        );
      case 'Institucional (EMBRAPA / INPA)':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-blue-50 text-blue-900 border border-blue-200">
            <ShieldCheck className="w-3 h-3 text-blue-700" /> Diretriz Institucional (EMBRAPA / INPA)
          </span>
        );
      case 'Observação Experimental do Projeto':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-purple-50 text-purple-900 border border-purple-200">
            <Sparkles className="w-3 h-3 text-purple-700" /> Observação de Bancada (BioAmazônia)
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Notificação Toast em Caso de Ações Concluídas */}
      {feedbackNotice && (
        <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs shadow-xs animate-in fade-in duration-150 ${
          feedbackNotice.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}>
          <div className="flex items-center gap-2">
            {feedbackNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
            )}
            <span className="font-medium">{feedbackNotice.message}</span>
          </div>
          <button
            onClick={() => setFeedbackNotice(null)}
            className="text-slate-400 hover:text-slate-700 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* 1. Cabeçalho Geral */}
      <div className="border-b border-slate-200 pb-6 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-mono font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" /> Protocolos Pós-Colheita &amp; Cadeia de Frio
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1.5">
              Guia Digital de Conservação Nutricional
            </h1>
            <p className="text-xs font-serif italic text-emerald-950 mt-1">
              Diretrizes Técnicas para Camu-camu, Açaí, Tucumã, Buriti e Cubiu
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <button
              onClick={handleExportCSV}
              disabled={filteredGuidelines.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors font-medium shadow-2xs disabled:opacity-50"
              title="Exportar guia em CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              Exportar Guia
            </button>

            {isResearcher && (
              <button
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Nova Diretriz
              </button>
            )}

            <span className="text-xs font-mono text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              {guidelines.length} Diretrizes Ativas
            </span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 max-w-4xl leading-relaxed">
          Orientações práticas e fundamentadas para maximizar a retenção de vitamina C, antocianinas monoméricas e carotenoides termolábeis em frutos nativos da Amazônia. Distingue rigorosamente recomendações canônicas de literatura e instituições agronômicas oficiais das observações exploratórias obtidas na bancada experimental do projeto.
        </p>

        {/* Alerta de Rigor Científico e Limitações Metodológicas */}
        <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5 leading-relaxed">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold">Critério Metodológico &amp; Não-Generalização:</strong> Temperaturas e prazos de armazenamento apresentados baseiam-se em publicações da EMBRAPA, INPA e literatura científica revisada por pares. As observações experimentais do BioAmazônia (aquecimento direto por 10 min no Exp. A, teste de biofilme protetor em maçã no Exp. B e variações de pH no Exp. C) representam condições de bancada específicas e NÃO autorizam inferências sobre processos industriais sem testes prévios de escala.
          </div>
        </div>
      </div>

      {/* 2. Barra de Filtros e Pesquisa */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-800" />
            <h2 className="text-xs font-bold text-slate-900 tracking-tight uppercase font-mono">
              Filtros de Consulta
            </h2>
            <span className="text-xs font-mono text-emerald-950 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              {filteredGuidelines.length} de {guidelines.length} orientação{filteredGuidelines.length !== 1 ? 'ões' : ''}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-colors font-medium"
              >
                <RotateCcw className="w-3 h-3" />
                Limpar Filtros
              </button>
            )}

            {/* Alternador de Modo de Exibição */}
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg border border-slate-200">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-md text-xs transition-colors ${
                  viewMode === 'cards' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Exibição em Cartões"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md text-xs transition-colors ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Exibição em Tabela Comparativa"
              >
                <TableIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Grade de Controles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          
          {/* Busca Textual */}
          <div className="space-y-1">
            <label className="text-slate-600 font-medium flex items-center gap-1">
              <Search className="w-3 h-3 text-slate-400" /> Buscar no Guia:
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ex: congelamento, vácuo, PPO..."
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-slate-800"
            />
          </div>

          {/* Filtro por Fruto */}
          <div className="space-y-1">
            <label className="text-slate-600 font-medium">Fruto Estudado:</label>
            <select
              value={selectedFruit}
              onChange={(e) => setSelectedFruit(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-slate-800 font-medium"
            >
              <option value="all">Todos os {fruits.length} Frutos Cadastrados</option>
              {fruits.map(f => (
                <option key={f.id} value={f.id}>
                  {f.popularName} ({f.scientificName})
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Tipo de Fonte */}
          <div className="space-y-1">
            <label className="text-slate-600 font-medium">Origem da Orientação:</label>
            <select
              value={selectedSourceType}
              onChange={(e) => setSelectedSourceType(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-slate-800 font-medium"
            >
              <option value="all">Todas as Fontes</option>
              <option value="Literatura Indexada">Literatura Científica Indexada</option>
              <option value="Institucional (EMBRAPA / INPA)">Institucional (EMBRAPA / INPA)</option>
              <option value="Observação Experimental do Projeto">Observação Experimental de Bancada</option>
            </select>
          </div>

          {/* Filtro por Condição de Armazenamento */}
          <div className="space-y-1">
            <label className="text-slate-600 font-medium">Condição / Processo:</label>
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-slate-800 font-medium"
            >
              <option value="all">Todas as Condições ({storageConditionsList.length})</option>
              {storageConditionsList.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* 3. Exibição das Diretrizes: Modo Cartões vs Modo Tabela */}
      {isLoading ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-xs font-mono text-slate-500">
          Carregando diretrizes de conservação...
        </div>
      ) : filteredGuidelines.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-dashed border-slate-300 space-y-3">
          <Search className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">
            Nenhuma diretriz de conservação encontrada
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Não encontramos recomendações correspondentes aos filtros selecionados.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-3.5 py-1.5 text-xs text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors font-semibold"
          >
            Redefinir Filtros
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        /* Visualização em Cartões Técnicos Estruturados */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredGuidelines.map((item) => (
            <div 
              key={item.id}
              className="bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-emerald-700/40 transition-all p-5 sm:p-6 flex flex-col justify-between space-y-4"
            >
              {/* Topo do Cartão */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-sm font-extrabold text-slate-900 block">
                      {item.fruitCommonName}
                    </span>
                    <span className="text-xs font-serif italic text-emerald-950 block">
                      {item.scientificName}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {getSourceBadge(item.sourceType)}
                    {isResearcher && (
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="p-1 text-slate-400 hover:text-emerald-800 rounded transition-colors"
                        title="Editar Diretriz"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => handleRequestDelete(item)}
                        className="p-1 text-slate-400 hover:text-rose-700 rounded transition-colors"
                        title="Excluir Diretriz"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Condição de Armazenamento */}
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-0.5">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                    Condição de Armazenamento
                  </span>
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <ThermometerSnowflake className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    {item.storageCondition}
                  </span>
                </div>

                {/* Composto ou Característica Alvo */}
                <div className="text-xs">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-0.5">
                    Composto / Mecanismo Discutido:
                  </span>
                  <span className="font-semibold text-emerald-950 bg-emerald-50/60 px-2 py-0.5 rounded border border-emerald-100">
                    {item.compoundTarget}
                  </span>
                </div>

                {/* Recomendação Detalhada */}
                <div className="text-xs space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                    Recomendação Técnica:
                  </span>
                  <p className="text-slate-700 leading-relaxed font-sans bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                    {item.recommendation}
                  </p>
                </div>

                {/* Limitações de Aplicação */}
                <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200 text-[11px] text-amber-950 space-y-1 leading-relaxed">
                  <span className="font-bold flex items-center gap-1 text-amber-900">
                    <AlertTriangle className="w-3 h-3 text-amber-700 shrink-0" /> Limitações de Aplicação &amp; Cuidados:
                  </span>
                  <p>{item.applicationLimitations}</p>
                </div>
              </div>

              {/* Rodapé do Cartão com Fonte e Link para Referência */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="text-[11px] text-slate-500 font-mono">
                  <span className="font-semibold text-slate-700 block">Fonte: {item.sourceCitation}</span>
                  <span>Atualizado em: {item.updatedAt}</span>
                </div>

                {item.relatedReferenceId ? (
                  <button
                    onClick={() => openReferenceModal(item.relatedReferenceId)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 hover:text-emerald-900 hover:underline shrink-0 font-mono self-start sm:self-auto"
                  >
                    <BookOpen className="w-3 h-3" /> Ver Referência
                  </button>
                ) : item.sourceUrl ? (
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 hover:text-emerald-900 hover:underline shrink-0 font-mono self-start sm:self-auto"
                  >
                    <ExternalLink className="w-3 h-3" /> Link da Fonte
                  </a>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Visualização em Tabela Comparativa */
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="p-3 bg-slate-50 border-b border-slate-200 text-xs text-slate-500 flex items-center justify-between font-mono">
            <span>{filteredGuidelines.length} orientações pós-colheita indexadas</span>
            <span className="hidden md:inline">Deslize horizontalmente se necessário</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-semibold text-slate-700 uppercase font-mono">
                  <th className="py-3 px-3.5 whitespace-nowrap">Fruto &amp; Espécie</th>
                  <th className="py-3 px-3.5 whitespace-nowrap">Condição Armazenamento</th>
                  <th className="py-3 px-3.5 whitespace-nowrap">Composto Alvo</th>
                  <th className="py-3 px-3.5 whitespace-nowrap">Recomendação Técnica</th>
                  <th className="py-3 px-3.5 whitespace-nowrap">Origem / Categoria</th>
                  <th className="py-3 px-3.5 whitespace-nowrap">Limitações de Aplicação</th>
                  <th className="py-3 px-3.5 whitespace-nowrap">Fonte &amp; Referência</th>
                  {isResearcher && <th className="py-3 px-3.5 text-right whitespace-nowrap">Ações</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredGuidelines.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span className="font-bold text-slate-900 block">{item.fruitCommonName}</span>
                      <span className="font-serif italic text-[11px] text-slate-500">{item.scientificName}</span>
                    </td>

                    <td className="py-3 px-3.5 whitespace-nowrap font-medium text-slate-800">
                      {item.storageCondition}
                    </td>

                    <td className="py-3 px-3.5 whitespace-nowrap text-emerald-950 font-medium">
                      {item.compoundTarget}
                    </td>

                    <td className="py-3 px-3.5 max-w-xs text-slate-600 leading-relaxed text-[11px]">
                      {item.recommendation}
                    </td>

                    <td className="py-3 px-3.5 whitespace-nowrap">
                      {getSourceBadge(item.sourceType)}
                    </td>

                    <td className="py-3 px-3.5 max-w-xs text-amber-950 text-[11px] leading-relaxed">
                      {item.applicationLimitations}
                    </td>

                    <td className="py-3 px-3.5 whitespace-nowrap text-[11px] font-mono text-slate-500">
                      <span>{item.sourceCitation}</span>
                      {item.relatedReferenceId && (
                        <button
                          onClick={() => openReferenceModal(item.relatedReferenceId)}
                          className="block text-emerald-800 hover:underline font-bold mt-0.5"
                        >
                          Ver no Acervo
                        </button>
                      )}
                    </td>

                    {isResearcher && (
                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1 text-slate-500 hover:text-emerald-800 rounded"
                            title="Editar"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => handleRequestDelete(item)}
                              className="p-1 text-slate-500 hover:text-rose-700 rounded"
                              title="Excluir"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Modal de Referência Científica Vinculada */}
      {activeReference && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-emerald-900 uppercase bg-emerald-100 px-2 py-0.5 rounded">
                  {activeReference.publicationType}
                </span>
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {activeReference.title}
                </h3>
                <span className="text-xs text-slate-500 font-mono block">
                  {activeReference.journal} · {activeReference.year} {activeReference.volumeAndPages ? `· ${activeReference.volumeAndPages}` : ''}
                </span>
              </div>
              <button
                onClick={() => setActiveReference(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Autores:</span>
                <p className="text-slate-800 font-medium">{activeReference.authors}</p>
              </div>

              {activeReference.abstract && (
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Resumo Científico:</span>
                  <p className="text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed text-[11px]">
                    {activeReference.abstract}
                  </p>
                </div>
              )}

              {activeReference.doi && (
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                  <span className="font-mono text-slate-600 text-[11px]">DOI: {activeReference.doi}</span>
                  <a
                    href={`https://doi.org/${activeReference.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-800 hover:underline font-bold"
                  >
                    Abrir Publicação <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {/* Caixa de Citação ABNT / APA com Cópia Rápida */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Citação Formatada:</span>
                <div className="p-3 bg-slate-900 text-slate-200 rounded-lg font-mono text-[11px] leading-relaxed relative group">
                  {activeReference.authors} ({activeReference.year}). {activeReference.title}. {activeReference.journal}{activeReference.volumeAndPages ? `, ${activeReference.volumeAndPages}` : ''}.{activeReference.doi ? ` https://doi.org/${activeReference.doi}` : ''}
                </div>
                <button
                  onClick={() => handleCopyCitation(activeReference)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                >
                  {copiedCitation ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Citação Copiada!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" /> Copiar Citação Formatada
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setActiveReference(null)}
                className="px-4 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors text-xs"
              >
                Fechar Ficha
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 5. Modal de Cadastro / Edição de Diretriz de Conservação */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50">
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-900 uppercase bg-emerald-100 px-2 py-0.5 rounded">
                  Guia Digital Pós-Colheita
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {editingGuideline ? 'Editar Diretriz de Conservação' : 'Cadastrar Nova Diretriz de Conservação'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Fruto e Composto */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Fruto Estudado *:</label>
                  <select
                    value={formFruitId}
                    onChange={(e) => setFormFruitId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  >
                    {fruits.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.popularName} ({f.scientificName})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Composto ou Característica Alvo *:</label>
                  <input
                    type="text"
                    required
                    value={formCompoundTarget}
                    onChange={(e) => setFormCompoundTarget(e.target.value)}
                    placeholder="Ex: Ácido L-Ascórbico, Antocianinas..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Condição de Armazenamento */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">Condição / Processo de Armazenamento *:</label>
                  {storageConditionsList.length > 0 && (
                    <span className="text-[10px] text-slate-500 font-mono">
                      {storageConditionsList.length} condições cadastradas
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  required
                  list="conservation-conditions-list"
                  value={formStorageCondition}
                  onChange={(e) => setFormStorageCondition(e.target.value)}
                  placeholder="Ex: Congelamento da Polpa Desaerada (-18°C a -20°C)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
                <datalist id="conservation-conditions-list">
                  {storageConditionsList.map(c => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
                {storageConditionsList.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    <span className="text-[10px] text-slate-500">Sugestões rápidas:</span>
                    {storageConditionsList.slice(0, 4).map(c => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setFormStorageCondition(c)}
                        className="text-[10px] bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 rounded px-1.5 py-0.5 transition-colors"
                      >
                        {c.length > 30 ? c.slice(0, 30) + '...' : c}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Recomendação Técnica */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Recomendação Técnica Operacional *:</label>
                <textarea
                  rows={3}
                  required
                  value={formRecommendation}
                  onChange={(e) => setFormRecommendation(e.target.value)}
                  placeholder="Instruções práticas de manejo, envase e temperatura..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-sans"
                />
              </div>

              {/* Limitações de Aplicação e Cuidados */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 text-amber-900 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700" /> Limitações de Aplicação &amp; Cuidados Metodológicos *:
                </label>
                <textarea
                  rows={3}
                  required
                  value={formApplicationLimitations}
                  onChange={(e) => setFormApplicationLimitations(e.target.value)}
                  placeholder="Ex: Exige cadeia ininterrupta de frio; não extrapolar aquecimento de bancada para processos industriais..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-sans"
                />
              </div>

              {/* Origem e Citação */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Origem da Orientação *:</label>
                  <select
                    value={formSourceType}
                    onChange={(e) => setFormSourceType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="Literatura Indexada">Literatura Científica Indexada</option>
                    <option value="Institucional (EMBRAPA / INPA)">Institucional (EMBRAPA / INPA)</option>
                    <option value="Observação Experimental do Projeto">Observação Experimental de Bancada</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Citação da Fonte *:</label>
                  <input
                    type="text"
                    required
                    value={formSourceCitation}
                    onChange={(e) => setFormSourceCitation(e.target.value)}
                    placeholder="Ex: Yuyama et al. (2002) — Acta Amazonica"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Vínculo com Referência Científica Indexada */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <label className="font-bold text-slate-700 block">Vincular a Publicação do Acervo (Opcional):</label>
                <select
                  value={formRelatedReferenceId}
                  onChange={(e) => setFormRelatedReferenceId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="">Nenhuma referência vinculada</option>
                  {references.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.journal} ({r.year}) — {r.title.slice(0, 60)}...
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500">
                  Permite aos leitores abrir a ficha completa do artigo diretamente a partir desta recomendação.
                </p>
              </div>

              {/* URL Direta */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Endereço Eletrônico / DOI URL (Opcional):</label>
                <input
                  type="url"
                  value={formSourceUrl}
                  onChange={(e) => setFormSourceUrl(e.target.value)}
                  placeholder="https://doi.org/..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>

              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-100 transition-colors text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-lg transition-colors text-xs shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Salvando...' : editingGuideline ? 'Atualizar Diretriz' : 'Salvar no Guia'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão (Substitui window.confirm e funciona no iframe) */}
      {guidelineToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  Excluir Diretriz de Conservação?
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tem certeza de que deseja remover permanentemente a recomendação técnica de armazenamento para <strong className="text-slate-900">{guidelineToDelete.fruitCommonName}</strong> ({guidelineToDelete.storageCondition})?
                </p>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900 leading-relaxed">
              Esta ação removerá esta diretriz do acervo oficial de orientações pós-colheita para pesquisadores e produtores.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setGuidelineToDelete(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 disabled:opacity-50 rounded-md transition-colors shadow-xs flex items-center gap-1.5"
              >
                {isDeleting ? 'Excluindo...' : 'Excluir Definitivamente'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
