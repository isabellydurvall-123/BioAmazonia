import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import { FruitSpecies, UserProfile } from '../types';
import { FRUITS_CATALOG } from '../data/fruitsCatalogData';

const LOCAL_STORAGE_KEY = 'bioamazonia_fruits_catalog_v2';
const DELETED_FRUITS_STORAGE_KEY = 'bioamazonia_deleted_fruits_v1';
const DELETED_FRUITS_COLLECTION = 'deletedFruits';

const normalizeFruitImagePaths = (fruit: FruitSpecies): FruitSpecies => {
  const authorizedPhotographs = fruit.authorizedPhotographs?.map(photo => ({
    ...photo,
    url: photo.url.replace(/^\/(?:src\/assets|public)\/images\//, '/imagens/')
  }));

  return authorizedPhotographs
    ? { ...fruit, authorizedPhotographs }
    : fruit;
};

export interface IFruitStorageService {
  list(statusFilter?: 'all' | 'publicado' | 'rascunho' | 'em_revisao', currentUser?: UserProfile | null): Promise<FruitSpecies[]>;
  listCachedSync(statusFilter?: 'all' | 'publicado' | 'rascunho' | 'em_revisao', currentUser?: UserProfile | null): FruitSpecies[];
  get(id: string): Promise<FruitSpecies | null>;
  getCachedSync(id: string): FruitSpecies | null;
  create(fruit: FruitSpecies, currentUser?: UserProfile | null): Promise<FruitSpecies>;
  update(fruit: FruitSpecies, currentUser?: UserProfile | null): Promise<FruitSpecies>;
  delete(id: string, currentUser?: UserProfile | null): Promise<boolean>;
  subscribe(callback: () => void): () => void;
}

class FruitStorageService implements IFruitStorageService {
  private localCache: FruitSpecies[] = [];
  private listeners: Set<() => void> = new Set();
  private isInitialized: boolean = false;
  private deletedFruitIds = new Set<string>();
  private remoteDeletedFruitIds = new Set<string>();
  private hasLoadedRemoteDeletedFruitIds = false;

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
    this.deletedFruitIds = this.loadDeletedFruitIds();
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed: FruitSpecies[] = (JSON.parse(stored) as FruitSpecies[])
          .map(normalizeFruitImagePaths)
          .filter(fruit => !this.deletedFruitIds.has(fruit.id.toLowerCase()));
        const existingIds = new Set(parsed.map(f => f.id.toLowerCase()));
        for (const catalogFruit of FRUITS_CATALOG) {
          if (
            !existingIds.has(catalogFruit.id.toLowerCase()) &&
            !this.deletedFruitIds.has(catalogFruit.id.toLowerCase())
          ) {
            parsed.push(catalogFruit);
          }
        }
        this.localCache = parsed;
        const updatedStorage = JSON.stringify(this.localCache);
        if (updatedStorage !== stored) {
          localStorage.setItem(LOCAL_STORAGE_KEY, updatedStorage);
        }
      } else {
        this.localCache = FRUITS_CATALOG.filter(
          fruit => !this.deletedFruitIds.has(fruit.id.toLowerCase())
        );
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.localCache));
      }
    } catch {
      this.localCache = FRUITS_CATALOG.filter(
        fruit => !this.deletedFruitIds.has(fruit.id.toLowerCase())
      );
    }
  }

  private loadDeletedFruitIds(): Set<string> {
    try {
      const stored = localStorage.getItem(DELETED_FRUITS_STORAGE_KEY);
      const ids: unknown = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(ids) || !ids.every(id => typeof id === 'string')) {
        throw new Error('Formato inválido para as exclusões de frutos armazenadas.');
      }
      return new Set(ids.map(id => id.trim().toLowerCase()).filter(Boolean));
    } catch (err) {
      console.warn('Falha ao carregar registro local de frutos excluídos:', err);
      return new Set();
    }
  }

  private saveDeletedFruitIds(): void {
    try {
      localStorage.setItem(
        DELETED_FRUITS_STORAGE_KEY,
        JSON.stringify(Array.from(this.deletedFruitIds))
      );
    } catch (err) {
      console.error('Falha ao salvar registro de frutos excluídos:', err);
      throw new Error('Não foi possível salvar o registro de exclusão neste dispositivo.');
    }
  }

  private async syncDeletedFruitIds(): Promise<void> {
    if (!this.hasLoadedRemoteDeletedFruitIds) {
      try {
        const snapshot = await getDocs(collection(db, DELETED_FRUITS_COLLECTION));
        snapshot.forEach(deletedFruit => {
          const id = deletedFruit.id.trim().toLowerCase();
          if (id) {
            this.deletedFruitIds.add(id);
            this.remoteDeletedFruitIds.add(id);
          }
        });
        this.saveDeletedFruitIds();
        this.hasLoadedRemoteDeletedFruitIds = true;
      } catch (err) {
        console.warn('Sincronização do registro de exclusões de frutos indisponível:', err);
      }
    }

    for (const id of this.deletedFruitIds) {
      if (this.remoteDeletedFruitIds.has(id)) continue;
      try {
        await setDoc(doc(db, DELETED_FRUITS_COLLECTION, id), {
          fruitId: id,
          deletedAt: new Date().toISOString()
        });
        this.remoteDeletedFruitIds.add(id);
      } catch (err) {
        console.warn(`Falha ao sincronizar a exclusão do fruto "${id}" com o Firestore:`, err);
      }
    }

    this.localCache = this.localCache.filter(
      fruit => !this.deletedFruitIds.has(fruit.id.toLowerCase())
    );
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
    if (this.deletedFruitIds.has(cleanId)) return null;
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
      if (this.deletedFruitIds.has(fruit.id.toLowerCase())) return false;
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
    await this.syncDeletedFruitIds();
    try {
      const col = collection(db, 'fruits');
      const snap = await getDocs(col);
      if (!snap.empty) {
        const firestoreList: FruitSpecies[] = [];
        snap.forEach(d => {
          firestoreList.push(normalizeFruitImagePaths(d.data() as FruitSpecies));
        });

        // Mesclar com cache local preservando os dados
        const map = new Map(this.localCache.map(f => [f.id, f]));
        firestoreList.forEach(f => {
          if (!this.deletedFruitIds.has(f.id.toLowerCase())) {
            map.set(f.id, f);
          }
        });
        this.localCache = Array.from(map.values());
        this.saveToLocalCache();
      }
    } catch (e) {
      console.warn('Recuperando catálogo de frutos do cache local:', e);
    }

    const isPrivileged = currentUser?.role === 'admin' || currentUser?.role === 'researcher';

    return this.localCache.filter(fruit => {
      if (this.deletedFruitIds.has(fruit.id.toLowerCase())) return false;
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
    const cleanId = (id || '').trim().toLowerCase();
    await this.syncDeletedFruitIds();
    if (this.deletedFruitIds.has(cleanId)) return null;
    try {
      const docRef = doc(db, 'fruits', id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return normalizeFruitImagePaths(snap.data() as FruitSpecies);
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

    const normalizedId = newFruit.id.toLowerCase();
    if (this.deletedFruitIds.delete(normalizedId)) {
      this.remoteDeletedFruitIds.delete(normalizedId);
      this.saveDeletedFruitIds();
      try {
        await deleteDoc(doc(db, DELETED_FRUITS_COLLECTION, normalizedId));
      } catch (err) {
        console.warn(`Falha ao remover a marca de exclusão do fruto "${normalizedId}" no Firestore:`, err);
      }
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

  public async delete(id: string, currentUser?: UserProfile | null): Promise<boolean> {
    if (currentUser?.role !== 'admin') {
      throw new Error('Acesso negado: Apenas administradores curadores podem excluir espécies do catálogo.');
    }

    const normalizedId = id.trim().toLowerCase();
    this.deletedFruitIds.add(normalizedId);
    try {
      this.saveDeletedFruitIds();
    } catch (err) {
      this.deletedFruitIds.delete(normalizedId);
      throw err;
    }

    this.localCache = this.localCache.filter(f => f.id.toLowerCase() !== normalizedId);
    this.saveToLocalCache();
    this.notify();

    let syncedToFirestore = false;
    try {
      await setDoc(doc(db, DELETED_FRUITS_COLLECTION, normalizedId), {
        fruitId: normalizedId,
        deletedAt: new Date().toISOString()
      });
      this.remoteDeletedFruitIds.add(normalizedId);
      syncedToFirestore = true;
    } catch (err) {
      console.warn(`Exclusão do fruto "${normalizedId}" foi salva localmente, mas não sincronizada com o Firestore:`, err);
    }

    try {
      await deleteDoc(doc(db, 'fruits', id));
    } catch (err) {
      console.warn(`Falha ao excluir o registro remoto do fruto "${id}"; a marca de exclusão continuará ocultando-o:`, err);
    }

    return syncedToFirestore;
  }
}

export const fruitStorageService = new FruitStorageService();
