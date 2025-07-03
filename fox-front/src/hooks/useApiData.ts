import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/lib/api';
import { DeliveryRecord, MetricasResumo, ApiResponse, StatusBanco, EmpresasResponse, LocalizacoesEntregaResponse, EntregadoresResponse } from '@/types';

/*
 * ✅ CORREÇÃO: Problema de erro 404 após upload
 * 
 * Problema: Após upload, aparecia erro 404 por ~2 segundos antes do dashboard carregar
 * Causa: Race condition - queries invalidadas antes do backend processar completamente
 * 
 * Solução implementada:
 * 1. Delay escalonado na invalidação de queries (1s + 500ms)
 * 2. Retry inteligente com delay exponencial para erros 404
 * 3. Melhor error handling na API
 * 4. Feedback visual aprimorado durante processamento
 */

// Query keys para cache management
export const QUERY_KEYS = {
  dados: 'dados',
  dadosHibrido: 'dados-hibrido',
  dadosBanco: 'dados-banco',
  dadosComMetricas: 'dados-com-metricas',
  metricasResumo: 'metricas-resumo',
  metricasResumoBanco: 'metricas-resumo-banco',
  statusBanco: 'status-banco',
  status: 'status',
  // Novos endpoints para métricas avançadas
  empresas: 'empresas',
  localizacoesEntrega: 'localizacoes-entrega',
  entregadores: 'entregadores'
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
    retry: (failureCount, error) => {
      // Retry mais inteligente após upload
      if (failureCount < 3 && error?.message?.includes('404')) {
        console.log(`🔄 Retry ${failureCount + 1}/3 para dados do banco (404 - dados sendo processados)`);
        return true; // Retry em caso de 404 (dados ainda sendo processados)
      }
      return failureCount < 1; // Retry padrão para outros erros
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000), // Delay exponencial até 3s
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
    retry: (failureCount, error) => {
      // Retry mais inteligente após upload
      if (failureCount < 3 && error?.message?.includes('404')) {
        console.log(`🔄 Retry ${failureCount + 1}/3 para métricas do banco (404 - dados sendo processados)`);
        return true; // Retry em caso de 404 (dados ainda sendo processados)
      }
      return failureCount < 1; // Retry padrão para outros erros
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000), // Delay exponencial até 3s
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
      console.log('📤 Upload bem-sucedido, iniciando atualização das queries...');
      
      // Aguardar um pouco para o backend processar antes de invalidar as queries
      // Isso evita o erro 404 por race condition
      setTimeout(() => {
        console.log('🔄 Invalidando status do banco...');
        // Invalidar status primeiro para atualizar o número de registros
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.statusBanco] });
        
        // Aguardar um pouco mais antes de invalidar outras queries
        setTimeout(() => {
          console.log('🔄 Invalidando dados e métricas...');
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.dadosBanco] });
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.metricasResumoBanco] });
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.dados] });
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.dadosHibrido] });
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.dadosComMetricas] });
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.metricasResumo] });
          
          // Invalidar novos endpoints de métricas avançadas após upload
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.empresas] });
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.localizacoesEntrega] });
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.entregadores] });
          
          console.log('✅ Todas as queries foram invalidadas (incluindo métricas avançadas)!');
        }, 500); // Aguardar 500ms adicional
      }, 1000); // Aguardar 1 segundo após upload
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
      
      // Invalidar novos endpoints de métricas avançadas após limpar banco
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.empresas] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.localizacoesEntrega] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.entregadores] });
    },
  });
}

// Hook combinado para dashboard - usa APENAS dados do banco de dados
export function useDashboardData() {
  const statusBanco = useStatusBanco();
  const metricasBanco = useMetricasResumoBanco();
  const dadosBanco = useDadosBanco();
  const entregadoresMetricas = useEntregadoresMetricas();

  // Usar APENAS dados do banco de dados (sem fallback para memória)
  const metricas = metricasBanco.data;
  const dados = dadosBanco.data?.dados || dadosBanco.data?.data || [];
  const topDrivers = entregadoresMetricas.data?.entregadores || [];
  
  // Lógica melhorada para loading e error states
  const isStatusLoading = statusBanco.isLoading;
  const statusData = statusBanco.data as StatusBanco;
  const isDatabaseEmpty = statusData?.banco_conectado && statusData?.total_registros_banco === 0;
  
  // Se o banco está vazio, não considerar como loading ou error
  const isLoading = isStatusLoading || (!isDatabaseEmpty && (metricasBanco.isLoading || dadosBanco.isLoading || entregadoresMetricas.isLoading));
  
  // Só considerar erro se não for banco vazio e houver erro real de conexão
  const hasConnectionError = !isDatabaseEmpty && (
    statusBanco.error || 
    (!statusData?.banco_conectado && !statusBanco.isLoading) ||
    (statusData?.total_registros_banco > 0 && (metricasBanco.error || dadosBanco.error || entregadoresMetricas.error))
  );
  
  // Calcular estatísticas de drivers apenas com dados do banco
  const driverStats = dados.length > 0 ? apiService.getDriverStats(dados) : [];
  const statusDistribution = dados.length > 0 ? apiService.getStatusDistribution(dados) : [];

  return {
    metricas,
    dados,
    driverStats,
    statusDistribution,
    topDrivers,
    statusBanco: statusData,
    isLoading,
    error: hasConnectionError ? (statusBanco.error || metricasBanco.error || dadosBanco.error || entregadoresMetricas.error) : null,
    isDatabaseEmpty,
    refetch: () => {
      statusBanco.refetch();
      if (!isDatabaseEmpty) {
        metricasBanco.refetch();
        dadosBanco.refetch();
        entregadoresMetricas.refetch();
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
    
    // Invalidar novos endpoints de métricas avançadas
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.empresas] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.localizacoesEntrega] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.entregadores] });
    
    // Manter outros para compatibilidade, mas com prioridade menor
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.dadosHibrido] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.dados] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.dadosComMetricas] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.metricasResumo] });
  };
}

// ========== NOVOS HOOKS PARA MÉTRICAS AVANÇADAS ==========

// Hook para obter métricas de empresas
export function useEmpresasMetricas() {
  const statusBanco = useStatusBanco();
  
  return useQuery({
    queryKey: [QUERY_KEYS.empresas],
    queryFn: () => apiService.getEmpresasMetricas(),
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: (failureCount, error) => {
      if (failureCount < 3 && error?.message?.includes('404')) {
        console.log(`🔄 Retry ${failureCount + 1}/3 para empresas (404 - dados sendo processados)`);
        return true;
      }
      return failureCount < 1;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
    // Só buscar se houver dados no banco ou memória
    enabled: (statusBanco.data as StatusBanco)?.total_registros_banco > 0 || (statusBanco.data as StatusBanco)?.total_registros_memoria > 0,
  });
}

// Hook para obter localizações de entrega
export function useLocalizacoesEntrega() {
  const statusBanco = useStatusBanco();
  
  return useQuery({
    queryKey: [QUERY_KEYS.localizacoesEntrega],
    queryFn: () => apiService.getLocalizacoesEntrega(),
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: (failureCount, error) => {
      if (failureCount < 3 && error?.message?.includes('404')) {
        console.log(`🔄 Retry ${failureCount + 1}/3 para localizações (404 - dados sendo processados)`);
        return true;
      }
      return failureCount < 1;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
    // Só buscar se houver dados no banco ou memória
    enabled: (statusBanco.data as StatusBanco)?.total_registros_banco > 0 || (statusBanco.data as StatusBanco)?.total_registros_memoria > 0,
  });
}

// Hook para obter métricas de entregadores
export function useEntregadoresMetricas() {
  const statusBanco = useStatusBanco();
  
  return useQuery({
    queryKey: [QUERY_KEYS.entregadores],
    queryFn: () => apiService.getEntregadoresMetricas(),
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: (failureCount, error) => {
      if (failureCount < 3 && error?.message?.includes('404')) {
        console.log(`🔄 Retry ${failureCount + 1}/3 para entregadores (404 - dados sendo processados)`);
        return true;
      }
      return failureCount < 1;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
    // Só buscar se houver dados no banco ou memória
    enabled: (statusBanco.data as StatusBanco)?.total_registros_banco > 0 || (statusBanco.data as StatusBanco)?.total_registros_memoria > 0,
  });
}

// Hook combinado para obter todas as métricas avançadas de uma vez
export function useMetricasAvancadas() {
  const empresas = useEmpresasMetricas();
  const localizacoes = useLocalizacoesEntrega();
  const entregadores = useEntregadoresMetricas();
  
  return {
    empresas: empresas.data,
    localizacoes: localizacoes.data,
    entregadores: entregadores.data,
    isLoading: empresas.isLoading || localizacoes.isLoading || entregadores.isLoading,
    error: empresas.error || localizacoes.error || entregadores.error,
    isSuccess: empresas.isSuccess && localizacoes.isSuccess && entregadores.isSuccess,
    refetch: () => {
      empresas.refetch();
      localizacoes.refetch();
      entregadores.refetch();
    }
  };
} 