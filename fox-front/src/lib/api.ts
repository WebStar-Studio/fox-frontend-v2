import { DeliveryRecord, MetricasResumo, ApiResponse, DriverStats, StatusDistribution, EmpresasResponse, LocalizacoesEntregaResponse, EntregadoresResponse, AnaliseTemporalResponse, UploadResponse } from '@/types';

const API_BASE_URL = 'http://127.0.0.1:5000';

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

  // Endpoints principais
  async getStatus() {
    return this.request('/');
  }

  async getDadosHibrido(): Promise<ApiResponse<DeliveryRecord>> {
    return this.request('/dados-hibrido');
  }

  async getDadosBanco(limit?: number): Promise<ApiResponse<DeliveryRecord>> {
    const params = limit ? `?limit=${limit}` : '';
    return this.request(`/dados-banco${params}`);
  }

  async getDadosMemoria(): Promise<DeliveryRecord[]> {
    return this.request('/dados');
  }

  async getDadosComMetricas(): Promise<DeliveryRecord[]> {
    return this.request('/dados-com-metricas');
  }

  async getDadosBancoComMetricas(limit?: number): Promise<ApiResponse<DeliveryRecord>> {
    const params = limit ? `?limit=${limit}` : '';
    return this.request(`/dados-banco-com-metricas${params}`);
  }

  async getMetricasResumo(): Promise<MetricasResumo> {
    return this.request('/metricas-resumo');
  }

  async getMetricasResumoBanco(): Promise<MetricasResumo> {
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

  // Novos endpoints para métricas avançadas
  async getEmpresasMetricas(): Promise<EmpresasResponse> {
    return this.request('/empresas');
  }

  async getLocalizacoesEntrega(): Promise<LocalizacoesEntregaResponse> {
    return this.request('/localizacoes-entrega');
  }

  async getEntregadoresMetricas(): Promise<EntregadoresResponse> {
    return this.request('/entregadores');
  }

  async getAnaliseTemporalMetricas(): Promise<AnaliseTemporalResponse> {
    return this.request('/analise-temporal');
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