/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PageRoute } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { OfflineIndicator } from './components/OfflineIndicator';
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { FruitDetailPage } from './pages/FruitDetailPage';
import { BiochemistryPage } from './pages/BiochemistryPage';
import { ExperimentsPage } from './pages/ExperimentsPage';
import { ConservationPage } from './pages/ConservationPage';
import { StabilityPage } from './pages/StabilityPage';
import { ReferencesPage } from './pages/ReferencesPage';
import { LoginPage } from './pages/LoginPage';
import { AdminPage } from './pages/AdminPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AuthProvider } from './contexts/AuthContext';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageRoute>('home');
  const [selectedFruitId, setSelectedFruitId] = useState<string>('camu-camu');
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isPageLoading, setIsPageLoading] = useState<boolean>(false);
  const [isNotFound, setIsNotFound] = useState<boolean>(false);

  // Sincronização robusta de rotas via hash da URL para funcionar como PWA e SPA
  useEffect(() => {
    const handleHashChange = () => {
      const rawHash = window.location.hash.replace(/^#\/?/, '').trim();
      
      if (!rawHash || rawHash === '' || rawHash === 'home') {
        setCurrentPage('home');
        setIsNotFound(false);
        return;
      }

      // Suporte a sub-rotas como #fruto/camu-camu ou #fruto?id=camu-camu
      if (rawHash.startsWith('fruto/') || rawHash.startsWith('fruto?')) {
        let fruitId = 'camu-camu';
        if (rawHash.startsWith('fruto/')) {
          fruitId = rawHash.replace('fruto/', '').split('?')[0].trim();
        } else if (rawHash.includes('id=')) {
          const params = new URLSearchParams(rawHash.split('?')[1]);
          fruitId = params.get('id') || 'camu-camu';
        }
        setSelectedFruitId(fruitId);
        setCurrentPage('fruto');
        setIsNotFound(false);
        return;
      }

      // Suporte a sub-rotas de bioquímica como #bioquimica/antocianinas ou #bioquimica?topico=vitamina-c
      if (rawHash.startsWith('bioquimica/') || rawHash.startsWith('bioquimica?')) {
        let topicId: string | null = null;
        if (rawHash.startsWith('bioquimica/')) {
          topicId = rawHash.replace('bioquimica/', '').split('?')[0].trim();
        } else if (rawHash.includes('topico=')) {
          const params = new URLSearchParams(rawHash.split('?')[1]);
          topicId = params.get('topico');
        }
        setSelectedTopicId(topicId);
        setCurrentPage('bioquimica');
        setIsNotFound(false);
        return;
      }

      // Parâmetros de rota padrão
      const [routePart, queryPart] = rawHash.split('?');
      const validRoutes: PageRoute[] = [
        'home',
        'catalogo',
        'fruto',
        'bioquimica',
        'experimentos',
        'conservacao',
        'estabilidade',
        'referencias',
        'login',
        'admin',
      ];

      if (validRoutes.includes(routePart as PageRoute)) {
        setCurrentPage(routePart as PageRoute);
        setIsNotFound(false);

        if (routePart === 'bioquimica') {
          setSelectedTopicId(null);
        }

        if (queryPart) {
          const params = new URLSearchParams(queryPart);
          const f = params.get('fruto') || params.get('id');
          if (f) setSelectedFruitId(f);
          const top = params.get('topico');
          if (top) setSelectedTopicId(top);
        }
      } else {
        setIsNotFound(true);
      }
    };

    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (page: PageRoute, targetId?: string) => {
    setIsPageLoading(true);
    setIsNotFound(false);

    if (page === 'fruto' && targetId) {
      setSelectedFruitId(targetId);
      window.location.hash = `#fruto/${targetId}`;
    } else if (page === 'bioquimica' && targetId) {
      setSelectedTopicId(targetId);
      window.location.hash = `#bioquimica/${targetId}`;
    } else if (page === 'bioquimica' && !targetId) {
      setSelectedTopicId(null);
      window.location.hash = `#bioquimica`;
    } else if (targetId) {
      window.location.hash = `#${page}?id=${targetId}`;
    } else {
      window.location.hash = `#${page}`;
    }

    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setTimeout(() => {
      setIsPageLoading(false);
    }, 120);
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-[#fbfcfb] text-[#1a2e1d]">
        
        {/* Barra de Progresso Sutil de Carregamento */}
        {isPageLoading && (
          <div className="fixed top-0 left-0 right-0 h-0.5 bg-emerald-700 z-50 animate-pulse" />
        )}

        {/* Indicador de Conexão Offline para o PWA */}
        <OfflineIndicator />

        {/* Navegação Principal com PWA Install */}
        <Navbar
          currentPage={currentPage}
          onNavigate={navigateTo}
          isLoggedIn={isLoggedIn}
        />

        {/* Conteúdo da Página Ativa */}
        <main className="flex-1">
          {isNotFound ? (
            <NotFoundPage onNavigate={navigateTo} />
          ) : (
            <>
              {currentPage === 'home' && (
                <HomePage onNavigate={navigateTo} />
              )}

              {currentPage === 'catalogo' && (
                <CatalogPage onNavigate={navigateTo} />
              )}

              {currentPage === 'fruto' && (
                <FruitDetailPage
                  fruitId={selectedFruitId}
                  onNavigate={navigateTo}
                />
              )}

              {currentPage === 'bioquimica' && (
                <BiochemistryPage
                  initialTopicId={selectedTopicId}
                  onNavigate={navigateTo}
                />
              )}

              {currentPage === 'experimentos' && (
                <ExperimentsPage />
              )}

              {currentPage === 'conservacao' && (
                <ConservationPage />
              )}

              {currentPage === 'estabilidade' && (
                <StabilityPage />
              )}

              {currentPage === 'referencias' && (
                <ReferencesPage />
              )}

              {currentPage === 'login' && (
                <LoginPage
                  onLoginSuccess={handleLoginSuccess}
                  onNavigate={navigateTo}
                />
              )}

              {currentPage === 'admin' && (
                <AdminPage
                  onLogout={handleLogout}
                  onNavigate={navigateTo}
                />
              )}
            </>
          )}
        </main>

        {/* Rodapé Científico */}
        <Footer onNavigate={navigateTo} />

      </div>
    </AuthProvider>
  );
}
