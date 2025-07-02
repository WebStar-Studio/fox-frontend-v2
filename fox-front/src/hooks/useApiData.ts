import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/lib/api';
import { DeliveryRecord, MetricasResumo, ApiResponse, StatusBanco } from '@/types';

// Query keys para cache management
export const QUERY_KEYS = {
  dados: 'dados',
  dadosHibrido: 'dados-hibrido',
  dadosBanco: 'dados-banco',
  dadosComMetricas: 'dados-com-metricas',
  metricasResumo: 'metricas-resumo',
  metricasResumoBanco: 'metricas-resumo-banco',
  statusBanco: 'status-banco',
  status: 'status'
} as const;

// Hook para obter dados híbridos (banco primeiro, depois memória)
export function useDadosHibrido() {
  return useQuery({
    queryKey: [QUERY_KEYS.dadosHibrido],
    queryFn: () => apiService.getDadosHibrido(),
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 1, // Reduzido de 2 para 1
  });
}

// Hook para obter dados do banco
export function useDadosBanco(limit?: number) {
  return useQuery({
    queryKey: [QUERY_KEYS.dadosBanco, limit],
    queryFn: () => apiService.getDadosBanco(limit),
    staleTime: 5 * 60 * 1000,
    retry: 1, // Reduzido de 2 para 1
  });
}

// Hook para obter dados da memória
export function useDadosMemoria() {
  return useQuery({
    queryKey: [QUERY_KEYS.dados],
    queryFn: () => apiService.getDadosMemoria(),
    staleTime: 5 * 60 * 1000,
    retry: 1, // Reduzido de 2 para 1
  });
}

// Hook para obter dados com métricas calculadas
export function useDadosComMetricas() {
  return useQuery({
    queryKey: [QUERY_KEYS.dadosComMetricas],
    queryFn: () => apiService.getDadosComMetricas(),
    staleTime: 5 * 60 * 1000,
    retry: 1, // Reduzido de 2 para 1
  });
}

// Hook para obter métricas resumo
export function useMetricasResumo() {
  return useQuery({
    queryKey: [QUERY_KEYS.metricasResumo],
    queryFn: () => apiService.getMetricasResumo(),
    staleTime: 5 * 60 * 1000,
    retry: 1, // Reduzido de 2 para 1
  });
}

// Hook para obter métricas resumo do banco
export function useMetricasResumoBanco() {
  const statusBanco = useStatusBanco();
  
  return useQuery({
    queryKey: [QUERY_KEYS.metricasResumoBanco],
    queryFn: () => apiService.getMetricasResumoBanco(),
    staleTime: 5 * 60 * 1000,
    retry: 1, // Reduzido de 2 para 1
    // Não tentar buscar métricas se o banco está vazio
    enabled: (statusBanco.data as StatusBanco)?.total_registros_banco > 0,
  });
}

// Hook para obter status do banco
export function useStatusBanco() {
  return useQuery({
    queryKey: [QUERY_KEYS.statusBanco],
    queryFn: () => apiService.getStatusBanco(),
    staleTime: 30 * 1000, // Reduzido para 30 segundos para atualizar mais rápido
    retry: 1,
    refetchInterval: 15 * 1000, // Aumentado para 15 segundos para ser menos agressivo
    refetchOnWindowFocus: false, // Evitar refetch desnecessário quando janela ganha foco
  });
}

// Hook para obter status geral da API
export function useApiStatus() {
  return useQuery({
    queryKey: [QUERY_KEYS.status],
    queryFn: () => apiService.getStatus(),
    staleTime: 5 * 60 * 1000,
    retry: 1, // Reduzido de 2 para 1
  });
}

// Hook para upload de planilha
export function useUploadPlanilha() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (file: File) => apiService.uploadPlanilha(file),
    onSuccess: () => {
      // Invalidate all related queries to refetch data
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.dados] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.dadosHibrido] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.dadosBanco] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.dadosComMetricas] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.metricasResumo] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.metricasResumoBanco] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.statusBanco] });
    },
  });
}

// Hook para limpar banco
export function useLimparBanco() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => apiService.limparBanco(),
    onSuccess: () => {
      // Limpar o cache imediatamente
      queryClient.setQueryData([QUERY_KEYS.dadosBanco], { dados: [], total_registros: 0 });
      queryClient.setQueryData([QUERY_KEYS.metricasResumoBanco], null);
      
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.dadosBanco] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.dadosHibrido] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.metricasResumoBanco] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.statusBanco] });
    },
  });
}

// Hook combinado para dashboard - usa APENAS dados do banco de dados
export function useDashboardData() {
  const statusBanco = useStatusBanco();
  const metricasBanco = useMetricasResumoBanco();
  const dadosBanco = useDadosBanco();

  // Usar APENAS dados do banco de dados (sem fallback para memória)
  const metricas = metricasBanco.data;
  const dados = dadosBanco.data?.dados || dadosBanco.data?.data || [];
  
  // Lógica melhorada para loading e error states
  const isStatusLoading = statusBanco.isLoading;
  const statusData = statusBanco.data as StatusBanco;
  const isDatabaseEmpty = statusData?.banco_conectado && statusData?.total_registros_banco === 0;
  
  // Se o banco está vazio, não considerar como loading ou error
  const isLoading = isStatusLoading || (!isDatabaseEmpty && (metricasBanco.isLoading || dadosBanco.isLoading));
  
  // Só considerar erro se não for banco vazio e houver erro real de conexão
  const hasConnectionError = !isDatabaseEmpty && (
    statusBanco.error || 
    (!statusData?.banco_conectado && !statusBanco.isLoading) ||
    (statusData?.total_registros_banco > 0 && (metricasBanco.error || dadosBanco.error))
  );
  
  // Calcular estatísticas de drivers apenas com dados do banco
  const driverStats = dados.length > 0 ? apiService.getDriverStats(dados) : [];
  const statusDistribution = dados.length > 0 ? apiService.getStatusDistribution(dados) : [];

  return {
    metricas,
    dados,
    driverStats,
    statusDistribution,
    statusBanco: statusData,
    isLoading,
    error: hasConnectionError ? (statusBanco.error || metricasBanco.error || dadosBanco.error) : null,
    isDatabaseEmpty,
    refetch: () => {
      statusBanco.refetch();
      if (!isDatabaseEmpty) {
        metricasBanco.refetch();
        dadosBanco.refetch();
      }
    }
  };
}

// Hook para refresh manual - foco apenas nos dados do banco
export function useRefreshData() {
  const queryClient = useQueryClient();
  
  return () => {
    // Priorizar apenas endpoints do banco de dados
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.statusBanco] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.dadosBanco] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.metricasResumoBanco] });
    
    // Manter outros para compatibilidade, mas com prioridade menor
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.dadosHibrido] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.dados] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.dadosComMetricas] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.metricasResumo] });
  };
} 