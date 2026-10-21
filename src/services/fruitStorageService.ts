import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import { FruitSpecies, UserProfile } from '../types';
import { FRUITS_CATALOG } from '../data/fruitsCatalogData';

const LOCAL_STORAGE_KEY = 'bioamazonia_fruits_catalog_v2';

export interface IFruitStorageService {
  list(statusFilter?: 'all' | 'publicado' | 'rascunho' | 'em_revisao', currentUser?: UserProfile | null): Promise<FruitSpecies[]>;
  listCachedSync(statusFilter?: 'all' | 'publicado' | 'rascunho' | 'em_revisao', currentUser?: UserProfile | null): FruitSpecies[];
  get(id: string): Promise<FruitSpecies | null>;
  getCachedSync(id: string): FruitSpecies | null;
  create(fruit: FruitSpecies, currentUser?: UserProfile | null): Promise<FruitSpecies>;
  update(fruit: FruitSpecies, currentUser?: UserProfile | null): Promise<FruitSpecies>;
  delete(id: string, currentUser?: UserProfile | null): Promise<void>;
  subscribe(callback: () => void): () => void;
}

class FruitStorageService implements IFruitStorageService {
  private localCache: FruitSpecies[] = [];
  private listeners: Set<() => void> = new Set();
  private isInitialized: boolean = false;

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
        console.error('Erro em subscriber de frutos:', err);
      }
    });
  }

  private initLocalCache() {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed: FruitSpecies[] = JSON.parse(stored);
        const existingIds = new Set(parsed.map(f => f.id.toLowerCase()));
        let hasNew = false;
        for (const catalogFruit of FRUITS_CATALOG) {
          if (!existingIds.has(catalogFruit.id.toLowerCase())) {
            parsed.push(catalogFruit);
            hasNew = true;
          }
        }
        this.localCache = parsed;
        if (hasNew) {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.localCache));
        }
      } else {
        this.localCache = [...FRUITS_CATALOG];
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.localCache));
      }
    } catch {
      this.localCache = [...FRUITS_CATALOG];
    }
  }

  private saveToLocalCache() {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.localCache));
    } catch (e) {
      console.warn('Falha ao salvar catálogo de frutos no cache:', e);
    }
  }

  public getCachedSync(id: string): FruitSpecies | null {
    if (!this.localCache || this.localCache.length === 0) {
      this.initLocalCache();
    }
    const cleanId = (id || '').trim().toLowerCase();
    return this.localCache.find(f => f.id.toLowerCase() === cleanId) || null;
  }

  public listCachedSync(
    statusFilter: 'all' | 'publicado' | 'rascunho' | 'em_revisao' = 'all',
    currentUser?: UserProfile | null
  ): FruitSpecies[] {
    if (!this.localCache || this.localCache.length === 0) {
      this.initLocalCache();
    }
    const isPrivileged = currentUser?.role === 'admin' || currentUser?.role === 'researcher';

    return this.localCache.filter(fruit => {
      if (!isPrivileged) {
        return fruit.publicationStatus === 'Publicado e Validado' || (fruit.publicationStatus as string) === 'publicado';
      }

      if (statusFilter === 'all') return true;
      if (statusFilter === 'publicado') {
        return fruit.publicationStatus === 'Publicado e Validado' || (fruit.publicationStatus as string) === 'publicado';
      }
      if (statusFilter === 'rascunho') {
        return fruit.publicationStatus === 'Pendente de Verificação' || (fruit.publicationStatus as string) === 'rascunho';
      }
      if (statusFilter === 'em_revisao') {
        return fruit.publicationStatus === 'Em Revisão por Pares' || (fruit.publicationStatus as string) === 'em_revisao';
      }
      return true;
    });
  }

  public async list(
    statusFilter: 'all' | 'publicado' | 'rascunho' | 'em_revisao' = 'all',
    currentUser?: UserProfile | null
  ): Promise<FruitSpecies[]> {
    try {
      const col = collection(db, 'fruits');
      const snap = await getDocs(col);
      if (!snap.empty) {
        const firestoreList: FruitSpecies[] = [];
        snap.forEach(d => {
          firestoreList.push(d.data() as FruitSpecies);
        });

        // Mesclar com cache local preservando os dados
        const map = new Map(this.localCache.map(f => [f.id, f]));
        firestoreList.forEach(f => map.set(f.id, f));
        this.localCache = Array.from(map.values());
        this.saveToLocalCache();
      }
    } catch (e) {
      console.warn('Recuperando catálogo de frutos do cache local:', e);
    }

    const isPrivileged = currentUser?.role === 'admin' || currentUser?.role === 'researcher';

    return this.localCache.filter(fruit => {
      // Regra de Publicação: usuários não autorizados/visitantes apenas visualizam espécies validadas/publicadas
      if (!isPrivileged) {
        return fruit.publicationStatus === 'Publicado e Validado' || (fruit.publicationStatus as string) === 'publicado';
      }

      if (statusFilter === 'all') return true;
      if (statusFilter === 'publicado') {
        return fruit.publicationStatus === 'Publicado e Validado' || (fruit.publicationStatus as string) === 'publicado';
      }
      if (statusFilter === 'rascunho') {
        return fruit.publicationStatus === 'Pendente de Verificação' || (fruit.publicationStatus as string) === 'rascunho';
      }
      if (statusFilter === 'em_revisao') {
        return fruit.publicationStatus === 'Em Revisão por Pares' || (fruit.publicationStatus as string) === 'em_revisao';
      }
      return true;
    });
  }

  public async get(id: string): Promise<FruitSpecies | null> {
    try {
      const docRef = doc(db, 'fruits', id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as FruitSpecies;
      }
    } catch (e) {
      console.warn('Recuperando fruto do cache:', e);
    }
    return this.localCache.find(f => f.id === id) || null;
  }

  public async create(fruitData: FruitSpecies, currentUser?: UserProfile | null): Promise<FruitSpecies> {
    if (!currentUser || currentUser.role === 'visitor') {
      throw new Error('Acesso negado: Apenas pesquisadores e administradores autorizados podem cadastrar espécies.');
    }

    if (!fruitData.id || !fruitData.popularName || !fruitData.scientificName || !fruitData.family) {
      throw new Error('Campos obrigatórios ausentes: Identificador, Nome Popular, Nome Científico e Família.');
    }

    const exists = this.localCache.some(f => f.id.toLowerCase() === fruitData.id.toLowerCase());
    if (exists) {
      throw new Error(`Já existe uma espécie cadastrada com o ID "${fruitData.id}".`);
    }

    const newFruit: FruitSpecies = {
      ...fruitData,
      updatedAt: new Date().toLocaleDateString('pt-BR')
    };

    try {
      const docRef = doc(db, 'fruits', newFruit.id);
      await setDoc(docRef, newFruit);
    } catch (err) {
      console.warn('Persistindo espécie no repositório local:', err);
    }

    this.localCache.unshift(newFruit);
    this.saveToLocalCache();
    this.notify();
    return newFruit;
  }

  public async update(fruitData: FruitSpecies, currentUser?: UserProfile | null): Promise<FruitSpecies> {
    if (!currentUser || currentUser.role === 'visitor') {
      throw new Error('Acesso negado: Apenas pesquisadores e administradores autorizados podem editar espécies.');
    }

    const existing = this.localCache.find(f => f.id === fruitData.id);
    if (!existing) {
      throw new Error('Espécie não encontrada para atualização.');
    }

    const isPublished = existing.publicationStatus === 'Publicado e Validado' || (existing.publicationStatus as string) === 'publicado';
    if (isPublished && currentUser.role !== 'admin') {
      // Se não for admin, pesquisador só pode submeter para revisão
      fruitData.publicationStatus = 'Em Revisão por Pares';
    }

    const updatedFruit: FruitSpecies = {
      ...fruitData,
      updatedAt: new Date().toLocaleDateString('pt-BR')
    };

    try {
      const docRef = doc(db, 'fruits', updatedFruit.id);
      await updateDoc(docRef, { ...updatedFruit });
    } catch (err) {
      console.warn('Atualizando espécie no repositório local:', err);
    }

    this.localCache = this.localCache.map(f => f.id === updatedFruit.id ? updatedFruit : f);
    this.saveToLocalCache();
    this.notify();
    return updatedFruit;
  }

  public async delete(id: string, currentUser?: UserProfile | null): Promise<void> {
    if (currentUser?.role !== 'admin') {
      throw new Error('Acesso negado: Apenas administradores curadores podem excluir espécies do catálogo.');
    }

    try {
      const docRef = doc(db, 'fruits', id);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn('Excluindo espécie do cache local:', err);
    }

    this.localCache = this.localCache.filter(f => f.id !== id);
    this.saveToLocalCache();
    this.notify();
  }
}

export const fruitStorageService = new FruitStorageService();
