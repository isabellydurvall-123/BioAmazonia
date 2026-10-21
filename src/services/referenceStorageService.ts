import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import { ScientificReference, UserProfile } from '../types';
import { SCIENTIFIC_REFERENCES } from '../data/referencesData';

const REFERENCES_STORAGE_KEY = 'bioamazonia_scientific_references_v3';

export interface ReferenceFilterCriteria {
  searchTerm?: string;
  fruit?: string;
  experiment?: string;
  topic?: string;
  publicationType?: string;
  verificationStatus?: string;
}

export interface IReferenceStorageService {
  list(filters?: ReferenceFilterCriteria): Promise<ScientificReference[]>;
  get(id: string): Promise<ScientificReference | null>;
  create(reference: Omit<ScientificReference, 'createdAt'>, currentUser?: UserProfile | null): Promise<ScientificReference>;
  update(reference: ScientificReference, currentUser?: UserProfile | null): Promise<ScientificReference>;
  delete(id: string, currentUser?: UserProfile | null): Promise<void>;
  subscribe(callback: () => void): () => void;
  getByFruit(fruitId: string): Promise<ScientificReference[]>;
  getByTopic(topicId: string): Promise<ScientificReference[]>;
  getByExperiment(experimentType: string): Promise<ScientificReference[]>;
}

class ReferenceStorageService implements IReferenceStorageService {
  private localCache: ScientificReference[] = [];
  private listeners: Set<() => void> = new Set();
  private lastFetchRemote: boolean = false;

  constructor() {
    this.initLocalCache();
  }

  private initLocalCache() {
    try {
      const stored = localStorage.getItem(REFERENCES_STORAGE_KEY);
      if (stored) {
        this.localCache = JSON.parse(stored);
      } else {
        this.localCache = [...SCIENTIFIC_REFERENCES];
        localStorage.setItem(REFERENCES_STORAGE_KEY, JSON.stringify(this.localCache));
      }
    } catch {
      this.localCache = [...SCIENTIFIC_REFERENCES];
    }
  }

  private saveToLocalCache() {
    try {
      localStorage.setItem(REFERENCES_STORAGE_KEY, JSON.stringify(this.localCache));
    } catch (e) {
      console.warn('Falha ao salvar referências no cache local:', e);
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
        console.error('Erro em ouvinte de referências:', err);
      }
    });
  }

  public async list(filters?: ReferenceFilterCriteria): Promise<ScientificReference[]> {
    try {
      const refCol = collection(db, 'references');
      const snapshot = await getDocs(refCol);
      if (!snapshot.empty) {
        const firestoreList: ScientificReference[] = [];
        snapshot.forEach(docSnap => {
          firestoreList.push(docSnap.data() as ScientificReference);
        });

        // Mesclar por ID
        const map = new Map(this.localCache.map(r => [r.id, r]));
        firestoreList.forEach(r => map.set(r.id, r));
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
      results = results.filter(r => 
        r.title.toLowerCase().includes(term) ||
        r.authors.toLowerCase().includes(term) ||
        r.journal.toLowerCase().includes(term) ||
        (r.doi && r.doi.toLowerCase().includes(term)) ||
        (r.keywords && r.keywords.some(k => k.toLowerCase().includes(term)))
      );
    }

    if (filters.fruit && filters.fruit !== 'all') {
      const targetFruit = filters.fruit.toLowerCase();
      results = results.filter(r => 
        r.relatedFruits.some(f => f.toLowerCase().includes(targetFruit)) ||
        r.fruitFocus.toLowerCase().includes(targetFruit)
      );
    }

    if (filters.experiment && filters.experiment !== 'all') {
      results = results.filter(r => 
        r.relatedExperiments.includes(filters.experiment as any)
      );
    }

    if (filters.topic && filters.topic !== 'all') {
      results = results.filter(r => 
        r.relatedContents.includes(filters.topic!)
      );
    }

    if (filters.publicationType && filters.publicationType !== 'all') {
      results = results.filter(r => r.publicationType === filters.publicationType);
    }

    if (filters.verificationStatus && filters.verificationStatus !== 'all') {
      results = results.filter(r => r.verificationStatus === filters.verificationStatus);
    }

    return results;
  }

  public async get(id: string): Promise<ScientificReference | null> {
    try {
      const docRef = doc(db, 'references', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as ScientificReference;
      }
    } catch {
      // fallback local
    }
    return this.localCache.find(r => r.id === id) || null;
  }

  public async create(
    referenceData: Omit<ScientificReference, 'createdAt'>, 
    currentUser?: UserProfile | null
  ): Promise<ScientificReference> {
    if (currentUser?.role === 'visitor') {
      throw new Error('Acesso restrito: Visitantes não possuem autorização para cadastrar referências científicas.');
    }

    // Validações
    if (!referenceData.title || referenceData.title.trim().length < 5) {
      throw new Error('O título da publicação é obrigatório (mínimo de 5 caracteres).');
    }
    if (!referenceData.authors || referenceData.authors.trim().length < 3) {
      throw new Error('A lista de autores é obrigatória.');
    }
    if (!referenceData.year || referenceData.year < 1900 || referenceData.year > new Date().getFullYear() + 1) {
      throw new Error('Ano de publicação inválido.');
    }
    if (!referenceData.journal || referenceData.journal.trim().length === 0) {
      throw new Error('A revista, livro ou instituição publicadora é obrigatória.');
    }

    // Prevenção de duplicidade por DOI ou título
    const isDuplicateDOI = referenceData.doi && referenceData.doi.trim().length > 0 &&
      this.localCache.some(r => r.doi && r.doi.trim().toLowerCase() === referenceData.doi!.trim().toLowerCase());
    if (isDuplicateDOI) {
      throw new Error(`Já existe uma referência cadastrada com o DOI "${referenceData.doi}". Evite duplicações bibliográficas.`);
    }

    const isDuplicateTitle = this.localCache.some(r => 
      r.title.trim().toLowerCase() === referenceData.title.trim().toLowerCase()
    );
    if (isDuplicateTitle) {
      throw new Error('Uma publicação com título idêntico já consta no acervo indexado.');
    }

    const newRecord: ScientificReference = {
      ...referenceData,
      id: referenceData.id || `ref-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    try {
      const docRef = doc(db, 'references', newRecord.id);
      await setDoc(docRef, newRecord);
    } catch (e) {
      console.warn('Persistindo referência localmente:', e);
    }

    this.localCache.unshift(newRecord);
    this.saveToLocalCache();
    this.notify();

    return newRecord;
  }

  public async update(
    reference: ScientificReference, 
    currentUser?: UserProfile | null
  ): Promise<ScientificReference> {
    if (currentUser?.role === 'visitor') {
      throw new Error('Acesso restrito: Visitantes não possuem autorização para editar referências científicas.');
    }

    try {
      const docRef = doc(db, 'references', reference.id);
      await updateDoc(docRef, { ...reference });
    } catch (e) {
      console.warn('Atualizando referência no cache local:', e);
    }

    this.localCache = this.localCache.map(r => r.id === reference.id ? reference : r);
    this.saveToLocalCache();
    this.notify();

    return reference;
  }

  public async delete(id: string, currentUser?: UserProfile | null): Promise<void> {
    if (currentUser?.role !== 'admin') {
      throw new Error('Apenas Administradores Curadores podem remover referências científicas do acervo.');
    }

    try {
      const docRef = doc(db, 'references', id);
      await deleteDoc(docRef);
    } catch (e) {
      console.warn('Removendo referência localmente:', e);
    }

    this.localCache = this.localCache.filter(r => r.id !== id);
    this.saveToLocalCache();
    this.notify();
  }

  public async getByFruit(fruitId: string): Promise<ScientificReference[]> {
    const list = await this.list();
    const target = fruitId.toLowerCase();
    return list.filter(r => 
      r.relatedFruits.some(f => f.toLowerCase() === target) ||
      r.fruitFocus.toLowerCase().includes(target)
    );
  }

  public async getByTopic(topicId: string): Promise<ScientificReference[]> {
    const list = await this.list();
    return list.filter(r => r.relatedContents.includes(topicId));
  }

  public async getByExperiment(experimentType: string): Promise<ScientificReference[]> {
    const list = await this.list();
    return list.filter(r => r.relatedExperiments.includes(experimentType as any));
  }
}

export const referenceStorageService = new ReferenceStorageService();
