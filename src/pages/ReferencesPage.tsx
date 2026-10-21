import React, { useState, useEffect, useMemo } from 'react';
import { ScientificReference, PublicationType, ReferenceVerificationStatus, FruitSpecies } from '../types';
import { referenceStorageService } from '../services/referenceStorageService';
import { fruitStorageService } from '../services/fruitStorageService';
import { useAuth } from '../contexts/AuthContext';
import { 
  Search, 
  ExternalLink, 
  BookOpen, 
  Copy, 
  Check, 
  Filter, 
  RotateCcw, 
  Plus, 
  ShieldCheck, 
  HelpCircle, 
  FileText, 
  Layers, 
  FlaskConical, 
  Sparkles, 
  X,
  AlertTriangle,
  Download,
  Edit3,
  Trash2,
  CheckCircle2
} from 'lucide-react';

const PUBLICATION_TYPES: PublicationType[] = [
  'Artigo Científico em Periódico Indexado',
  'Livro Técnico / Capítulo',
  'Norma Técnica / Farmacopeia',
  'Comunicado Técnico / Manual Institucional',
  'Documento Técnico / Boletim Institucional',
  'Tese / Dissertação Acadêmica'
];

export const ReferencesPage: React.FC = () => {
  const { currentUser, isVisitor, isResearcher, isAdmin } = useAuth();

  // Lista de Referências e Catálogo de Frutos
  const [references, setReferences] = useState<ScientificReference[]>([]);
  const [availableFruits, setAvailableFruits] = useState<FruitSpecies[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filtros
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedFruit, setSelectedFruit] = useState<string>('all');
  const [selectedExperiment, setSelectedExperiment] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Estado de Cópia e Modal
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeReferenceForModal, setActiveReferenceForModal] = useState<ScientificReference | null>(null);

  // Notificações e Exclusão Segura
  const [referenceToDelete, setReferenceToDelete] = useState<ScientificReference | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [feedbackNotice, setFeedbackNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal de Criação / Edição de Referência
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [editingReference, setEditingReference] = useState<ScientificReference | null>(null);
  const [formAuthors, setFormAuthors] = useState<string>('');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formYear, setFormYear] = useState<number>(new Date().getFullYear());
  const [formJournal, setFormJournal] = useState<string>('');
  const [formVolume, setFormVolume] = useState<string>('');
  const [formDoi, setFormDoi] = useState<string>('');
  const [formUrl, setFormUrl] = useState<string>('');
  const [formPubType, setFormPubType] = useState<PublicationType>('Artigo Científico em Periódico Indexado');
  const [formFruitFocus, setFormFruitFocus] = useState<string>('Camu-camu');
  const [formRelatedFruits, setFormRelatedFruits] = useState<string[]>([]);
  const [formRelatedExperiments, setFormRelatedExperiments] = useState<('vitamina-c' | 'oxidacao-enzimatica' | 'ph-antocianinas')[]>([]);
  const [formRelatedContents, setFormRelatedContents] = useState<string>('vitamina-c, antioxidantes');
  const [formAbstract, setFormAbstract] = useState<string>('');
  const [formKeywords, setFormKeywords] = useState<string>('');
  const [formStatus, setFormStatus] = useState<ReferenceVerificationStatus>('Validada por Literatura Indexada');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleOpenCreateModal = () => {
    setEditingReference(null);
    setFormAuthors('');
    setFormTitle('');
    setFormYear(new Date().getFullYear());
    setFormJournal('');
    setFormVolume('');
    setFormDoi('');
    setFormUrl('');
    setFormPubType('Artigo Científico em Periódico Indexado');
    setFormFruitFocus(availableFruits.length > 0 ? availableFruits[0].popularName : 'Camu-camu');
    setFormRelatedFruits([]);
    setFormRelatedExperiments([]);
    setFormRelatedContents('vitamina-c, antioxidantes');
    setFormAbstract('');
    setFormKeywords('');
    setFormStatus('Validada por Literatura Indexada');
    setFormError(null);
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (ref: ScientificReference, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingReference(ref);
    setFormAuthors(ref.authors);
    setFormTitle(ref.title);
    setFormYear(ref.year);
    setFormJournal(ref.journal);
    setFormVolume(ref.volumeAndPages || '');
    setFormDoi(ref.doi || '');
    setFormUrl(ref.url || '');
    setFormPubType(ref.publicationType);
    setFormFruitFocus(ref.fruitFocus || 'Camu-camu');
    setFormRelatedFruits(ref.relatedFruits || []);
    setFormRelatedExperiments(ref.relatedExperiments || []);
    setFormRelatedContents((ref.relatedContents || []).join(', '));
    setFormAbstract(ref.abstract || '');
    setFormKeywords((ref.keywords || []).join(', '));
    setFormStatus(ref.verificationStatus);
    setFormError(null);
    setIsCreateModalOpen(true);
  };

  const handleDeleteReference = (refOrId: string | ScientificReference, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (typeof refOrId === 'string') {
      const found = references.find(r => r.id === refOrId);
      if (found) setReferenceToDelete(found);
    } else {
      setReferenceToDelete(refOrId);
    }
  };

  const handleRequestDelete = handleDeleteReference;

  const handleConfirmDelete = async () => {
    if (!referenceToDelete) return;
    setIsDeleting(true);
    try {
      await referenceStorageService.delete(referenceToDelete.id, currentUser);
      setFeedbackNotice({
        type: 'success',
        message: `Referência "${referenceToDelete.title.slice(0, 50)}..." excluída com sucesso.`
      });
      setReferenceToDelete(null);
      const data = await referenceStorageService.list();
      setReferences(data);
      setTimeout(() => setFeedbackNotice(null), 4000);
    } catch (err: any) {
      setFeedbackNotice({
        type: 'error',
        message: err.message || 'Falha ao remover referência científica.'
      });
      setTimeout(() => setFeedbackNotice(null), 5000);
    } finally {
      setIsDeleting(false);
    }
  };

  const loadReferencesAndFruits = async () => {
    setIsLoading(true);
    try {
      const [refsData, fruitsData] = await Promise.all([
        referenceStorageService.list(),
        fruitStorageService.list('all', currentUser)
      ]);
      setReferences(refsData);
      setAvailableFruits(fruitsData);
    } catch (e) {
      console.warn('Erro ao carregar dados de referências e catálogo:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReferencesAndFruits();
    const unsubRefs = referenceStorageService.subscribe(() => {
      referenceStorageService.list().then(setReferences);
    });
    const unsubFruits = fruitStorageService.subscribe(() => {
      fruitStorageService.list('all', currentUser).then(setAvailableFruits);
    });
    return () => {
      unsubRefs();
      unsubFruits();
    };
  }, [currentUser]);

  // Filtragem
  const filteredReferences = useMemo(() => {
    return references.filter(ref => {
      // Busca Textual
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchTitle = ref.title.toLowerCase().includes(query);
        const matchAuthors = ref.authors.toLowerCase().includes(query);
        const matchJournal = ref.journal.toLowerCase().includes(query);
        const matchDoi = (ref.doi || '').toLowerCase().includes(query);
        const matchKw = (ref.keywords || []).some(k => k.toLowerCase().includes(query));
        if (!matchTitle && !matchAuthors && !matchJournal && !matchDoi && !matchKw) {
          return false;
        }
      }

      // Filtro por Fruto
      if (selectedFruit !== 'all') {
        const matchFruit = ref.relatedFruits.some(f => f.toLowerCase() === selectedFruit.toLowerCase()) ||
          ref.fruitFocus.toLowerCase().includes(selectedFruit.toLowerCase());
        if (!matchFruit) return false;
      }

      // Filtro por Experimento
      if (selectedExperiment !== 'all') {
        const matchExp = ref.relatedExperiments.includes(selectedExperiment as any);
        if (!matchExp) return false;
      }

      // Filtro por Tipo de Publicação
      if (selectedType !== 'all') {
        if (ref.publicationType !== selectedType) return false;
      }

      // Filtro por Estado de Verificação
      if (selectedStatus !== 'all') {
        if (ref.verificationStatus !== selectedStatus) return false;
      }

      return true;
    });
  }, [references, searchTerm, selectedFruit, selectedExperiment, selectedType, selectedStatus]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedFruit('all');
    setSelectedExperiment('all');
    setSelectedType('all');
    setSelectedStatus('all');
  };

  const hasActiveFilters = searchTerm !== '' || selectedFruit !== 'all' || selectedExperiment !== 'all' || selectedType !== 'all' || selectedStatus !== 'all';

  // Copiar Citação em ABNT / APA
  const handleCopyCitation = (ref: ScientificReference, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const citation = `${ref.authors} (${ref.year}). ${ref.title}. ${ref.journal}${ref.volumeAndPages ? `, ${ref.volumeAndPages}` : ''}.${ref.doi ? ` https://doi.org/${ref.doi}` : ''}`;
    navigator.clipboard.writeText(citation);
    setCopiedId(ref.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Exportar Referências em CSV / BibTeX Simples
  const handleExportCSV = () => {
    if (filteredReferences.length === 0) return;
    const headers = ['ID', 'Autores', 'Ano', 'Titulo', 'Periodico_Editora', 'Volume_Paginas', 'DOI', 'URL', 'Tipo_Publicacao', 'Estado_Verificacao', 'Frutos_Relacionados', 'Experimentos_Relacionados'];
    const rows = filteredReferences.map(r => [
      `"${r.id}"`,
      `"${r.authors}"`,
      r.year,
      `"${r.title.replace(/"/g, '""')}"`,
      `"${r.journal.replace(/"/g, '""')}"`,
      `"${r.volumeAndPages || ''}"`,
      `"${r.doi || ''}"`,
      `"${r.url || ''}"`,
      `"${r.publicationType}"`,
      `"${r.verificationStatus}"`,
      `"${r.relatedFruits.join('; ')}"`,
      `"${r.relatedExperiments.join('; ')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bioamazonia_referencias_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Submissão do Formulário de Cadastro / Edição
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const contentsArray = formRelatedContents
        .split(',')
        .map(c => c.trim().toLowerCase())
        .filter(c => c.length > 0);

      const keywordsArray = formKeywords
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0);

      if (editingReference) {
        await referenceStorageService.update({
          ...editingReference,
          authors: formAuthors.trim(),
          title: formTitle.trim(),
          year: Number(formYear),
          journal: formJournal.trim(),
          volumeAndPages: formVolume.trim() || undefined,
          doi: formDoi.trim() || undefined,
          url: formUrl.trim() || (formDoi.trim() ? `https://doi.org/${formDoi.trim()}` : undefined),
          publicationType: formPubType,
          relatedContents: contentsArray,
          relatedFruits: formRelatedFruits,
          relatedExperiments: formRelatedExperiments,
          abstract: formAbstract.trim() || undefined,
          keywords: keywordsArray,
          fruitFocus: formFruitFocus,
          verificationStatus: formStatus
        }, currentUser);
      } else {
        await referenceStorageService.create({
          id: `ref-${Date.now()}`,
          authors: formAuthors.trim(),
          title: formTitle.trim(),
          year: Number(formYear),
          journal: formJournal.trim(),
          volumeAndPages: formVolume.trim() || undefined,
          doi: formDoi.trim() || undefined,
          url: formUrl.trim() || (formDoi.trim() ? `https://doi.org/${formDoi.trim()}` : undefined),
          publicationType: formPubType,
          relatedContents: contentsArray,
          relatedFruits: formRelatedFruits,
          relatedExperiments: formRelatedExperiments,
          abstract: formAbstract.trim() || undefined,
          keywords: keywordsArray,
          fruitFocus: formFruitFocus,
          verificationStatus: formStatus
        }, currentUser);
      }

      setIsCreateModalOpen(false);
      setEditingReference(null);
      // Resetar form
      setFormAuthors('');
      setFormTitle('');
      setFormJournal('');
      setFormVolume('');
      setFormDoi('');
      setFormUrl('');
      setFormAbstract('');
      setFormKeywords('');
    } catch (err: any) {
      setFormError(err.message || 'Erro ao salvar referência.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: ReferenceVerificationStatus) => {
    switch (status) {
      case 'Validada por Literatura Indexada':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200">
            <ShieldCheck className="w-3 h-3 text-emerald-700" /> Validada por Literatura Indexada
          </span>
        );
      case 'Fonte Institucional Oficial':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-blue-50 text-blue-900 border border-blue-200">
            <Check className="w-3 h-3 text-blue-700" /> Fonte Institucional Oficial (EMBRAPA/INPA)
          </span>
        );
      case 'Em Verificação':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-amber-50 text-amber-900 border border-amber-200">
            <HelpCircle className="w-3 h-3 text-amber-700" /> Em Verificação Bibliográfica
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 1. Cabeçalho Geral */}
      <div className="border-b border-slate-200 pb-6 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-mono font-semibold">
              <BookOpen className="w-3.5 h-3.5 text-emerald-700" /> Acervo Bibliográfico Verificável
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1.5">
              Referências Científicas &amp; Publicações Indexadas
            </h1>
            <p className="text-xs font-serif italic text-emerald-950 mt-1">
              Fontes primárias, manuais técnicos e compêndios oficiais que embasam a pesquisa fitoquímica do BioAmazônia
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={handleExportCSV}
              disabled={filteredReferences.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors font-medium shadow-2xs disabled:opacity-50"
              title="Exportar referências em formato tabular"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              Exportar Acervo
            </button>

            {isResearcher && (
              <button
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Nova Referência
              </button>
            )}
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 max-w-4xl leading-relaxed">
          Repositório central de publicações revisadas por pares (Food Chemistry, Food Research International, Acta Amazonica, Journal of Agricultural and Food Chemistry), normas técnicas oficiais (AOAC, Instituto Adolfo Lutz) e compêndios institucionais (EMBRAPA, INPA). Cada registro é associado dinamicamente aos frutos estudados, aos tópicos bioquímicos e aos protocolos dos três experimentos de bancada.
        </p>

        {/* Alerta de Verificabilidade Científica */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div className="leading-relaxed text-[11px] sm:text-xs">
            <strong className="text-slate-900 font-semibold">Integridade e Anti-Falsificação:</strong> Todas as referências indexadas possuem autoria real, periódico e DOI/link oficial verificável. Nenhuma publicação ou DOI sintético é permitido no BioAmazônia. Quando uma fonte ainda está sob processo de validação documental, ela é explicitamente identificada como <span className="font-mono bg-amber-100 text-amber-900 px-1 py-0.5 rounded font-bold">Em Verificação</span>.
          </div>
        </div>
      </div>

      {/* 2. Barra de Filtros e Pesquisa */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-800" />
            <h2 className="text-xs font-bold text-slate-900 tracking-tight uppercase font-mono">
              Filtros do Acervo Bibliográfico
            </h2>
            <span className="text-xs font-mono text-emerald-950 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              {filteredReferences.length} de {references.length} publicações
            </span>
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-colors font-medium self-start sm:self-auto"
            >
              <RotateCcw className="w-3 h-3" />
              Limpar Filtros
            </button>
          )}
        </div>

        {/* Grade de Controles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          
          {/* Busca Textual */}
          <div className="space-y-1 lg:col-span-1">
            <label className="text-slate-600 font-medium flex items-center gap-1">
              <Search className="w-3 h-3 text-slate-400" /> Buscar:
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Autor, título, periódico, DOI..."
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-slate-800"
            />
          </div>

          {/* Filtro por Fruto */}
          <div className="space-y-1">
            <label className="text-slate-600 font-medium">Fruto Relacionado:</label>
            <select
              value={selectedFruit}
              onChange={(e) => setSelectedFruit(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-slate-800 font-medium"
            >
              <option value="all">Todos os Frutos ({availableFruits.length})</option>
              {availableFruits.map(fruit => (
                <option key={fruit.id} value={fruit.id}>
                  {fruit.popularName || (fruit as any).commonName}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Experimento */}
          <div className="space-y-1">
            <label className="text-slate-600 font-medium">Experimento de Bancada:</label>
            <select
              value={selectedExperiment}
              onChange={(e) => setSelectedExperiment(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-slate-800 font-medium"
            >
              <option value="all">Todos os Experimentos</option>
              <option value="vitamina-c">Exp. A — Vitamina C</option>
              <option value="oxidacao-enzimatica">Exp. B — Oxidação Enzimática</option>
              <option value="ph-antocianinas">Exp. C — pH das Antocianinas</option>
            </select>
          </div>

          {/* Filtro por Tipo de Publicação */}
          <div className="space-y-1">
            <label className="text-slate-600 font-medium">Tipo de Publicação:</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-slate-800 font-medium"
            >
              <option value="all">Todos os Tipos</option>
              {PUBLICATION_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Filtro por Estado de Verificação */}
          <div className="space-y-1">
            <label className="text-slate-600 font-medium">Estado de Verificação:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-slate-800 font-medium"
            >
              <option value="all">Todos os Estados</option>
              <option value="Validada por Literatura Indexada">Validada por Literatura</option>
              <option value="Fonte Institucional Oficial">Fonte Institucional (EMBRAPA/INPA)</option>
              <option value="Em Verificação">Em Verificação</option>
            </select>
          </div>

        </div>
      </div>

      {/* 3. Lista de Referências Científicas */}
      {isLoading ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-xs font-mono text-slate-500">
          Carregando acervo bibliográfico...
        </div>
      ) : filteredReferences.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-dashed border-slate-300 space-y-3">
          <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">
            Nenhuma publicação científica encontrada
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Não há publicações cadastradas que correspondam aos filtros combinados.
          </p>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="px-3.5 py-1.5 text-xs text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors font-semibold"
            >
              Redefinir Filtros
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReferences.map((ref) => {
            const hasDoi = Boolean(ref.doi && ref.doi.trim());
            const hasUrl = Boolean(ref.url && ref.url.trim());

            return (
              <div
                key={ref.id}
                onClick={() => setActiveReferenceForModal(ref)}
                className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-2xs hover:border-emerald-700/40 hover:shadow-xs transition-all space-y-4 cursor-pointer group"
              >
                {/* Cabeçalho da Referência */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono text-emerald-900 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {ref.journal} · {ref.year}
                      </span>
                      {ref.volumeAndPages && (
                        <span className="text-[11px] font-mono text-slate-500">
                          {ref.volumeAndPages}
                        </span>
                      )}
                      <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                        {ref.publicationType}
                      </span>
                    </div>

                    <h2 className="text-base font-bold text-slate-900 leading-snug group-hover:text-emerald-900 transition-colors pt-1">
                      {ref.title}
                    </h2>

                    <p className="text-xs text-slate-700 font-medium">
                      {ref.authors}
                    </p>
                  </div>

                  <div className="shrink-0 self-start">
                    {getStatusBadge(ref.verificationStatus)}
                  </div>
                </div>

                {/* Resumo / Abstract */}
                {ref.abstract && (
                  <p className="text-xs text-slate-600 bg-slate-50/70 p-3.5 rounded-lg border border-slate-100 leading-relaxed font-sans line-clamp-3">
                    {ref.abstract}
                  </p>
                )}

                {/* Vínculos: Frutos Relacionados, Experimentos e Conteúdos */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                    Vínculos no Projeto:
                  </span>

                  {/* Frutos */}
                  {ref.relatedFruits.map(fruit => (
                    <span key={fruit} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 text-[10px] font-medium font-mono">
                      <Layers className="w-2.5 h-2.5 text-emerald-700" />
                      {fruit}
                    </span>
                  ))}

                  {/* Experimentos */}
                  {ref.relatedExperiments.map(exp => (
                    <span key={exp} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 text-purple-900 border border-purple-200 text-[10px] font-medium font-mono">
                      <FlaskConical className="w-2.5 h-2.5 text-purple-700" />
                      {exp === 'vitamina-c' ? 'Exp. A (Vitamina C)' : exp === 'oxidacao-enzimatica' ? 'Exp. B (Oxidação)' : 'Exp. C (pH)'}
                    </span>
                  ))}
                </div>

                {/* Barra Inferior com DOI, Link e Botão de Copiar Citação */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-3">
                    {hasDoi && (
                      <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        DOI: {ref.doi}
                      </span>
                    )}
                    {hasUrl && (
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-800 hover:text-emerald-900 hover:underline font-bold"
                      >
                        Acessar Documento <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isResearcher && (
                      <button
                        onClick={(e) => handleOpenEditModal(ref, e)}
                        className="p-1.5 text-slate-500 hover:text-emerald-800 hover:bg-emerald-50 rounded-md border border-slate-200 transition-colors"
                        title="Editar Referência"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {isAdmin && (
                      <button
                        onClick={(e) => handleDeleteReference(ref.id, e)}
                        className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-md border border-slate-200 transition-colors"
                        title="Excluir Referência"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={(e) => handleCopyCitation(ref, e)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors shrink-0"
                    >
                      {copiedId === ref.id ? (
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
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Modal de Visualização Completa da Referência */}
      {activeReferenceForModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-emerald-900 uppercase bg-emerald-100 px-2 py-0.5 rounded">
                    {activeReferenceForModal.publicationType}
                  </span>
                  {getStatusBadge(activeReferenceForModal.verificationStatus)}
                </div>
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {activeReferenceForModal.title}
                </h3>
                <span className="text-xs text-slate-500 font-mono block">
                  {activeReferenceForModal.journal} · {activeReferenceForModal.year} {activeReferenceForModal.volumeAndPages ? `· ${activeReferenceForModal.volumeAndPages}` : ''}
                </span>
              </div>
              <button
                onClick={() => setActiveReferenceForModal(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Autores:</span>
                <p className="text-slate-800 font-medium">{activeReferenceForModal.authors}</p>
              </div>

              {activeReferenceForModal.abstract && (
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Resumo Científico:</span>
                  <p className="text-slate-600 bg-slate-50 p-3.5 rounded-lg border border-slate-200 leading-relaxed text-[11px] font-sans">
                    {activeReferenceForModal.abstract}
                  </p>
                </div>
              )}

              {activeReferenceForModal.keywords && activeReferenceForModal.keywords.length > 0 && (
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">Palavras-chave:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeReferenceForModal.keywords.map(kw => (
                      <span key={kw} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px]">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Vínculos */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">
                  Aplicações e Vínculos no BioAmazônia:
                </span>
                <div className="text-[11px] text-slate-700 space-y-1">
                  <div>
                    <strong>Frutos Associados:</strong> {activeReferenceForModal.relatedFruits.join(', ')}
                  </div>
                  <div>
                    <strong>Experimentos Relacionados:</strong> {activeReferenceForModal.relatedExperiments.join(', ') || 'Fundamentação Teórica Geral'}
                  </div>
                  {activeReferenceForModal.relatedContents.length > 0 && (
                    <div>
                      <strong>Tópicos de Bioquímica:</strong> {activeReferenceForModal.relatedContents.join(', ')}
                    </div>
                  )}
                </div>
              </div>

              {/* Caixa de Citação Formatada ABNT / APA */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Citação Formatada:</span>
                <div className="p-3.5 bg-slate-900 text-slate-200 rounded-lg font-mono text-[11px] leading-relaxed">
                  {activeReferenceForModal.authors} ({activeReferenceForModal.year}). {activeReferenceForModal.title}. {activeReferenceForModal.journal}{activeReferenceForModal.volumeAndPages ? `, ${activeReferenceForModal.volumeAndPages}` : ''}.{activeReferenceForModal.doi ? ` https://doi.org/${activeReferenceForModal.doi}` : ''}
                </div>
                <button
                  onClick={() => handleCopyCitation(activeReferenceForModal)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                >
                  {copiedId === activeReferenceForModal.id ? (
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

              {activeReferenceForModal.doi && (
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-emerald-50/50">
                  <span className="font-mono text-emerald-950 text-xs">
                    DOI: {activeReferenceForModal.doi}
                  </span>
                  <a
                    href={`https://doi.org/${activeReferenceForModal.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-xs text-emerald-800 hover:underline font-bold"
                  >
                    Acessar via DOI <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isResearcher && (
                  <button
                    onClick={() => {
                      const refToEdit = activeReferenceForModal;
                      setActiveReferenceForModal(null);
                      handleOpenEditModal(refToEdit);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:text-emerald-800 hover:border-emerald-700 rounded-lg transition-colors text-xs font-semibold"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Editar
                  </button>
                )}
                {isAdmin && (
                  <button
                    onClick={() => {
                      const idToDelete = activeReferenceForModal.id;
                      setActiveReferenceForModal(null);
                      handleDeleteReference(idToDelete);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-800 hover:bg-rose-100 rounded-lg transition-colors text-xs font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Excluir
                  </button>
                )}
              </div>

              <button
                onClick={() => setActiveReferenceForModal(null)}
                className="px-4 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors text-xs"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 5. Modal de Cadastro / Edição de Referência Científica (Pesquisadores / Admins) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50">
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-900 uppercase bg-emerald-100 px-2 py-0.5 rounded">
                  Acervo Fitoquímico
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {editingReference ? 'Editar Referência Científica' : 'Cadastrar Nova Referência Científica'}
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Título */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Título da Publicação *:</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ex: Phytochemical profile and antioxidant stability of..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              {/* Autores */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Autores (formato acadêmico) *:</label>
                <input
                  type="text"
                  required
                  value={formAuthors}
                  onChange={(e) => setFormAuthors(e.target.value)}
                  placeholder="Ex: Silva, L. M. R., Ricardo, N. M. P. S., et al."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              {/* Linha: Periódico, Ano e Volume */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1 sm:col-span-1">
                  <label className="font-bold text-slate-700">Revista / Editora *:</label>
                  <input
                    type="text"
                    required
                    value={formJournal}
                    onChange={(e) => setFormJournal(e.target.value)}
                    placeholder="Ex: Food Chemistry"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Ano *:</label>
                  <input
                    type="number"
                    required
                    min={1900}
                    max={new Date().getFullYear() + 1}
                    value={formYear}
                    onChange={(e) => setFormYear(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Volume / Páginas:</label>
                  <input
                    type="text"
                    value={formVolume}
                    onChange={(e) => setFormVolume(e.target.value)}
                    placeholder="v. 165, p. 142-148"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* DOI e URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">DOI (apenas identificador):</label>
                  <input
                    type="text"
                    value={formDoi}
                    onChange={(e) => setFormDoi(e.target.value)}
                    placeholder="10.1016/j.foodchem..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Endereço Eletrônico / URL:</label>
                  <input
                    type="url"
                    value={formUrl}
                    onChange={(e) => setFormUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              {/* Tipo de Publicação e Estado de Verificação */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Tipo de Publicação *:</label>
                  <select
                    value={formPubType}
                    onChange={(e) => setFormPubType(e.target.value as PublicationType)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  >
                    {PUBLICATION_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Estado de Verificação *:</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as ReferenceVerificationStatus)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="Validada por Literatura Indexada">Validada por Literatura Indexada</option>
                    <option value="Fonte Institucional Oficial">Fonte Institucional (EMBRAPA/INPA)</option>
                    <option value="Em Verificação">Em Verificação</option>
                  </select>
                </div>
              </div>

              {/* Frutos e Experimentos Relacionados */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                <span className="font-bold text-slate-800 block text-xs">Vínculos com o Projeto:</span>
                
                <div>
                  <label className="text-slate-600 text-[11px] block mb-1">Frutos Relacionados:</label>
                  <div className="flex flex-wrap gap-2.5">
                    {availableFruits.map(fruit => (
                      <label key={fruit.id} className="flex items-center gap-1.5 cursor-pointer text-xs bg-white px-2.5 py-1 rounded border border-slate-200 shadow-2xs hover:border-emerald-500">
                        <input
                          type="checkbox"
                          checked={formRelatedFruits.includes(fruit.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormRelatedFruits([...formRelatedFruits, fruit.id]);
                            } else {
                              setFormRelatedFruits(formRelatedFruits.filter(f => f !== fruit.id));
                            }
                          }}
                          className="rounded border-slate-300 text-emerald-800 focus:ring-emerald-700"
                        />
                        <span>{fruit.popularName || (fruit as any).commonName || fruit.id}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-slate-600 text-[11px] block mb-1">Experimentos Relacionados:</label>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { id: 'vitamina-c', label: 'Exp. A (Vitamina C)' },
                      { id: 'oxidacao-enzimatica', label: 'Exp. B (Oxidação Enzimática)' },
                      { id: 'ph-antocianinas', label: 'Exp. C (pH Antocianinas)' }
                    ].map(exp => (
                      <label key={exp.id} className="flex items-center gap-1.5 cursor-pointer text-xs">
                        <input
                          type="checkbox"
                          checked={formRelatedExperiments.includes(exp.id as any)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormRelatedExperiments([...formRelatedExperiments, exp.id as any]);
                            } else {
                              setFormRelatedExperiments(formRelatedExperiments.filter(x => x !== exp.id));
                            }
                          }}
                          className="rounded border-slate-300 text-emerald-800 focus:ring-emerald-700"
                        />
                        <span>{exp.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Resumo */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Resumo / Abstract:</label>
                <textarea
                  rows={3}
                  value={formAbstract}
                  onChange={(e) => setFormAbstract(e.target.value)}
                  placeholder="Síntese dos achados científicos e metodologia..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-sans"
                />
              </div>

              {/* Palavras-chave */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Palavras-chave (separadas por vírgula):</label>
                <input
                  type="text"
                  value={formKeywords}
                  onChange={(e) => setFormKeywords(e.target.value)}
                  placeholder="Ex: Myrciaria dubia, HPLC, ácido ascórbico, estabilidade"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-100 transition-colors text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-emerald-800 text-white font-medium rounded-lg hover:bg-emerald-900 transition-colors text-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {isSubmitting ? 'Salvando...' : editingReference ? 'Atualizar Referência' : 'Cadastrar Referência'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
