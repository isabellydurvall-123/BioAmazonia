import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import { BiochemistryTopic, UserProfile } from '../types';
import { BIOCHEMISTRY_TOPICS } from '../data/biochemistryTopicsData';

const LOCAL_STORAGE_KEY = 'bioamazonia_biochem_topics_v2';

export interface ITopicStorageService {
  list(statusFilter?: 'all' | 'publicado' | 'rascunho' | 'em_revisao', currentUser?: UserProfile | null): Promise<BiochemistryTopic[]>;
  listCachedSync(statusFilter?: 'all' | 'publicado' | 'rascunho' | 'em_revisao', currentUser?: UserProfile | null): BiochemistryTopic[];
  get(id: string): Promise<BiochemistryTopic | null>;
  create(topic: BiochemistryTopic, currentUser?: UserProfile | null): Promise<BiochemistryTopic>;
  update(topic: BiochemistryTopic, currentUser?: UserProfile | null): Promise<BiochemistryTopic>;
  delete(id: string, currentUser?: UserProfile | null): Promise<void>;
  subscribe(callback: () => void): () => void;
}

class TopicStorageService implements ITopicStorageService {
  private localCache: BiochemistryTopic[] = [];
  private listeners: Set<() => void> = new Set();

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
        console.error('Erro em subscriber de tópicos educativos:', err);
      }
    });
  }

  private initLocalCache() {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        this.localCache = JSON.parse(stored);
      } else {
        this.localCache = [...BIOCHEMISTRY_TOPICS];
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.localCache));
      }
    } catch {
      this.localCache = [...BIOCHEMISTRY_TOPICS];
    }
  }

  private saveToLocalCache() {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.localCache));
    } catch (e) {
      console.warn('Falha ao salvar tópicos no cache:', e);
    }
  }

  public listCachedSync(
    statusFilter: 'all' | 'publicado' | 'rascunho' | 'em_revisao' = 'all',
    currentUser?: UserProfile | null
  ): BiochemistryTopic[] {
    if (!this.localCache || this.localCache.length === 0) {
      this.initLocalCache();
    }
    const isPrivileged = currentUser?.role === 'admin' || currentUser?.role === 'researcher';

    return this.localCache.filter(topic => {
      if (!isPrivileged) {
        return topic.verificationStatus === 'Validado por Literatura Indexada' || (topic.verificationStatus as string) === 'publicado';
      }

      if (statusFilter === 'all') return true;
      if (statusFilter === 'publicado') {
        return topic.verificationStatus === 'Validado por Literatura Indexada' || (topic.verificationStatus as string) === 'publicado';
      }
      if (statusFilter === 'rascunho') {
        return topic.verificationStatus === 'Pendente de Verificação' || (topic.verificationStatus as string) === 'rascunho';
      }
      if (statusFilter === 'em_revisao') {
        return topic.verificationStatus === 'Em Revisão por Pares' || (topic.verificationStatus as string) === 'em_revisao';
      }
      return true;
    }).sort((a, b) => a.order - b.order);
  }

  public async list(
    statusFilter: 'all' | 'publicado' | 'rascunho' | 'em_revisao' = 'all',
    currentUser?: UserProfile | null
  ): Promise<BiochemistryTopic[]> {
    try {
      const col = collection(db, 'topics');
      const snap = await getDocs(col);
      if (!snap.empty) {
        const firestoreList: BiochemistryTopic[] = [];
        snap.forEach(d => {
          firestoreList.push(d.data() as BiochemistryTopic);
        });

        const map = new Map(this.localCache.map(t => [t.id, t]));
        firestoreList.forEach(t => map.set(t.id, t));
        this.localCache = Array.from(map.values()).sort((a, b) => a.order - b.order);
        this.saveToLocalCache();
      }
    } catch (e) {
      console.warn('Recuperando tópicos educativos do cache local:', e);
    }

    const isPrivileged = currentUser?.role === 'admin' || currentUser?.role === 'researcher';

    return this.localCache.filter(topic => {
      // Regra de Publicação para visitantes
      if (!isPrivileged) {
        return topic.verificationStatus === 'Validado por Literatura Indexada' || (topic.verificationStatus as string) === 'publicado';
      }

      if (statusFilter === 'all') return true;
      if (statusFilter === 'publicado') {
        return topic.verificationStatus === 'Validado por Literatura Indexada' || (topic.verificationStatus as string) === 'publicado';
      }
      if (statusFilter === 'rascunho') {
        return topic.verificationStatus === 'Pendente de Verificação' || (topic.verificationStatus as string) === 'rascunho';
      }
      if (statusFilter === 'em_revisao') {
        return topic.verificationStatus === 'Em Revisão por Pares' || (topic.verificationStatus as string) === 'em_revisao';
      }
      return true;
    });
  }

  public async get(id: string): Promise<BiochemistryTopic | null> {
    try {
      const docRef = doc(db, 'topics', id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as BiochemistryTopic;
      }
    } catch (e) {
      console.warn('Recuperando tópico do cache:', e);
    }
    return this.localCache.find(t => t.id === id) || null;
  }

  public async create(topicData: BiochemistryTopic, currentUser?: UserProfile | null): Promise<BiochemistryTopic> {
    if (!currentUser || currentUser.role === 'visitor') {
      throw new Error('Acesso negado: Apenas pesquisadores e administradores autorizados podem cadastrar conteúdos educativos.');
    }

    if (!topicData.id || !topicData.title || !topicData.category || !topicData.shortSummary) {
      throw new Error('Campos obrigatórios ausentes: Identificador, Título, Categoria e Resumo Introdutório.');
    }

    const exists = this.localCache.some(t => t.id.toLowerCase() === topicData.id.toLowerCase());
    if (exists) {
      throw new Error(`Já existe um tópico educativo com o ID "${topicData.id}".`);
    }

    const newTopic: BiochemistryTopic = {
      ...topicData,
      order: topicData.order || this.localCache.length + 1,
      updatedAt: new Date().toLocaleDateString('pt-BR')
    };

    try {
      const docRef = doc(db, 'topics', newTopic.id);
      await setDoc(docRef, newTopic);
    } catch (err) {
      console.warn('Persistindo tópico no repositório local:', err);
    }

    this.localCache.push(newTopic);
    this.localCache.sort((a, b) => a.order - b.order);
    this.saveToLocalCache();
    this.notify();
    return newTopic;
  }

  public async update(topicData: BiochemistryTopic, currentUser?: UserProfile | null): Promise<BiochemistryTopic> {
    if (!currentUser || currentUser.role === 'visitor') {
      throw new Error('Acesso negado: Apenas pesquisadores e administradores autorizados podem editar conteúdos educativos.');
    }

    const existing = this.localCache.find(t => t.id === topicData.id);
    if (!existing) {
      throw new Error('Tópico educativo não encontrado para atualização.');
    }

    const isPublished = existing.verificationStatus === 'Validado por Literatura Indexada' || (existing.verificationStatus as string) === 'publicado';
    if (isPublished && currentUser.role !== 'admin') {
      topicData.verificationStatus = 'Em Revisão por Pares';
    }

    const updatedTopic: BiochemistryTopic = {
      ...topicData,
      updatedAt: new Date().toLocaleDateString('pt-BR')
    };

    try {
      const docRef = doc(db, 'topics', updatedTopic.id);
      await updateDoc(docRef, { ...updatedTopic });
    } catch (err) {
      console.warn('Atualizando tópico no repositório local:', err);
    }

    this.localCache = this.localCache.map(t => t.id === updatedTopic.id ? updatedTopic : t);
    this.saveToLocalCache();
    this.notify();
    return updatedTopic;
  }

  public async delete(id: string, currentUser?: UserProfile | null): Promise<void> {
    if (currentUser?.role !== 'admin') {
      throw new Error('Acesso negado: Apenas administradores curadores podem excluir conteúdos educativos.');
    }

    try {
      const docRef = doc(db, 'topics', id);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn('Excluindo tópico do cache local:', err);
    }

    this.localCache = this.localCache.filter(t => t.id !== id);
    this.saveToLocalCache();
    this.notify();
  }
}

export const topicStorageService = new TopicStorageService();
