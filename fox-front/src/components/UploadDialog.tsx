"use client";

import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useUploadPlanilha } from '@/hooks/useApiData';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2, AlertTriangle } from 'lucide-react';

interface UploadDialogProps {
  children: React.ReactNode;
}

export function UploadDialog({ children }: UploadDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const uploadMutation = useUploadPlanilha();

  const handleFileSelect = (file: File) => {
    if (file && file.name.endsWith('.xlsx')) {
      uploadMutation.mutate(file, {
        onSuccess: (data) => {
          console.log('Upload successful:', data);
          // Aguardar um pouco mais para o dashboard atualizar antes de fechar
          setTimeout(() => setIsOpen(false), 3000); // Fechar dialog após 3 segundos
        },
        onError: (error) => {
          console.error('Upload failed:', error);
        }
      });
    } else {
      alert('Por favor, selecione um arquivo .xlsx válido');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const resetDialog = () => {
    uploadMutation.reset();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Upload de Planilha Excel
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Status do upload */}
          {uploadMutation.isPending && (
            <div className="space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <span className="text-blue-800 font-medium">Processando planilha...</span>
              </div>
              <div className="space-y-1 text-sm text-blue-700">
                <p>⏳ Este processo pode levar alguns minutos para planilhas grandes</p>
                <p>📊 Etapas: Leitura → Validação → Mapeamento → Salvamento no banco</p>
                <p className="text-xs text-blue-600 italic">💡 Não feche esta janela até a conclusão</p>
              </div>
            </div>
          )}

          {uploadMutation.isSuccess && (
            <div className="space-y-3">
              <div className="flex items-start gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="text-green-800 w-full">
                  <div className="font-medium">Upload realizado com sucesso!</div>
                  <div className="text-sm mt-2 space-y-1">
                    <div>📁 Arquivo: {uploadMutation.data?.arquivo} ({uploadMutation.data?.tamanho_mb} MB)</div>
                    <div>📖 Linhas lidas: {uploadMutation.data?.total_linhas_planilha}</div>
                    <div>✅ Registros válidos: {uploadMutation.data?.registros_validos_mapeados}</div>
                    {uploadMutation.data?.registros_inseridos !== undefined && (
                      <div className="font-medium text-green-700">
                        💾 Novos no banco: {uploadMutation.data.registros_inseridos}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-green-600 mt-2 italic">
                    ⏳ Dashboard será atualizado em alguns segundos...
                  </div>
                </div>
              </div>
              
              {/* Alerta sobre duplicatas encontradas */}
              {uploadMutation.data?.duplicatas_evitadas && uploadMutation.data.duplicatas_evitadas > 0 && (
                <div className="flex items-start gap-2 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-amber-800">
                    <div className="font-medium">Dados duplicados detectados</div>
                    <div className="text-sm mt-1">
                      🔍 {uploadMutation.data.duplicatas_evitadas} registro{uploadMutation.data.duplicatas_evitadas > 1 ? 's' : ''} duplicado{uploadMutation.data.duplicatas_evitadas > 1 ? 's foram encontrados' : ' foi encontrado'} e não {uploadMutation.data.duplicatas_evitadas > 1 ? 'foram inseridos' : 'foi inserido'}.
                    </div>
                    <div className="text-xs text-amber-600 mt-1">
                      💡 Duplicatas são identificadas pelo Job ID. Dados já existentes não são sobrescritos.
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {uploadMutation.isError && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div className="text-red-800">
                <div className="font-medium">Erro no upload</div>
                <div className="text-sm">
                  {(uploadMutation.error as Error)?.message || 'Erro desconhecido'}
                </div>
              </div>
            </div>
          )}

          {/* Área de upload */}
          {!uploadMutation.isPending && !uploadMutation.isSuccess && (
            <div
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${dragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
                }
              `}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={openFileDialog}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-700">
                  Arraste um arquivo Excel aqui
                </p>
                <p className="text-sm text-gray-500">
                  ou clique para selecionar um arquivo
                </p>
                <p className="text-xs text-gray-400">
                  Apenas arquivos .xlsx são aceitos
                </p>
              </div>
            </div>
          )}

          {/* Input oculto para seleção de arquivo */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {/* Informações adicionais */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>• O arquivo será processado e salvo automaticamente no banco de dados</p>
            <p>• As métricas do dashboard serão atualizadas em tempo real</p>
            <p>• Formatos suportados: .xlsx (Excel)</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 