import React, { useState } from 'react';
import { UnifiedExperimentRecord } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { AlertTriangle, Trash2, X, Lock, LogIn, CheckCircle2 } from 'lucide-react';

interface DeleteExperimentModalProps {
  isOpen: boolean;
  record: UnifiedExperimentRecord | null;
  onClose: () => void;
  onDeleted: () => void;
  onExecuteDelete: (record: UnifiedExperimentRecord) => Promise<void>;
}

export const DeleteExperimentModal: React.FC<DeleteExperimentModalProps> = ({
  isOpen,
  record,
  onClose,
  onDeleted,
  onExecuteDelete
}) => {
  const { currentUser, isAdmin, isVisitor } = useAuth();
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !record) return null;

  const isOfficialSeed = record.dataSource === 'demonstracao_inicial' && record.status === 'publicado';
  const canDelete = isAdmin || (!isOfficialSeed && !isVisitor) || (!isOfficialSeed && record.authorUid === currentUser?.uid);

  const handleConfirm = async () => {
    if (!canDelete) {
      setErrorMessage('Apenas o Administrador Curador pode excluir amostras oficiais publicadas de referência.');
      return;
    }

    setIsDeleting(true);
    setErrorMessage(null);

    try {
      await onExecuteDelete(record);
      onDeleted();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao excluir o registro. Tente novamente.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleGoToLogin = () => {
    window.location.hash = '#login';
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) onClose();
      }}
    >
      <div 
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
      >
        {/* Cabeçalho */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${canDelete ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'} shrink-0`}>
              {canDelete ? <Trash2 className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <h3 id="delete-dialog-title" className="text-base font-bold text-slate-900">
                {canDelete ? 'Excluir Amostra Experimental' : 'Acesso Restrito para Exclusão'}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Bancada de Ensaios Científicos
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Detalhes da Amostra Selecionada */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-mono font-bold text-slate-900 text-sm">
              {record.sampleCode}
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
              record.status === 'publicado' 
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' 
                : record.status === 'em_revisao' 
                ? 'bg-amber-100 text-amber-900 border border-amber-200' 
                : 'bg-slate-200 text-slate-800 border border-slate-300'
            }`}>
              {record.status === 'publicado' ? 'Publicado' : record.status === 'em_revisao' ? 'Em Revisão' : 'Rascunho'}
            </span>
          </div>

          <div className="text-slate-700">
            <span className="text-slate-500">Amostra: </span>
            <span className="font-medium">{record.fruitOrSample}</span>
          </div>

          <div className="text-slate-700">
            <span className="text-slate-500">Condição: </span>
            <span className="font-mono text-[11px] font-semibold text-emerald-900 bg-emerald-50/80 px-1.5 py-0.5 rounded border border-emerald-200/60">
              {record.experimentalCondition}
            </span>
          </div>

          {record.observations && (
            <p className="text-[11px] text-slate-500 italic bg-white p-2 rounded border border-slate-100 line-clamp-2">
              "{record.observations}"
            </p>
          )}
        </div>

        {/* Mensagem Explicativa ou Alerta */}
        {canDelete ? (
          <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl text-xs text-rose-950 space-y-1">
            <div className="font-semibold flex items-center gap-1.5 text-rose-900">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              Confirmação de Ação Destrutiva
            </div>
            <p className="text-[11px] text-rose-800 leading-relaxed">
              Esta medição será permanentemente removida da base de dados. As médias estatísticas, curvas cinéticas e tabelas do experimento serão recalculadas imediatamente.
            </p>
          </div>
        ) : (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950 space-y-2">
            <div className="font-semibold flex items-center gap-1.5 text-amber-900">
              <Lock className="w-4 h-4 text-amber-700 shrink-0" />
              Amostra Oficial Catalogada
            </div>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              Esta amostra faz parte do acervo de referência oficial do experimento. Apenas o <strong>Administrador Curador</strong> possui permissão no banco de dados para revogar registros oficiais.
            </p>
            {isVisitor && (
              <button
                type="button"
                onClick={handleGoToLogin}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Fazer Login como Administrador</span>
              </button>
            )}
          </div>
        )}

        {/* Mensagem de Erro */}
        {errorMessage && (
          <div className="p-2.5 bg-rose-100 border border-rose-300 rounded-lg text-xs text-rose-900 font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Botões de Ação */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {canDelete ? 'Cancelar' : 'Fechar'}
          </button>
          {canDelete && (
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isDeleting}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                  <span>Excluindo...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Excluir Definitivamente</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
