import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import { ConservationGuideline, ConservationSourceType, UserProfile } from '../types';
import { CONSERVATION_GUIDELINES } from '../data/conservationData';

const CONSERVATION_STORAGE_KEY = 'bioamazonia_conservation_guidelines_v2';

export interface ConservationFilterCriteria {
  searchTerm?: string;
  fruit?: string;
  sourceType?: string;
  storageCondition?: string;
}

export interface IConservationStorageService {
  list(filters?: ConservationFilterCriteria): Promise<ConservationGuideline[]>;
  get(id: string): Promise<ConservationGuideline | null>;
  create(guideline: Omit<ConservationGuideline, 'id' | 'updatedAt'>, currentUser?: UserProfile | null): Promise<ConservationGuideline>;
  update(guideline: ConservationGuideline, currentUser?: UserProfile | null): Promise<ConservationGuideline>;
  delete(id: string, currentUser?: UserProfile | null): Promise<void>;
  subscribe(callback: () => void): () => void;
  getByFruit(fruitId: string): Promise<ConservationGuideline[]>;
}

class ConservationStorageService implements IConservationStorageService {
  private localCache: ConservationGuideline[] = [];
  private listeners: Set<() => void> = new Set();
  private lastFetchRemote: boolean = false;

  constructor() {
    this.initLocalCache();
  }

  private initLocalCache() {
    try {
      const stored = localStorage.getItem(CONSERVATION_STORAGE_KEY);
      if (stored) {
        this.localCache = JSON.parse(stored);
      } else {
        this.localCache = [...CONSERVATION_GUIDELINES];
        localStorage.setItem(CONSERVATION_STORAGE_KEY, JSON.stringify(this.localCache));
      }
    } catch {
      this.localCache = [...CONSERVATION_GUIDELINES];
    }
  }

  private saveToLocalCache() {
    try {
      localStorage.setItem(CONSERVATION_STORAGE_KEY, JSON.stringify(this.localCache));
    } catch (e) {
      console.warn('Falha ao salvar diretrizes de conservação no cache local:', e);
    }
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
        console.error('Erro em ouvinte de conservação:', err);
      }
    });
  }

  public async list(filters?: ConservationFilterCriteria): Promise<ConservationGuideline[]> {
    try {
      const colRef = collection(db, 'conservation');
      const snapshot = await getDocs(colRef);
      if (!snapshot.empty) {
        const firestoreList: ConservationGuideline[] = [];
        snapshot.forEach(docSnap => {
          firestoreList.push(docSnap.data() as ConservationGuideline);
        });

        // Mesclar dados do Firestore preservando dados do cache local e dados iniciais
        const map = new Map(this.localCache.map(g => [g.id, g]));
        firestoreList.forEach(g => map.set(g.id, g));
        this.localCache = Array.from(map.values());
        this.saveToLocalCache();
        this.lastFetchRemote = true;
      }
    } catch (e) {
      // Usar cache local resiliente
    }

    let results = [...this.localCache];

    if (!filters) return results;

    if (filters.searchTerm && filters.searchTerm.trim()) {
      const term = filters.searchTerm.toLowerCase().trim();
      results = results.filter(g =>
        g.fruitCommonName.toLowerCase().includes(term) ||
        g.scientificName.toLowerCase().includes(term) ||
        g.recommendation.toLowerCase().includes(term) ||
        g.compoundTarget.toLowerCase().includes(term) ||
        g.storageCondition.toLowerCase().includes(term) ||
        g.sourceCitation.toLowerCase().includes(term) ||
        g.applicationLimitations.toLowerCase().includes(term)
      );
    }

    if (filters.fruit && filters.fruit !== 'all') {
      const target = filters.fruit.toLowerCase();
      results = results.filter(g => g.fruitId === target || g.fruitCommonName.toLowerCase().includes(target));
    }

    if (filters.sourceType && filters.sourceType !== 'all') {
      results = results.filter(g => g.sourceType === filters.sourceType);
    }

    if (filters.storageCondition && filters.storageCondition !== 'all') {
      results = results.filter(g => g.storageCondition === filters.storageCondition);
    }

    return results;
  }

  public async get(id: string): Promise<ConservationGuideline | null> {
    try {
      const docRef = doc(db, 'conservation', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as ConservationGuideline;
      }
    } catch {
      // fallback local
    }
    return this.localCache.find(g => g.id === id) || null;
  }

  public async create(
    guidelineData: Omit<ConservationGuideline, 'id' | 'updatedAt'>,
    currentUser?: UserProfile | null
  ): Promise<ConservationGuideline> {
    if (currentUser?.role === 'visitor') {
      throw new Error('Acesso restrito: Visitantes não possuem autorização para cadastrar diretrizes de conservação.');
    }

    // Validações
    if (!guidelineData.fruitId) {
      throw new Error('O fruto estudado é obrigatório.');
    }
    if (!guidelineData.storageCondition || guidelineData.storageCondition.trim().length < 3) {
      throw new Error('A condição de armazenamento é obrigatória.');
    }
    if (!guidelineData.recommendation || guidelineData.recommendation.trim().length < 10) {
      throw new Error('A recomendação técnica deve conter pelo menos 10 caracteres.');
    }
    if (!guidelineData.compoundTarget || guidelineData.compoundTarget.trim().length < 3) {
      throw new Error('O composto ou característica fitoquímica é obrigatório.');
    }
    if (!guidelineData.sourceCitation || guidelineData.sourceCitation.trim().length < 3) {
      throw new Error('A citação da fonte científica ou institucional é obrigatória.');
    }
    if (!guidelineData.applicationLimitations || guidelineData.applicationLimitations.trim().length < 5) {
      throw new Error('As limitações de aplicação e cuidados metodológicos são obrigatórios.');
    }

    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

    const newGuideline: ConservationGuideline = {
      ...guidelineData,
      id: `cons-${guidelineData.fruitId}-${Date.now().toString(36)}`,
      updatedAt: formattedDate
    };

    try {
      const docRef = doc(db, 'conservation', newGuideline.id);
      await setDoc(docRef, newGuideline);
    } catch (e) {
      console.warn('Persistindo diretriz no cache local:', e);
    }

    this.localCache.unshift(newGuideline);
    this.saveToLocalCache();
    this.notify();

    return newGuideline;
  }

  public async update(
    guideline: ConservationGuideline,
    currentUser?: UserProfile | null
  ): Promise<ConservationGuideline> {
    if (currentUser?.role === 'visitor') {
      throw new Error('Acesso restrito: Visitantes não possuem autorização para editar diretrizes de conservação.');
    }

    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    const updated = { ...guideline, updatedAt: formattedDate };

    try {
      const docRef = doc(db, 'conservation', updated.id);
      await updateDoc(docRef, { ...updated });
    } catch (e) {
      console.warn('Atualizando diretriz no cache local:', e);
    }

    this.localCache = this.localCache.map(g => g.id === updated.id ? updated : g);
    this.saveToLocalCache();
    this.notify();

    return updated;
  }

  public async delete(id: string, currentUser?: UserProfile | null): Promise<void> {
    if (currentUser?.role !== 'admin') {
      throw new Error('Apenas Administradores Curadores podem remover diretrizes de conservação do guia oficial.');
    }

    try {
      const docRef = doc(db, 'conservation', id);
      await deleteDoc(docRef);
    } catch (e) {
      console.warn('Removendo diretriz no cache local:', e);
    }

    this.localCache = this.localCache.filter(g => g.id !== id);
    this.saveToLocalCache();
    this.notify();
  }

  public async getByFruit(fruitId: string): Promise<ConservationGuideline[]> {
    const list = await this.list();
    const target = fruitId.toLowerCase();
    return list.filter(g => g.fruitId === target || g.fruitCommonName.toLowerCase().includes(target));
  }
}

export const conservationStorageService = new ConservationStorageService();
