"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useLimparBanco } from '@/hooks/useApiData';
import { Trash2, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

interface ClearDataDialogProps {
  children: React.ReactNode;
}

export function ClearDataDialog({ children }: ClearDataDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  
  const clearMutation = useLimparBanco();

  const handleClearData = () => {
    if (confirmText.toLowerCase() === 'clear data') {
      clearMutation.mutate(undefined, {
        onSuccess: (data) => {
          console.log('Data cleared successfully:', data);
          setTimeout(() => {
            setIsOpen(false);
            setConfirmText('');
          }, 2000); // Fechar dialog após 2 segundos
        },
        onError: (error) => {
          console.error('Clear data failed:', error);
        }
      });
    }
  };

  const resetDialog = () => {
    clearMutation.reset();
    setConfirmText('');
  };

  const isConfirmValid = confirmText.toLowerCase() === 'clear data';

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => {
      setIsOpen(open);
      if (!open) {
        resetDialog();
      }
    }}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Limpar Todos os Dados
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Status do clear */}
          {clearMutation.isPending && (
            <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <Loader2 className="w-5 h-5 animate-spin text-yellow-600" />
              <span className="text-yellow-800">Limpando dados do banco...</span>
            </div>
          )}

          {clearMutation.isSuccess && (
            <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div className="text-green-800">
                <div className="font-medium">Dados limpos com sucesso!</div>
                <div className="text-sm">
                  Todos os dados foram removidos do banco de dados.
                </div>
              </div>
            </div>
          )}

          {clearMutation.isError && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div className="text-red-800">
                <div className="font-medium">Erro ao limpar dados</div>
                <div className="text-sm">
                  {(clearMutation.error as Error)?.message || 'Erro desconhecido'}
                </div>
              </div>
            </div>
          )}

          {/* Confirmação */}
          {!clearMutation.isPending && !clearMutation.isSuccess && (
            <>
              <div className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="text-red-800">
                      <div className="font-medium mb-2">⚠️ AÇÃO IRREVERSÍVEL</div>
                      <div className="text-sm space-y-1">
                        <p>• Esta ação vai <strong>deletar TODOS</strong> os dados do banco Supabase</p>
                        <p>• Todas as entregas, métricas e informações serão perdidas</p>
                        <p>• Não é possível desfazer esta operação</p>
                        <p>• O dashboard ficará vazio até o próximo upload</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Para confirmar, digite: <code className="bg-gray-100 px-1 rounded">clear data</code>
                  </label>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="Digite 'clear data' para confirmar"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleClearData}
                    disabled={!isConfirmValid}
                    className={`flex-1 px-4 py-2 rounded-md transition-colors flex items-center justify-center gap-2 ${
                      isConfirmValid 
                        ? 'bg-red-600 text-white hover:bg-red-700' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                    Limpar Dados
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Informações adicionais */}
          <div className="text-xs text-gray-500 space-y-1 border-t pt-3">
            <p>• Use esta função apenas quando necessário</p>
            <p>• Faça backup dos dados importantes antes de limpar</p>
            <p>• Esta ação afeta apenas o banco Supabase</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 