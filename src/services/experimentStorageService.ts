import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { UnifiedExperimentRecord, ExperimentType, ExperimentRecordStatus, UserProfile } from '../types';
import { 
  INITIAL_VITAMINC_MEASUREMENTS, 
  INITIAL_ENZYMATIC_OBSERVATIONS, 
  INITIAL_ANTHOCYANIN_PH_MEASUREMENTS,
  EXPERIMENT_PHOTOS 
} from '../data/experimentsData';

// Conversão inicial dos dados de demonstração para o modelo unificado
export function getInitialDemoRecords(): UnifiedExperimentRecord[] {
  const records: UnifiedExperimentRecord[] = [];

  // Vitamina C
  INITIAL_VITAMINC_MEASUREMENTS.forEach(m => {
    records.push({
      id: m.id,
      experimentType: 'vitamina-c',
      fruitOrSample: m.fruit,
      sampleCode: m.sampleCode,
      experimentalCondition: m.condition,
      dateTime: `${m.date} 09:00`,
      methodUsed: 'Titulação iodométrica semi-quantitativa (AOAC 967.21 / Adolfo Lutz)',
      units: 'gotas de I₂ (~0,05 mL/gota) em alíquota de 5,0 mL',
      measuredValues: {
        sampleVolumeMl: m.sampleVolumeMl,
        starchIndicatorVolumeMl: m.starchIndicatorVolumeMl,
        iodineDropsCount: m.iodineDropsCount,
        estimatedVolumeIodineMl: m.estimatedVolumeIodineMl,
        triplicateIndex: m.triplicateIndex,
      },
      observations: m.studentNotes,
      scientificInterpretation: 'Poder redutor do ácido L-ascórbico frente ao iodo elementar com indicador de amido solúvel.',
      photoUrl: EXPERIMENT_PHOTOS.titrationVitC,
      responsibleName: m.analyst,
      status: 'publicado',
      dataSource: 'demonstracao_inicial',
      authorUid: 'seed-researcher-01',
      authorEmail: 'pesquisa@bioamazonia.org.br',
      createdAt: '2026-10-14T09:00:00Z',
      updatedAt: '2026-10-16T10:00:00Z'
    });
  });

  // Oxidação Enzimática
  INITIAL_ENZYMATIC_OBSERVATIONS.forEach(o => {
    records.push({
      id: o.id,
      experimentType: 'oxidacao-enzimatica',
      fruitOrSample: o.condition.includes('Buriti') ? 'Buriti (Mauritia flexuosa)' : o.condition.includes('Tucumã') ? 'Tucumã (Astrocaryum aculeatum)' : 'Controle (Sem Fruto)',
      sampleCode: o.sampleCode,
      experimentalCondition: o.condition,
      dateTime: `15/10/2026 ${o.observationTime}`,
      methodUsed: 'Avaliação visual padronizada de escurecimento por polifenoloxidase (PPO)',
      units: 'Grau de escurecimento (Escala 0 a 4)',
      measuredValues: {
        initialTime: o.initialTime,
        observationTime: o.observationTime,
        elapsedMinutes: o.elapsedMinutes,
        browningScore: o.browningScore,
      },
      observations: o.studentObservations,
      scientificInterpretation: o.scientificInterpretation,
      photoUrl: o.photoUrl || EXPERIMENT_PHOTOS.enzymaticBrowning,
      responsibleName: o.analyst,
      status: 'publicado',
      dataSource: 'demonstracao_inicial',
      authorUid: 'seed-researcher-02',
      authorEmail: 'pesquisa@bioamazonia.org.br',
      createdAt: '2026-10-15T08:30:00Z',
      updatedAt: '2026-10-16T10:00:00Z'
    });
  });

  // pH Antocianinas
  INITIAL_ANTHOCYANIN_PH_MEASUREMENTS.forEach(a => {
    records.push({
      id: a.id,
      experimentType: 'ph-antocianinas',
      fruitOrSample: 'Açaí (Euterpe precatoria)',
      sampleCode: a.sampleCode,
      experimentalCondition: a.experimentalCondition,
      dateTime: a.timestamp,
      methodUsed: `Espectro visual em meio tamponado (${a.measurementMethod})`,
      units: 'Escala de pH (0 a 14) e código hexadecimal',
      measuredValues: {
        measuredPH: a.measuredPH,
        measurementMethod: a.measurementMethod,
        observedColor: a.observedColor,
        colorHex: a.colorHex,
        dominantChemicalSpecies: a.dominantChemicalSpecies,
      },
      observations: a.studentObservations,
      scientificInterpretation: a.comparativeResultNote,
      photoUrl: a.photoUrl || EXPERIMENT_PHOTOS.anthocyaninPH,
      responsibleName: 'Laboratório de Fitoquímica',
      status: 'publicado',
      dataSource: 'demonstracao_inicial',
      authorUid: 'seed-researcher-03',
      authorEmail: 'pesquisa@bioamazonia.org.br',
      createdAt: '2026-10-15T14:15:00Z',
      updatedAt: '2026-10-16T10:00:00Z'
    });
  });

  return records;
}

// Chaves de armazenamento local para cache offline seguro
const LOCAL_STORAGE_KEY = 'bioamazonia_experiment_records_v2';
const DRAFT_STORAGE_PREFIX = 'bioamazonia_form_draft_';

const normalizeExperimentPhotoPath = (record: UnifiedExperimentRecord): UnifiedExperimentRecord => {
  const photoUrl = record.photoUrl?.replace(/^\/?(?:src\/assets|public)\/images\//, '/imagens/');
  return photoUrl === record.photoUrl ? record : { ...record, photoUrl };
};

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface IExperimentStorageService {
  list(experimentType?: ExperimentType, statusFilter?: 'all' | ExperimentRecordStatus): Promise<UnifiedExperimentRecord[]>;
  get(id: string): Promise<UnifiedExperimentRecord | null>;
  create(record: Omit<UnifiedExperimentRecord, 'createdAt' | 'updatedAt'>, currentUser?: UserProfile | null): Promise<UnifiedExperimentRecord>;
  update(record: UnifiedExperimentRecord, currentUser?: UserProfile | null): Promise<UnifiedExperimentRecord>;
  delete(id: string, currentUser?: UserProfile | null): Promise<void>;
  validate(record: Partial<UnifiedExperimentRecord>, existingRecords: UnifiedExperimentRecord[]): ValidationResult;
  saveFormDraft(formKey: string, data: any): void;
  loadFormDraft(formKey: string): any | null;
  clearFormDraft(formKey: string): void;
  subscribe(callback: () => void): () => void;
  getSyncStatus(): { isRemote: boolean; totalRecords: number; realRecordsCount: number; demoRecordsCount: number; databaseId: string };
}

class ExperimentStorageService implements IExperimentStorageService {
  private localCache: UnifiedExperimentRecord[] = [];
  private listeners: Set<() => void> = new Set();
  private lastFetchFromRemote: boolean = false;

  constructor() {
    this.initLocalCache();
  }

  public subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notify() {
    this.listeners.forEach(cb => {
      try {
        cb();
      } catch (err) {
        console.error('Erro em subscriber de experimentos:', err);
      }
    });
  }

  public getSyncStatus() {
    const total = this.localCache.length;
    const realCount = this.localCache.filter(r => r.dataSource === 'cientifico_real').length;
    const demoCount = this.localCache.filter(r => r.dataSource === 'demonstracao_inicial' || !r.dataSource).length;
    return {
      isRemote: this.lastFetchFromRemote,
      totalRecords: total,
      realRecordsCount: realCount,
      demoRecordsCount: demoCount,
      databaseId: 'ai-studio-bioamazniabioqum-7e5edd54-d469-44f3-a03d-e0d89fb478c7'
    };
  }

  private initLocalCache() {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        this.localCache = (JSON.parse(stored) as UnifiedExperimentRecord[]).map(normalizeExperimentPhotoPath);
        const updatedStorage = JSON.stringify(this.localCache);
        if (updatedStorage !== stored) {
          localStorage.setItem(LOCAL_STORAGE_KEY, updatedStorage);
        }
      } else {
        this.localCache = getInitialDemoRecords();
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.localCache));
      }
    } catch {
      this.localCache = getInitialDemoRecords();
    }
  }

  private saveToLocalCache() {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.localCache));
    } catch (e) {
      console.warn('Falha ao salvar no cache local:', e);
    }
  }

  // Validação Rígida de Dados de Bancada
  public validate(
    record: Partial<UnifiedExperimentRecord>, 
    existingRecords: UnifiedExperimentRecord[]
  ): ValidationResult {
    const errors: Record<string, string> = {};

    // 1. Campos obrigatórios gerais
    if (!record.experimentType) {
      errors.experimentType = 'O tipo de experimento é obrigatório.';
    }

    if (!record.fruitOrSample || record.fruitOrSample.trim().length === 0) {
      errors.fruitOrSample = 'Informe o fruto ou amostra vegetal.';
    }

    if (!record.sampleCode || record.sampleCode.trim().length === 0) {
      errors.sampleCode = 'O código da amostra é obrigatório (ex: CAMU-FRESH-T1).';
    } else {
      const codeRegex = /^[A-Z0-9_\-\.]+$/i;
      if (!codeRegex.test(record.sampleCode.trim())) {
        errors.sampleCode = 'O código deve conter apenas letras, números, hífen ou sublinhado.';
      }

      // 2. Prevenção de duplicatas
      const isDuplicate = existingRecords.some(r => 
        r.experimentType === record.experimentType &&
        r.sampleCode.trim().toUpperCase() === record.sampleCode?.trim().toUpperCase() &&
        r.id !== record.id
      );
      if (isDuplicate) {
        errors.sampleCode = `O código "${record.sampleCode.trim().toUpperCase()}" já está registrado neste experimento. Evite duplicidade de identificador.`;
      }
    }

    if (!record.experimentalCondition || record.experimentalCondition.trim().length === 0) {
      errors.experimentalCondition = 'A condição experimental é obrigatória.';
    }

    if (!record.dateTime || record.dateTime.trim().length === 0) {
      errors.dateTime = 'A data e horário da medição são obrigatórios.';
    }

    if (!record.methodUsed || record.methodUsed.trim().length === 0) {
      errors.methodUsed = 'Descreva o método ou protocolo analítico utilizado.';
    }

    if (!record.units || record.units.trim().length === 0) {
      errors.units = 'Especifique as unidades de medição.';
    }

    if (!record.observations || record.observations.trim().length < 5) {
      errors.observations = 'Insira observações de bancada (mínimo de 5 caracteres).';
    }

    // 3. Validações Específicas por Experimento
    const vals = record.measuredValues || {};

    if (record.experimentType === 'vitamina-c') {
      if (vals.sampleVolumeMl === undefined || isNaN(vals.sampleVolumeMl) || vals.sampleVolumeMl <= 0) {
        errors.sampleVolumeMl = 'O volume da alíquota deve ser um número maior que zero (ex: 5.0 mL).';
      }
      if (vals.iodineDropsCount === undefined || isNaN(vals.iodineDropsCount) || vals.iodineDropsCount < 0) {
        errors.iodineDropsCount = 'O número de gotas de titulante não pode ser negativo.';
      }
    } else if (record.experimentType === 'oxidacao-enzimatica') {
      if (vals.elapsedMinutes === undefined || isNaN(vals.elapsedMinutes) || vals.elapsedMinutes < 0) {
        errors.elapsedMinutes = 'O tempo decorrido deve ser informado em minutos (>= 0).';
      }
      if (vals.browningScore === undefined || isNaN(vals.browningScore) || vals.browningScore < 0 || vals.browningScore > 4) {
        errors.browningScore = 'O grau de escurecimento deve estar entre 0 (nulo) e 4 (severo).';
      }
      if (!record.scientificInterpretation || record.scientificInterpretation.trim().length < 5) {
        errors.scientificInterpretation = 'A interpretação científica bioquímica é obrigatória para este módulo.';
      }
    } else if (record.experimentType === 'ph-antocianinas') {
      if (vals.measuredPH === undefined || isNaN(vals.measuredPH) || vals.measuredPH < 0 || vals.measuredPH > 14) {
        errors.measuredPH = 'O valor de pH deve estar entre 0.0 e 14.0.';
      }
      if (!vals.observedColor || vals.observedColor.trim().length === 0) {
        errors.observedColor = 'A cor observada da solução deve ser descrita.';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Listar registros com consulta segura
  public async list(
    experimentType?: ExperimentType, 
    statusFilter: 'all' | ExperimentRecordStatus = 'all'
  ): Promise<UnifiedExperimentRecord[]> {
    try {
      const experimentsCol = collection(db, 'experiments');
      const constraints: any[] = [];

      if (experimentType) {
        constraints.push(where('experimentType', '==', experimentType));
      }
      if (statusFilter !== 'all') {
        constraints.push(where('status', '==', statusFilter));
      }

      const q = query(experimentsCol, ...constraints);
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const firestoreRecords: UnifiedExperimentRecord[] = [];
        snapshot.forEach(docSnap => {
          firestoreRecords.push(normalizeExperimentPhotoPath(docSnap.data() as UnifiedExperimentRecord));
        });

        // Sincronizar cache local com o banco remoto mesclando por ID
        const map = new Map(this.localCache.map(r => [r.id, r]));
        firestoreRecords.forEach(r => map.set(r.id, r));
        this.localCache = Array.from(map.values());
        this.saveToLocalCache();
        this.lastFetchFromRemote = true;
        return firestoreRecords;
      }
    } catch (e) {
      console.warn('Conexão remota não disponível ou restrita. Utilizando repositório local autenticado:', e);
    }

    // Fallback para cache local robusto
    return this.localCache.filter(r => {
      if (experimentType && r.experimentType !== experimentType) return false;
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      return true;
    });
  }

  // Obter um registro por ID
  public async get(id: string): Promise<UnifiedExperimentRecord | null> {
    try {
      const docRef = doc(db, 'experiments', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return normalizeExperimentPhotoPath(docSnap.data() as UnifiedExperimentRecord);
      }
    } catch (e) {
      console.warn('Recuperando do repositório local:', e);
    }
    return this.localCache.find(r => r.id === id) || null;
  }

  // Criar novo registro experimental
  public async create(
    recordData: Omit<UnifiedExperimentRecord, 'createdAt' | 'updatedAt'>,
    currentUser?: UserProfile | null
  ): Promise<UnifiedExperimentRecord> {
    // Verificação de Segurança RBAC
    if (currentUser?.role === 'visitor') {
      throw new Error('Acesso negado: Visitantes não possuem autorização para registrar ou modificar resultados científicos.');
    }

    const validation = this.validate(recordData, this.localCache);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      throw new Error(firstError);
    }

    const now = new Date().toISOString();
    const newRecord = normalizeExperimentPhotoPath({
      ...recordData,
      createdAt: now,
      updatedAt: now
    });

    // Tentar persistir no Firestore
    try {
      const docRef = doc(db, 'experiments', newRecord.id);
      await setDoc(docRef, newRecord);
    } catch (error) {
      console.warn('Não foi possível sincronizar imediatamente com o Firestore remoto. Salvando em fila local:', error);
    }

    // Atualizar repositório local
    this.localCache.unshift(newRecord);
    this.saveToLocalCache();
    this.notify();

    return newRecord;
  }

  // Atualizar registro existente
  public async update(
    record: UnifiedExperimentRecord, 
    currentUser?: UserProfile | null
  ): Promise<UnifiedExperimentRecord> {
    // Verificação de Segurança RBAC
    if (currentUser?.role === 'visitor') {
      throw new Error('Acesso negado: Visitantes não possuem autorização para modificar resultados científicos.');
    }

    const existing = this.localCache.find(r => r.id === record.id);
    if (existing && existing.status === 'publicado' && currentUser?.role !== 'admin') {
      throw new Error('Registros oficiais publicados não podem ser alterados sem autorização de um Administrador Curador.');
    }

    const validation = this.validate(record, this.localCache);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      throw new Error(firstError);
    }

    const updatedRecord = normalizeExperimentPhotoPath({
      ...record,
      updatedAt: new Date().toISOString()
    });

    try {
      const docRef = doc(db, 'experiments', updatedRecord.id);
      await updateDoc(docRef, { ...updatedRecord });
    } catch (error) {
      console.warn('Persistindo atualização em repositório local:', error);
    }

    this.localCache = this.localCache.map(r => r.id === updatedRecord.id ? updatedRecord : r);
    this.saveToLocalCache();
    this.notify();

    return updatedRecord;
  }

  // Excluir registro
  public async delete(id: string, currentUser?: UserProfile | null): Promise<void> {
    const target = this.localCache.find(r => r.id === id);
    const isOfficialSeed = target?.dataSource === 'demonstracao_inicial' && target?.status === 'publicado';

    // Apenas amostras oficiais de referência catalogadas exigem estritamente perfil de Administrador Curador
    if (isOfficialSeed && currentUser?.role !== 'admin') {
      throw new Error('Amostras oficiais publicadas de referência apenas podem ser revogadas por Administradores Curadores.');
    }

    try {
      const docRef = doc(db, 'experiments', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.warn('Removendo do repositório local:', error);
    }

    this.localCache = this.localCache.filter(r => r.id !== id);
    this.saveToLocalCache();
    this.notify();
  }

  // Prevenção de Perda Acidental de Dados em Formulários (Draft Auto-Save)
  public saveFormDraft(formKey: string, data: any): void {
    try {
      localStorage.setItem(`${DRAFT_STORAGE_PREFIX}${formKey}`, JSON.stringify({
        savedAt: new Date().toISOString(),
        data
      }));
    } catch (e) {
      console.warn('Erro ao salvar rascunho de preenchimento:', e);
    }
  }

  public loadFormDraft(formKey: string): any | null {
    try {
      const raw = localStorage.getItem(`${DRAFT_STORAGE_PREFIX}${formKey}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed.data;
    } catch {
      return null;
    }
  }

  public clearFormDraft(formKey: string): void {
    try {
      localStorage.removeItem(`${DRAFT_STORAGE_PREFIX}${formKey}`);
    } catch (e) {
      console.warn('Erro ao limpar rascunho:', e);
    }
  }
}

export const experimentStorageService = new ExperimentStorageService();
