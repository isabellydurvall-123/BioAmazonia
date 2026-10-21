import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile, UserRole } from '../types';

export const ADMIN_EMAIL = 'adailtonc716@gmail.com';
export const MASTER_ADMIN_EMAILS = [ADMIN_EMAIL, 'isabellydurvall@gmail.com'];
const LOCAL_USERS_KEY = 'bioamazonia_registered_users_v2';

export const isMasterAdminEmail = (email: string): boolean =>
  MASTER_ADMIN_EMAILS.some(masterEmail => masterEmail === email.trim().toLowerCase());

export interface IUserManagementService {
  listUsers(currentAdmin: UserProfile | null): Promise<UserProfile[]>;
  createResearcher(
    data: { email: string; displayName: string; institution?: string }, 
    currentAdmin: UserProfile | null
  ): Promise<UserProfile>;
  updateUserProfile(
    userId: string,
    data: { displayName?: string; institution?: string; role?: UserRole },
    currentAdmin: UserProfile | null
  ): Promise<UserProfile>;
  updateUserRole(userId: string, newRole: UserRole, currentAdmin: UserProfile | null): Promise<void>;
  deleteUser(userId: string, currentAdmin: UserProfile | null): Promise<void>;
  findAuthorizedUserByEmail(email: string): Promise<UserProfile | null>;
  findAuthorizedRoleByEmail(email: string): Promise<UserRole | null>;
  syncGoogleUser(profile: UserProfile): void;
  subscribe(callback: () => void): () => void;
}

class UserManagementService implements IUserManagementService {
  private localCache: UserProfile[] = [];
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
        console.error('Erro em subscriber de usuários:', err);
      }
    });
  }

  private initLocalCache() {
    try {
      const stored = localStorage.getItem(LOCAL_USERS_KEY);
      if (stored) {
        this.localCache = JSON.parse(stored);
      } else {
        // Inicializar com o Administrador Curador oficial do projeto
        this.localCache = [
          {
            uid: 'admin-master-adailton',
            email: ADMIN_EMAIL,
            displayName: 'Adailton (Administrador Curador)',
            role: 'admin',
            institution: 'Coordenação Geral BioAmazônia / INPA',
            createdAt: '2026-10-14T08:00:00Z',
            updatedAt: '2026-10-18T09:00:00Z'
          }
        ];
        localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(this.localCache));
      }
    } catch {
      this.localCache = [
        {
          uid: 'admin-master-adailton',
          email: ADMIN_EMAIL,
          displayName: 'Adailton (Administrador Curador)',
          role: 'admin',
          institution: 'Coordenação Geral BioAmazônia / INPA',
          createdAt: '2026-10-14T08:00:00Z',
          updatedAt: '2026-10-18T09:00:00Z'
        }
      ];
    }
  }

  private saveToLocalCache() {
    try {
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(this.localCache));
    } catch (e) {
      console.warn('Falha ao salvar usuários no cache local:', e);
    }
  }

  public async listUsers(currentAdmin: UserProfile | null): Promise<UserProfile[]> {
    if (currentAdmin?.role !== 'admin') {
      throw new Error('Acesso negado: Apenas o Administrador Curador possui permissão para visualizar e gerenciar o cadastro de usuários e pesquisadores.');
    }

    try {
      const usersCol = collection(db, 'users');
      const snap = await getDocs(usersCol);
      if (!snap.empty) {
        const remoteUsers: UserProfile[] = [];
        snap.forEach(d => {
          remoteUsers.push(d.data() as UserProfile);
        });

        // Mesclar com cache local preservando o admin master
        const map = new Map(this.localCache.map(u => [u.email.toLowerCase(), u]));
        remoteUsers.forEach(u => {
          const existing = map.get(u.email.toLowerCase());
          if (existing) {
            // Se o remoto tiver campos preenchidos, preserva, mas não deixa institution genérica sobrepor
            map.set(u.email.toLowerCase(), {
              ...existing,
              ...u,
              institution: u.institution || existing.institution
            });
          } else {
            map.set(u.email.toLowerCase(), u);
          }
        });
        this.localCache = Array.from(map.values());
        this.saveToLocalCache();
      }
    } catch (e) {
      console.warn('Recuperando listagem de usuários do repositório local:', e);
    }

    return this.localCache;
  }

  public async createResearcher(
    data: { email: string; displayName: string; institution?: string },
    currentAdmin: UserProfile | null
  ): Promise<UserProfile> {
    if (currentAdmin?.role !== 'admin') {
      throw new Error('Acesso negado: Somente o Administrador Curador pode cadastrar e autorizar um Pesquisador de Bancada.');
    }

    const emailTrimmed = data.email.trim().toLowerCase();
    const nameTrimmed = data.displayName.trim();
    const instTrimmed = data.institution?.trim() || 'Laboratório de Fitoquímica / BioAmazônia';

    if (!emailTrimmed || !nameTrimmed) {
      throw new Error('E-mail institucional e Nome do pesquisador são obrigatórios.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrimmed)) {
      throw new Error('Informe um formato de e-mail válido para o pesquisador.');
    }

    const now = new Date().toISOString();

    // 1. Verificar se já existe cadastrado no cache local
    const existing = this.localCache.find(u => u.email.toLowerCase() === emailTrimmed);
    if (existing) {
      const updated: UserProfile = {
        ...existing,
        displayName: nameTrimmed,
        institution: instTrimmed,
        role: 'researcher',
        updatedAt: now
      };

      try {
        const docRef = doc(db, 'users', existing.uid);
        await updateDoc(docRef, {
          displayName: nameTrimmed,
          institution: instTrimmed,
          role: 'researcher',
          updatedAt: now
        });
      } catch (e) {
        console.warn('Atualizando perfil no Firestore:', e);
      }

      try {
        await setDoc(doc(db, 'authorized_emails', emailTrimmed), {
          email: emailTrimmed,
          displayName: nameTrimmed,
          institution: instTrimmed,
          role: 'researcher',
          authorizedBy: currentAdmin?.email,
          updatedAt: now
        }, { merge: true });
      } catch (e) {
        console.warn('Salvando em authorized_emails:', e);
      }

      this.localCache = this.localCache.map(u => u.uid === existing.uid ? updated : u);
      this.saveToLocalCache();
      this.notify();
      return updated;
    }

    // 2. Novo cadastro: gerar UID sanitizado
    const sanitizedId = 'res_' + emailTrimmed.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 40) + '_' + Date.now().toString().slice(-4);

    const newProfile: UserProfile = {
      uid: sanitizedId,
      email: emailTrimmed,
      displayName: nameTrimmed,
      role: 'researcher',
      institution: instTrimmed,
      createdAt: now,
      updatedAt: now
    };

    try {
      const docRef = doc(db, 'users', newProfile.uid);
      await setDoc(docRef, newProfile);
    } catch (e) {
      console.warn('Persistindo cadastro de pesquisador em users:', e);
    }

    try {
      await setDoc(doc(db, 'authorized_emails', emailTrimmed), {
        email: emailTrimmed,
        displayName: nameTrimmed,
        institution: instTrimmed,
        role: 'researcher',
        authorizedBy: currentAdmin?.email,
        createdAt: now,
        updatedAt: now
      }, { merge: true });
    } catch (e) {
      console.warn('Persistindo cadastro de pesquisador em authorized_emails:', e);
    }

    this.localCache.unshift(newProfile);
    this.saveToLocalCache();
    this.notify();
    return newProfile;
  }

  public async updateUserProfile(
    userId: string,
    data: { displayName?: string; institution?: string; role?: UserRole },
    currentAdmin: UserProfile | null
  ): Promise<UserProfile> {
    if (currentAdmin?.role !== 'admin') {
      throw new Error('Acesso negado: Somente o Administrador Curador pode alterar dados e permissões.');
    }

    const target = this.localCache.find(u => u.uid === userId);
    if (!target) throw new Error('Usuário não encontrado.');

    if (isMasterAdminEmail(target.email) && data.role && data.role !== 'admin') {
      throw new Error('Operação bloqueada: Não é permitido remover as permissões do Administrador Principal.');
    }

    const now = new Date().toISOString();
    const updated: UserProfile = {
      ...target,
      displayName: data.displayName !== undefined && data.displayName.trim() ? data.displayName.trim() : target.displayName,
      institution: data.institution !== undefined && data.institution.trim() ? data.institution.trim() : target.institution,
      role: data.role !== undefined ? data.role : target.role,
      updatedAt: now
    };

    try {
      const docRef = doc(db, 'users', userId);
      await setDoc(docRef, updated, { merge: true });
    } catch (e) {
      console.warn('Persistindo atualização de perfil em users:', e);
    }

    try {
      await setDoc(doc(db, 'authorized_emails', target.email.toLowerCase()), {
        email: target.email.toLowerCase(),
        displayName: updated.displayName,
        institution: updated.institution,
        role: updated.role,
        updatedAt: now
      }, { merge: true });
    } catch (e) {
      console.warn('Atualizando authorized_emails:', e);
    }

    this.localCache = this.localCache.map(u => u.uid === userId ? updated : u);
    this.saveToLocalCache();
    this.notify();
    return updated;
  }

  public async updateUserRole(userId: string, newRole: UserRole, currentAdmin: UserProfile | null): Promise<void> {
    await this.updateUserProfile(userId, { role: newRole }, currentAdmin);
  }

  public async deleteUser(userId: string, currentAdmin: UserProfile | null): Promise<void> {
    if (currentAdmin?.role !== 'admin') {
      throw new Error('Acesso negado: Somente o Administrador Curador pode revogar e excluir cadastros de pesquisadores.');
    }

    const target = this.localCache.find(u => u.uid === userId);
    if (target && isMasterAdminEmail(target.email)) {
      throw new Error('Operação bloqueada: O Administrador Principal não pode ser excluído.');
    }

    if (target) {
      try {
        await deleteDoc(doc(db, 'users', userId));
      } catch (e) {
        console.warn('Excluindo usuário de users:', e);
      }

      try {
        await deleteDoc(doc(db, 'authorized_emails', target.email.toLowerCase()));
      } catch (e) {
        console.warn('Excluindo usuário de authorized_emails:', e);
      }
    }

    this.localCache = this.localCache.filter(u => u.uid !== userId);
    this.saveToLocalCache();
    this.notify();
  }

  public async findAuthorizedUserByEmail(email: string): Promise<UserProfile | null> {
    const cleanEmail = email.trim().toLowerCase();
    if (isMasterAdminEmail(cleanEmail)) {
      const found = this.localCache.find(u => u.email.toLowerCase() === cleanEmail);
      return found || {
        uid: `admin-master-${cleanEmail.replace(/[^a-z0-9]+/g, '-')}`,
        email: cleanEmail,
        displayName: cleanEmail === ADMIN_EMAIL ? 'Adailton (Administrador Curador)' : 'Isabelly (Administradora Curadora)',
        role: 'admin',
        institution: 'Coordenação Geral BioAmazônia / INPA',
        createdAt: '2026-10-14T08:00:00Z',
        updatedAt: '2026-10-18T09:00:00Z'
      };
    }

    // 1. Checar na coleção authorized_emails do Firestore (prioridade da autorização do Admin)
    try {
      const authSnap = await getDoc(doc(db, 'authorized_emails', cleanEmail));
      if (authSnap.exists()) {
        const data = authSnap.data();
        return {
          uid: 'auth_' + cleanEmail,
          email: cleanEmail,
          displayName: data.displayName || 'Pesquisador de Bancada',
          role: (data.role as UserRole) || 'researcher',
          institution: data.institution || 'Laboratório de Fitoquímica / BioAmazônia',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString()
        };
      }
    } catch (e) {
      console.warn('Consulta a authorized_emails falhou:', e);
    }

    // 2. Checar no cache local
    const localFound = this.localCache.find(u => u.email.toLowerCase() === cleanEmail);
    if (localFound && localFound.institution && localFound.institution !== 'Laboratório de Fitoquímica / Pesquisa de Bancada') {
      return localFound;
    }

    // 3. Checar na coleção users do Firestore
    try {
      const usersCol = collection(db, 'users');
      const q = query(usersCol, where('email', '==', cleanEmail));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const u = snap.docs[0].data() as UserProfile;
        return u;
      }
    } catch {
      // fallback
    }

    return localFound || null;
  }

  public async findAuthorizedRoleByEmail(email: string): Promise<UserRole | null> {
    const user = await this.findAuthorizedUserByEmail(email);
    return user ? user.role : null;
  }

  public syncGoogleUser(profile: UserProfile): void {
    const cleanEmail = profile.email.toLowerCase();
    const existingIndex = this.localCache.findIndex(u => u.email.toLowerCase() === cleanEmail);
    if (existingIndex >= 0) {
      const old = this.localCache[existingIndex];
      this.localCache[existingIndex] = {
        ...old,
        ...profile,
        // Preserva a instituição personalizada se a nova veio com o texto genérico
        institution: (old.institution && old.institution !== 'Laboratório de Fitoquímica / Pesquisa de Bancada')
          ? old.institution
          : profile.institution
      };
    } else {
      this.localCache.unshift(profile);
    }
    this.saveToLocalCache();
  }
}

export const userManagementService = new UserManagementService();
