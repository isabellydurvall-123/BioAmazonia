import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut as fbSignOut,
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db, testFirestoreConnection } from '../services/firebase';
import { UserProfile, UserRole } from '../types';
import { userManagementService } from '../services/userManagementService';

interface AuthContextType {
  currentUser: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  role: UserRole;
  isVisitor: boolean;
  isResearcher: boolean;
  isAdmin: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const ADMIN_EMAIL = 'isabellydurvall@gmail.com';
const LOCAL_USER_KEY = 'bioamazonia_active_auth_profile_v3';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_USER_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return null;
  });

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Monitorar estado de autenticação real do Firebase Auth
  useEffect(() => {
    testFirestoreConnection();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user && user.email) {
        try {
          const cleanEmail = user.email.toLowerCase();
          const userDocRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userDocRef);

          // Buscar dados pré-cadastrados ou cadastrados pelo Administrador Curador
          const preAuthorizedUser = await userManagementService.findAuthorizedUserByEmail(cleanEmail);

          let resolvedRole: UserRole = 'visitor';

          // 1. O Administrador Curador é determinado pelo e-mail mestre autorizado
          if (cleanEmail === ADMIN_EMAIL.toLowerCase()) {
            resolvedRole = 'admin';
          } else if (preAuthorizedUser?.role) {
            resolvedRole = preAuthorizedUser.role;
          } else if (userSnap.exists()) {
            const data = userSnap.data();
            resolvedRole = (data.role as UserRole) || 'visitor';
          } else {
            resolvedRole = 'visitor';
          }

          // 2. Resolver Instituição / Laboratório (priorizando a informação cadastrada pelo Administrador)
          let resolvedInstitution = '';
          if (preAuthorizedUser?.institution && preAuthorizedUser.institution.trim().length > 0) {
            resolvedInstitution = preAuthorizedUser.institution.trim();
          } else if (userSnap.exists() && userSnap.data()?.institution && userSnap.data().institution.trim().length > 0) {
            resolvedInstitution = userSnap.data().institution.trim();
          } else if (resolvedRole === 'admin') {
            resolvedInstitution = 'Coordenação Curatorial BioAmazônia / INPA';
          } else if (resolvedRole === 'researcher') {
            resolvedInstitution = 'Laboratório de Fitoquímica / Pesquisa de Bancada';
          } else {
            resolvedInstitution = 'Consulta Pública';
          }

          // 3. Resolver Nome de Exibição
          let resolvedDisplayName = user.displayName || '';
          if (preAuthorizedUser?.displayName && preAuthorizedUser.displayName.trim().length > 0) {
            resolvedDisplayName = preAuthorizedUser.displayName.trim();
          } else if (userSnap.exists() && userSnap.data()?.displayName && userSnap.data().displayName.trim().length > 0) {
            resolvedDisplayName = userSnap.data().displayName.trim();
          } else if (!resolvedDisplayName) {
            resolvedDisplayName = resolvedRole === 'admin' ? 'Administrador Curador' : 'Usuário BioAmazônia';
          }

          const profile: UserProfile = {
            uid: user.uid,
            email: user.email,
            displayName: resolvedDisplayName,
            role: resolvedRole,
            institution: resolvedInstitution,
            createdAt: userSnap.exists() ? (userSnap.data().createdAt || new Date().toISOString()) : (preAuthorizedUser?.createdAt || new Date().toISOString()),
            updatedAt: new Date().toISOString()
          };

          // Salvar ou atualizar perfil no Firestore
          try {
            await setDoc(userDocRef, profile, { merge: true });
          } catch (e) {
            console.warn('Persistência do perfil no Firestore:', e);
          }

          userManagementService.syncGoogleUser(profile);

          setCurrentUser(profile);
          localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profile));
        } catch (e) {
          console.warn('Erro ao processar perfil do Firebase:', e);
        }
      } else {
        // Usuário deslogado do Firebase
        setCurrentUser(null);
        localStorage.removeItem(LOCAL_USER_KEY);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Erro no login Google:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await fbSignOut(auth);
    } catch (e) {
      console.warn('Erro ao deslogar do Firebase:', e);
    } finally {
      setCurrentUser(null);
      setFirebaseUser(null);
      localStorage.removeItem(LOCAL_USER_KEY);
      setIsLoading(false);
    }
  };

  const role: UserRole = currentUser?.role || 'visitor';
  const isVisitor = !currentUser || role === 'visitor';
  const isResearcher = role === 'researcher' || role === 'admin';
  const isAdmin = role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        isLoading,
        role,
        isVisitor,
        isResearcher,
        isAdmin,
        loginWithGoogle,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};
