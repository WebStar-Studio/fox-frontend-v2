export interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon?: React.ReactNode;
  status?: 'good' | 'warning' | 'critical';
  }
  
  export interface DeliveryStatusData {
  name: string;
  value: number;
  color: string;
}

export interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  isActive?: boolean;
}

// Novos tipos para a API Flask
export interface DeliveryRecord {
  id?: string;
  job_id: string;
  invoice_id: string;
  invoice_number: string;
  priority: string;
  customer_name: string;
  company_name: string;
  collecting_driver: string;
  delivering_driver: string;
  pickup_address: string;
  delivery_address: string;
  service_type: string;
  cost: number;
  tip_amount?: number;
  courier_commission?: number;
  courier_commission_vat?: number;
  status: string;
  submitted_at: string;
  accepted_at?: string;
  collected_at?: string;
  delivered_at?: string;
  canceled_at?: string;
  driver_notes?: string;
  return_job: boolean;
  payment_method: string;
  collected_waiting_time?: string;
  delivered_waiting_time?: string;
  return_job_delivered_waiting_time?: string;
  fuel_surcharge?: number;
  insurance_protection?: string;
  rider_tips?: number;
  package_value?: string;
  passenger_count?: number;
  luggage_count?: number;
  uploaded_at: string;
  uploaded_by: string;
  // Métricas calculadas
  collection_time_minutes?: number;
  delivery_time_minutes?: number;
  customer_experience_minutes?: number;
}

export interface MetricasResumo {
  medias: {
    "Collection Time (minutos)": number | null;
    "Delivery Time (minutos)": number | null;
    "Customer Experience (minutos)": number | null;
  };
  metricas_principais: {
    "Total Courier Commission": number;
    "Active Drivers": number;
    "Total Deliveries": number;
    "Total Distance": number;
    "Average Distance per Delivery": number;
  };
  estatisticas_detalhadas: {
    "Collection Time": {
      media: number | null;
      minimo: number | null;
      maximo: number | null;
      amostras: number;
    };
    "Delivery Time": {
      media: number | null;
      minimo: number | null;
      maximo: number | null;
      amostras: number;
    };
    "Customer Experience": {
      media: number | null;
      minimo: number | null;
      maximo: number | null;
      amostras: number;
    };
    Revenue: {
      total: number;
      media_por_entrega: number;
      minimo: number | null;
      maximo: number | null;
      entregas_com_custo: number;
    };
    Drivers: {
      total_ativos: number;
      lista_drivers: string[] | string;
      entregas_por_driver: number;
    };
  };
  analise_status: {
    resumo_percentual: {
      entregas_concluidas: number;
      entregas_canceladas: number;
      outros_status: number;
    };
    resumo_quantitativo: {
      total_entregas: number;
      entregas_concluidas: number;
      entregas_canceladas: number;
      outros_status: number;
    };
    taxa_sucesso: {
      percentual: number;
      descricao: string;
    };
    detalhamento_status: Record<string, number>;
  };
  resumo_processamento: {
    total_linhas: number;
    linhas_processadas: number;
    linhas_com_erro: number;
    fonte?: string;
  };
}

export interface ApiResponse<T> {
  total_registros?: number;
  fonte?: string;
  dados?: T[];
  data?: T[];
  erro?: string;
  detalhes?: string;
  sucesso?: boolean;
  mensagem?: string;
}

export interface DriverStats {
  driver_name: string;
  total_deliveries: number;
  total_revenue: number;
  success_rate: number;
  average_delivery_time: number;
}

export interface StatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

export interface StatusBanco {
  banco_conectado: boolean;
  total_registros_banco: number;
  total_registros_memoria: number;
  url_banco: string;
  ultimo_upload?: string;
  erro?: string;
}

// Novos tipos para os endpoints avançados
export interface EmpresaMetricas {
  nome: string;
  total_pedidos: number;
  localizacoes_pickup: string[];
  total_localizacoes: number;
  endereco_mais_comum: string;
  total_entregas: number;
}

export interface EmpresasResponse {
  total_empresas: number;
  total_pedidos: number;
  empresa_mais_ativa: EmpresaMetricas | null;
  fonte: 'banco_de_dados' | 'memoria';
  empresas: EmpresaMetricas[];
}

export interface LocalizacaoEntrega {
  endereco: string;
  total_entregas: number;
}

export interface LocalizacoesEntregaResponse {
  total_localizacoes: number;
  total_entregas: number;
  localizacao_mais_comum: LocalizacaoEntrega | null;
  fonte: 'banco_de_dados' | 'memoria';
  localizacoes: LocalizacaoEntrega[];
}

export interface EntregadorMetricas {
  nome: string;
  entregas_coleta: number;
  entregas_entrega: number;
  total_entregas: number;
}

export interface EntregadoresResponse {
  total_entregadores: number;
  total_entregas: number;
  media_entregas_por_entregador: number;
  entregador_mais_ativo: EntregadorMetricas | null;
  fonte: 'banco_de_dados' | 'memoria';
  entregadores: EntregadorMetricas[];
}

export interface IntervaloTemporal {
  intervalo_centro: string;
  intervalo_inicio: string;
  intervalo_fim: string;
  quantidade_pedidos: number;
  descricao: string;
  dia_semana: string;
  periodo_do_dia: string;
}

export interface AnaliseTemporalResponse {
  fonte: 'banco_de_dados' | 'memoria';
  analise_temporal: {
    total_pedidos_analisados: number;
    total_horarios_diferentes: number;
    total_intervalos_30min: number;
    horario_mais_movimentado: {
      data_hora: string;
      quantidade_pedidos: number;
    } | null;
    pedidos_por_datetime: Array<{
      data_hora: string;
      quantidade_pedidos: number;
    }>;
    top10_intervalos_30min: IntervaloTemporal[];
  };
  resumo: {
    total_pedidos_analisados: number;
    total_horarios_diferentes: number;
    total_intervalos_30min: number;
    horario_mais_movimentado: {
      data_hora: string;
      quantidade_pedidos: number;
    } | null;
    top_intervalo_30min: IntervaloTemporal | null;
    total_intervalos_analisados: number;
  };
} 