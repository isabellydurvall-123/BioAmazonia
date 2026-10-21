import React, { useState, useEffect, useMemo } from 'react';
import { UnifiedExperimentRecord, ExperimentRecordStatus, BrowningScaleScore } from '../../types';
import { experimentStorageService } from '../../services/experimentStorageService';
import { ExperimentRecordFormModal } from './ExperimentRecordFormModal';
import { DeleteExperimentModal } from './DeleteExperimentModal';
import { useAuth } from '../../contexts/AuthContext';
import { 
  BROWNING_SCALE_DESCRIPTORS,
  EXPERIMENT_PHOTOS 
} from '../../data/experimentsData';
import { 
  Eye, 
  Clock, 
  Plus, 
  Download, 
  Table, 
  LayoutGrid, 
  CheckCircle2, 
  Camera, 
  X,
  Edit2,
  Trash2,
  Lock,
  FileCheck2,
  AlertTriangle
} from 'lucide-react';

export const ExperimentB_EnzymaticBrowning: React.FC = () => {
  const { currentUser, isVisitor, isResearcher, isAdmin } = useAuth();

  const [records, setRecords] = useState<UnifiedExperimentRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [conditionFilter, setConditionFilter] = useState<'all' | string>('all');
  const [scoreFilter, setScoreFilter] = useState<'all' | number>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | ExperimentRecordStatus>('all');

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<UnifiedExperimentRecord | null>(null);
  const [activePhotoModal, setActivePhotoModal] = useState<string | null>(null);

  // Controle de Modal de Exclusão e Notificações In-App
  const [recordToDelete, setRecordToDelete] = useState<UnifiedExperimentRecord | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [feedbackNotice, setFeedbackNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadRecords = async () => {
    setIsLoading(true);
    try {
      const data = await experimentStorageService.list('oxidacao-enzimatica', 'all');
      setRecords(data);
    } catch (e) {
      console.warn('Erro ao carregar registros de oxidação enzimática:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingRecord(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (rec: UnifiedExperimentRecord) => {
    if (isVisitor) {
      setFeedbackNotice({
        type: 'error',
        message: 'Acesso restrito: Faça login como pesquisador para alterar dados.'
      });
      setTimeout(() => setFeedbackNotice(null), 4000);
      return;
    }
    if (rec.status === 'publicado' && !isAdmin) {
      setFeedbackNotice({
        type: 'error',
        message: 'Registros oficiais publicados apenas podem ser alterados por Administradores Curadores.'
      });
      setTimeout(() => setFeedbackNotice(null), 4000);
      return;
    }
    setEditingRecord(rec);
    setIsModalOpen(true);
  };

  const handleRequestDelete = (rec: UnifiedExperimentRecord) => {
    setRecordToDelete(rec);
    setIsDeleteModalOpen(true);
  };

  const handleExecuteDelete = async (rec: UnifiedExperimentRecord) => {
    await experimentStorageService.delete(rec.id, currentUser);
    setRecords(prev => prev.filter(r => r.id !== rec.id));
    setFeedbackNotice({
      type: 'success',
      message: `Amostra ${rec.sampleCode} excluída com sucesso do ensaio de oxidação!`
    });
    setTimeout(() => {
      setFeedbackNotice(null);
    }, 4500);
  };

  const filteredRecords = useMemo(() => {
    return records
      .filter(r => {
        if (isVisitor && r.status !== 'publicado') return false;
        if (statusFilter !== 'all' && r.status !== statusFilter) return false;
        if (conditionFilter !== 'all' && r.experimentalCondition !== conditionFilter) return false;
        if (scoreFilter !== 'all' && r.measuredValues?.browningScore !== scoreFilter) return false;
        return true;
      })
      .sort((a, b) => (a.measuredValues?.elapsedMinutes || 0) - (b.measuredValues?.elapsedMinutes || 0));
  }, [records, conditionFilter, scoreFilter, statusFilter, isVisitor]);

  const kineticData = useMemo(() => {
    const timePoints = [0, 30, 60, 120];
    
    const getAvgScore = (condKeyword: string, min: number) => {
      const match = records.filter(r => 
        r.experimentalCondition.toLowerCase().includes(condKeyword.toLowerCase()) && 
        Math.abs((r.measuredValues?.elapsedMinutes || 0) - min) <= 15
      );
      if (match.length === 0) {
        if (min === 0) return 0;
        if (condKeyword.includes('controle')) return min >= 120 ? 4 : min >= 60 ? 3 : 2;
        return min >= 120 ? 1 : 0;
      }
      return match[match.length - 1].measuredValues?.browningScore || 0;
    };

    return timePoints.map(t => ({
      time: t,
      control: getAvgScore('controle', t),
      buriti: getAvgScore('buriti', t),
      tucuma: getAvgScore('tucumã', t),
    }));
  }, [records]);

  const handleExportCSV = () => {
    const headers = [
      'ID_Registro',
      'Codigo_Amostra',
      'Condicao_Tratamento',
      'Horario_Inicial',
      'Horario_Observacao',
      'Minutos_Decorridos',
      'Grau_Escurecimento',
      'Status_Registro',
      'Observacoes_Estudantes',
      'Interpretacao_Cientifica',
      'Responsavel'
    ];

    const rows = filteredRecords.map(r => [
      `"${r.id}"`,
      `"${r.sampleCode}"`,
      `"${r.experimentalCondition}"`,
      `"${r.measuredValues?.initialTime || ''}"`,
      `"${r.measuredValues?.observationTime || ''}"`,
      r.measuredValues?.elapsedMinutes || 0,
      r.measuredValues?.browningScore || 0,
      `"${r.status}"`,
      `"${(r.observations || '').replace(/"/g, '""')}"`,
      `"${(r.scientificInterpretation || '').replace(/"/g, '""')}"`,
      `"${r.responsibleName || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `experimento_oxidacao_enzimatica_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      
      {/* Banner Principal do Experimento B */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          
          <div className="lg:col-span-8 p-6 sm:p-8 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-mono font-semibold">
              <Eye className="w-3.5 h-3.5 text-amber-700" /> Experimento B · Inibição da Polifenoloxidase (PPO)
            </div>

            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Oxidação Enzimática: Inibição do Escurecimento por Buriti e Tucumã
            </h2>

            <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
              <p>
                <strong className="text-slate-900 font-semibold">Objetivo Científico:</strong> Avaliar a eficácia de biofilmes naturais formulados com polpas dos frutos oleaginosos da Amazônia — <span className="italic">Mauritia flexuosa</span> (buriti) e <span className="italic">Astrocaryum aculeatum</span> (tucumã) — na inibição do escurecimento enzimático superficial em fatias de maçã (<span className="italic">Malus domestica</span> Borkh.) expostas ao oxigênio atmosférico.
              </p>
              <p>
                <strong className="text-slate-900 font-semibold">Mecanismo Bioquímico:</strong> O corte da maçã rompe a compartimentalização celular, permitindo que a enzima polifenoloxidase oxide compostos fenólicos como ácido clorogênico e epicatequinas a <span className="italic">o-quinonas</span>, que se polimerizam em pigmentos escuros insolúveis (melaninas).
              </p>
            </div>

            {/* Documentação da Escala Proposta de Escurecimento */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs font-mono uppercase text-slate-900">
                  Escala Padronizada Proposta de Escurecimento (Graus 0 a 4)
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-semibold">
                  Pendente de Validação por Densitometria Digital
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                {BROWNING_SCALE_DESCRIPTORS.map(desc => (
                  <div key={desc.score} className="p-2 bg-white rounded border border-slate-200 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 font-mono text-[11px]">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        desc.score === 0 ? 'bg-emerald-500' :
                        desc.score === 1 ? 'bg-amber-400' :
                        desc.score === 2 ? 'bg-amber-600' :
                        desc.score === 3 ? 'bg-orange-800' : 'bg-stone-900'
                      }`} />
                      Grau {desc.score}
                    </div>
                    <p className="text-[10px] text-slate-600 leading-tight">
                      {desc.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Fotografia Científica do Experimento */}
          <div className="lg:col-span-4 bg-slate-900 relative flex flex-col justify-end p-4 min-h-[220px]">
            <img 
              src={EXPERIMENT_PHOTOS.enzymaticBrowning} 
              alt="Ensaio de oxidação enzimática comparando maçã controle vs maçã tratada com buriti e tucumã" 
              className="absolute inset-0 w-full h-full object-cover opacity-85 cursor-pointer hover:opacity-95 transition-opacity"
              onClick={() => setActivePhotoModal(EXPERIMENT_PHOTOS.enzymaticBrowning)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />
            <div className="relative z-10 text-white space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400 font-semibold flex items-center gap-1">
                <Camera className="w-3 h-3 text-amber-400" /> Placa de Petri em Bancada
              </span>
              <p className="text-xs font-medium text-slate-200">
                Comparação visual: Controle oxidado (Grau 4) vs Fatias revestidas por buriti e tucumã (Grau 0-1).
              </p>
              <div className="text-[10px] text-slate-400 font-mono">
                Clique na imagem para ampliar em alta resolução
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Gráfico Comparativo de Cinética de Escurecimento */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-amber-800 font-semibold">
              Cinética de Escurecimento
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Evolução Temporal do Grau de Escurecimento (0 a 120 minutos)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparação da proteção conferida pelas matrizes lipofílicas ricas em tocoferóis e carotenoides.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-stone-900">
              <span className="w-3 h-3 rounded-full bg-stone-800" /> Controle
            </span>
            <span className="flex items-center gap-1.5 text-amber-700">
              <span className="w-3 h-3 rounded-full bg-amber-500" /> Polpa de Buriti
            </span>
            <span className="flex items-center gap-1.5 text-orange-700">
              <span className="w-3 h-3 rounded-full bg-orange-600" /> Polpa de Tucumã
            </span>
          </div>
        </div>

        {/* Linhas de Tempo Gráficas */}
        <div className="overflow-x-auto">
          <div className="min-w-[500px] space-y-4 pt-2">
            {kineticData.map((pt) => (
              <div key={pt.time} className="flex items-center gap-4 text-xs">
                <div className="w-16 font-mono font-bold text-slate-700 shrink-0">
                  {pt.time === 0 ? 't = 0 min' : `t = ${pt.time} min`}
                </div>
                
                <div className="flex-1 grid grid-cols-3 gap-3">
                  <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                    <div className="flex justify-between font-mono text-[11px] mb-1">
                      <span className="text-slate-600">Controle</span>
                      <span className="font-bold text-stone-900">Grau {pt.control} / 4</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-stone-800 h-full rounded-full transition-all duration-300" style={{ width: `${(pt.control / 4) * 100}%` }} />
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200">
                    <div className="flex justify-between font-mono text-[11px] mb-1">
                      <span className="text-amber-900">Buriti</span>
                      <span className="font-bold text-amber-800">Grau {pt.buriti} / 4</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full transition-all duration-300" style={{ width: `${(pt.buriti / 4) * 100}%` }} />
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-orange-50/70 border border-orange-200">
                    <div className="flex justify-between font-mono text-[11px] mb-1">
                      <span className="text-orange-900">Tucumã</span>
                      <span className="font-bold text-orange-800">Grau {pt.tucuma} / 4</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-orange-600 h-full rounded-full transition-all duration-300" style={{ width: `${(pt.tucuma / 4) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quadro Comparativo de Mecanismos de Ação */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1">
              Barreira Física Lipídica (Oclusão de Oxigênio)
            </span>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Tanto o buriti quanto o tucumã contêm frações oleosas ricas em ácidos graxos monoinsaturados (ácido oleico C18:1). Essa viscosidade lipofílica forma uma película hidrofóbica que reduz drasticamente o coeficiente de difusão do oxigênio atmosférico (O₂) para o interior dos tecidos vegetais lesados.
            </p>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1">
              Ação Bioquímica dos Carotenoides e Tocoferóis
            </span>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              O β-caroteno e a vitamina E (tocoferóis) atuam como varredores de radicais peroxil e supressores de oxigênio singlete (¹O₂), retardando a oxidação secundária não-enzimática e sequestrando intermediários reativos gerados durante o processo degradativo.
            </p>
          </div>
        </div>
      </div>

      {/* Controles de Filtro e Adição */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Filtrar:</span>
          
          <select
            value={conditionFilter}
            onChange={(e) => setConditionFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-md border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-amber-700"
          >
            <option value="all">Todos os Tratamentos</option>
            <option value="Grupo de Controle (Sem Tratamento)">Grupo de Controle</option>
            <option value="Tratado com Polpa de Buriti">Polpa de Buriti</option>
            <option value="Tratado com Polpa de Tucumã">Polpa de Tucumã</option>
          </select>

          <select
            value={scoreFilter}
            onChange={(e) => setScoreFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="px-2.5 py-1.5 rounded-md border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-amber-700"
          >
            <option value="all">Todos os Graus (0 a 4)</option>
            <option value={0}>Grau 0 (Nulo)</option>
            <option value={1}>Grau 1 (Leve)</option>
            <option value={2}>Grau 2 (Moderado)</option>
            <option value={3}>Grau 3 (Acentuado)</option>
            <option value={4}>Grau 4 (Severo)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-md border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-amber-700"
          >
            <option value="all">Todos os Estados</option>
            <option value="publicado">Publicados</option>
            {!isVisitor && <option value="em_revisao">Em Revisão</option>}
            {!isVisitor && <option value="rascunho">Rascunhos</option>}
          </select>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Exibição em Tabela"
            >
              <Table className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                viewMode === 'cards' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Exibição em Cartões"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" /> Exportar CSV
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-amber-800 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Registrar Observação
          </button>
        </div>

      </div>

      {/* Notificação In-App de Feedback */}
      {feedbackNotice && (
        <div className={`p-3 rounded-xl border text-xs font-medium flex items-center justify-between gap-3 animate-in fade-in duration-150 ${
          feedbackNotice.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
            : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}>
          <div className="flex items-center gap-2">
            {feedbackNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedbackNotice.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackNotice(null)}
            className="p-1 hover:bg-black/5 rounded transition-colors text-slate-500 hover:text-slate-700"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Tabela ou Cartões */}
      {viewMode === 'table' ? (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-mono uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4 font-semibold">Identificação</th>
                  <th className="py-3 px-4 font-semibold">Condição</th>
                  <th className="py-3 px-4 font-semibold">Tempo</th>
                  <th className="py-3 px-4 font-semibold text-center">Escurecimento</th>
                  <th className="py-3 px-4 font-semibold">Estado</th>
                  <th className="py-3 px-4 font-semibold">Observações dos Estudantes</th>
                  <th className="py-3 px-4 font-semibold">Interpretação Bioquímica</th>
                  <th className="py-3 px-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500 text-xs">
                      Nenhuma observação encontrada para os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((r) => {
                    const vals = r.measuredValues || {};
                    return (
                      <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-semibold text-slate-900 whitespace-nowrap">
                          {r.sampleCode}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                            r.experimentalCondition.includes('Controle')
                              ? 'bg-stone-100 text-stone-900 border border-stone-200'
                              : r.experimentalCondition.includes('Buriti')
                              ? 'bg-amber-50 text-amber-900 border border-amber-200'
                              : 'bg-orange-50 text-orange-900 border border-orange-200'
                          }`}>
                            {r.experimentalCondition}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                          {vals.elapsedMinutes || 0} min
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 font-mono font-bold px-2 py-0.5 rounded text-xs ${
                            vals.browningScore === 0 ? 'bg-emerald-100 text-emerald-900' :
                            vals.browningScore === 1 ? 'bg-amber-100 text-amber-900' :
                            vals.browningScore === 2 ? 'bg-amber-200 text-amber-950' :
                            vals.browningScore === 3 ? 'bg-orange-200 text-orange-950' : 'bg-stone-800 text-white'
                          }`}>
                            Grau {vals.browningScore ?? 0}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                            r.status === 'publicado'
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                              : r.status === 'em_revisao'
                              ? 'bg-amber-100 text-amber-900 border border-amber-200'
                              : 'bg-slate-100 text-slate-800 border border-slate-300'
                          }`}>
                            {r.status === 'publicado' ? 'Publicado' : r.status === 'em_revisao' ? 'Em Revisão' : 'Rascunho'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700 min-w-[180px]">
                          <p className="leading-relaxed bg-slate-50/70 p-2 rounded border border-slate-100 text-[11px]">
                            {r.observations}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-slate-700 min-w-[200px]">
                          <p className="leading-relaxed bg-emerald-50/40 p-2 rounded border border-emerald-100 text-[11px] text-emerald-950">
                            {r.scientificInterpretation}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            {r.photoUrl && (
                              <button
                                onClick={() => setActivePhotoModal(r.photoUrl!)}
                                className="p-1 rounded hover:bg-slate-100 text-amber-700"
                                title="Ver fotografia"
                              >
                                <Camera className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {(!isVisitor || isAdmin) && (
                              <button
                                onClick={() => handleOpenEditModal(r)}
                                className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                                title="Editar"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {(!isVisitor || isAdmin || r.dataSource !== 'demonstracao_inicial') && (
                              <button
                                type="button"
                                onClick={() => handleRequestDelete(r)}
                                className="p-1 rounded text-slate-400 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                                title="Excluir"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>Total de registros catalogados: {filteredRecords.length}</span>
            <span className="font-mono text-[10px]">Persistência Cloud Firestore Conectada</span>
          </div>
        </div>
      ) : (
        /* Cartões Responsivos */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecords.map((r) => {
            const vals = r.measuredValues || {};
            return (
              <div key={r.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-900 block">{r.sampleCode}</span>
                    <span className="text-xs text-slate-600">{r.experimentalCondition}</span>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold ${
                    vals.browningScore === 0 ? 'bg-emerald-100 text-emerald-900' :
                    vals.browningScore === 1 ? 'bg-amber-100 text-amber-900' :
                    vals.browningScore === 2 ? 'bg-amber-200 text-amber-950' :
                    vals.browningScore === 3 ? 'bg-orange-200 text-orange-950' : 'bg-stone-800 text-white'
                  }`}>
                    Grau {vals.browningScore ?? 0}
                  </span>
                </div>

                <div className="text-[11px] text-slate-500 font-mono flex items-center justify-between bg-slate-50 p-2 rounded">
                  <span>Tempo: {vals.elapsedMinutes || 0} min</span>
                  <span>{r.dateTime}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono font-semibold text-slate-500 block">
                    Observação Empírica dos Estudantes:
                  </span>
                  <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-100 leading-relaxed italic">
                    "{r.observations}"
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono font-semibold text-emerald-800 block">
                    Interpretação Bioquímica:
                  </span>
                  <p className="text-xs text-emerald-950 bg-emerald-50/50 p-2.5 rounded border border-emerald-100 leading-relaxed">
                    {r.scientificInterpretation}
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    r.status === 'publicado' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                    r.status === 'em_revisao' ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-800'
                  }`}>
                    {r.status === 'publicado' ? 'Publicado' : r.status === 'em_revisao' ? 'Em Revisão' : 'Rascunho'}
                  </span>
                  <div className="flex items-center gap-2">
                    {(!isVisitor || isAdmin) && (
                      <button onClick={() => handleOpenEditModal(r)} className="text-slate-600 hover:text-slate-900">
                        Editar
                      </button>
                    )}
                    {(!isVisitor || isAdmin || r.dataSource !== 'demonstracao_inicial') && (
                      <button 
                        type="button"
                        onClick={() => handleRequestDelete(r)} 
                        className="text-rose-600 hover:text-rose-800 text-[11px] font-medium flex items-center gap-1"
                        title="Excluir observação"
                      >
                        <Trash2 className="w-3 h-3" /> Excluir
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Formulário Funcional */}
      {isModalOpen && (
        <ExperimentRecordFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSaveSuccess={() => loadRecords()}
          experimentType="oxidacao-enzimatica"
          initialRecord={editingRecord}
          existingRecords={records}
        />
      )}

      {/* Modal de Confirmação de Exclusão Sem window.confirm */}
      <DeleteExperimentModal
        isOpen={isDeleteModalOpen}
        record={recordToDelete}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setRecordToDelete(null);
        }}
        onDeleted={() => {
          loadRecords();
        }}
        onExecuteDelete={handleExecuteDelete}
      />

      {/* Modal de Fotografia Ampliada */}
      {activePhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 rounded-xl overflow-hidden max-w-3xl w-full border border-slate-800 space-y-3 p-4">
            <div className="flex items-center justify-between text-white border-b border-slate-800 pb-2">
              <span className="font-mono text-xs text-amber-400 font-semibold flex items-center gap-1.5">
                <Camera className="w-4 h-4" /> Registro Fotográfico Laboratorial
              </span>
              <button onClick={() => setActivePhotoModal(null)} className="p-1 rounded text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <img src={activePhotoModal} alt="Fotografia do ensaio experimental" className="w-full h-auto max-h-[70vh] object-contain rounded-lg" />
            <div className="text-xs text-slate-300 font-sans">
              Ensaio de inibição da PPO: À esquerda, fatias de controle com oxidação severa (Grau 4). À direita, fatias revestidas com polpas amazônicas (buriti e tucumã) mantendo integridade celular.
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
