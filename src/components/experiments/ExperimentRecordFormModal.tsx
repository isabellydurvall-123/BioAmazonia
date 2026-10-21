import React, { useState, useEffect } from 'react';
import { 
  UnifiedExperimentRecord, 
  ExperimentType, 
  ExperimentRecordStatus, 
  VitaminCCondition, 
  EnzymaticCondition, 
  BrowningScaleScore 
} from '../../types';
import { experimentStorageService } from '../../services/experimentStorageService';
import { useAuth } from '../../contexts/AuthContext';
import { 
  EXPERIMENT_PHOTOS, 
  BROWNING_SCALE_DESCRIPTORS 
} from '../../data/experimentsData';
import { 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  FlaskConical, 
  Eye, 
  Sparkles, 
  Save, 
  Lock, 
  ShieldAlert, 
  RotateCcw,
  Camera,
  FileCheck2
} from 'lucide-react';

interface ExperimentRecordFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: (savedRecord: UnifiedExperimentRecord) => void;
  experimentType: ExperimentType;
  initialRecord?: UnifiedExperimentRecord | null;
  existingRecords: UnifiedExperimentRecord[];
}

export const ExperimentRecordFormModal: React.FC<ExperimentRecordFormModalProps> = ({
  isOpen,
  onClose,
  onSaveSuccess,
  experimentType,
  initialRecord,
  existingRecords
}) => {
  const { currentUser, isVisitor, isResearcher, isAdmin } = useAuth();

  const isEditing = Boolean(initialRecord);
  const draftStorageKey = `draft_${experimentType}_${initialRecord?.id || 'new'}`;

  // Form Fields
  const [fruitOrSample, setFruitOrSample] = useState<string>('');
  const [sampleCode, setSampleCode] = useState<string>('');
  const [experimentalCondition, setExperimentalCondition] = useState<string>('');
  const [dateTime, setDateTime] = useState<string>('');
  const [methodUsed, setMethodUsed] = useState<string>('');
  const [units, setUnits] = useState<string>('');
  const [observations, setObservations] = useState<string>('');
  const [scientificInterpretation, setScientificInterpretation] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [responsibleName, setResponsibleName] = useState<string>('');
  const [status, setStatus] = useState<ExperimentRecordStatus>('publicado');

  // Specific Values - Vitamina C
  const [sampleVolumeMl, setSampleVolumeMl] = useState<number>(5.0);
  const [starchIndicatorMl, setStarchIndicatorMl] = useState<number>(1.0);
  const [iodineDropsCount, setIodineDropsCount] = useState<number>(100);
  const [triplicateIndex, setTriplicateIndex] = useState<1 | 2 | 3>(1);

  // Specific Values - Oxidação Enzimática
  const [initialTime, setInitialTime] = useState<string>('08:30');
  const [observationTime, setObservationTime] = useState<string>('09:30');
  const [elapsedMinutes, setElapsedMinutes] = useState<number>(60);
  const [browningScore, setBrowningScore] = useState<BrowningScaleScore>(1);

  // Specific Values - pH Antocianinas
  const [measuredPH, setMeasuredPH] = useState<number>(4.0);
  const [measurementMethod, setMeasurementMethod] = useState<string>('pHmetro de Bancada Calibrado');
  const [observedColor, setObservedColor] = useState<string>('Roxo Violáceo Escuro');
  const [colorHex, setColorHex] = useState<string>('#4c1d95');
  const [dominantSpecies, setDominantSpecies] = useState<string>('Equilíbrio Cátion Flavílio / Pseudobase Carbinol');

  // Erros e Notificações
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [hasDraftRestored, setHasDraftRestored] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Inicialização de valores padrão com base no tipo de experimento
  useEffect(() => {
    if (initialRecord) {
      setFruitOrSample(initialRecord.fruitOrSample);
      setSampleCode(initialRecord.sampleCode);
      setExperimentalCondition(initialRecord.experimentalCondition);
      setDateTime(initialRecord.dateTime);
      setMethodUsed(initialRecord.methodUsed);
      setUnits(initialRecord.units);
      setObservations(initialRecord.observations);
      setScientificInterpretation(initialRecord.scientificInterpretation || '');
      setPhotoUrl(initialRecord.photoUrl || '');
      setResponsibleName(initialRecord.responsibleName || '');
      setStatus(initialRecord.status);

      const vals = initialRecord.measuredValues || {};
      if (experimentType === 'vitamina-c') {
        setSampleVolumeMl(vals.sampleVolumeMl || 5.0);
        setStarchIndicatorMl(vals.starchIndicatorVolumeMl || 1.0);
        setIodineDropsCount(vals.iodineDropsCount || 0);
        setTriplicateIndex(vals.triplicateIndex || 1);
      } else if (experimentType === 'oxidacao-enzimatica') {
        setInitialTime(vals.initialTime || '08:30');
        setObservationTime(vals.observationTime || '09:30');
        setElapsedMinutes(vals.elapsedMinutes || 0);
        setBrowningScore(vals.browningScore !== undefined ? vals.browningScore : 1);
      } else if (experimentType === 'ph-antocianinas') {
        setMeasuredPH(vals.measuredPH !== undefined ? vals.measuredPH : 7.0);
        setMeasurementMethod(vals.measurementMethod || 'pHmetro de Bancada Calibrado');
        setObservedColor(vals.observedColor || 'Violeta');
        setColorHex(vals.colorHex || '#4c1d95');
        setDominantSpecies(vals.dominantChemicalSpecies || '');
      }
    } else {
      // Valores padrão para novo cadastro
      const now = new Date();
      const formattedDate = `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
      setDateTime(formattedDate);
      setStatus('publicado');
      setResponsibleName(currentUser?.displayName || 'Bancada Científica BioAmazônia');

      if (experimentType === 'vitamina-c') {
        setFruitOrSample('Camu-camu (Myrciaria dubia)');
        setSampleCode(`CAMU-NOVO-${Math.floor(Math.random() * 900 + 100)}`);
        setExperimentalCondition('Fresco');
        setMethodUsed('Titulação iodométrica com tintura de iodo 0,01 N e indicador de amido 1% (AOAC 967.21)');
        setUnits('gotas de I₂ (~0,05 mL/gota) em alíquota de 5,0 mL');
        setPhotoUrl(EXPERIMENT_PHOTOS.titrationVitC);
        setObservations('Viragem para azul escuro persistente.');
        setSampleVolumeMl(5.0);
        setStarchIndicatorMl(1.0);
        setIodineDropsCount(105);
      } else if (experimentType === 'oxidacao-enzimatica') {
        setFruitOrSample('Buriti (Mauritia flexuosa)');
        setSampleCode(`BURITI-EXP-${Math.floor(Math.random() * 900 + 100)}`);
        setExperimentalCondition('Tratado com Polpa de Buriti');
        setMethodUsed('Avaliação visual e padronizada de escurecimento por polifenoloxidase (PPO)');
        setUnits('Grau de escurecimento (Escala 0 a 4)');
        setPhotoUrl(EXPERIMENT_PHOTOS.enzymaticBrowning);
        setObservations('Película oleosa homogênea preservou coloração clara da polpa.');
        setScientificInterpretation('A barreira lipídica de ácido oleico reduziu o contato com oxigênio, enquanto os tocoferóis sequestraram radicais peroxil.');
        setElapsedMinutes(60);
        setBrowningScore(1);
      } else if (experimentType === 'ph-antocianinas') {
        setFruitOrSample('Açaí (Euterpe precatoria)');
        setSampleCode(`ACAI-PH-${Math.floor(Math.random() * 900 + 100)}`);
        setExperimentalCondition('Meio Ácido Diluído (Ácido Cítrico 1%)');
        setMethodUsed('Espectro visual comparativo e equilíbrio tautomérico');
        setUnits('Escala de pH (0 a 14) e código hexadecimal');
        setPhotoUrl(EXPERIMENT_PHOTOS.anthocyaninPH);
        setObservations('Solução avermelhada brilhante límpida após agitação.');
        setScientificInterpretation('Predomínio da forma protonada de cátion flavílio (AH⁺) em meio ácido.');
        setMeasuredPH(3.2);
        setObservedColor('Vermelho Rubi Vivo');
        setColorHex('#b91c1c');
        setDominantSpecies('Cátion Flavílio (AH⁺)');
      }

      // Verificar se há rascunho anterior salvo para evitar perda acidental
      const savedDraft = experimentStorageService.loadFormDraft(draftStorageKey);
      if (savedDraft) {
        if (savedDraft.sampleCode) setSampleCode(savedDraft.sampleCode);
        if (savedDraft.observations) setObservations(savedDraft.observations);
        if (savedDraft.scientificInterpretation) setScientificInterpretation(savedDraft.scientificInterpretation);
        setHasDraftRestored(true);
      }
    }
  }, [isOpen, initialRecord, experimentType]);

  // Auto-save no storage local para evitar perda acidental de dados durante o preenchimento
  useEffect(() => {
    if (!isOpen || isEditing) return;
    const timer = setTimeout(() => {
      experimentStorageService.saveFormDraft(draftStorageKey, {
        sampleCode,
        observations,
        scientificInterpretation,
        fruitOrSample,
        experimentalCondition
      });
    }, 600);
    return () => clearTimeout(timer);
  }, [sampleCode, observations, scientificInterpretation, fruitOrSample, experimentalCondition, isOpen]);

  const handleDiscardDraft = () => {
    experimentStorageService.clearFormDraft(draftStorageKey);
    setHasDraftRestored(false);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setFieldErrors({});

    // Montar os valores medidos
    let measuredValues: Record<string, any> = {};
    if (experimentType === 'vitamina-c') {
      measuredValues = {
        sampleVolumeMl,
        starchIndicatorVolumeMl: starchIndicatorMl,
        iodineDropsCount,
        estimatedVolumeIodineMl: parseFloat((iodineDropsCount * 0.05).toFixed(2)),
        triplicateIndex
      };
    } else if (experimentType === 'oxidacao-enzimatica') {
      measuredValues = {
        initialTime,
        observationTime,
        elapsedMinutes,
        browningScore
      };
    } else if (experimentType === 'ph-antocianinas') {
      measuredValues = {
        measuredPH,
        measurementMethod,
        observedColor,
        colorHex,
        dominantChemicalSpecies: dominantSpecies
      };
    }

    const payload: Partial<UnifiedExperimentRecord> = {
      id: initialRecord?.id || `rec-${experimentType}-${Date.now()}`,
      experimentType,
      fruitOrSample: fruitOrSample.trim(),
      sampleCode: sampleCode.trim().toUpperCase(),
      experimentalCondition: experimentalCondition.trim(),
      dateTime: dateTime.trim(),
      methodUsed: methodUsed.trim(),
      units: units.trim(),
      measuredValues,
      observations: observations.trim(),
      scientificInterpretation: scientificInterpretation.trim(),
      photoUrl: photoUrl.trim() || undefined,
      responsibleName: responsibleName.trim() || undefined,
      status,
      authorUid: initialRecord?.authorUid || currentUser?.uid || 'guest-user',
      authorEmail: initialRecord?.authorEmail || currentUser?.email || undefined
    };

    // Validação
    const validation = experimentStorageService.validate(payload, existingRecords);
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      setGeneralError('Por favor, corrija os campos destacados abaixo antes de salvar.');
      return;
    }

    setIsSubmitting(true);
    try {
      let saved: UnifiedExperimentRecord;
      if (isEditing && initialRecord) {
        saved = await experimentStorageService.update({
          ...initialRecord,
          ...(payload as UnifiedExperimentRecord)
        }, currentUser);
      } else {
        saved = await experimentStorageService.create(
          payload as Omit<UnifiedExperimentRecord, 'createdAt' | 'updatedAt'>,
          currentUser
        );
        experimentStorageService.clearFormDraft(draftStorageKey);
      }

      onSaveSuccess(saved);
      onClose();
    } catch (err: any) {
      setGeneralError(err.message || 'Erro ao persistir o registro experimental.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg text-white ${
              experimentType === 'vitamina-c' ? 'bg-emerald-800' :
              experimentType === 'oxidacao-enzimatica' ? 'bg-amber-800' : 'bg-purple-900'
            }`}>
              {experimentType === 'vitamina-c' && <FlaskConical className="w-4 h-4" />}
              {experimentType === 'oxidacao-enzimatica' && <Eye className="w-4 h-4" />}
              {experimentType === 'ph-antocianinas' && <Sparkles className="w-4 h-4" />}
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-500">
                {isEditing ? 'Edição de Registro' : 'Novo Registro de Bancada'} · {
                  experimentType === 'vitamina-c' ? 'Vitamina C' :
                  experimentType === 'oxidacao-enzimatica' ? 'Oxidação Enzimática' : 'pH das Antocianinas'
                }
              </div>
              <h3 className="font-bold text-slate-900 text-base">
                {isEditing ? `Editar Registro ${initialRecord?.sampleCode}` : 'Cadastrar Amostra Experimental'}
              </h3>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notificação de Recuperação de Rascunho */}
        {hasDraftRestored && !isEditing && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-5 py-2.5 flex items-center justify-between text-xs text-emerald-950">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              Rascunho de preenchimento recuperado automaticamente para evitar perda de dados.
            </span>
            <button 
              type="button"
              onClick={handleDiscardDraft}
              className="text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 underline"
            >
              Descartar rascunho
            </button>
          </div>
        )}

        {/* Alerta de Segurança para Visitantes */}
        {isVisitor && (
          <div className="bg-amber-50 border-b border-amber-200 p-4 flex items-start gap-3 text-xs text-amber-950">
            <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1.5 flex-1">
              <span className="font-bold text-amber-900 uppercase tracking-wider text-[11px] block font-mono">
                Acesso de Visitante · Modificação Restrita
              </span>
              <p className="leading-relaxed text-slate-700">
                Visitantes possuem permissão para consultar dados científicos publicados. O cadastro de <strong>Pesquisadores de Bancada</strong> é concedido <strong>exclusivamente pelo Administrador Curador</strong>.
              </p>
              <div className="pt-1 flex items-center gap-2">
                <a
                  href="#login"
                  onClick={() => onClose()}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-800 hover:bg-emerald-900 text-white rounded text-[11px] font-semibold transition-colors"
                >
                  Ir para Autenticação Oficial
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Mensagem de Erro Geral */}
        {generalError && (
          <div className="bg-rose-50 border-b border-rose-200 p-3.5 flex items-center gap-2 text-xs text-rose-900">
            <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
            <span>{generalError}</span>
          </div>
        )}

        {/* Corpo do Formulário */}
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs">
          
          {/* Seção 1: Identificação da Amostra e Matriz */}
          <div className="space-y-3">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 block border-b border-slate-100 pb-1">
              1. Identificação da Amostra & Matriz
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Fruto ou Amostra Vegetal <span className="text-rose-600">*</span>
                </label>
                {experimentType === 'vitamina-c' ? (
                  <select
                    value={fruitOrSample}
                    onChange={(e) => setFruitOrSample(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  >
                    <option value="Camu-camu (Myrciaria dubia)">Camu-camu (Myrciaria dubia)</option>
                    <option value="Cubiu (Solanum sessiliflorum)">Cubiu (Solanum sessiliflorum)</option>
                    <option value="Cupuaçu (Theobroma grandiflorum)">Cupuaçu (Theobroma grandiflorum)</option>
                    <option value="Açaí (Euterpe precatoria)">Açaí (Euterpe precatoria)</option>
                  </select>
                ) : experimentType === 'oxidacao-enzimatica' ? (
                  <select
                    value={fruitOrSample}
                    onChange={(e) => setFruitOrSample(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-700"
                  >
                    <option value="Controle (Sem Fruto)">Controle (Sem Fruto / Sem Tratamento)</option>
                    <option value="Buriti (Mauritia flexuosa)">Buriti (Mauritia flexuosa)</option>
                    <option value="Tucumã (Astrocaryum aculeatum)">Tucumã (Astrocaryum aculeatum)</option>
                    <option value="Cupuaçu (Theobroma grandiflorum)">Cupuaçu (Theobroma grandiflorum)</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    value={fruitOrSample}
                    onChange={(e) => setFruitOrSample(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-700"
                    placeholder="Ex: Açaí (Euterpe precatoria)"
                  />
                )}
                {fieldErrors.fruitOrSample && (
                  <span className="text-[11px] text-rose-600 mt-1 block">{fieldErrors.fruitOrSample}</span>
                )}
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Código Único da Amostra <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={sampleCode}
                  onChange={(e) => setSampleCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono font-bold text-slate-900 uppercase focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  placeholder="Ex: CAMU-FRESH-T1"
                />
                {fieldErrors.sampleCode && (
                  <span className="text-[11px] text-rose-600 mt-1 block">{fieldErrors.sampleCode}</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Condição Experimental <span className="text-rose-600">*</span>
                </label>
                {experimentType === 'vitamina-c' ? (
                  <select
                    value={experimentalCondition}
                    onChange={(e) => setExperimentalCondition(e.target.value as VitaminCCondition)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  >
                    <option value="Fresco">Fresco (Referência Basal)</option>
                    <option value="Refrigerado (48h)">Refrigerado (48 horas a 4°C)</option>
                    <option value="Fervido">Fervido (10 min a ~98°C)</option>
                  </select>
                ) : experimentType === 'oxidacao-enzimatica' ? (
                  <select
                    value={experimentalCondition}
                    onChange={(e) => setExperimentalCondition(e.target.value as EnzymaticCondition)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-700"
                  >
                    <option value="Grupo de Controle (Sem Tratamento)">Grupo de Controle (Sem Tratamento)</option>
                    <option value="Tratado com Polpa de Buriti">Tratado com Polpa de Buriti</option>
                    <option value="Tratado com Polpa de Tucumã">Tratado com Polpa de Tucumã</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    value={experimentalCondition}
                    onChange={(e) => setExperimentalCondition(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-700"
                    placeholder="Ex: Adição de HCl 0,1 M ou Tampão pH 7.0"
                  />
                )}
                {fieldErrors.experimentalCondition && (
                  <span className="text-[11px] text-rose-600 mt-1 block">{fieldErrors.experimentalCondition}</span>
                )}
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Data e Horário do Ensaio <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  placeholder="DD/MM/AAAA HH:MM"
                />
                {fieldErrors.dateTime && (
                  <span className="text-[11px] text-rose-600 mt-1 block">{fieldErrors.dateTime}</span>
                )}
              </div>
            </div>
          </div>

          {/* Seção 2: Valores Medidos Específicos do Experimento */}
          <div className="space-y-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 block">
              2. Parâmetros & Valores Medidos ({units})
            </span>

            {/* Módulo Vitamina C */}
            {experimentType === 'vitamina-c' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Alíquota da Polpa (mL) <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={sampleVolumeMl}
                      onChange={(e) => setSampleVolumeMl(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-mono font-bold text-slate-900"
                    />
                    {fieldErrors.sampleVolumeMl && (
                      <span className="text-[11px] text-rose-600 mt-1 block">{fieldErrors.sampleVolumeMl}</span>
                    )}
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Gotas de I₂ Consumidas <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={iodineDropsCount}
                      onChange={(e) => setIodineDropsCount(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-mono font-bold text-slate-900"
                    />
                    {fieldErrors.iodineDropsCount && (
                      <span className="text-[11px] text-rose-600 mt-1 block">{fieldErrors.iodineDropsCount}</span>
                    )}
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Triplicata / Replicata</label>
                    <select
                      value={triplicateIndex}
                      onChange={(e) => setTriplicateIndex(parseInt(e.target.value) as 1 | 2 | 3)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-mono text-slate-800"
                    >
                      <option value="1">Replicata #1</option>
                      <option value="2">Replicata #2</option>
                      <option value="3">Replicata #3</option>
                    </select>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-white border border-slate-200 flex items-center justify-between font-mono text-xs text-slate-600">
                  <span>Volume aproximado de I₂ consumido:</span>
                  <span className="font-bold text-emerald-800">~{(iodineDropsCount * 0.05).toFixed(2)} mL</span>
                </div>
              </div>
            )}

            {/* Módulo Oxidação Enzimática */}
            {experimentType === 'oxidacao-enzimatica' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Horário Inicial (t=0)</label>
                    <input
                      type="time"
                      value={initialTime}
                      onChange={(e) => setInitialTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Horário da Leitura</label>
                    <input
                      type="time"
                      value={observationTime}
                      onChange={(e) => setObservationTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Tempo Decorrido (min)</label>
                    <input
                      type="number"
                      min="0"
                      value={elapsedMinutes}
                      onChange={(e) => setElapsedMinutes(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-mono font-bold"
                    />
                    {fieldErrors.elapsedMinutes && (
                      <span className="text-[11px] text-rose-600 mt-1 block">{fieldErrors.elapsedMinutes}</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Grau de Escurecimento (Escala Proposta 0 a 4):
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {BROWNING_SCALE_DESCRIPTORS.map(desc => (
                      <button
                        key={desc.score}
                        type="button"
                        onClick={() => setBrowningScore(desc.score as BrowningScaleScore)}
                        className={`p-2 rounded-lg border text-center transition-all ${
                          browningScore === desc.score
                            ? 'bg-amber-800 text-white border-amber-800 font-bold shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="font-mono text-xs">Grau {desc.score}</div>
                        <div className="text-[10px] truncate opacity-90">{desc.score === 0 ? 'Nulo' : desc.score === 4 ? 'Severo' : 'Parcial'}</div>
                      </button>
                    ))}
                  </div>
                  {fieldErrors.browningScore && (
                    <span className="text-[11px] text-rose-600 mt-1 block">{fieldErrors.browningScore}</span>
                  )}
                </div>
              </div>
            )}

            {/* Módulo pH Antocianinas */}
            {experimentType === 'ph-antocianinas' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      pH Medido (0.0 a 14.0) <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="14"
                      value={measuredPH}
                      onChange={(e) => setMeasuredPH(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-mono font-bold text-slate-900"
                    />
                    {fieldErrors.measuredPH && (
                      <span className="text-[11px] text-rose-600 mt-1 block">{fieldErrors.measuredPH}</span>
                    )}
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Método de Medição</label>
                    <select
                      value={measurementMethod}
                      onChange={(e) => setMeasurementMethod(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800"
                    >
                      <option value="pHmetro de Bancada Calibrado">pHmetro de Bancada Calibrado</option>
                      <option value="Fita Indicadora Universal">Fita Indicadora Universal</option>
                      <option value="Tampão Químico Padrão">Tampão Químico Padrão</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Cor Observada na Solução</label>
                    <input
                      type="text"
                      value={observedColor}
                      onChange={(e) => setObservedColor(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800"
                      placeholder="Ex: Vermelho rubi vivo límpido"
                    />
                    {fieldErrors.observedColor && (
                      <span className="text-[11px] text-rose-600 mt-1 block">{fieldErrors.observedColor}</span>
                    )}
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Código de Cor Hex</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={colorHex}
                        onChange={(e) => setColorHex(e.target.value)}
                        className="w-9 h-9 rounded cursor-pointer border border-slate-200 p-0.5"
                      />
                      <input
                        type="text"
                        value={colorHex}
                        onChange={(e) => setColorHex(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-mono text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Espécie Molecular Tautomérica Predominante</label>
                  <input
                    type="text"
                    value={dominantSpecies}
                    onChange={(e) => setDominantSpecies(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800"
                    placeholder="Ex: Cátion Flavílio (AH⁺)"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Método Utilizado</label>
                <input
                  type="text"
                  required
                  value={methodUsed}
                  onChange={(e) => setMethodUsed(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Unidades de Expressão</label>
                <input
                  type="text"
                  required
                  value={units}
                  onChange={(e) => setUnits(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Seção 3: Observações e Interpretações Científicas */}
          <div className="space-y-3">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 block border-b border-slate-100 pb-1">
              3. Relato de Bancada & Interpretação
            </span>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Observações dos Estudantes / Analistas <span className="text-rose-600">*</span>
              </label>
              <textarea
                rows={2}
                required
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                placeholder="Descreva a alteração visual, tempo de estabilidade da cor, odor ou comportamento da fase..."
              />
              {fieldErrors.observations && (
                <span className="text-[11px] text-rose-600 mt-1 block">{fieldErrors.observations}</span>
              )}
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Interpretação Bioquímica e Limitações Metodológicas
              </label>
              <textarea
                rows={2}
                value={scientificInterpretation}
                onChange={(e) => setScientificInterpretation(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                placeholder="Fundamento molecular, via de proteção ou limitações analíticas da medição..."
              />
              {fieldErrors.scientificInterpretation && (
                <span className="text-[11px] text-rose-600 mt-1 block">{fieldErrors.scientificInterpretation}</span>
              )}
            </div>
          </div>

          {/* Seção 4: Governança, Metadados e Estado do Registro */}
          <div className="space-y-3 pt-1 border-t border-slate-100">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
              4. Estado do Registro & Responsabilidade Científica
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Estado do Registro (Workflow Científico) <span className="text-rose-600">*</span>
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ExperimentRecordStatus)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                >
                  <option value="publicado">Publicado (Visível a todos)</option>
                  <option value="em_revisao">Em Revisão por Pares (Pendente de Validação)</option>
                  <option value="rascunho">Rascunho de Bancada (Privado)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Responsável / Analista de Bancada
                </label>
                <input
                  type="text"
                  value={responsibleName}
                  onChange={(e) => setResponsibleName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  placeholder="Nome do analista ou equipe"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                URL da Fotografia Documental (Opcional)
              </label>
              <input
                type="text"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 font-mono text-[11px]"
                placeholder="/imagens/... ou URL autorizada"
              />
            </div>
          </div>

          {/* Rodapé de Ações */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium transition-colors"
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting || isVisitor}
              className={`inline-flex items-center gap-2 px-5 py-2 rounded-lg text-white font-semibold shadow-xs transition-colors disabled:opacity-50 ${
                experimentType === 'vitamina-c' ? 'bg-emerald-800 hover:bg-emerald-700' :
                experimentType === 'oxidacao-enzimatica' ? 'bg-amber-800 hover:bg-amber-700' : 'bg-purple-900 hover:bg-purple-800'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Salvando...' : isEditing ? 'Atualizar Registro' : 'Salvar Registro Oficial'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
