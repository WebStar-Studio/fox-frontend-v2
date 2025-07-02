# Integração com API Flask

Este documento explica como a aplicação frontend Next.js está integrada com a API Flask para gerenciar dados de entregas.

## Configuração da API

A API Flask deve estar rodando em `http://localhost:5000` por padrão. Para alterar a URL da API, modifique a constante `API_BASE_URL` no arquivo `src/lib/api.ts`.

## Estrutura da Integração

### 1. Serviço de API (`src/lib/api.ts`)
- **apiService**: Classe principal para comunicação com o backend Flask
- **Endpoints suportados**:
  - `GET /dados-hibrido`: Dados do banco primeiro, depois memória (recomendado)
  - `GET /metricas-resumo-banco`: Métricas calculadas do banco de dados
  - `POST /upload`: Upload de planilhas Excel
  - `GET /status-banco`: Status da conexão com o banco

### 2. Hooks Customizados (`src/hooks/useApiData.ts`)
- **useDashboardData()**: Hook principal para o dashboard
- **useUploadPlanilha()**: Hook para upload de arquivos
- **useRefreshData()**: Hook para refresh manual dos dados

### 3. Tipos TypeScript (`src/types/index.ts`)
- **DeliveryRecord**: Interface para dados de entrega
- **MetricasResumo**: Interface para métricas agregadas
- **StatusBanco**: Interface para status do banco de dados

## Como Usar

### Dashboard Principal
O dashboard carrega automaticamente dados da API:
```typescript
const { metricas, dados, isLoading, error } = useDashboardData();
```

### Upload de Planilhas
Use o componente `UploadDialog` para fazer upload de arquivos Excel:
```typescript
<UploadDialog>
  <button>Import Data</button>
</UploadDialog>
```

### Refresh de Dados
Para atualizar os dados manualmente:
```typescript
const refreshData = useRefreshData();
refreshData(); // Atualiza todos os dados
```

## Métricas Calculadas

O dashboard exibe as seguintes métricas em tempo real:
- **Total Deliveries**: Número total de entregas
- **Success Rate**: Taxa de sucesso das entregas
- **Total Revenue**: Receita total
- **Active Drivers**: Número de motoristas ativos
- **Average Delivery Time**: Tempo médio de entrega
- **Customer Experience**: Tempo total da experiência do cliente

## Gráficos

### Top 5 Drivers (BarChart)
Mostra os 5 melhores motoristas baseado em:
- Número de entregas
- Taxa de sucesso

### Status Distribution (DonutChart)
Distribui as entregas por status:
- Delivered/Completed (Verde)
- Cancelled/Canceled (Vermelho)
- Pending (Amarelo)
- In Progress (Azul)

## Status da Conexão

O dashboard mostra um indicador visual do status da conexão:
- 🟢 Verde: Conectado ao banco de dados
- 🔴 Vermelho: Desconectado (usando dados em memória)

## Cache e Performance

- **React Query**: Gerencia cache automático dos dados
- **Stale Time**: 5 minutos para dados principais
- **Retry**: 2 tentativas em caso de erro
- **Background Refetch**: Dados são atualizados em background

## Tratamento de Erros

A aplicação trata os seguintes cenários:
- API offline/indisponível
- Dados corrompidos ou vazios
- Erros de upload de arquivo
- Timeout de requisições

## Desenvolvimento

Para adicionar novos endpoints:

1. Adicione o método no `apiService` (src/lib/api.ts)
2. Crie um hook customizado se necessário (src/hooks/useApiData.ts)
3. Adicione os tipos TypeScript (src/types/index.ts)
4. Use o hook nos componentes

Exemplo:
```typescript
// api.ts
async getNovoEndpoint() {
  return this.request('/novo-endpoint');
}

// useApiData.ts
export function useNovoEndpoint() {
  return useQuery({
    queryKey: ['novo-endpoint'],
    queryFn: () => apiService.getNovoEndpoint(),
  });
} 