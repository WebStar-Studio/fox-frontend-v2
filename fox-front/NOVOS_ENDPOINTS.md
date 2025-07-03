# Novos Endpoints Integrados

## 📊 Métricas Avançadas

A API agora oferece 3 novos endpoints para análises mais detalhadas:

### 1. `/empresas` - Métricas de Empresas
- **Endpoint**: `GET /empresas`
- **Tipo**: `EmpresasResponse`
- **Hook**: `useEmpresasMetricas()`

**Dados retornados:**
- Lista de empresas com quantidade de pedidos
- Localizações de pickup por empresa
- Endereço mais comum de cada empresa
- Empresa mais ativa

### 2. `/localizacoes-entrega` - Análise de Localizações
- **Endpoint**: `GET /localizacoes-entrega`
- **Tipo**: `LocalizacoesEntregaResponse` 
- **Hook**: `useLocalizacoesEntrega()`

**Dados retornados:**
- Lista de localizações de entrega
- Quantidade de entregas por localização
- Localização mais comum
- Estatísticas gerais

### 3. `/entregadores` - Performance dos Entregadores
- **Endpoint**: `GET /entregadores`
- **Tipo**: `EntregadoresResponse`
- **Hook**: `useEntregadoresMetricas()`

**Dados retornados:**
- Lista de entregadores com performance
- Quantidade de coletas vs entregas
- Entregador mais ativo
- Média de entregas por entregador

## 🔧 Como Usar

### Hooks Individuais

```typescript
import { useEmpresasMetricas, useLocalizacoesEntrega, useEntregadoresMetricas } from '@/hooks/useApiData';

// Usar individual
const { data: empresas, isLoading, error } = useEmpresasMetricas();
const { data: localizacoes } = useLocalizacoesEntrega();
const { data: entregadores } = useEntregadoresMetricas();
```

### Hook Combinado

```typescript
import { useMetricasAvancadas } from '@/hooks/useApiData';

const { 
  empresas, 
  localizacoes, 
  entregadores, 
  isLoading, 
  error,
  refetch 
} = useMetricasAvancadas();
```

## 📋 Tipos TypeScript

### EmpresaMetricas
```typescript
interface EmpresaMetricas {
  nome: string;
  total_pedidos: number;
  localizacoes_pickup: string[];
  total_localizacoes: number;
  endereco_mais_comum: string;
  total_entregas: number;
}
```

### LocalizacaoEntrega
```typescript
interface LocalizacaoEntrega {
  endereco: string;
  total_entregas: number;
}
```

### EntregadorMetricas
```typescript
interface EntregadorMetricas {
  nome: string;
  entregas_coleta: number;
  entregas_entrega: number;
  total_entregas: number;
}
```

## 🔄 Integração com Upload

Os novos endpoints são **automaticamente invalidados** quando:
- Upload de planilha é feito
- Banco de dados é limpo  
- Refresh manual é executado

## 🧠 Lógica de Ativação

Os hooks só fazem requisições quando:
- Há dados no banco de dados (`total_registros_banco > 0`)
- OU há dados na memória (`total_registros_memoria > 0`)

## 🔧 Retry Inteligente

Todos os novos hooks incluem:
- Retry até 3 vezes para erros 404
- Delay exponencial (1s, 2s, 3s)
- Logs informativos para debug
- Stale time de 5 minutos

## ⚙️ Configuração

Base URL configurada para: `http://localhost:5000`

## 🚀 Próximos Passos

1. **Criar componentes** para visualizar essas métricas
2. **Adicionar ao dashboard** conforme necessário
3. **Implementar filtros** por empresa, localização, etc.
4. **Criar gráficos** para visualização das métricas

## 📝 Exemplo de Uso Completo

```typescript
"use client";

import { useEmpresasMetricas } from '@/hooks/useApiData';

export function EmpresasList() {
  const { data: empresasData, isLoading, error } = useEmpresasMetricas();

  if (isLoading) return <div>Carregando empresas...</div>;
  if (error) return <div>Erro: {error.message}</div>;
  if (!empresasData) return <div>Nenhuma empresa encontrada</div>;

  return (
    <div>
      <h2>Top {empresasData.empresas.length} Empresas</h2>
      <p>Total de pedidos: {empresasData.total_pedidos}</p>
      
      {empresasData.empresas.map((empresa, index) => (
        <div key={index} className="empresa-card">
          <h3>{empresa.nome}</h3>
          <p>Pedidos: {empresa.total_pedidos}</p>
          <p>Localizações: {empresa.total_localizacoes}</p>
          <p>Endereço principal: {empresa.endereco_mais_comum}</p>
        </div>
      ))}
    </div>
  );
}
```

## ✅ Status da Integração

- [x] Tipos TypeScript criados
- [x] Endpoints adicionados à API
- [x] Hooks customizados implementados
- [x] Invalidação automática configurada
- [x] Retry inteligente implementado
- [x] Documentação criada
- [ ] Componentes visuais (próxima etapa)
- [ ] Integração ao dashboard (próxima etapa) 