import { DeliveryRecord, MetricasResumo, ApiResponse, DriverStats, StatusDistribution, EmpresasResponse, LocalizacoesEntregaResponse, EntregadoresResponse, AnaliseTemporalResponse, UploadResponse, EmpresaMetricasDetalhadas } from '@/types';

const API_BASE_URL = 'http://127.0.0.1:5000';

/**
 * ESTRATÉGIA DE PAGINAÇÃO PARA EVITAR TIMEOUTS EM PRODUÇÃO:
 * 
 * DOIS TIPOS DE ENDPOINTS:
 * 
 * 1. ENDPOINTS DE DADOS BRUTOS (/dados-banco, /dados-hibrido, etc.):
 *    - Frontend faz paginação manual: múltiplas requisições de 1000 em 1000
 *    - Distribui a carga em várias requisições pequenas e rápidas
 *    - Evita timeouts 502 Bad Gateway em deploy
 *    - Consegue buscar TODOS os dados sem sobrecarregar servidor
 *    - Backend suporta: ?limit=1000&offset=0, ?limit=1000&offset=1000, etc.
 * 
 * 2. ENDPOINTS DE AGREGAÇÃO (/empresas, /entregadores, /localizacoes, /analise-temporal):
 *    - Backend busca TODOS os dados internamente (fetch_all=True)
 *    - Backend processa/agrega os dados completos
 *    - Frontend recebe resultado já processado
 *    - Uma única requisição, mas pode demorar mais
 *    - Backend otimizado para fazer agregação de forma eficiente
 * 
 * ENDPOINTS POR CATEGORIA:
 * - Dados Brutos (paginação no frontend): /dados-banco, /dados-hibrido, /dados-banco-com-metricas
 * - Agregação (processamento no backend): /empresas, /localizacoes-entrega, /entregadores, /analise-temporal
 */

interface PaginationParams {
  limit?: number;
  offset?: number;
  page?: number;
  page_size?: number;
  all?: boolean; // Evitar usar em produção - causa timeout!
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        // Melhor tratamento para diferentes tipos de erro
        if (response.status === 404) {
          throw new Error(`404: Endpoint não encontrado ou dados ainda sendo processados`);
        } else if (response.status === 500) {
          throw new Error(`500: Erro interno do servidor`);
        } else if (response.status === 503) {
          throw new Error(`503: Serviço temporariamente indisponível`);
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Função auxiliar para construir parâmetros de query
  private buildQueryParams(params: PaginationParams): string {
    const searchParams = new URLSearchParams();
    
    if (params.limit !== undefined) searchParams.append('limit', params.limit.toString());
    if (params.offset !== undefined) searchParams.append('offset', params.offset.toString());
    if (params.page !== undefined) searchParams.append('page', params.page.toString());
    if (params.page_size !== undefined) searchParams.append('page_size', params.page_size.toString());
    if (params.all !== undefined) searchParams.append('all', params.all.toString());
    
    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  // Função auxiliar para buscar todos os dados com paginação manual
  // ESTRATÉGIA: Múltiplas requisições de 1000 em 1000 para evitar timeout em produção
  private async fetchAllData<T>(endpoint: string, supportsPagination: boolean = true): Promise<ApiResponse<T>> {
    console.log(`[ApiService] 🔄 Paginação MANUAL no frontend para ${endpoint}`);
    console.log(`[ApiService] Estratégia: Múltiplas requisições pequenas para evitar timeout 502`);
    
    let allData: T[] = [];
    let offset = 0;
    const pageSize = 1000; // Tamanho ideal: não sobrecarrega o servidor
    let pageCount = 0;
    let consecutiveEmptyPages = 0;
    const maxConsecutiveEmptyPages = 3; // Segurança: para após 3 páginas vazias
    const maxTotalPages = 100; // Segurança: máximo 100k registros

    while (pageCount < maxTotalPages && consecutiveEmptyPages < maxConsecutiveEmptyPages) {
      try {
        pageCount++;
        console.log(`[ApiService] Buscando página ${pageCount} (offset: ${offset}, limit: ${pageSize})`);
        const params = this.buildQueryParams({ limit: pageSize, offset });
        const response: ApiResponse<T> = await this.request<ApiResponse<T>>(`${endpoint}${params}`);
        
        const data = response.dados || response.data || [];
        console.log(`[ApiService] ===== PÁGINA ${pageCount} =====`);
        console.log(`[ApiService] Offset solicitado: ${offset}`);
        console.log(`[ApiService] Limit solicitado: ${pageSize}`);
        console.log(`[ApiService] Registros recebidos: ${data.length}`);
        console.log(`[ApiService] Total registros (resposta): ${response.total_registros}`);
        console.log(`[ApiService] Fonte: ${response.fonte}`);
        console.log(`[ApiService] Primeiro item:`, data[0] ? Object.keys(data[0]).slice(0, 3) : 'nenhum');
        console.log(`[ApiService] ========================`);

        if (data.length === 0) {
          consecutiveEmptyPages++;
          console.warn(`[ApiService] ⚠️ Página ${pageCount} VAZIA! (${consecutiveEmptyPages}/${maxConsecutiveEmptyPages} vazias consecutivas)`);
          
          if (consecutiveEmptyPages >= maxConsecutiveEmptyPages) {
            console.error(`[ApiService] ❌ Finalizando paginação - ${consecutiveEmptyPages} páginas vazias consecutivas`);
            break;
          } else {
            console.log(`[ApiService] ↪️ Tentando próxima página mesmo com página vazia...`);
          }
        } else {
          consecutiveEmptyPages = 0; // Reset contador de páginas vazias
          const tamAnterior = allData.length;
          allData = allData.concat(data);
          console.log(`[ApiService] ✅ Página ${pageCount}: +${data.length} registros (${tamAnterior} → ${allData.length})`);
          
          // IMPORTANTE: Continue mesmo se retornou menos que pageSize
          // Pode haver mais dados em offsets maiores
          if (data.length < pageSize) {
            console.log(`[ApiService] ⚠️ Página incompleta (${data.length} < ${pageSize}) - MAS continuando para verificar...`);
          } else {
            console.log(`[ApiService] ➡️ Página completa! Buscando próxima...`);
          }
        }
        
        // Sempre avança o offset para próxima página
        offset += pageSize;
        
      } catch (error) {
        console.error(`[ApiService] Erro na paginação manual (página ${pageCount}, offset ${offset}):`, error);
        consecutiveEmptyPages++;
        
        if (consecutiveEmptyPages >= maxConsecutiveEmptyPages) {
          console.error(`[ApiService] Muitos erros consecutivos, finalizando paginação`);
          break;
        } else {
          console.warn(`[ApiService] Continuando para próxima página apesar do erro...`);
          offset += pageSize;
        }
      }
    }

    if (pageCount >= maxTotalPages) {
      console.warn(`[ApiService] Limite máximo de páginas atingido (${maxTotalPages}), finalizando paginação`);
    }

    console.log(`[ApiService] ✅ ===== PAGINAÇÃO CONCLUÍDA =====`);
    console.log(`[ApiService] ✅ Total de páginas buscadas: ${pageCount}`);
    console.log(`[ApiService] ✅ Total de registros obtidos: ${allData.length}`);
    console.log(`[ApiService] ✅ Endpoint: ${endpoint}`);
    console.log(`[ApiService] ✅ ================================`);
    
    return {
      total_registros: allData.length,
      fonte: 'paginacao_manual',
      dados: allData
    } as ApiResponse<T>;
  }

  // Função auxiliar para endpoints que retornam objetos customizados  
  // IMPORTANTE: Esses endpoints fazem AGREGAÇÃO/PROCESSAMENTO dos dados do banco
  // Eles precisam buscar TODOS os dados primeiro, processar, e ENTÃO retornar
  // NÃO podemos paginar a requisição pois o backend faz a agregação no conjunto completo
  private async fetchAllCustomData<T>(endpoint: string): Promise<T> {
    console.log(`[ApiService] 📊 Buscando dados agregados/processados de ${endpoint}`);
    console.log(`[ApiService] ⚠️ Endpoints de agregação devem processar todos os dados - pode demorar`);
    
    try {
      // Chamar SEM paginação - deixa o backend processar todos os dados
      const response = await this.request<T>(endpoint);
      console.log(`[ApiService] ✅ Dados agregados obtidos com sucesso de ${endpoint}`);
      return response;
    } catch (error) {
      console.error(`[ApiService] ❌ Erro ao buscar dados agregados de ${endpoint}:`, error);
      throw error;
    }
  }

  // Função forçada para buscar TODOS os dados - mais agressiva
  private async forceGetAllData<T>(endpoint: string): Promise<ApiResponse<T>> {
    console.log(`[ApiService] MODO FORÇADO: Buscando absolutamente todos os dados para ${endpoint}`);
    
    let allData: T[] = [];
    let offset = 0;
    const pageSize = 1000;
    let pageCount = 0;
    let emptyPagesInARow = 0;
    const maxEmptyPages = 5; // Mais permissivo
    const maxPages = 200; // Muito mais páginas permitidas
    
    // Força buscar página por página até ter certeza absoluta que acabou
    while (pageCount < maxPages && emptyPagesInARow < maxEmptyPages) {
      pageCount++;
      
      try {
        console.log(`[ApiService] FORÇA - Página ${pageCount}/${maxPages} (offset: ${offset})`);
        const params = this.buildQueryParams({ limit: pageSize, offset });
        const response: ApiResponse<T> = await this.request<ApiResponse<T>>(`${endpoint}${params}`);
        
        const data = response.dados || response.data || [];
        
        if (data.length > 0) {
          allData = allData.concat(data);
          emptyPagesInARow = 0; // Reset
          console.log(`[ApiService] FORÇA - Página ${pageCount}: +${data.length} registros (total: ${allData.length})`);
        } else {
          emptyPagesInARow++;
          console.log(`[ApiService] FORÇA - Página ${pageCount}: vazia (${emptyPagesInARow}/${maxEmptyPages} vazias)`);
        }
        
        offset += pageSize;
        
        // Pequena pausa para não sobrecarregar o servidor
        if (pageCount % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
      } catch (error) {
        console.warn(`[ApiService] FORÇA - Erro na página ${pageCount}:`, error);
        emptyPagesInARow++;
        offset += pageSize;
      }
    }
    
    console.log(`[ApiService] MODO FORÇADO concluído: ${allData.length} registros total em ${pageCount} páginas verificadas`);
    
    return {
      total_registros: allData.length,
      fonte: 'busca_forcada',
      dados: allData
    } as ApiResponse<T>;
  }

  // Endpoints principais
  async getStatus() {
    return this.request('/');
  }

  async getDadosHibrido(): Promise<ApiResponse<DeliveryRecord>> {
    // Paginação manual: múltiplas requisições de 1000 em 1000
    return await this.fetchAllData<DeliveryRecord>('/dados-hibrido');
  }

  async getDadosBanco(limit?: number): Promise<ApiResponse<DeliveryRecord>> {
    // Se limit foi especificado, retornar apenas essa quantidade
    if (limit !== undefined) {
      const params = this.buildQueryParams({ limit });
      return this.request(`/dados-banco${params}`);
    }
    // Caso contrário, buscar TODOS os dados com paginação manual
    return await this.fetchAllData<DeliveryRecord>('/dados-banco');
  }

  async getDadosMemoria(): Promise<DeliveryRecord[]> {
    return this.request('/dados');
  }

  async getDadosComMetricas(): Promise<DeliveryRecord[]> {
    return this.request('/dados-com-metricas');
  }

  async getDadosBancoComMetricas(limit?: number): Promise<ApiResponse<DeliveryRecord>> {
    // Se limit foi especificado, retornar apenas essa quantidade
    if (limit !== undefined) {
      const params = this.buildQueryParams({ limit });
      return this.request(`/dados-banco-com-metricas${params}`);
    }
    // Caso contrário, buscar TODOS os dados com paginação manual
    return await this.fetchAllData<DeliveryRecord>('/dados-banco-com-metricas');
  }

  async getMetricasResumo(): Promise<MetricasResumo> {
    return this.request('/metricas-resumo');
  }

  async getMetricasResumoBanco(): Promise<MetricasResumo> {
    // CRÍTICO: Este endpoint calcula métricas de TODOS os dados
    // Backend usa fetch_all=True internamente para cálculos corretos
    console.log(`[ApiService] 📊 Buscando métricas resumo de TODOS os dados do banco`);
    console.log(`[ApiService] ⏳ Aguarde - processando todos os registros...`);
    return this.request('/metricas-resumo-banco');
  }

  async getStatusBanco() {
    return this.request('/status-banco');
  }

  async uploadPlanilha(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseUrl}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.erro || errorData.detalhes || `Upload failed: ${response.status}`);
    }

    return response.json();
  }

  async limparBanco() {
    return this.request('/limpar-banco', {
      method: 'DELETE',
    });
  }

  // Endpoints para métricas avançadas - AGORA COM PAGINAÇÃO MANUAL
  async getEmpresasMetricas(): Promise<EmpresasResponse> {
    return this.fetchAllCustomData<EmpresasResponse>('/empresas');
  }

  async getLocalizacoesEntrega(): Promise<LocalizacoesEntregaResponse> {
    return this.fetchAllCustomData<LocalizacoesEntregaResponse>('/localizacoes-entrega');
  }

  async getEntregadoresMetricas(): Promise<EntregadoresResponse> {
    return this.fetchAllCustomData<EntregadoresResponse>('/entregadores');
  }

  async getAnaliseTemporalMetricas(): Promise<AnaliseTemporalResponse> {
    return this.fetchAllCustomData<AnaliseTemporalResponse>('/analise-temporal');
  }

  // Métodos específicos para paginação customizada (caso necessário no futuro)
  async getDadosBancoWithPagination(params: PaginationParams): Promise<ApiResponse<DeliveryRecord>> {
    const queryString = this.buildQueryParams(params);
    return this.request(`/dados-banco${queryString}`);
  }

  async getDadosBancoComMetricasWithPagination(params: PaginationParams): Promise<ApiResponse<DeliveryRecord>> {
    const queryString = this.buildQueryParams(params);
    return this.request(`/dados-banco-com-metricas${queryString}`);
  }

  async getDadosHibridoWithPagination(params: PaginationParams): Promise<ApiResponse<DeliveryRecord>> {
    const queryString = this.buildQueryParams(params);
    return this.request(`/dados-hibrido${queryString}`);
  }

  // Métodos públicos para forçar busca completa (paginação manual mais agressiva)
  // Use apenas se necessário - já é o comportamento padrão
  async forceGetAllDadosBanco(): Promise<ApiResponse<DeliveryRecord>> {
    console.log(`[ApiService] ⚡ Busca forçada e agressiva de todos os dados do banco`);
    return await this.forceGetAllData<DeliveryRecord>('/dados-banco');
  }

  async forceGetAllDadosHibrido(): Promise<ApiResponse<DeliveryRecord>> {
    console.log(`[ApiService] ⚡ Busca forçada e agressiva de todos os dados híbridos`);
    return await this.forceGetAllData<DeliveryRecord>('/dados-hibrido');
  }

  async forceGetAllDadosComMetricas(): Promise<ApiResponse<DeliveryRecord>> {
    console.log(`[ApiService] ⚡ Busca forçada e agressiva de todos os dados com métricas`);
    return await this.forceGetAllData<DeliveryRecord>('/dados-banco-com-metricas');
  }

  // APENAS PARA DESENVOLVIMENTO/DEBUGGING
  // NÃO usar em produção - causa timeout com muitos dados
  async getDadosBancoWithAllFlag(): Promise<ApiResponse<DeliveryRecord>> {
    console.warn(`[ApiService] 🚨 ATENÇÃO: Usando 'all=true' - pode causar timeout em produção!`);
    const params = this.buildQueryParams({ all: true });
    return this.request(`/dados-banco${params}`);
  }

  // Método para obter métricas detalhadas de empresa específica (usa fetch_all=True no backend)
  async getEmpresaMetricasEspecifica(nomeEmpresa: string): Promise<{ sucesso: boolean; fonte: string; metricas: EmpresaMetricasDetalhadas }> {
    try {
      const params = this.buildQueryParams({ all: true });
      const endpoint = `/empresa-metricas?empresa=${encodeURIComponent(nomeEmpresa)}${params ? '&' + params.substring(1) : ''}`;
      return this.request(endpoint);
    } catch (error) {
      // Fallback sem o parâmetro 'all'
      const endpoint = `/empresa-metricas?empresa=${encodeURIComponent(nomeEmpresa)}`;
      return this.request(endpoint);
    }
  }

  // Métodos utilitários para processar dados
  getDriverStats(deliveries: DeliveryRecord[]): DriverStats[] {
    const driverMap = new Map<string, {
      total_deliveries: number;
      total_revenue: number;
      successful_deliveries: number;
      delivery_times: number[];
    }>();

    deliveries.forEach(delivery => {
      const driver = delivery.collecting_driver || delivery.delivering_driver;
      if (!driver || driver.toLowerCase() === 'n/a') return;

      if (!driverMap.has(driver)) {
        driverMap.set(driver, {
          total_deliveries: 0,
          total_revenue: 0,
          successful_deliveries: 0,
          delivery_times: []
        });
      }

      const stats = driverMap.get(driver)!;
      stats.total_deliveries++;
      stats.total_revenue += delivery.cost || 0;

      // Verificar se a entrega foi bem-sucedida
      const status = delivery.status?.toLowerCase();
      if (status && ['delivered', 'completed', 'finished', 'done', 'entregue', 'concluído', 'concluido'].includes(status)) {
        stats.successful_deliveries++;
      }

      // Adicionar tempo de entrega se disponível
      if (delivery.delivery_time_minutes && delivery.delivery_time_minutes > 0) {
        stats.delivery_times.push(delivery.delivery_time_minutes);
      }
    });

    return Array.from(driverMap.entries()).map(([driver_name, stats]) => ({
      driver_name,
      total_deliveries: stats.total_deliveries,
      total_revenue: stats.total_revenue,
      success_rate: stats.total_deliveries > 0 ? (stats.successful_deliveries / stats.total_deliveries) * 100 : 0,
      average_delivery_time: stats.delivery_times.length > 0 
        ? stats.delivery_times.reduce((a, b) => a + b, 0) / stats.delivery_times.length 
        : 0
    })).sort((a, b) => b.total_deliveries - a.total_deliveries);
  }

  getStatusDistribution(deliveries: DeliveryRecord[]): StatusDistribution[] {
    const statusMap = new Map<string, number>();
    
    deliveries.forEach(delivery => {
      const status = delivery.status || 'Unknown';
      // Filtrar status "submitted" para não aparecer no chart
      if (status.toLowerCase() !== 'submitted') {
        statusMap.set(status, (statusMap.get(status) || 0) + 1);
      }
    });

    const total = Array.from(statusMap.values()).reduce((sum, count) => sum + count, 0);
    
    return Array.from(statusMap.entries()).map(([status, count]) => ({
      status,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0
    })).sort((a, b) => b.count - a.count);
  }

  // Formatadores de dados
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  }

  formatTime(minutes: number): string {
    if (minutes < 60) {
      return `${Math.round(minutes)}m`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = Math.round(minutes % 60);
      return `${hours}h ${remainingMinutes}m`;
    }
  }

  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }
}

export const apiService = new ApiService();
export default apiService;
export type { PaginationParams }; 