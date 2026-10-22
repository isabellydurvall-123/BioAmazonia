import React, { useState } from 'react';
import { PageRoute } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, ShieldCheck, UserCheck, LogIn } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  currentPage: PageRoute;
  onNavigate: (page: PageRoute) => void;
  isLoggedIn?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const { currentUser, isAdmin, isResearcher, isVisitor } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Top Bar Contract: 4-5 primary single-line links for Zone 2
  const primaryLinks: { id: PageRoute; label: string }[] = [
    { id: 'home', label: 'Início' },
    { id: 'catalogo', label: 'Catálogo' },
    { id: 'bioquimica', label: 'Bioquímica' },
    { id: 'experimentos', label: 'Experimentos' },
    { id: 'estabilidade', label: 'Estabilidade' },
  ];

  // Additional secondary links
  const secondaryLinks: { id: PageRoute; label: string }[] = [
    { id: 'conservacao', label: 'Conservação' },
    { id: 'referencias', label: 'Referências' },
  ];

  const handleLinkClick = (page: PageRoute) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200/90 text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Bar 3-Zone Contract */}
        <div className="flex items-center justify-between gap-8 h-16">
          
          {/* Zone 1: Wordmark / Brand element */}
          <button
            onClick={() => handleLinkClick('home')}
            className="flex items-center gap-2.5 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 rounded-md"
          >
            <div className="w-8 h-8 rounded-md bg-emerald-800 flex items-center justify-center text-white font-bold text-sm shadow-xs transition-transform group-hover:scale-105">
              BA
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-emerald-950 font-display whitespace-nowrap">
                BioAmazônia
              </span>
            </div>
          </button>

          {/* Zone 2: 4-5 single-line nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            {primaryLinks.map((link) => {
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.id)}
                  className={`relative py-1 text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 rounded ${
                    isActive ? 'text-emerald-900 font-semibold' : 'text-slate-600 hover:text-emerald-950'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-emerald-700 rounded-full" />
                  )}
                </button>
              );
            })}

            {secondaryLinks.map((link) => {
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.id)}
                  className={`relative py-1 text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 rounded ${
                    isActive ? 'text-emerald-900 font-semibold' : 'text-slate-500 hover:text-emerald-950'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-emerald-700 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Action & PWA Install Button */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <PWAInstallButton />

            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleLinkClick(isResearcher ? 'admin' : 'login')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors whitespace-nowrap ${
                    currentPage === 'admin'
                      ? 'bg-emerald-900 text-white border-emerald-900'
                      : isResearcher
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{isAdmin ? 'Curador Geral' : isResearcher ? 'Pesquisador' : 'Visitante'}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleLinkClick('login')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-emerald-950 bg-emerald-50 border border-emerald-200/80 rounded-md hover:bg-emerald-100/90 transition-colors whitespace-nowrap"
              >
                <LogIn className="w-3.5 h-3.5 text-emerald-800" />
                <span>Acesso do Laboratório</span>
              </button>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center gap-2">
            <PWAInstallButton />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              aria-label={mobileMenuOpen ? 'Fechar navegação' : 'Abrir navegação'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 shadow-lg animate-in fade-in duration-150">
          <div className="space-y-1">
            <div className="text-[11px] font-semibold text-emerald-800 tracking-wider uppercase px-3 py-1">
              Plataforma Científica
            </div>
            {[...primaryLinks, ...secondaryLinks].map((link) => {
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-900 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-emerald-900'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
            
            <div className="pt-3 border-t border-slate-100 mt-2 space-y-2">
              <div className="w-full flex justify-center pb-1">
                <PWAInstallButton />
              </div>
              <button
                onClick={() => handleLinkClick(currentUser ? (isResearcher ? 'admin' : 'login') : 'login')}
                className="w-full text-left px-3 py-2.5 rounded-md text-sm font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 transition-colors"
              >
                {currentUser 
                  ? (isResearcher ? 'Painel Administrativo do Laboratório' : 'Minha Conta / Permissões') 
                  : 'Acesso de Pesquisador (Login)'}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
