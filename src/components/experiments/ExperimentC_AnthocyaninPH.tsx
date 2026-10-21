import React, { useState, useEffect, useMemo } from 'react';
import { UnifiedExperimentRecord, ExperimentRecordStatus } from '../../types';
import { experimentStorageService } from '../../services/experimentStorageService';
import { ExperimentRecordFormModal } from './ExperimentRecordFormModal';
import { useAuth } from '../../contexts/AuthContext';
import { EXPERIMENT_PHOTOS } from '../../data/experimentsData';
import { 
  Sparkles, 
  AlertTriangle, 
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
  Clock,
  Layers
} from 'lucide-react';

export const ExperimentC_AnthocyaninPH: React.FC = () => {
  const { currentUser, isVisitor, isResearcher, isAdmin } = useAuth();

  const [records, setRecords] = useState<UnifiedExperimentRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [methodFilter, setMethodFilter] = useState<'all' | string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | ExperimentRecordStatus>('all');

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<UnifiedExperimentRecord | null>(null);
  const [activePhotoModal, setActivePhotoModal] = useState<string | null>(null);

  const loadRecords = async () => {
    setIsLoading(true);
    try {
      const data = await experimentStorageService.list('ph-antocianinas', 'all');
      setRecords(data);
    } catch (e) {
      console.warn('Erro ao carregar registros de pH das antocianinas:', e);
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
      alert('Acesso restrito: Faça login como pesquisador para alterar dados.');
      return;
    }
    if (rec.status === 'publicado' && !isAdmin) {
      alert('Registros publicados apenas podem ser alterados por Administradores Curadores.');
      return;
    }
    setEditingRecord(rec);
    setIsModalOpen(true);
  };

  const handleDeleteRecord = async (rec: UnifiedExperimentRecord) => {
    if (isVisitor) {
      alert('Acesso restrito: Visitantes não podem excluir registros.');
      return;
    }
    if (rec.status === 'publicado' && !isAdmin) {
      alert('Registros oficiais publicados apenas podem ser excluídos por Administradores Curadores.');
      return;
    }
    if (window.confirm(`Deseja excluir permanentemente o registro da amostra ${rec.sampleCode}?`)) {
      try {
        await experimentStorageService.delete(rec.id, currentUser);
        await loadRecords();
      } catch (err: any) {
        alert(err.message || 'Erro ao excluir.');
      }
    }
  };

  const filteredRecords = useMemo(() => {
    return records
      .filter(r => {
        if (isVisitor && r.status !== 'publicado') return false;
        if (statusFilter !== 'all' && r.status !== statusFilter) return false;
        if (methodFilter !== 'all' && r.measuredValues?.measurementMethod !== methodFilter) return false;
        return true;
      })
      .sort((a, b) => (a.measuredValues?.measuredPH ?? 0) - (b.measuredValues?.measuredPH ?? 0));
  }, [records, methodFilter, statusFilter, isVisitor]);

  const handleExportCSV = () => {
    const headers = [
      'ID_Registro',
      'Codigo_Amostra',
      'Condicao_Experimental',
      'pH_Medido',
      'Metodo_Medicao',
      'Cor_Observada',
      'Codigo_Hex',
      'Especie_Molecular',
      'Status_Registro',
      'Data_Horario',
      'Observacoes_Estudantes',
      'Interpretacao_Cientifica',
      'Responsavel'
    ];

    const rows = filteredRecords.map(r => [
      `"${r.id}"`,
      `"${r.sampleCode}"`,
      `"${r.experimentalCondition}"`,
      r.measuredValues?.measuredPH !== undefined ? r.measuredValues.measuredPH : 'N/A',
      `"${r.measuredValues?.measurementMethod || ''}"`,
      `"${r.measuredValues?.observedColor || ''}"`,
      `"${r.measuredValues?.colorHex || ''}"`,
      `"${(r.measuredValues?.dominantChemicalSpecies || '').replace(/"/g, '""')}"`,
      `"${r.status}"`,
      `"${r.dateTime}"`,
      `"${(r.observations || '').replace(/"/g, '""')}"`,
      `"${(r.scientificInterpretation || '').replace(/"/g, '""')}"`,
      `"${r.responsibleName || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `experimento_antocianinas_ph_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      
      {/* Banner Principal do Experimento C */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          
          <div className="lg:col-span-8 p-6 sm:p-8 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-purple-50 text-purple-900 border border-purple-200 text-[11px] font-mono font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-purple-700" /> Experimento C · Equilíbrio Estrutural Tautomérico
            </div>

            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Influência do pH nas Antocianinas do Açaí (<span className="italic font-serif">Euterpe precatoria</span>)
            </h2>

            <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
              <p>
                <strong className="text-slate-900 font-semibold">Objetivo Científico:</strong> Mapear visual e instrumentalmente as transições cromáticas dos pigmentos antociânicos (<span className="italic">cianidina-3-rutinosídeo</span> e <span className="italic">cianidina-3-glicosídeo</span>) extraídos do açaí sob diferentes valores de potencial hidrogeniônico (pH 1,0 a 12,0), compreendendo o comportamento reversível das formas químicas em solução aquosa.
              </p>
            </div>

            {/* AVISO CIENTÍFICO OBRIGATÓRIO EM DESTAQUE */}
            <div className="p-4 bg-rose-50/90 border border-rose-200 rounded-lg flex items-start gap-3 text-xs text-rose-950">
              <AlertTriangle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold uppercase tracking-wider text-[11px] text-rose-900 block font-mono">
                  Princípio Metodológico Fundamental · Mudança Cromática ≠ Concentração
                </span>
                <p className="leading-relaxed">
                  <strong className="text-rose-950 font-bold underline">Não confunda mudança de cor com medição direta da concentração de antocianinas ou da capacidade antioxidante!</strong> A variação de coloração observada nos tubos decorre exclusivamente do <span className="font-semibold">equilíbrio ácido-base tautomérico</span> e de desprotonação reversível do núcleo 2-fenilcromílio (anel flavílio). Uma amostra incolor em pH 4,5 ainda contém antocianinas intactas (na forma de pseudobase hemiacetal). Apenas em valores de pH alcalino extremo prolongado (pH &gt; 11) ocorre a clivagem química irreversível do anel heterocíclico para formas de chalcona e ácidos fenólicos degradados.
                </p>
              </div>
            </div>

            {/* Guia das 4 Formas Químicas em Equilíbrio */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-2">
              <div className="p-2.5 rounded-lg border border-red-200 bg-red-50/50 space-y-1">
                <div className="text-[10px] font-mono font-bold text-red-800">pH 1,0 - 3,0</div>
                <div className="text-xs font-bold text-slate-900">Cátion Flavílio (AH⁺)</div>
                <div className="w-full h-2 rounded bg-red-700" />
                <p className="text-[10px] text-slate-600">Vermelho rubi intenso e brilhante. Forma protonada com carga positiva estável.</p>
              </div>

              <div className="p-2.5 rounded-lg border border-purple-200 bg-purple-50/50 space-y-1">
                <div className="text-[10px] font-mono font-bold text-purple-800">pH 4,0 - 5,5</div>
                <div className="text-xs font-bold text-slate-900">Pseudobase Carbinol (B)</div>
                <div className="w-full h-2 rounded bg-purple-900" />
                <p className="text-[10px] text-slate-600">Roxo açaí clássico em equilíbrio com hemiacetal hidratado incolor.</p>
              </div>

              <div className="p-2.5 rounded-lg border border-emerald-200 bg-emerald-50/50 space-y-1">
                <div className="text-[10px] font-mono font-bold text-emerald-800">pH 7,0 - 9,0</div>
                <div className="text-xs font-bold text-slate-900">Base Quinoidal (A, A⁻)</div>
                <div className="w-full h-2 rounded bg-emerald-800" />
                <p className="text-[10px] text-slate-600">Desprotonação fenólica: transição para azul acinzentado e verde musgo.</p>
              </div>

              <div className="p-2.5 rounded-lg border border-amber-200 bg-amber-50/50 space-y-1">
                <div className="text-[10px] font-mono font-bold text-amber-800">pH &gt; 11,0</div>
                <div className="text-xs font-bold text-slate-900">Chalcona (C)</div>
                <div className="w-full h-2 rounded bg-amber-700" />
                <p className="text-[10px] text-slate-600">Abertura do anel heterocíclico: amarelo-pardo e clivagem irreversível.</p>
              </div>
            </div>

          </div>

          {/* Fotografia Científica do Experimento */}
          <div className="lg:col-span-4 bg-slate-900 relative flex flex-col justify-end p-4 min-h-[220px]">
            <img 
              src={EXPERIMENT_PHOTOS.anthocyaninPH} 
              alt="Gradiente de pH das antocianinas do açaí em tubos de ensaio de pH 1 a 10" 
              className="absolute inset-0 w-full h-full object-cover opacity-85 cursor-pointer hover:opacity-95 transition-opacity"
              onClick={() => setActivePhotoModal(EXPERIMENT_PHOTOS.anthocyaninPH)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />
            <div className="relative z-10 text-white space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-purple-300 font-semibold flex items-center gap-1">
                <Camera className="w-3 h-3 text-purple-300" /> Bancada Laboratorial Real
              </span>
              <p className="text-xs font-medium text-slate-200">
                Estante de tubos: Vermelho rubi (pH 1-2) → Púrpura (pH 4) → Azul/Verde (pH 7-8) → Amarelo (pH 10+).
              </p>
              <div className="text-[10px] text-slate-400 font-mono">
                Clique para ampliar a fotografia do gradiente
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Régua Visual Interativa de Transição */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-purple-900 font-semibold">
              Régua Espectral de Transição
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Escala Cromática Contínua de pH & Espécies Químicas Registradas
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded">
            λ máx desloca de 520 nm (vermelho) para ~610 nm (azul/verde)
          </span>
        </div>

        {/* Tubos de Ensaio Gráficos */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          {filteredRecords.map((r) => {
            const vals = r.measuredValues || {};
            return (
              <div 
                key={r.id} 
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100/70 transition-colors flex flex-col items-center text-center space-y-2.5"
              >
                <div className="text-[11px] font-mono font-bold text-slate-500">
                  pH {vals.measuredPH !== undefined ? Number(vals.measuredPH).toFixed(1) : '—'}
                </div>

                <div className="w-10 h-24 rounded-b-full border-2 border-slate-300 bg-white p-1 relative flex flex-col justify-end shadow-inner overflow-hidden">
                  <div 
                    className="w-full h-16 rounded-b-full transition-all duration-300 shadow-sm"
                    style={{ backgroundColor: vals.colorHex || '#4c1d95' }}
                  />
                </div>

                <div className="space-y-0.5">
                  <span className="font-mono text-[10px] font-bold text-slate-800 block">
                    {vals.colorHex || '#4c1d95'}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-900 block leading-tight">
                    {vals.observedColor || 'Açaí Natural'}
                  </span>
                </div>

                <span className="text-[10px] text-slate-500 line-clamp-2 leading-tight">
                  {vals.dominantChemicalSpecies}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Controles de Filtros e Ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Método:</span>
          
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-md border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-purple-700"
          >
            <option value="all">Todos os Instrumentos</option>
            <option value="pHmetro de Bancada Calibrado">pHmetro de Bancada Calibrado</option>
            <option value="Fita Indicadora Universal">Fita Indicadora Universal</option>
            <option value="Tampão Químico Padrão">Tampão Químico Padrão</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-md border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-purple-700"
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
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-purple-900 hover:bg-purple-800 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Registrar Medição de pH
          </button>
        </div>

      </div>

      {/* Tabela ou Cartões */}
      {viewMode === 'table' ? (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-mono uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4 font-semibold">Código</th>
                  <th className="py-3 px-4 font-semibold">Condição Experimental</th>
                  <th className="py-3 px-4 font-semibold text-center">pH Medido</th>
                  <th className="py-3 px-4 font-semibold">Método</th>
                  <th className="py-3 px-4 font-semibold">Cor Observada</th>
                  <th className="py-3 px-4 font-semibold">Espécie Molecular Dominante</th>
                  <th className="py-3 px-4 font-semibold">Estado</th>
                  <th className="py-3 px-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500 text-xs">
                      Nenhuma medição encontrada.
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
                          {r.experimentalCondition}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-slate-900 whitespace-nowrap">
                          {vals.measuredPH !== undefined ? (
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-900">
                              pH {Number(vals.measuredPH).toFixed(1)}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-600 text-[11px] whitespace-nowrap">
                          {vals.measurementMethod}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span 
                              className="w-4 h-4 rounded-full border border-slate-300 shadow-xs shrink-0" 
                              style={{ backgroundColor: vals.colorHex || '#4c1d95' }}
                            />
                            <span className="font-medium text-slate-800">{vals.observedColor}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-700 text-[11px] min-w-[180px]">
                          {vals.dominantChemicalSpecies}
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
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            {r.photoUrl && (
                              <button
                                onClick={() => setActivePhotoModal(r.photoUrl!)}
                                className="p-1 rounded hover:bg-slate-100 text-purple-800"
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
                            {(!isVisitor && (r.status !== 'publicado' || isAdmin)) && (
                              <button
                                onClick={() => handleDeleteRecord(r)}
                                className="p-1 rounded text-slate-400 hover:text-rose-700 hover:bg-rose-50"
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
            <span>Total de condições documentadas: {filteredRecords.length}</span>
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
                  <span className="px-2.5 py-0.5 rounded font-mono font-bold text-xs bg-slate-100 text-slate-900 border border-slate-200">
                    pH {vals.measuredPH !== undefined ? Number(vals.measuredPH).toFixed(1) : 'N/A'}
                  </span>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <div 
                    className="w-8 h-8 rounded-lg border border-slate-300 shrink-0 shadow-xs" 
                    style={{ backgroundColor: vals.colorHex || '#4c1d95' }}
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">{vals.observedColor}</span>
                    <span className="text-[10px] font-mono text-slate-500">Hex: {vals.colorHex || '#4c1d95'}</span>
                  </div>
                </div>

                <div className="text-xs space-y-1">
                  <span className="text-[10px] uppercase font-mono font-semibold text-slate-500 block">
                    Espécie Estrutural Predominante:
                  </span>
                  <p className="text-[11px] text-slate-700 bg-slate-50 p-2 rounded border border-slate-100">
                    {vals.dominantChemicalSpecies}
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
                    {(!isVisitor && (r.status !== 'publicado' || isAdmin)) && (
                      <button onClick={() => handleDeleteRecord(r)} className="text-rose-600 hover:text-rose-800">
                        Excluir
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
          experimentType="ph-antocianinas"
          initialRecord={editingRecord}
          existingRecords={records}
        />
      )}

      {/* Modal de Fotografia Ampliada */}
      {activePhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 rounded-xl overflow-hidden max-w-3xl w-full border border-slate-800 space-y-3 p-4">
            <div className="flex items-center justify-between text-white border-b border-slate-800 pb-2">
              <span className="font-mono text-xs text-purple-300 font-semibold flex items-center gap-1.5">
                <Camera className="w-4 h-4" /> Registro Fotográfico Laboratorial
              </span>
              <button onClick={() => setActivePhotoModal(null)} className="p-1 rounded text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <img src={activePhotoModal} alt="Gradiente de pH de antocianinas em tubos de ensaio" className="w-full h-auto max-h-[70vh] object-contain rounded-lg" />
            <div className="text-xs text-slate-300 font-sans">
              Estante de tubos com extrato de açaí (Euterpe precatoria) em gradiente contínuo de pH 1 a 10. A transição vermelho → púrpura → azul-cinza → verde espelha o equilíbrio tautomérico reversível entre o cátion flavílio e as formas quinoidais.
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
