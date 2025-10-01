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

// NOVO FORMATO OTIMIZADO - Dashboard Metrics (retornado por /metricas-resumo-banco e /dashboard-metrics)
export interface DashboardMetrics {
  success: boolean;
  timestamp: string;
  metrics: {
    total_deliveries: {
      value: number;
      label: string;
      description: string;
    };
    customer_experience: {
      value: number;
      unit: string;
      label: string;
      description: string;
      samples: number;
    };
    collection_time: {
      value: number;
      unit: string;
      label: string;
      description: string;
      samples: number;
    };
    average_delivery_time: {
      value: number;
      unit: string;
      label: string;
      description: string;
      samples: number;
    };
    total_courier_commission: {
      value: number;
      unit: string;
      label: string;
      description: string;
    };
    active_drivers: {
      value: number;
      label: string;
      description: string;
    };
    active_companies: {
      value: number;
      label: string;
      description: string;
    };
    total_distance: {
      value: number;
      unit: string;
      label: string;
      description: string;
    };
    delivery_completion_status: {
      value: number;
      unit: string;
      label: string;
      description: string;
      completed: number;
      total: number;
    };
  };
  top_5_drivers: Array<{
    rank: number;
    name: string;
    deliveries: number;
  }>;
  metadata: {
    total_records_analyzed: number;
    total_records_database: number;
    calculation_method: string;
    note: string;
  };
}

// FORMATO LEGADO (mantido para compatibilidade)
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

export interface UploadResponse {
  sucesso: boolean;
  mensagem: string;
  total_registros: number;
  arquivo: string;
  colunas_processadas: number;
  colunas_obrigatorias_encontradas: number;
  colunas_opcionais_encontradas: number;
  salvo_no_banco: boolean;
  registros_inseridos?: number;
  duplicatas_evitadas?: number;
  erro_banco?: string;
  erro?: string;
  detalhes?: string;
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

// Tipo para métricas detalhadas de uma empresa específica (endpoint /empresa-metricas)
export interface EmpresaMetricasDetalhadas {
  empresa: string;
  total_deliveries: number;
  collection_time: {
    media_minutos: number | null;
    minimo_minutos: number | null;
    maximo_minutos: number | null;
    amostras_validas: number;
  };
  delivery_time: {
    media_minutos: number | null;
    minimo_minutos: number | null;
    maximo_minutos: number | null;
    amostras_validas: number;
  };
  customer_experience: {
    media_minutos: number | null;
    minimo_minutos: number | null;
    maximo_minutos: number | null;
    amostras_validas: number;
  };
  delayed_orders: {
    total: number;
    percentual: number;
    criterio: string;
    total_com_metricas: number;
  };
  resumo_performance: {
    pedidos_analisados: number;
    pedidos_com_metricas_completas: number;
    taxa_sucesso_metricas: number;
  };
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

// ========== TIPOS DE AUTENTICAÇÃO ==========

export type UserRole = 'admin' | 'client' | 'company';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  company_name?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  company_name?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
  company_name?: string; // Obrigatório apenas para role 'company'
}

export interface AuthResponse {
  user: AuthUser | null;
  error?: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (credentials: RegisterCredentials) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isClient: boolean;
  isCompany: boolean;
}

// Tipo para lista de empresas disponíveis
export interface AvailableCompany {
  company_name: string;
  total_deliveries: number;
}

// Permissões específicas por role
export interface RolePermissions {
  canViewFullDashboard: boolean;
  canViewDrivers: boolean;
  canViewCompanies: boolean;
  canViewAnalytics: boolean;
  canUploadData: boolean;
  canManageUsers: boolean;
  allowedMetrics: string[];
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: {
    canViewFullDashboard: true,
    canViewDrivers: true,
    canViewCompanies: true,
    canViewAnalytics: true,
    canUploadData: true,
    canManageUsers: true,
    allowedMetrics: ['all']
  },
  client: {
    canViewFullDashboard: false,
    canViewDrivers: false,
    canViewCompanies: false,
    canViewAnalytics: false,
    canUploadData: false,
    canManageUsers: false,
    allowedMetrics: [
      'total_deliveries',
      'collection_time',
      'avg_time',
      'customer_experience',
      'top_peak_hours',
      'delivery_completion_status'
    ]
  },
  company: {
    canViewFullDashboard: false,
    canViewDrivers: false,
    canViewCompanies: false,
    canViewAnalytics: false,
    canUploadData: false,
    canManageUsers: false,
    allowedMetrics: [
      'total_deliveries',
      'collection_time',
      'avg_time',
      'customer_experience',
      'top_peak_hours',
      'delivery_completion_status',
      'company_metrics'
    ]
  }
}; 