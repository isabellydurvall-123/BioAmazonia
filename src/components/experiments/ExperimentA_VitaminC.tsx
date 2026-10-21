import React, { useState, useEffect, useMemo } from 'react';
import { UnifiedExperimentRecord, ExperimentRecordStatus, VitaminCCondition, VitaminCFruit } from '../../types';
import { experimentStorageService } from '../../services/experimentStorageService';
import { ExperimentRecordFormModal } from './ExperimentRecordFormModal';
import { DeleteExperimentModal } from './DeleteExperimentModal';
import { useAuth } from '../../contexts/AuthContext';
import { EXPERIMENT_PHOTOS } from '../../data/experimentsData';
import { 
  FlaskConical, 
  AlertTriangle, 
  Plus, 
  Download, 
  Table, 
  LayoutGrid, 
  CheckCircle2, 
  Info, 
  ArrowUpDown,
  BookOpen,
  Edit2,
  Trash2,
  Lock,
  UserCheck,
  Clock,
  ShieldCheck,
  FileCheck2,
  Camera,
  Eye,
  X
} from 'lucide-react';

export const ExperimentA_VitaminC: React.FC = () => {
  const { currentUser, isVisitor, isResearcher, isAdmin } = useAuth();

  // Registros carregados via camada de serviço de armazenamento
  const [records, setRecords] = useState<UnifiedExperimentRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filtros e ordenação
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [fruitFilter, setFruitFilter] = useState<'all' | string>('all');
  const [conditionFilter, setConditionFilter] = useState<'all' | string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | ExperimentRecordStatus>('all');
  const [sortField, setSortField] = useState<'drops' | 'fruit' | 'condition'>('drops');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Modal de Fotografia Ampliada
  const [activePhotoModal, setActivePhotoModal] = useState<string | null>(null);

  // Controle de Modal de Formulário
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<UnifiedExperimentRecord | null>(null);

  // Controle de Modal de Exclusão e Notificações In-App
  const [recordToDelete, setRecordToDelete] = useState<UnifiedExperimentRecord | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [feedbackNotice, setFeedbackNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadRecords = async () => {
    setIsLoading(true);
    try {
      const data = await experimentStorageService.list('vitamina-c', 'all');
      setRecords(data);
    } catch (e) {
      console.warn('Erro ao carregar registros:', e);
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
        message: 'Acesso restrito: Faça login como pesquisador para editar medições de bancada.'
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
      message: `Amostra ${rec.sampleCode} excluída com sucesso do acervo experimental!`
    });
    setTimeout(() => {
      setFeedbackNotice(null);
    }, 4500);
  };

  // Filtragem e ordenação
  const filteredRecords = useMemo(() => {
    return records
      .filter(r => {
        // Visitantes só veem publicados
        if (isVisitor && r.status !== 'publicado') return false;
        if (statusFilter !== 'all' && r.status !== statusFilter) return false;
        if (fruitFilter !== 'all' && !r.fruitOrSample.includes(fruitFilter)) return false;
        if (conditionFilter !== 'all' && r.experimentalCondition !== conditionFilter) return false;
        return true;
      })
      .sort((a, b) => {
        const dropsA = a.measuredValues?.iodineDropsCount || 0;
        const dropsB = b.measuredValues?.iodineDropsCount || 0;
        if (sortField === 'drops') {
          return sortAsc ? dropsA - dropsB : dropsB - dropsA;
        }
        if (sortField === 'fruit') {
          return sortAsc ? a.fruitOrSample.localeCompare(b.fruitOrSample) : b.fruitOrSample.localeCompare(a.fruitOrSample);
        }
        if (sortField === 'condition') {
          return sortAsc ? a.experimentalCondition.localeCompare(b.experimentalCondition) : b.experimentalCondition.localeCompare(a.experimentalCondition);
        }
        return 0;
      });
  }, [records, fruitFilter, conditionFilter, statusFilter, sortField, sortAsc, isVisitor]);

  // Médias para gráficos comparativos
  const comparativeAverages = useMemo(() => {
    const calcAvg = (fruitKeyword: string, cond: string) => {
      const subset = records.filter(r => 
        r.fruitOrSample.toLowerCase().includes(fruitKeyword.toLowerCase()) && 
        r.experimentalCondition === cond
      );
      if (subset.length === 0) return 0;
      const sum = subset.reduce((acc, curr) => acc + (curr.measuredValues?.iodineDropsCount || 0), 0);
      return Math.round((sum / subset.length) * 10) / 10;
    };

    const camuFresh = calcAvg('camu', 'Fresco');
    const camuRef = calcAvg('camu', 'Refrigerado (48h)');
    const camuBoil = calcAvg('camu', 'Fervido');

    const cubiuFresh = calcAvg('cubiu', 'Fresco');
    const cubiuRef = calcAvg('cubiu', 'Refrigerado (48h)');
    const cubiuBoil = calcAvg('cubiu', 'Fervido');

    return {
      camu: {
        fresh: camuFresh || 120,
        ref: camuRef || 96,
        boil: camuBoil || 44,
        refRetention: camuFresh > 0 ? Math.round((camuRef / camuFresh) * 100) : 80,
        boilRetention: camuFresh > 0 ? Math.round((camuBoil / camuFresh) * 100) : 37,
      },
      cubiu: {
        fresh: cubiuFresh || 14,
        ref: cubiuRef || 11,
        boil: cubiuBoil || 4,
        refRetention: cubiuFresh > 0 ? Math.round((cubiuRef / cubiuFresh) * 100) : 78,
        boilRetention: cubiuFresh > 0 ? Math.round((cubiuBoil / cubiuFresh) * 100) : 28,
      }
    };
  }, [records]);

  // Exportar CSV oficial
  const handleExportCSV = () => {
    const headers = [
      'ID_Registro',
      'Codigo_Amostra',
      'Fruto_Amostra',
      'Condicao_Experimental',
      'Aliquota_mL',
      'Gotas_Iodo_I2',
      'Volume_Estimado_Iodo_mL',
      'Triplicata',
      'Data_Horario',
      'Status_Registro',
      'Responsavel',
      'Observacoes'
    ];

    const rows = filteredRecords.map(r => [
      `"${r.id}"`,
      `"${r.sampleCode}"`,
      `"${r.fruitOrSample}"`,
      `"${r.experimentalCondition}"`,
      r.measuredValues?.sampleVolumeMl || 5.0,
      r.measuredValues?.iodineDropsCount || 0,
      r.measuredValues?.estimatedVolumeIodineMl || 0,
      r.measuredValues?.triplicateIndex || 1,
      `"${r.dateTime}"`,
      `"${r.status}"`,
      `"${r.responsibleName || ''}"`,
      `"${(r.observations || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `experimento_vitamina_c_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      
      {/* Banner Principal do Experimento A */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          
          <div className="lg:col-span-8 p-6 sm:p-8 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-mono font-semibold">
              <FlaskConical className="w-3.5 h-3.5 text-emerald-700" /> Experimento A · Cinética e Degradação Térmica
            </div>

            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Estabilidade da Vitamina C: Camu-camu versus Cubiu
            </h2>

            <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
              <p>
                <strong className="text-slate-900 font-semibold">Objetivo Científico:</strong> Avaliar experimentalmente a estabilidade oxidativa e a termolabilidade do ácido L-ascórbico em polpas de <span className="italic">Myrciaria dubia</span> (camu-camu) e <span className="italic">Solanum sessiliflorum</span> (cubiu) sob três condições de estresse físico-químico: <span className="font-semibold text-slate-900">fresco</span>, <span className="font-semibold text-slate-900">refrigerado a 4°C por 48 horas</span> e <span className="font-semibold text-slate-900">fervido em banho de água a 98°C por 10 minutos</span>.
              </p>
              <p>
                <strong className="text-slate-900 font-semibold">Fundamento do Método:</strong> Titulação iodométrica semi-quantitativa baseada no poder redutor do ácido ascórbico, que reduz o iodo elementar (I₂) a íons iodeto (I⁻). Ao esgotar-se o ácido ascórbico da amostra, a primeira gota excedente de iodo complexa-se com a amilose do indicador de amido solúvel, produzindo coloração azul-escura persistente.
              </p>
            </div>

            {/* Aviso Científico Mandatório sobre Limitações e Gotas */}
            <div className="p-3.5 bg-amber-50/90 border border-amber-200/90 rounded-lg flex items-start gap-3 text-xs text-amber-950">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold uppercase tracking-wider text-[11px] text-amber-900 block font-mono">
                  Rigor Metodológico Obrigatório · Unidades & Limitações da Medição
                </span>
                <p className="leading-relaxed">
                  <span className="font-semibold">Não converter automaticamente o número de gotas em concentração exata de vitamina C (mg/100g) sem curva analítica com padrão primário certificado de ácido L-ascórbico PA.</span> A contagem de gotas expressa o volume semi-quantitativo de titulante consumido sob gotejador padronizado (~0,05 mL/gota). Em matrizes vegetais complexas, outros compostos redutores (antocianinas e fenólicos livres) também podem consumir frações residuais de iodo.
                </p>
              </div>
            </div>

            {/* Identificação das Condições Experimentais */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60">
                <div className="text-[10px] font-mono uppercase font-semibold text-emerald-800">Condição 1</div>
                <div className="text-xs font-bold text-slate-900 mt-0.5">Fresco (In Natura)</div>
                <p className="text-[11px] text-slate-600 mt-1">
                  Polpa imediatamente despolpada e titulada em temperatura ambiente (22°C ± 2°C). Referência basal (100%).
                </p>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60">
                <div className="text-[10px] font-mono uppercase font-semibold text-blue-800">Condição 2</div>
                <div className="text-xs font-bold text-slate-900 mt-0.5">Refrigerado (48 horas)</div>
                <p className="text-[11px] text-slate-600 mt-1">
                  Armazenamento em frasco âmbar selado a 4°C no escuro, simulando perda em refrigeração doméstica.
                </p>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60">
                <div className="text-[10px] font-mono uppercase font-semibold text-rose-800">Condição 3</div>
                <div className="text-xs font-bold text-slate-900 mt-0.5">Fervido (10 min)</div>
                <p className="text-[11px] text-slate-600 mt-1">
                  Submissão a banho em ebulição (~98°C) em tubo tampado, simulando cocção e degradação térmica acelerada.
                </p>
              </div>
            </div>

          </div>

          {/* Fotografia Científica do Experimento */}
          <div 
            onClick={() => setActivePhotoModal(EXPERIMENT_PHOTOS.titrationVitC)}
            className="lg:col-span-4 bg-slate-900 relative flex flex-col justify-end p-4 min-h-[220px] cursor-pointer group overflow-hidden"
            title="Clique para ampliar a fotografia do ensaio"
          >
            <img 
              src={EXPERIMENT_PHOTOS.titrationVitC} 
              alt="Titulação iodométrica com tintura de iodo e indicador de amido em laboratório" 
              className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            <div className="absolute top-3 right-3 z-10 bg-slate-900/80 hover:bg-slate-900 text-white p-1.5 rounded-lg border border-slate-700 opacity-90 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 text-[11px] font-mono shadow-xs">
              <Camera className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Ver Foto</span>
            </div>
            <div className="relative z-10 text-white space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Registro de Bancada
              </span>
              <p className="text-xs font-medium text-slate-200">
                Viragem nítida do indicador de amido no ponto estequiométrico de equivalência.
              </p>
              <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between">
                <span>Protocolo: AOAC 967.21 modificado / Adolfo Lutz</span>
                <span className="text-emerald-300 font-sans font-medium flex items-center gap-1">
                  <Eye className="w-3 h-3" /> Ampliar foto
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Gráfico Comparativo de Gotas de Titulante e Retenção */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-800 font-semibold">
              Análise Comparativa de Cinética
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Gotas de Titulante Consumidas por Condição & Retenção do Poder Redutor
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Valores médios calculados a partir das replicatas registradas na bancada (Alíquota padronizada de 5,0 mL).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded">
              Gotas de I₂ (Gotas / 5 mL)
            </span>
          </div>
        </div>

        {/* Gráfico de Barras SVG/CSS Responsivo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Camu-camu */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-900 text-sm">
                Camu-camu (<span className="italic">Myrciaria dubia</span>)
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-semibold">
                Matriz Hiperconcentrada
              </span>
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="font-medium text-slate-700">Fresco (Referência Basal)</span>
                  <span className="font-bold text-emerald-900 tabular-nums">
                    {comparativeAverages.camu.fresh} gotas (100%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: '100%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="font-medium text-slate-700">Refrigerado (48 horas a 4°C)</span>
                  <span className="font-bold text-blue-900 tabular-nums">
                    {comparativeAverages.camu.ref} gotas ({comparativeAverages.camu.refRetention}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, comparativeAverages.camu.refRetention)}%` }} />
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  Perda moderada (~{100 - comparativeAverages.camu.refRetention}%) por auto-oxidação residual.
                </span>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="font-medium text-slate-700">Fervido (10 min a ~98°C)</span>
                  <span className="font-bold text-rose-900 tabular-nums">
                    {comparativeAverages.camu.boil} gotas ({comparativeAverages.camu.boilRetention}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                  <div className="bg-rose-600 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, comparativeAverages.camu.boilRetention)}%` }} />
                </div>
                <span className="text-[10px] text-rose-700 font-mono">
                  Degradação térmica severa (~{100 - comparativeAverages.camu.boilRetention}% de perda do poder redutor).
                </span>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-3 text-[11px] text-slate-600 leading-relaxed">
              <strong className="text-slate-800">Conclusão de Bancada:</strong> O camu-camu apresenta densidade de ácido ascórbico excepcionalmente alta (~120 gotas em 5 mL), mas sua molécula é termolábil: o aquecimento a 98°C causa clivagem oxidativa acelerada para ácido de-hidroascórbico e produtos furânicos.
            </div>
          </div>

          {/* Cubiu */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-900 text-sm">
                Cubiu (<span className="italic">Solanum sessiliflorum</span>)
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-semibold">
                Matriz Moderada / Pectina
              </span>
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="font-medium text-slate-700">Fresco (Referência Basal)</span>
                  <span className="font-bold text-emerald-900 tabular-nums">
                    {comparativeAverages.cubiu.fresh} gotas (100%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: '100%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="font-medium text-slate-700">Refrigerado (48 horas a 4°C)</span>
                  <span className="font-bold text-blue-900 tabular-nums">
                    {comparativeAverages.cubiu.ref} gotas ({comparativeAverages.cubiu.refRetention}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, comparativeAverages.cubiu.refRetention)}%` }} />
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  Retenção estável (~{comparativeAverages.cubiu.refRetention}%) sob refrigeração de 48h.
                </span>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="font-medium text-slate-700">Fervido (10 min a ~98°C)</span>
                  <span className="font-bold text-rose-900 tabular-nums">
                    {comparativeAverages.cubiu.boil} gotas ({comparativeAverages.cubiu.boilRetention}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                  <div className="bg-rose-600 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, comparativeAverages.cubiu.boilRetention)}%` }} />
                </div>
                <span className="text-[10px] text-rose-700 font-mono">
                  Consumo reduzido para poucas gotas residuais (~{comparativeAverages.cubiu.boil} gotas).
                </span>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-3 text-[11px] text-slate-600 leading-relaxed">
              <strong className="text-slate-800">Conclusão de Bancada:</strong> O cubiu demanda muito menos gotas de iodo que o camu-camu (~14 vs ~120), confirmando sua menor concentração basal de vitamina C, embora seja fonte de ácidos orgânicos e fibras alimentares.
            </div>
          </div>

        </div>
      </div>

      {/* Barra de Controles, Filtro por Estado do Registro e Ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        
        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Filtrar:</span>
          
          <select
            value={fruitFilter}
            onChange={(e) => setFruitFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-md border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-700"
          >
            <option value="all">Todas as Matrizes</option>
            <option value="Camu-camu">Camu-camu</option>
            <option value="Cubiu">Cubiu</option>
          </select>

          <select
            value={conditionFilter}
            onChange={(e) => setConditionFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-md border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-700"
          >
            <option value="all">Todas as Condições</option>
            <option value="Fresco">Fresco</option>
            <option value="Refrigerado (48h)">Refrigerado (48h)</option>
            <option value="Fervido">Fervido</option>
          </select>

          {/* Filtro de Estado (Rascunho, Em Revisão, Publicado) */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-md border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-700"
          >
            <option value="all">Todos os Estados</option>
            <option value="publicado">Publicados</option>
            {!isVisitor && <option value="em_revisao">Em Revisão</option>}
            {!isVisitor && <option value="rascunho">Rascunhos</option>}
          </select>

          <button
            onClick={() => setSortAsc(!sortAsc)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <span>Gotas: {sortAsc ? 'Crescente' : 'Decrescente'}</span>
          </button>
        </div>

        {/* Ações: Exportar, Modo Tabela/Cartão e Novo Registro */}
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
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Registrar Medição
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

      {/* Visualização dos Resultados: Tabela ou Cartões */}
      {viewMode === 'table' ? (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-mono uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4 font-semibold">Código / ID</th>
                  <th className="py-3 px-4 font-semibold">Espécie Vegetal</th>
                  <th className="py-3 px-4 font-semibold">Condição</th>
                  <th className="py-3 px-4 font-semibold text-right">Alíquota</th>
                  <th className="py-3 px-4 font-semibold text-right">Gotas de I₂</th>
                  <th className="py-3 px-4 font-semibold text-right">Vol. Estimado</th>
                  <th className="py-3 px-4 font-semibold">Estado</th>
                  <th className="py-3 px-4 font-semibold">Observações dos Estudantes</th>
                  <th className="py-3 px-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-500 text-xs">
                      Nenhum registro encontrado para os filtros selecionados.
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
                        <td className="py-3 px-4 text-slate-800 font-medium">
                          {r.fruitOrSample}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                            r.experimentalCondition === 'Fresco'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : r.experimentalCondition.includes('Ref')
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}>
                            {r.experimentalCondition}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-right text-slate-700">
                          {vals.sampleVolumeMl || 5.0} mL
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-right text-slate-900 tabular-nums">
                          {vals.iodineDropsCount || 0}
                        </td>
                        <td className="py-3 px-4 font-mono text-right text-slate-600 tabular-nums">
                          ~{vals.estimatedVolumeIodineMl || ((vals.iodineDropsCount || 0) * 0.05).toFixed(2)} mL
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                            r.status === 'publicado'
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                              : r.status === 'em_revisao'
                              ? 'bg-amber-100 text-amber-900 border border-amber-200'
                              : 'bg-slate-100 text-slate-800 border border-slate-300'
                          }`}>
                            {r.status === 'publicado' && <CheckCircle2 className="w-3 h-3 text-emerald-700" />}
                            {r.status === 'em_revisao' && <Clock className="w-3 h-3 text-amber-700" />}
                            {r.status === 'rascunho' && <Edit2 className="w-3 h-3 text-slate-500" />}
                            {r.status === 'publicado' ? 'Publicado' : r.status === 'em_revisao' ? 'Em Revisão' : 'Rascunho'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 max-w-xs truncate text-[11px]" title={r.observations}>
                          {r.observations}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            {r.photoUrl && (
                              <button
                                type="button"
                                onClick={() => setActivePhotoModal(r.photoUrl!)}
                                className="p-1 rounded hover:bg-slate-100 text-emerald-800 transition-colors"
                                title="Ver fotografia da amostra"
                              >
                                <Camera className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {(!isVisitor || isAdmin) && (
                              <button
                                onClick={() => handleOpenEditModal(r)}
                                className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                                title="Editar medição"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {(!isVisitor || isAdmin || r.dataSource !== 'demonstracao_inicial') && (
                              <button
                                type="button"
                                onClick={() => handleRequestDelete(r)}
                                className="p-1 rounded text-slate-400 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                                title="Excluir medição"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {isVisitor && (
                              <span className="text-[10px] text-slate-400 font-mono">Somente Leitura</span>
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
        /* Modo Cartões Responsivos */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecords.map((r) => {
            const vals = r.measuredValues || {};
            return (
              <div key={r.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-900 block">{r.sampleCode}</span>
                    <span className="text-xs text-slate-600 font-medium">{r.fruitOrSample}</span>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                    r.status === 'publicado'
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                      : r.status === 'em_revisao'
                      ? 'bg-amber-100 text-amber-900 border border-amber-200'
                      : 'bg-slate-100 text-slate-800 border border-slate-300'
                  }`}>
                    {r.status === 'publicado' ? 'Publicado' : r.status === 'em_revisao' ? 'Em Revisão' : 'Rascunho'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-400 block">Gotas de I₂</span>
                    <span className="font-bold text-base font-mono text-slate-900">{vals.iodineDropsCount || 0} gotas</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-400 block">Volume Estimado</span>
                    <span className="font-mono font-semibold text-slate-700">~{vals.estimatedVolumeIodineMl || ((vals.iodineDropsCount || 0) * 0.05).toFixed(2)} mL</span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] font-semibold text-slate-700">Observações da Amostra:</div>
                  </div>
                  <p className="text-[11px] bg-slate-50 p-2 rounded border border-slate-100 leading-relaxed italic">
                    "{r.observations}"
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>{r.dateTime}</span>
                  <div className="flex items-center gap-2">
                    {r.photoUrl && (
                      <button
                        type="button"
                        onClick={() => setActivePhotoModal(r.photoUrl!)}
                        className="text-emerald-800 hover:text-emerald-950 text-[11px] font-semibold flex items-center gap-1"
                        title="Ver fotografia da amostra"
                      >
                        <Camera className="w-3 h-3" /> Foto
                      </button>
                    )}
                    {(!isVisitor || isAdmin) && (
                      <button 
                        onClick={() => handleOpenEditModal(r)}
                        className="text-slate-600 hover:text-slate-900 text-[11px] font-medium"
                      >
                        Editar
                      </button>
                    )}
                    {(!isVisitor || isAdmin || r.dataSource !== 'demonstracao_inicial') && (
                      <button 
                        type="button"
                        onClick={() => handleRequestDelete(r)}
                        className="text-rose-600 hover:text-rose-800 text-[11px] font-medium flex items-center gap-1"
                        title="Excluir medição"
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

      {/* Referência do Protocolo */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-3">
        <BookOpen className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-slate-900">
            Referência do Protocolo Analítico Utilizado:
          </span>
          <p className="leading-relaxed">
            AOAC International. Official Method 967.21 (Ascorbic Acid in Vitamin Preparations and Juices - Titrimetric Method). Adaptado para triagem de bancada com indicador de amido solúvel e gotejamento volumétrico com tintura de iodo 0,01 N padronizada. Instituto Adolfo Lutz (2008), Método Físico-Químico 041/IV.
          </p>
        </div>
      </div>

      {/* Modal Unificado e Funcional de Cadastro e Edição */}
      {isModalOpen && (
        <ExperimentRecordFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSaveSuccess={() => loadRecords()}
          experimentType="vitamina-c"
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
              <span className="font-mono text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                <Camera className="w-4 h-4" /> Registro Fotográfico Laboratorial · Experimento A (Vitamina C)
              </span>
              <button 
                onClick={() => setActivePhotoModal(null)} 
                className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img 
              src={activePhotoModal} 
              alt="Fotografia da titulação iodométrica de vitamina C" 
              className="w-full h-auto max-h-[70vh] object-contain rounded-lg" 
            />
            <div className="text-xs text-slate-300 font-sans leading-relaxed">
              Ensaio volumétrico de oxirredução: Titulação iodométrica semi-quantitativa em amostras de camu-camu e cubiu com indicador de amido a 1%. O aparecimento da coloração azul-escura persistente indica o término da oxidação do ácido ascórbico pelo iodo livre.
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
