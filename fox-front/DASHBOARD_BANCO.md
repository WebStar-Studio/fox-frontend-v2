# Dashboard com Foco no Banco de Dados

Este documento descreve as alterações realizadas para que o dashboard utilize **exclusivamente** dados do banco de dados Supabase.

## Mudanças Realizadas

### 1. Hook Principal Atualizado (`useDashboardData`)
- ❌ **Removido**: Fallback para dados em memória
- ✅ **Adicionado**: Uso exclusivo de `useMetricasResumoBanco()` e `useDadosBanco()`
- ✅ **Resultado**: Todos os dados vêm diretamente do banco Supabase

### 2. Métricas do Dashboard Corrigidas

#### Antes:
- ❌ Success Rate (taxa de sucesso em %)
- ❌ Average Delivery Time com dados inconsistentes
- ❌ Customer Experience zerado

#### Depois:
- ✅ **Collection Time**: Tempo médio de coleta (do banco)
- ✅ **Delivery Time**: Tempo médio de entrega (do banco)  
- ✅ **Customer Experience**: Tempo total da experiência (Collection + Delivery)

### 3. Cards do Dashboard Atualizados

```typescript
// Collection Time (novo)
<DashboardCard
  title="Collection Time"
  value={averageCollectionTime > 0 ? formatTime(averageCollectionTime) : "0m"}
  subtitle="Average collection time"
  status={averageCollectionTime <= 30 ? "good" : "warning"}
/>

// Delivery Time (melhorado)
<DashboardCard
  title="Average Delivery Time"
  value={averageDeliveryTime > 0 ? formatTime(averageDeliveryTime) : "0m"}
  subtitle="Average delivery time"
/>

// Customer Experience (corrigido)
<DashboardCard
  title="Customer Experience"
  value={averageCustomerExperience > 0 ? formatTime(averageCustomerExperience) : "N/A"}
  subtitle="Total experience time (Collection + Delivery)"
  status={averageCustomerExperience > 0 ? "good" : "warning"}
/>
```

## Endpoints Utilizados

### Principais (Banco de Dados)
- `GET /metricas-resumo-banco` - Métricas calculadas do Supabase
- `GET /dados-banco` - Dados brutos do Supabase
- `GET /status-banco` - Status da conexão

### Descontinuados (Memória)
- ~~`GET /metricas-resumo`~~ - Não utilizado mais
- ~~`GET /dados`~~ - Não utilizado mais
- ~~`GET /dados-hibrido`~~ - Não utilizado mais

## Indicadores Visuais

### Status da Conexão
- 🟢 **Verde**: Conectado ao banco Supabase
- 🔴 **Vermelho**: Desconectado (dados não disponíveis)

### Métricas de Performance
- **Collection Time**:
  - 🟢 ≤ 30 min: Excelente
  - 🟡 30-60 min: Bom
  - 🔴 > 60 min: Precisa melhorar

- **Customer Experience**:
  - 🟢 ≤ 90 min: Excelente
  - 🟡 90-180 min: Bom  
  - 🔴 > 180 min: Precisa melhorar

## Debug e Monitoramento

### Console Logs Adicionados
O dashboard agora exibe logs para monitoramento:

```javascript
console.log('🔍 Debug Dashboard - Métricas do banco:', {
  averageCollectionTime,
  averageDeliveryTime, 
  averageCustomerExperience,
  totalDeliveries,
  fonte: 'banco_de_dados'
});
```

## Como Testar

### 1. Verificar Conexão
1. Abrir o dashboard
2. Verificar indicador verde/vermelho no topo
3. Verificar console do navegador para logs de debug

### 2. Verificar Métricas
1. **Collection Time**: Deve mostrar tempo em minutos/horas
2. **Delivery Time**: Deve mostrar tempo real do banco
3. **Customer Experience**: Deve mostrar soma dos tempos ou "N/A"

### 3. Upload de Planilha
1. Clicar em "Import Data"
2. Fazer upload de arquivo .xlsx
3. Verificar atualização automática das métricas

## Próximos Passos

Se **Customer Experience** ainda estiver zerado:

1. **Verificar dados no banco**:
   ```sql
   SELECT 
     submitted_at, 
     collected_at, 
     delivered_at,
     collected_waiting_time,
     delivered_waiting_time
   FROM fox_deliveries 
   LIMIT 5;
   ```

2. **Verificar cálculo no Flask**:
   - Endpoint `/metricas-resumo-banco`
   - Função `calcular_metricas_linha()`

3. **Verificar formato de datas**:
   - Datas devem estar em formato ISO
   - Tempos de espera em formato correto

## ⚠️ Novo: Botão Clear Data + Empty State

### Funcionalidade Clear Data
- **Localização**: Topbar do dashboard (botão vermelho)
- **Ação**: Limpa TODOS os dados do banco Supabase
- **Confirmação**: Requer digitação de "clear data" para confirmar
- **Feedback**: Loading, sucesso e erro visual

### Como Usar
1. Clicar no botão **"Clear Data"** (vermelho) no topo
2. Ler os avisos de segurança
3. Digitar `clear data` no campo de confirmação
4. Clicar em "Limpar Dados"
5. Aguardar confirmação de sucesso
6. **Novo**: Dashboard mostra mensagem personalizada em inglês

### Segurança
- ⚠️ **AÇÃO IRREVERSÍVEL** - Não pode ser desfeita
- 🔒 **Confirmação obrigatória** - Previne cliques acidentais
- 📝 **Digitação manual** - Deve digitar "clear data"
- 🚨 **Avisos visuais** - Interface vermelha e alertas

### 📋 Novo: Empty State (Estado Vazio)
Após clear data ou quando banco está vazio:

**Mensagem Principal** (em inglês):
```
No Data Available
Upload a spreadsheet to view data and analytics in your dashboard
```

**Elementos Visuais**:
- 📄 Ícone grande de planilha (`FileSpreadsheet`)
- 🔵 Status "Connected to database" (verde)
- 📊 "0 records in database"
- 🔘 Botão "Upload Spreadsheet" (principal)
- 🔄 Botão "Refresh" (secundário)

**Informações de Formatos**:
- Excel files (.xlsx, .xls)
- CSV files (.csv) 
- Must contain delivery data columns

## Arquivos Modificados

- `src/hooks/useApiData.ts` - Hook principal para banco apenas
- `src/app/page.tsx` - Cards do dashboard atualizados
- `src/components/Topbar.tsx` - Adicionado botão Clear Data
- `src/components/ClearDataDialog.tsx` - Novo componente de confirmação
- `DASHBOARD_BANCO.md` - Esta documentação 