import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { UnifiedExperimentRecord, ExperimentType } from '../types';
import { experimentStorageService } from '../services/experimentStorageService';
import { 
  FlaskConical, 
  Eye, 
  Sparkles, 
  Filter, 
  Calendar, 
  Download, 
  Search, 
  RotateCcw, 
  Table as TableIcon, 
  BarChart3, 
  Info, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  ExternalLink, 
  ShieldCheck, 
  FileText, 
  X, 
  Clock, 
  ArrowUpDown, 
  Camera,
  Database,
  RefreshCw,
  HelpCircle
} from 'lucide-react';

// Mapeamento normalizado de frutos para exibição e filtragem
const KNOWN_FRUITS = [
  { id: 'camu-camu', label: 'Camu-camu (Myrciaria dubia)', searchKeys: ['camu', 'myrciaria'] },
  { id: 'acai', label: 'Açaí (Euterpe precatoria)', searchKeys: ['açaí', 'acai', 'euterpe'] },
  { id: 'tucuma', label: 'Tucumã (Astrocaryum aculeatum)', searchKeys: ['tucumã', 'tucuma', 'astrocaryum'] },
  { id: 'buriti', label: 'Buriti (Mauritia flexuosa)', searchKeys: ['buriti', 'mauritia'] },
  { id: 'cubiu', label: 'Cubiu (Solanum sessiliflorum)', searchKeys: ['cubiu', 'sessiliflorum'] },
  { id: 'cupuacu', label: 'Cupuaçu (Theobroma grandiflorum)', searchKeys: ['cupuaçu', 'cupuacu', 'theobroma'] },
  { id: 'maca', label: 'Maçã (Malus domestica - Amostra Controle)', searchKeys: ['maçã', 'maca', 'malus', 'controle'] },
];

export const StabilityPage: React.FC = () => {
  // Estado dos registros publicados carregados do repositório
  const [publishedRecords, setPublishedRecords] = useState<UnifiedExperimentRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [syncInfo, setSyncInfo] = useState<{ isRemote: boolean; totalRecords: number; databaseId: string }>({
    isRemote: false,
    totalRecords: 0,
    databaseId: ''
  });

  // Filtros de Pesquisa
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [fruitFilter, setFruitFilter] = useState<string>('all');
  const [experimentTypeFilter, setExperimentTypeFilter] = useState<string>('all');
  const [conditionFilter, setConditionFilter] = useState<string>('all');
  const [elapsedTimeFilter, setElapsedTimeFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Controle de Visualização e Modal
  const [viewTab, setViewTab] = useState<'both' | 'table' | 'charts'>('both');
  const [sortField, setSortField] = useState<'date' | 'fruit' | 'condition' | 'experiment'>('date');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<UnifiedExperimentRecord | null>(null);

  // Carregar registros publicados oficiais do serviço
  const loadPublishedData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      // Filtrar estritamente registros autorizados para publicação ('publicado')
      const data = await experimentStorageService.list(undefined, 'publicado');
      setPublishedRecords(data);
      const status = experimentStorageService.getSyncStatus();
      setSyncInfo({
        isRemote: status.isRemote,
        totalRecords: status.totalRecords,
        databaseId: status.databaseId
      });
    } catch (err: any) {
      console.error('Erro ao carregar registros de estabilidade:', err);
      setLoadError('Não foi possível sincronizar os registros científicos no momento. Exibindo dados locais seguros.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Inicialização e inscrição em tempo real no repositório de dados
  useEffect(() => {
    loadPublishedData();

    // Ouvinte em tempo real: quando novos registros forem publicados no sistema, a página atualiza automaticamente
    const unsubscribe = experimentStorageService.subscribe(() => {
      loadPublishedData();
    });

    return () => {
      unsubscribe();
    };
  }, [loadPublishedData]);

  // Lista dinâmica de condições experimentais presentes nos dados cadastrados
  const availableConditions = useMemo(() => {
    const set = new Set<string>();
    publishedRecords.forEach(r => {
      if (r.experimentalCondition && r.experimentalCondition.trim()) {
        set.add(r.experimentalCondition.trim());
      }
    });
    return Array.from(set).sort();
  }, [publishedRecords]);

  // Lista dinâmica de tempos decorridos disponíveis nos dados cadastrados (Exp B)
  const availableElapsedTimes = useMemo(() => {
    const set = new Set<number>();
    publishedRecords.forEach(r => {
      if (r.measuredValues?.elapsedMinutes !== undefined && !isNaN(r.measuredValues.elapsedMinutes)) {
        set.add(Number(r.measuredValues.elapsedMinutes));
      }
    });
    return Array.from(set).sort((a, b) => a - b);
  }, [publishedRecords]);

  // Aplicação combinada de todos os filtros
  const filteredRecords = useMemo(() => {
    return publishedRecords.filter(record => {
      // 1. Apenas registros estritamente autorizados para publicação
      if (record.status !== 'publicado') return false;

      // 2. Busca textual geral (código da amostra, fruto, responsável, observação)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchCode = record.sampleCode.toLowerCase().includes(query);
        const matchFruit = record.fruitOrSample.toLowerCase().includes(query);
        const matchCond = record.experimentalCondition.toLowerCase().includes(query);
        const matchResp = (record.responsibleName || '').toLowerCase().includes(query);
        const matchObs = (record.observations || '').toLowerCase().includes(query);
        if (!matchCode && !matchFruit && !matchCond && !matchResp && !matchObs) {
          return false;
        }
      }

      // 3. Filtro por Fruto
      if (fruitFilter !== 'all') {
        const fruitConfig = KNOWN_FRUITS.find(f => f.id === fruitFilter);
        if (fruitConfig) {
          const sampleLower = record.fruitOrSample.toLowerCase();
          const conditionLower = record.experimentalCondition.toLowerCase();
          const matchesKey = fruitConfig.searchKeys.some(k => sampleLower.includes(k) || conditionLower.includes(k));
          if (!matchesKey) return false;
        }
      }

      // 4. Filtro por Tipo de Experimento
      if (experimentTypeFilter !== 'all') {
        if (record.experimentType !== experimentTypeFilter) return false;
      }

      // 5. Filtro por Condição Experimental
      if (conditionFilter !== 'all') {
        if (record.experimentalCondition !== conditionFilter) return false;
      }

      // 6. Filtro por Duração / Tempo Decorrido (quando aplicável)
      if (elapsedTimeFilter !== 'all') {
        const targetMinutes = Number(elapsedTimeFilter);
        if (record.measuredValues?.elapsedMinutes !== targetMinutes) return false;
      }

      // 7. Filtro por Período de Observação (Datas Início e Fim)
      if (startDate || endDate) {
        let recordDate: Date | null = null;
        if (record.dateTime.includes('/')) {
          const parts = record.dateTime.split(' ')[0].split('/');
          if (parts.length === 3) {
            recordDate = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
          }
        } else {
          recordDate = new Date(record.dateTime);
        }

        if (recordDate && !isNaN(recordDate.getTime())) {
          if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            if (recordDate < start) return false;
          }
          if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            if (recordDate > end) return false;
          }
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortField === 'date') {
        const dateA = new Date(a.createdAt || a.dateTime).getTime();
        const dateB = new Date(b.createdAt || b.dateTime).getTime();
        return sortAsc ? dateA - dateB : dateB - dateA;
      }
      if (sortField === 'fruit') {
        return sortAsc ? a.fruitOrSample.localeCompare(b.fruitOrSample) : b.fruitOrSample.localeCompare(a.fruitOrSample);
      }
      if (sortField === 'condition') {
        return sortAsc ? a.experimentalCondition.localeCompare(b.experimentalCondition) : b.experimentalCondition.localeCompare(a.experimentalCondition);
      }
      if (sortField === 'experiment') {
        return sortAsc ? a.experimentType.localeCompare(b.experimentType) : b.experimentType.localeCompare(a.experimentType);
      }
      return 0;
    });
  }, [
    publishedRecords,
    searchQuery,
    fruitFilter,
    experimentTypeFilter,
    conditionFilter,
    elapsedTimeFilter,
    startDate,
    endDate,
    sortField,
    sortAsc
  ]);

  // Função para limpar todos os filtros aplicados
  const handleResetFilters = () => {
    setSearchQuery('');
    setFruitFilter('all');
    setExperimentTypeFilter('all');
    setConditionFilter('all');
    setElapsedTimeFilter('all');
    setStartDate('');
    setEndDate('');
  };

  const hasActiveFilters = searchQuery !== '' || 
    fruitFilter !== 'all' || 
    experimentTypeFilter !== 'all' || 
    conditionFilter !== 'all' || 
    elapsedTimeFilter !== 'all' || 
    startDate !== '' || 
    endDate !== '';

  // Helpers de Formatação e Rastreabilidade Científica
  const formatTargetCompound = (type: ExperimentType) => {
    switch (type) {
      case 'vitamina-c':
        return 'Ácido L-Ascórbico (Vitamina C / Poder Redutor)';
      case 'oxidacao-enzimatica':
        return 'Polifenoloxidase (PPO / Grau de Escurecimento)';
      case 'ph-antocianinas':
        return 'Cianidina-3-glicosídeo / Equilíbrio Tautomérico';
      default:
        return 'Composto Antioxidante Não Especificado';
    }
  };

  const formatExperimentTypeName = (type: ExperimentType) => {
    switch (type) {
      case 'vitamina-c':
        return 'Estabilidade da Vitamina C';
      case 'oxidacao-enzimatica':
        return 'Oxidação Enzimática';
      case 'ph-antocianinas':
        return 'Influência do pH nas Antocianinas';
      default:
        return type;
    }
  };

  const formatObservationPeriod = (record: UnifiedExperimentRecord) => {
    const vals = record.measuredValues || {};
    if (record.experimentType === 'oxidacao-enzimatica' && vals.elapsedMinutes !== undefined) {
      return (
        <span className="font-mono text-xs">
          t = {vals.elapsedMinutes} min{' '}
          <span className="text-slate-400">({vals.initialTime || '08:30'} → {vals.observationTime || '—'})</span>
        </span>
      );
    }
    if (record.experimentType === 'vitamina-c') {
      if (record.experimentalCondition.includes('Refrigerado')) return '48 horas a 4°C';
      if (record.experimentalCondition.includes('Fervido')) return '10 min em ebulição (~98°C)';
      return 'Imediato (Basal 0h)';
    }
    if (record.experimentType === 'ph-antocianinas') {
      return 'Imediato (Equilíbrio Tamponado)';
    }
    return record.dateTime || 'Não informado';
  };

  const formatRegisteredValue = (record: UnifiedExperimentRecord) => {
    const vals = record.measuredValues || {};
    if (record.experimentType === 'vitamina-c') {
      if (vals.iodineDropsCount !== undefined) {
        return (
          <div className="flex items-center gap-1.5 font-mono">
            <span className="font-bold text-emerald-950 text-sm tabular-nums">
              {vals.iodineDropsCount}
            </span>
            <span className="text-xs text-slate-500">gotas</span>
            {vals.triplicateIndex && (
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                T{vals.triplicateIndex}
              </span>
            )}
          </div>
        );
      }
      return <span className="text-slate-400 italic">Não informado</span>;
    }

    if (record.experimentType === 'oxidacao-enzimatica') {
      if (vals.browningScore !== undefined) {
        const score = vals.browningScore;
        const colorBadge = 
          score === 0 ? 'bg-emerald-50 text-emerald-900 border-emerald-200' :
          score === 1 ? 'bg-amber-50 text-amber-900 border-amber-200' :
          score === 2 ? 'bg-amber-100 text-amber-950 border-amber-300' :
          score === 3 ? 'bg-orange-100 text-orange-950 border-orange-300' :
          'bg-stone-200 text-stone-900 border-stone-300';

        const label = 
          score === 0 ? 'Nulo' :
          score === 1 ? 'Leve' :
          score === 2 ? 'Moderado' :
          score === 3 ? 'Acentuado' : 'Severo';

        return (
          <div className="flex items-center gap-1.5">
            <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold border ${colorBadge}`}>
              Grau {score} / 4
            </span>
            <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">({label})</span>
          </div>
        );
      }
      return <span className="text-slate-400 italic">Não informado</span>;
    }

    if (record.experimentType === 'ph-antocianinas') {
      return (
        <div className="flex items-center gap-2">
          {vals.measuredPH !== undefined && (
            <span className="font-mono font-bold text-purple-950 text-xs px-2 py-0.5 rounded bg-purple-50 border border-purple-200">
              pH {Number(vals.measuredPH).toFixed(1)}
            </span>
          )}
          {vals.colorHex && (
            <div className="flex items-center gap-1">
              <span 
                className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0 shadow-xs" 
                style={{ backgroundColor: vals.colorHex }}
                title={`Cor observada: ${vals.observedColor || vals.colorHex}`}
              />
              <span className="font-mono text-[10px] text-slate-500 hidden md:inline">
                {vals.colorHex}
              </span>
            </div>
          )}
        </div>
      );
    }

    return <span className="text-slate-400 italic">Não se aplica</span>;
  };

  const formatUnitOfMeasure = (record: UnifiedExperimentRecord) => {
    if (record.experimentType === 'vitamina-c') {
      return (
        <span className="text-xs font-mono text-slate-600">
          Gotas de I₂ / 5,0 mL
          <span className="block text-[10px] text-slate-400">(~0,05 mL por gota)</span>
        </span>
      );
    }
    if (record.experimentType === 'oxidacao-enzimatica') {
      return (
        <span className="text-xs font-mono text-slate-600">
          Escala 0 a 4
          <span className="block text-[10px] text-slate-400">(PPO / Densitometria)</span>
        </span>
      );
    }
    if (record.experimentType === 'ph-antocianinas') {
      return (
        <span className="text-xs font-mono text-slate-600">
          Escala de pH (0 a 14)
          <span className="block text-[10px] text-slate-400">&amp; Código Hexadecimal</span>
        </span>
      );
    }
    return record.units || <span className="text-slate-400">Não informado</span>;
  };

  const formatProtocolReference = (record: UnifiedExperimentRecord) => {
    if (record.experimentType === 'vitamina-c') {
      return {
        protocol: 'AOAC 967.21 modificado / Adolfo Lutz (2008)',
        citation: 'Titulação iodométrica semi-quantitativa em meio acidificado com indicador de amido solúvel.'
      };
    }
    if (record.experimentType === 'oxidacao-enzimatica') {
      return {
        protocol: 'Protocolo BioAmazônia PPO-02 / Fujita et al. (2013)',
        citation: 'Inibição por oclusão lipofílica de oxigênio atmosférico e sequestro de radicais por carotenoides.'
      };
    }
    if (record.experimentType === 'ph-antocianinas') {
      return {
        protocol: 'Giusti & Wrolstad (2001) / Farmacopeia Brasileira',
        citation: 'Equilíbrio ácido-base tautomérico de antocianinas em gradiente contínuo de pH.'
      };
    }
    return {
      protocol: 'Procedimento Operacional Padrão BioAmazônia',
      citation: 'Protocolo validado pelo comitê acadêmico.'
    };
  };

  // Exportação dos dados filtrados para CSV
  const handleExportCSV = () => {
    if (filteredRecords.length === 0) return;

    const headers = [
      'ID_Registro',
      'Codigo_Amostra',
      'Fruto_Amostra',
      'Composto_Alvo',
      'Tipo_Experimento',
      'Condicao_Experimental',
      'Periodo_Observacao',
      'Valor_Registrado',
      'Unidade_Medida',
      'Metodo_Utilizado',
      'Data_Registro',
      'Origem_Dados',
      'Protocolo_Referencia',
      'Status_Publicacao',
      'Observacoes_Bancada',
      'Interpretacao_Cientifica',
      'Responsavel'
    ];

    const rows = filteredRecords.map(r => {
      const vals = r.measuredValues || {};
      let valStr = '';
      if (r.experimentType === 'vitamina-c') valStr = `${vals.iodineDropsCount || ''} gotas`;
      else if (r.experimentType === 'oxidacao-enzimatica') valStr = `Grau ${vals.browningScore ?? ''}`;
      else if (r.experimentType === 'ph-antocianinas') valStr = `pH ${vals.measuredPH ?? ''} (${vals.observedColor || ''})`;

      const proto = formatProtocolReference(r);
      const origin = r.dataSource === 'cientifico_real' 
        ? 'Dado Experimental Próprio (BioAmazônia)' 
        : 'Demonstração Científica / Calibração Inicial';

      return [
        `"${r.id}"`,
        `"${r.sampleCode}"`,
        `"${r.fruitOrSample}"`,
        `"${formatTargetCompound(r.experimentType)}"`,
        `"${formatExperimentTypeName(r.experimentType)}"`,
        `"${r.experimentalCondition}"`,
        `"${r.dateTime}"`,
        `"${valStr}"`,
        `"${r.units}"`,
        `"${r.methodUsed}"`,
        `"${r.dateTime}"`,
        `"${origin}"`,
        `"${proto.protocol}"`,
        `"${r.status}"`,
        `"${(r.observations || '').replace(/"/g, '""')}"`,
        `"${(r.scientificInterpretation || '').replace(/"/g, '""')}"`,
        `"${r.responsibleName || ''}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bioamazonia_estabilidade_publicada_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Cálculo de Métricas e Gráficos a partir EXCLUSIVAMENTE dos dados filtrados
  const chartAnalytics = useMemo(() => {
    // 1. Experimento A (Vitamina C) - Médias Reais por fruto e condição
    const vitCRecords = filteredRecords.filter(r => r.experimentType === 'vitamina-c');
    
    const calcVitCAvg = (fruitKeyword: string, conditionName: string) => {
      const subset = vitCRecords.filter(r => 
        r.fruitOrSample.toLowerCase().includes(fruitKeyword.toLowerCase()) && 
        r.experimentalCondition === conditionName
      );
      if (subset.length === 0) return null;
      const drops = subset.map(s => Number(s.measuredValues?.iodineDropsCount || 0));
      const sum = drops.reduce((acc, curr) => acc + curr, 0);
      const avg = Math.round((sum / subset.length) * 10) / 10;
      const min = Math.min(...drops);
      const max = Math.max(...drops);
      return { n: subset.length, avg, min, max };
    };

    const camuFresh = calcVitCAvg('camu', 'Fresco');
    const camuRef = calcVitCAvg('camu', 'Refrigerado (48h)');
    const camuBoil = calcVitCAvg('camu', 'Fervido');

    const cubiuFresh = calcVitCAvg('cubiu', 'Fresco');
    const cubiuRef = calcVitCAvg('cubiu', 'Refrigerado (48h)');
    const cubiuBoil = calcVitCAvg('cubiu', 'Fervido');

    // 2. Experimento B (Oxidação Enzimática) - Médias Reais por tempo e tratamento
    const enzRecords = filteredRecords.filter(r => r.experimentType === 'oxidacao-enzimatica');
    const distinctTimes = Array.from(new Set(enzRecords.map(r => Number(r.measuredValues?.elapsedMinutes || 0)))).sort((a, b) => a - b);
    
    const kineticSeries = distinctTimes.map(time => {
      const getScoreForCondition = (condKeyword: string) => {
        const matches = enzRecords.filter(r => 
          r.experimentalCondition.toLowerCase().includes(condKeyword.toLowerCase()) && 
          Number(r.measuredValues?.elapsedMinutes || 0) === time
        );
        if (matches.length === 0) return null;
        const sum = matches.reduce((acc, curr) => acc + Number(curr.measuredValues?.browningScore || 0), 0);
        return Math.round((sum / matches.length) * 10) / 10;
      };

      return {
        time,
        control: getScoreForCondition('controle'),
        buriti: getScoreForCondition('buriti'),
        tucuma: getScoreForCondition('tucumã')
      };
    });

    // 3. Experimento C (pH Antocianinas) - Amostras ordenadas pelo pH
    const phRecords = filteredRecords
      .filter(r => r.experimentType === 'ph-antocianinas' && r.measuredValues?.measuredPH !== undefined)
      .sort((a, b) => Number(a.measuredValues.measuredPH) - Number(b.measuredValues.measuredPH));

    return {
      vitC: {
        totalSamples: vitCRecords.length,
        camu: { fresh: camuFresh, ref: camuRef, boil: camuBoil },
        cubiu: { fresh: cubiuFresh, ref: cubiuRef, boil: cubiuBoil }
      },
      enz: {
        totalSamples: enzRecords.length,
        distinctTimes,
        series: kineticSeries
      },
      ph: {
        totalSamples: phRecords.length,
        records: phRecords
      }
    };
  }, [filteredRecords]);

  // Contadores para cards de resumo
  const summaryMetrics = useMemo(() => {
    const totalPublished = publishedRecords.length;
    const fruitsCount = new Set(publishedRecords.map(r => r.fruitOrSample.split('(')[0].trim())).size;
    const experimentsCount = new Set(publishedRecords.map(r => r.experimentType)).size;
    const conditionsCount = new Set(publishedRecords.map(r => r.experimentalCondition)).size;

    return {
      totalPublished,
      fruitsCount,
      experimentsCount,
      conditionsCount
    };
  }, [publishedRecords]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 1. Cabeçalho Geral da Página de Estabilidade Científica */}
      <div className="border-b border-slate-200 pb-6 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-mono font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" /> Resultados Científicos Oficiais Publicados
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1.5">
              Tabela de Estabilidade Nutricional &amp; Cinética de Degradação
            </h1>
            <p className="text-xs font-serif italic text-emerald-950 mt-1">
              "Bioquímica da Longevidade: Análise da Estabilidade de Compostos Antioxidantes em Frutos Amazônicos e sua Relação com a Promoção da Saúde Celular"
            </p>
          </div>

          {/* Badge de Sincronização do Firestore */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white shadow-2xs text-xs font-mono text-slate-700">
              <Database className="w-3.5 h-3.5 text-emerald-700" />
              <span>Firestore Cloud Sincronizado</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <button
              onClick={loadPublishedData}
              disabled={isLoading}
              className="p-1.5 text-slate-500 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              title="Atualizar dados do servidor"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-700' : ''}`} />
            </button>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 max-w-4xl leading-relaxed">
          Consulta pública e rastreável aos dados experimentais dos três ensaios de bancada do projeto BioAmazônia: 
          estabilidade térmica e sob refrigeração do ácido ascórbico em camu-camu e cubiu; 
          cinética de inibição do escurecimento enzimático por polpa de buriti e tucumã em fatias de maçã; 
          e transição espectral ácido-base de antocianinas do açaí sob diferentes valores de pH.
        </p>

        {/* Alerta de Transparência Metodológica */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
          <div className="leading-relaxed text-[11px] sm:text-xs">
            <strong className="text-slate-900 font-semibold">Política de Transparência e Rigor Científico:</strong> Apenas registros com estado <span className="font-mono bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded font-bold">publicado</span> são apresentados nesta tabela. Rascunhos e ensaios em calibração permanecem isolados na bancada de pesquisa. Não realizamos conversões matemáticas hipotéticas sem calibração instrumental direta.
          </div>
        </div>
      </div>

      {/* 2. Cards de Métricas e Resumo Científico */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs">
        
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-mono uppercase tracking-wider">Registros Publicados</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {summaryMetrics.totalPublished}
          </div>
          <span className="text-[10px] text-slate-500 block">
            Dados autorizados para divulgação científica
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-mono uppercase tracking-wider">Matrizes Vegetais</span>
            <Layers className="w-4 h-4 text-emerald-800" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {summaryMetrics.fruitsCount}
          </div>
          <span className="text-[10px] text-slate-500 block">
            Camu-camu, Cubiu, Buriti, Tucumã, Açaí e Maçã
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-mono uppercase tracking-wider">Módulos Experimentais</span>
            <FlaskConical className="w-4 h-4 text-amber-700" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {summaryMetrics.experimentsCount}
          </div>
          <span className="text-[10px] text-slate-500 block">
            Exp. A (Vit. C), Exp. B (PPO) e Exp. C (pH)
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-mono uppercase tracking-wider">Condições Testadas</span>
            <Clock className="w-4 h-4 text-purple-700" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {summaryMetrics.conditionsCount}
          </div>
          <span className="text-[10px] text-slate-500 block">
            Temperaturas, tempos cinéticos e meios tamponados
          </span>
        </div>

      </div>

      {/* 3. Painel de Filtros Integrados e Pesquisa Avançada */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-800" />
            <h2 className="text-sm font-bold text-slate-900 tracking-tight uppercase font-mono">
              Filtros de Pesquisa Científica
            </h2>
            <span className="text-xs font-mono text-emerald-950 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              {filteredRecords.length} resultado{filteredRecords.length !== 1 ? 's' : ''}
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

            <button
              onClick={handleExportCSV}
              disabled={filteredRecords.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors font-medium disabled:opacity-50"
              title="Exportar planilha de auditoria em CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              Exportar CSV
            </button>
          </div>
        </div>

        {/* Grade de Controles de Filtros Obrigatórios */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          
          {/* Busca Textual */}
          <div className="space-y-1.5">
            <label className="text-slate-600 font-medium flex items-center gap-1">
              <Search className="w-3.5 h-3.5 text-slate-400" /> Busca por Código / Palavra-chave:
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ex: CAMU-FRESH, MACA, pH 1.4..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-slate-800"
            />
          </div>

          {/* Filtro por Fruto (incluindo Maçã) */}
          <div className="space-y-1.5">
            <label className="text-slate-600 font-medium">
              Fruto ou Matriz Analisada:
            </label>
            <select
              value={fruitFilter}
              onChange={(e) => setFruitFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-slate-800 font-medium"
            >
              <option value="all">Todos os Frutos e Amostras</option>
              {KNOWN_FRUITS.map(f => (
                <option key={f.id} value={f.id}>{f.label}</option>
              ))}
            </select>
          </div>

          {/* Filtro por Tipo de Experimento */}
          <div className="space-y-1.5">
            <label className="text-slate-600 font-medium">
              Tipo de Experimento:
            </label>
            <select
              value={experimentTypeFilter}
              onChange={(e) => setExperimentTypeFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-slate-800 font-medium"
            >
              <option value="all">Todos os Três Experimentos</option>
              <option value="vitamina-c">Exp. A — Estabilidade da Vitamina C</option>
              <option value="oxidacao-enzimatica">Exp. B — Oxidação Enzimática</option>
              <option value="ph-antocianinas">Exp. C — Influência do pH nas Antocianinas</option>
            </select>
          </div>

          {/* Filtro por Condição Experimental (Dinâmico) */}
          <div className="space-y-1.5">
            <label className="text-slate-600 font-medium">
              Condição de Conservação / Experimental:
            </label>
            <select
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-slate-800 font-medium"
            >
              <option value="all">Todas as Condições Cadastradas</option>
              {availableConditions.map(cond => (
                <option key={cond} value={cond}>{cond}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Linha Secundária: Intervalo de Datas e Tempo Decorrido */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-slate-100 text-xs">
          
          {/* Data Inicial */}
          <div className="space-y-1.5">
            <label className="text-slate-600 font-medium flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Período: Data Inicial
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-slate-800"
            />
          </div>

          {/* Data Final */}
          <div className="space-y-1.5">
            <label className="text-slate-600 font-medium flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Período: Data Final
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-slate-800"
            />
          </div>

          {/* Duração / Tempo Decorrido do Experimento (quando registrado) */}
          <div className="space-y-1.5">
            <label className="text-slate-600 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" /> Tempo Decorrido (Cinética):
            </label>
            <select
              value={elapsedTimeFilter}
              onChange={(e) => setElapsedTimeFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-slate-800"
            >
              <option value="all">Todos os Intervalos de Duração</option>
              {availableElapsedTimes.map(time => (
                <option key={time} value={String(time)}>
                  {time === 0 ? 't = 0 min (Basal)' : `t = ${time} minutos decorridos`}
                </option>
              ))}
            </select>
          </div>

          {/* Ordenação */}
          <div className="space-y-1.5">
            <label className="text-slate-600 font-medium flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" /> Ordenar Resultados:
            </label>
            <div className="flex items-center gap-1">
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as any)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-slate-800 font-medium"
              >
                <option value="date">Data de Registro</option>
                <option value="fruit">Nome do Fruto</option>
                <option value="condition">Condição Experimental</option>
                <option value="experiment">Tipo de Experimento</option>
              </select>
              <button
                type="button"
                onClick={() => setSortAsc(!sortAsc)}
                className="p-1.5 text-xs border border-slate-300 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700"
                title={sortAsc ? 'Ordem Crescente' : 'Ordem Decrescente'}
              >
                {sortAsc ? '▲' : '▼'}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* 4. Alternador de Visualização (Tabela de Resultados | Gráficos Analíticos | Ambos) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start">
          <button
            onClick={() => setViewTab('both')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              viewTab === 'both' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Visualização Integrada
          </button>
          <button
            onClick={() => setViewTab('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              viewTab === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            Tabela Dinâmica ({filteredRecords.length})
          </button>
          <button
            onClick={() => setViewTab('charts')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              viewTab === 'charts' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Gráficos &amp; Cinética
          </button>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Exibindo <span className="font-bold text-slate-900">{filteredRecords.length}</span> de{' '}
          <span className="font-bold text-slate-900">{publishedRecords.length}</span> registros científicos publicados
        </div>
      </div>

      {/* 5. Gráficos Analíticos Dinâmicos (Gerados a partir dos dados efetivamente filtrados) */}
      {(viewTab === 'both' || viewTab === 'charts') && filteredRecords.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-800" />
              Gráficos Comparativos dos Dados Filtrados
            </h2>
            <span className="text-[11px] text-slate-500 font-mono">
              Atualizados automaticamente conforme filtros ativos
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Gráfico Exp A: Vitamina C (Camu-camu e Cubiu) */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase block">
                    Experimento A · Titulação Iodométrica
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Gotas de Titulante I₂ Consumidas por Condição
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  n = {chartAnalytics.vitC.totalSamples} amostras
                </span>
              </div>

              {chartAnalytics.vitC.totalSamples === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  Nenhuma observação de vitamina C disponível nos filtros atuais.
                </div>
              ) : (
                <div className="space-y-4 text-xs">
                  {/* Camu-camu */}
                  <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2.5">
                    <div className="flex justify-between items-center font-bold text-slate-900">
                      <span>Camu-camu (<span className="italic font-serif">Myrciaria dubia</span>)</span>
                      <span className="text-[10px] font-mono text-emerald-900 bg-emerald-100 px-1.5 py-0.5 rounded">
                        Teor Hiperconcentrado
                      </span>
                    </div>

                    <div className="space-y-2 font-mono text-[11px]">
                      <div>
                        <div className="flex justify-between text-slate-700 mb-0.5">
                          <span>Fresco (Basal 100%):</span>
                          <span className="font-bold text-slate-900">
                            {chartAnalytics.vitC.camu.fresh ? `${chartAnalytics.vitC.camu.fresh.avg} gotas (n=${chartAnalytics.vitC.camu.fresh.n})` : 'Sem registros'}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-600 h-full rounded-full" style={{ width: chartAnalytics.vitC.camu.fresh ? '100%' : '0%' }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-slate-700 mb-0.5">
                          <span>Refrigerado (48h a 4°C):</span>
                          <span className="font-bold text-blue-900">
                            {chartAnalytics.vitC.camu.ref ? `${chartAnalytics.vitC.camu.ref.avg} gotas (n=${chartAnalytics.vitC.camu.ref.n})` : 'Sem registros'}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-blue-600 h-full rounded-full" 
                            style={{ 
                              width: chartAnalytics.vitC.camu.fresh && chartAnalytics.vitC.camu.ref 
                                ? `${Math.min(100, (chartAnalytics.vitC.camu.ref.avg / chartAnalytics.vitC.camu.fresh.avg) * 100)}%` 
                                : '0%' 
                            }} 
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-slate-700 mb-0.5">
                          <span>Fervido (10 min ~98°C):</span>
                          <span className="font-bold text-rose-900">
                            {chartAnalytics.vitC.camu.boil ? `${chartAnalytics.vitC.camu.boil.avg} gotas (n=${chartAnalytics.vitC.camu.boil.n})` : 'Sem registros'}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-rose-600 h-full rounded-full" 
                            style={{ 
                              width: chartAnalytics.vitC.camu.fresh && chartAnalytics.vitC.camu.boil 
                                ? `${Math.min(100, (chartAnalytics.vitC.camu.boil.avg / chartAnalytics.vitC.camu.fresh.avg) * 100)}%` 
                                : '0%' 
                            }} 
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cubiu */}
                  <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2.5">
                    <div className="flex justify-between items-center font-bold text-slate-900">
                      <span>Cubiu (<span className="italic font-serif">Solanum sessiliflorum</span>)</span>
                      <span className="text-[10px] font-mono text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded">
                        Teor Nutricional Moderado
                      </span>
                    </div>

                    <div className="space-y-2 font-mono text-[11px]">
                      <div>
                        <div className="flex justify-between text-slate-700 mb-0.5">
                          <span>Fresco (Basal 100%):</span>
                          <span className="font-bold text-slate-900">
                            {chartAnalytics.vitC.cubiu.fresh ? `${chartAnalytics.vitC.cubiu.fresh.avg} gotas (n=${chartAnalytics.vitC.cubiu.fresh.n})` : 'Sem registros'}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-600 h-full rounded-full" style={{ width: chartAnalytics.vitC.cubiu.fresh ? '100%' : '0%' }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-slate-700 mb-0.5">
                          <span>Refrigerado (48h a 4°C):</span>
                          <span className="font-bold text-blue-900">
                            {chartAnalytics.vitC.cubiu.ref ? `${chartAnalytics.vitC.cubiu.ref.avg} gotas (n=${chartAnalytics.vitC.cubiu.ref.n})` : 'Sem registros'}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-blue-600 h-full rounded-full" 
                            style={{ 
                              width: chartAnalytics.vitC.cubiu.fresh && chartAnalytics.vitC.cubiu.ref 
                                ? `${Math.min(100, (chartAnalytics.vitC.cubiu.ref.avg / chartAnalytics.vitC.cubiu.fresh.avg) * 100)}%` 
                                : '0%' 
                            }} 
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-slate-700 mb-0.5">
                          <span>Fervido (10 min ~98°C):</span>
                          <span className="font-bold text-rose-900">
                            {chartAnalytics.vitC.cubiu.boil ? `${chartAnalytics.vitC.cubiu.boil.avg} gotas (n=${chartAnalytics.vitC.cubiu.boil.n})` : 'Sem registros'}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-rose-600 h-full rounded-full" 
                            style={{ 
                              width: chartAnalytics.vitC.cubiu.fresh && chartAnalytics.vitC.cubiu.boil 
                                ? `${Math.min(100, (chartAnalytics.vitC.cubiu.boil.avg / chartAnalytics.vitC.cubiu.fresh.avg) * 100)}%` 
                                : '0%' 
                            }} 
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-500 font-mono">
                    * Metodologia: Titulação iodométrica semi-quantitativa. Não converte gotas em mg/100g sem calibração instrumental.
                  </p>
                </div>
              )}
            </div>

            {/* Gráfico Exp B: Cinética de Escurecimento Temporal */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-amber-800 uppercase block">
                    Experimento B · Polifenoloxidase (PPO)
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Evolução Temporal do Escurecimento Enzimático
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  n = {chartAnalytics.enz.totalSamples} amostras
                </span>
              </div>

              {chartAnalytics.enz.totalSamples === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  Nenhuma observação de oxidação enzimática disponível nos filtros atuais.
                </div>
              ) : (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center gap-4 text-[11px] font-mono border-b border-slate-100 pb-2">
                    <span className="flex items-center gap-1.5 text-stone-900 font-bold">
                      <span className="w-3 h-3 rounded-full bg-stone-800" /> Controle
                    </span>
                    <span className="flex items-center gap-1.5 text-amber-800 font-bold">
                      <span className="w-3 h-3 rounded-full bg-amber-500" /> Polpa de Buriti
                    </span>
                    <span className="flex items-center gap-1.5 text-orange-800 font-bold">
                      <span className="w-3 h-3 rounded-full bg-orange-600" /> Polpa de Tucumã
                    </span>
                  </div>

                  {/* Linhas de Tempo Gráficas */}
                  <div className="space-y-3">
                    {chartAnalytics.enz.series.map((point) => (
                      <div key={point.time} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                        <div className="flex justify-between items-center text-[11px] font-mono font-bold text-slate-700">
                          <span>t = {point.time} minutos decorridos</span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-[10px] font-mono">
                          {/* Controle */}
                          <div className="p-1.5 bg-white rounded border border-stone-200">
                            <span className="text-slate-500 block">Controle:</span>
                            <span className="font-bold text-stone-900 text-xs">
                              {point.control !== null ? `Grau ${point.control}/4` : '—'}
                            </span>
                          </div>

                          {/* Buriti */}
                          <div className="p-1.5 bg-amber-50/60 rounded border border-amber-200">
                            <span className="text-amber-800 block">Buriti:</span>
                            <span className="font-bold text-amber-900 text-xs">
                              {point.buriti !== null ? `Grau ${point.buriti}/4` : '—'}
                            </span>
                          </div>

                          {/* Tucumã */}
                          <div className="p-1.5 bg-orange-50/60 rounded border border-orange-200">
                            <span className="text-orange-800 block">Tucumã:</span>
                            <span className="font-bold text-orange-900 text-xs">
                              {point.tucuma !== null ? `Grau ${point.tucuma}/4` : '—'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-[10px] text-slate-500 font-mono">
                    * Escala visual: 0 (Nulo), 1 (Leve), 2 (Moderado), 3 (Acentuado), 4 (Severo). Mecanismo: barreira lipofílica de oclusão de O₂.
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* Gráfico Exp C: Influência do pH nas Antocianinas do Açaí */}
          {chartAnalytics.ph.totalSamples > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-purple-900 uppercase block">
                    Experimento C · Equilíbrio Tautomérico Estrutural
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Régua Espectral Cromática das Antocianinas do Açaí em Função do pH
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  n = {chartAnalytics.ph.totalSamples} ensaios
                </span>
              </div>

              {/* Tubos de Ensaio das Amostras Registradas */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {chartAnalytics.ph.records.map((record) => {
                  const vals = record.measuredValues || {};
                  return (
                    <div 
                      key={record.id} 
                      className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-slate-100/70 transition-colors flex flex-col items-center text-center space-y-2 cursor-pointer"
                      onClick={() => setSelectedRecordForDetail(record)}
                      title="Clique para ver os detalhes da medição"
                    >
                      <div className="text-xs font-mono font-bold text-purple-950">
                        pH {Number(vals.measuredPH).toFixed(1)}
                      </div>

                      <div className="w-9 h-20 rounded-b-full border-2 border-slate-300 bg-white p-1 relative flex flex-col justify-end shadow-inner overflow-hidden">
                        <div 
                          className="w-full h-14 rounded-b-full transition-all duration-300 shadow-sm"
                          style={{ backgroundColor: vals.colorHex || '#4c1d95' }}
                        />
                      </div>

                      <div className="space-y-0.5">
                        <span className="font-mono text-[10px] font-bold text-slate-700 block">
                          {vals.colorHex}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-900 block leading-tight">
                          {vals.observedColor || 'Açaí Natural'}
                        </span>
                      </div>

                      <span className="text-[10px] text-slate-500 line-clamp-2 leading-tight">
                        {vals.dominantChemicalSpecies || record.sampleCode}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 bg-purple-50/50 rounded-lg border border-purple-100 text-[11px] text-slate-600 leading-relaxed">
                <strong className="text-purple-950 font-semibold">Fundamento Fitoquímico:</strong> Em pH hiperácido (&lt; 2,0), predomina o cátion flavílio vermelho rubi estável. Com a elevação do pH, ocorrem hidratação reversível (pseudobase carbinol incolor) e desprotonação fenólica (bases quinoidais azul-violeta), evidenciando que a alteração visual de cor expressa rearranjo estrutural da molécula e não quantificação mássica direta.
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. Tabela Dinâmica Oficial de Estabilidade (12 Colunas Conforme Requisitos) */}
      {(viewTab === 'both' || viewTab === 'table') && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <TableIcon className="w-4 h-4 text-emerald-800" />
                Resultados Científicos Publicados ({filteredRecords.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Clique sobre qualquer linha para abrir a ficha completa de rastreabilidade analítica e observações de bancada.
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200 space-y-3">
              <RefreshCw className="w-6 h-6 text-emerald-800 animate-spin mx-auto" />
              <p className="text-xs font-mono text-slate-600">Sincronizando registros oficiais do banco Firestore...</p>
            </div>
          ) : filteredRecords.length === 0 ? (
            /* Mensagem Obrigatória quando não há resultados correspondentes */
            <div className="p-12 text-center bg-white rounded-xl border border-dashed border-slate-300 space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-sm font-bold text-slate-900">
                  Nenhum resultado encontrado
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Ainda não existem resultados científicos publicados para os filtros selecionados. Novos resultados serão disponibilizados após o registro, a revisão e a publicação dos dados.
                </p>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Redefinir Filtros de Pesquisa
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
              
              <div className="p-3 bg-slate-50 border-b border-slate-200 text-xs text-slate-500 flex items-center justify-between font-mono">
                <span>{filteredRecords.length} medições analíticas autorizadas para divulgação pública</span>
                <span className="hidden md:inline">Deslize horizontalmente para visualizar todas as 12 colunas analíticas</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-semibold text-slate-700 uppercase font-mono">
                      <th className="py-3 px-3.5 whitespace-nowrap">1. ID / Amostra</th>
                      <th className="py-3 px-3.5 whitespace-nowrap">2. Fruto / Espécie</th>
                      <th className="py-3 px-3.5 whitespace-nowrap">3. Composto Alvo</th>
                      <th className="py-3 px-3.5 whitespace-nowrap">4. Experimento</th>
                      <th className="py-3 px-3.5 whitespace-nowrap">5. Condição Experimental</th>
                      <th className="py-3 px-3.5 whitespace-nowrap">6. Período / Duração</th>
                      <th className="py-3 px-3.5 whitespace-nowrap">7. Valor Registrado</th>
                      <th className="py-3 px-3.5 whitespace-nowrap">8. Unidade</th>
                      <th className="py-3 px-3.5 whitespace-nowrap">9. Método Analítico</th>
                      <th className="py-3 px-3.5 whitespace-nowrap">10. Data Registro</th>
                      <th className="py-3 px-3.5 whitespace-nowrap">11. Origem dos Dados</th>
                      <th className="py-3 px-3.5 whitespace-nowrap">12. Protocolo / Ref.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredRecords.map((record) => {
                      const proto = formatProtocolReference(record);
                      const isRealData = record.dataSource === 'cientifico_real';

                      return (
                        <tr 
                          key={record.id} 
                          className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                          onClick={() => setSelectedRecordForDetail(record)}
                        >
                          
                          {/* 1. Identificação do Registro */}
                          <td className="py-3 px-3.5 font-mono text-[11px] whitespace-nowrap">
                            <span className="font-bold text-slate-900 group-hover:text-emerald-900 transition-colors block">
                              {record.sampleCode}
                            </span>
                            <span className="text-[10px] text-slate-400 block font-normal">
                              ID: {record.id.slice(0, 10)}...
                            </span>
                          </td>

                          {/* 2. Fruto ou Amostra Analisada */}
                          <td className="py-3 px-3.5 font-medium text-slate-900 whitespace-nowrap">
                            {record.fruitOrSample}
                          </td>

                          {/* 3. Composto ou Característica Observada */}
                          <td className="py-3 px-3.5 whitespace-nowrap text-emerald-950 font-medium">
                            {formatTargetCompound(record.experimentType)}
                          </td>

                          {/* 4. Tipo de Experimento */}
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            <span className="inline-block px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200">
                              {formatExperimentTypeName(record.experimentType)}
                            </span>
                          </td>

                          {/* 5. Condição Experimental ou de Conservação */}
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            <span className="font-medium text-slate-800">
                              {record.experimentalCondition}
                            </span>
                          </td>

                          {/* 6. Período de Observação */}
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            {formatObservationPeriod(record)}
                          </td>

                          {/* 7. Valor Registrado */}
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            {formatRegisteredValue(record)}
                          </td>

                          {/* 8. Unidade de Medida */}
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            {formatUnitOfMeasure(record)}
                          </td>

                          {/* 9. Método Utilizado */}
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            <span className="text-slate-600 text-[11px] max-w-[220px] truncate block" title={record.methodUsed}>
                              {record.methodUsed}
                            </span>
                          </td>

                          {/* 10. Data do Registro */}
                          <td className="py-3 px-3.5 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                            {record.dateTime}
                          </td>

                          {/* 11. Origem dos Dados */}
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            {isRealData ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200">
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-700" /> Dado de Bancada
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                                <HelpCircle className="w-2.5 h-2.5 text-slate-600" /> Calibração Piloto
                              </span>
                            )}
                          </td>

                          {/* 12. Referência ao Protocolo / Publicação */}
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            <span className="text-[11px] text-slate-600 font-mono truncate max-w-[180px] block" title={proto.citation}>
                              {proto.protocol}
                            </span>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

            </div>
          )}
        </div>
      )}

      {/* 7. Modal de Ficha Completa de Rastreabilidade Analítica */}
      {selectedRecordForDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Cabeçalho do Modal */}
            <div className="p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50/80">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded">
                    {selectedRecordForDetail.sampleCode}
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    ID: {selectedRecordForDetail.id}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedRecordForDetail.fruitOrSample}
                </h3>
                <span className="text-xs text-slate-500 font-mono block">
                  {formatExperimentTypeName(selectedRecordForDetail.experimentType)} · {selectedRecordForDetail.experimentalCondition}
                </span>
              </div>
              <button
                onClick={() => setSelectedRecordForDetail(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
                title="Fechar ficha"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
              
              {/* Fotografia Científica da Amostra (se disponível) */}
              {selectedRecordForDetail.photoUrl && (
                <div className="rounded-xl overflow-hidden border border-slate-200 relative max-h-56 bg-slate-950">
                  <img
                    src={selectedRecordForDetail.photoUrl}
                    alt={`Evidência laboratorial da amostra ${selectedRecordForDetail.sampleCode}`}
                    className="w-full h-56 object-cover"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/80 to-transparent p-3 text-white text-[11px] font-mono flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-emerald-400" />
                    Registro fotográfico em bancada experimental
                  </div>
                </div>
              )}

              {/* Quadro de Valores Medidos Estruturados */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase font-mono tracking-wider text-slate-500">
                  Valores Analíticos Registrados &amp; Unidades
                </h4>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono block">Valor Registrado</span>
                    <div className="mt-0.5">{formatRegisteredValue(selectedRecordForDetail)}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono block">Unidade Padrão</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">{selectedRecordForDetail.units}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono block">Período / Duração</span>
                    <div className="mt-0.5">{formatObservationPeriod(selectedRecordForDetail)}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono block">Data e Horário</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">{selectedRecordForDetail.dateTime}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono block">Origem do Dado</span>
                    <span className="font-semibold text-emerald-900 mt-0.5 block">
                      {selectedRecordForDetail.dataSource === 'cientifico_real' ? 'Pesquisa de Bancada (BioAmazônia)' : 'Calibração Piloto Padronizada'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono block">Responsável</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block truncate">
                      {selectedRecordForDetail.responsibleName || 'Laboratório de Fitoquímica'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Protocolo Metodológico e Referência */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase font-mono tracking-wider text-slate-500">
                  Protocolo Experimental &amp; Referência Científica
                </h4>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 leading-relaxed">
                  <div className="font-bold text-slate-900">
                    {formatProtocolReference(selectedRecordForDetail).protocol}
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    {formatProtocolReference(selectedRecordForDetail).citation}
                  </p>
                  <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200 font-mono">
                    Método Documentado: {selectedRecordForDetail.methodUsed}
                  </div>
                </div>
              </div>

              {/* Observações de Bancada */}
              {selectedRecordForDetail.observations && (
                <div className="space-y-1.5">
                  <h4 className="font-bold text-slate-900 text-xs uppercase font-mono tracking-wider text-slate-500">
                    Observações de Bancada (Estudantes / Analistas)
                  </h4>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 leading-relaxed font-sans">
                    {selectedRecordForDetail.observations}
                  </div>
                </div>
              )}

              {/* Interpretação Bioquímica dos Pesquisadores */}
              {selectedRecordForDetail.scientificInterpretation && (
                <div className="space-y-1.5">
                  <h4 className="font-bold text-slate-900 text-xs uppercase font-mono tracking-wider text-emerald-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-700" /> Interpretação Científica Bioquímica
                  </h4>
                  <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200 text-emerald-950 leading-relaxed font-sans">
                    {selectedRecordForDetail.scientificInterpretation}
                  </div>
                </div>
              )}

              {/* Limitações Científicas Estritas */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-950 text-[11px] space-y-1 leading-relaxed">
                <div className="font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" /> Limitação Analítica Documentada
                </div>
                <p>
                  Os dados apresentados foram coletados sob condições controladas de laboratório para fins acadêmicos e analíticos. O número de gotas de titulante ou a viragem de cor não substituem curvas de calibração instrumental (CLAE-DAD ou espectrometria de massas) para fins de registro farmacopeico ou rotulagem nutricional definitiva.
                </p>
              </div>

            </div>

            {/* Rodapé do Modal */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-500">
                Última atualização: {new Date(selectedRecordForDetail.updatedAt || selectedRecordForDetail.createdAt).toLocaleDateString('pt-BR')}
              </span>
              <button
                onClick={() => setSelectedRecordForDetail(null)}
                className="px-4 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors text-xs"
              >
                Fechar Ficha
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 8. Rodapé Científico e Rastreabilidade do Banco de Dados */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>
            Banco de Dados Oficial: <span className="text-slate-900 font-bold">Firestore Enterprise</span> · Coleção <code className="bg-slate-200 px-1 py-0.5 rounded">/experiments</code>
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-500">
          <span>Rastreabilidade por ID único</span>
          <span>•</span>
          <span>Controle de Acesso RBAC Ativo</span>
        </div>
      </div>

    </div>
  );
};
