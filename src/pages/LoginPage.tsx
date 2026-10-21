import React, { useState } from 'react';
import { PageRoute } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { ShieldCheck, AlertCircle, Sparkles, CheckCircle2, LogOut, ArrowRight, UserCheck, Loader2 } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: () => void;
  onNavigate: (page: PageRoute) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onNavigate }) => {
  const { currentUser, role, isVisitor, isResearcher, isAdmin, loginWithGoogle, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await loginWithGoogle();
      onLoginSuccess();
      if (role === 'admin' || role === 'researcher') {
        onNavigate('admin');
      }
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMessage('A janela de autenticação Google foi fechada antes de concluir.');
      } else if (err.code === 'auth/popup-blocked') {
        setErrorMessage('A janela popup foi bloqueada pelo navegador. Permita popups para autenticar com o Google.');
      } else {
        setErrorMessage(err.message || 'Falha ao autenticar com o Google.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-16">
      
      {/* Caixa de Autenticação */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        
        {/* Topo do Formulário */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-emerald-800 text-white font-bold flex items-center justify-center mx-auto text-lg shadow-xs">
            BA
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Autenticação &amp; Controle de Acesso
          </h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Plataforma Científica BioAmazônia — Gestão Fitoquímica e de Bancada
          </p>
        </div>

        {/* Informação sobre a Política de Permissões */}
        <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/90 rounded-lg space-y-1.5 text-xs text-emerald-950">
          <div className="font-semibold flex items-center gap-1.5 text-emerald-900">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            Acesso Restrito Baseado em Funções (RBAC)
          </div>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            O cadastro de <strong>Pesquisadores de Bancada</strong> é realizado exclusivamente pelo <strong>Administrador Curador</strong> do projeto. Usuários autenticados que ainda não possuam autorização prévia recebem permissão de <strong>Visitante</strong>.
          </p>
        </div>

        {/* Mensagem de Erro se houver */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Se já estiver autenticado com conta Google */}
        {currentUser ? (
          <div className="space-y-4 pt-1">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-slate-400">Sessão Ativa</span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                  isAdmin
                    ? 'bg-purple-100 text-purple-900 border border-purple-200'
                    : isResearcher
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                    : 'bg-slate-200 text-slate-800 border border-slate-300'
                }`}>
                  <UserCheck className="w-3 h-3" />
                  {isAdmin ? 'Administrador Curador' : isResearcher ? 'Pesquisador de Bancada' : 'Visitante'}
                </span>
              </div>

              <div>
                <div className="text-sm font-bold text-slate-900">{currentUser.displayName}</div>
                <div className="text-xs text-slate-500 font-mono">{currentUser.email}</div>
                <div className="text-xs font-semibold text-emerald-950 mt-1.5 flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded font-bold">
                    Instituição
                  </span>
                  <span>{currentUser.institution || 'Não informada'}</span>
                </div>
              </div>

              {isVisitor && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-900 leading-relaxed mt-2">
                  Sua conta está conectada como <strong>Visitante</strong>. Apenas pesquisadores cadastrados pelo Administrador podem registrar novos frutos, ensaios de bancada e diretrizes.
                </div>
              )}
            </div>

            {isResearcher ? (
              <button
                onClick={() => onNavigate('admin')}
                className="w-full py-2.5 px-4 rounded-md bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <span>Acessar Painel Administrativo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => onNavigate('home')}
                className="w-full py-2.5 px-4 rounded-md bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <span>Navegar pelo Acervo Público</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={handleLogout}
              className="w-full py-2 px-3 rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              Encerrar Sessão / Trocar de Conta
            </button>
          </div>
        ) : (
          /* Formulário de Acesso Autêntico com Google */
          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-3 hover:border-slate-400 disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 shrink-0 animate-spin text-emerald-700" />
                  <span>Verificando acesso...</span>
                </>
              ) : (
                <>
                  {/* Google SVG Logo */}
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Entrar com Conta Google Institucional</span>
                </>
              )}
            </button>

            <div className="text-[11px] text-slate-500 text-center leading-relaxed">
              Autenticação oficial protegida pelo Firebase Authentication e Google Cloud.
            </div>
          </div>
        )}

        <div className="text-center pt-2 border-t border-slate-100">
          <button
            onClick={() => onNavigate('home')}
            className="text-xs text-slate-500 hover:text-emerald-800 transition-colors"
          >
            ← Retornar à página pública
          </button>
        </div>

      </div>

    </div>
  );
};