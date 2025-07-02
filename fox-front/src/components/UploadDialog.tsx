"use client";

import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useUploadPlanilha } from '@/hooks/useApiData';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

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
          setTimeout(() => setIsOpen(false), 2000); // Fechar dialog após 2 segundos
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
            <div className="flex items-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span className="text-blue-800">Fazendo upload...</span>
            </div>
          )}

          {uploadMutation.isSuccess && (
            <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div className="text-green-800">
                <div className="font-medium">Upload realizado com sucesso!</div>
                <div className="text-sm">
                  {uploadMutation.data?.total_registros} registros processados
                  {uploadMutation.data?.registros_salvos_db && 
                    ` | ${uploadMutation.data.registros_salvos_db} salvos no banco`
                  }
                </div>
              </div>
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