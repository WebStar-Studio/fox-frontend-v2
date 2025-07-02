# 🗑️ Clear Data Feature

Funcionalidade para limpar todos os dados do banco de dados Supabase através da interface do dashboard.

## 📍 Localização

O botão **"Clear Data"** está localizado no **Topbar** do dashboard, ao lado dos botões "Refresh" e "Import Data".

```
[Refresh] [Clear Data] [Import Data]
```

## 🔴 Identificação Visual

- **Cor**: Vermelho (`text-red-600`)
- **Ícone**: Lixeira (`Trash2`)
- **Hover**: Fundo vermelho claro
- **Posição**: Entre Refresh e Import Data

## ⚠️ Processo de Confirmação

### 1. Clique Inicial
- Clique no botão "Clear Data"
- Abre dialog modal de confirmação

### 2. Avisos de Segurança
O dialog exibe avisos claros:
- ⚠️ **AÇÃO IRREVERSÍVEL**
- 🗑️ Deletará **TODOS** os dados do Supabase
- 📊 Todas as entregas e métricas serão perdidas
- 🔄 Não é possível desfazer
- 📊 Dashboard ficará vazio até próximo upload

### 3. Confirmação Obrigatória
- **Campo de texto**: Deve digitar exatamente `clear data`
- **Case insensitive**: "Clear Data", "CLEAR DATA" também funcionam
- **Botão**: Só habilita quando texto correto for digitado
- **Cores**: Botão fica vermelho quando habilitado

### 4. Execução
- Loading spinner durante processo
- Feedback visual de sucesso/erro
- Auto-fechamento após 2 segundos se sucesso

## 🔧 Implementação Técnica

### Componentes Envolvidos
```typescript
// Topbar principal
src/components/Topbar.tsx

// Dialog de confirmação
src/components/ClearDataDialog.tsx

// Hook de clear data
src/hooks/useApiData.ts → useLimparBanco()

// Service API
src/lib/api.ts → apiService.limparBanco()
```

### Endpoint Utilizado
```
DELETE /limpar-banco
```

### Invalidação de Cache
Após sucesso, invalida automaticamente:
- `dados-banco`
- `metricas-resumo-banco`
- `status-banco`
- `dados-hibrido`

## 🎯 Estados do Dialog

### Loading State
```
🔄 Limpando dados do banco...
```

### Success State
```
✅ Dados limpos com sucesso!
   Todos os dados foram removidos do banco de dados.
```

### Error State
```
❌ Erro ao limpar dados
   [Mensagem de erro específica]
```

## 🛡️ Segurança

### Prevenção de Acidentes
1. **Botão diferenciado**: Cor vermelha clara
2. **Dialog modal**: Não pode ser ignorado
3. **Confirmação textual**: Deve digitar manualmente
4. **Avisos explícitos**: Múltiplas linhas de aviso
5. **Botão desabilitado**: Até confirmação correta

### Casos de Uso Apropriados
- ✅ Desenvolvimento/testes
- ✅ Limpeza antes de nova importação
- ✅ Reset completo do sistema
- ❌ **NUNCA** em produção com dados importantes

## 🔄 Integração com Dashboard

### Antes do Clear
```
Dashboard: Mostra métricas atuais
Status: 🟢 Conectado (X registros)
```

### Durante o Clear
```
Dialog: 🔄 Limpando dados...
Dashboard: Continua normal
```

### Após o Clear
```
Dashboard: Mostra Empty State personalizado ✨
Status: 🟢 Connected to database (0 records)
Mensagem: "No Data Available - Upload a spreadsheet to view data"
Botões: [Upload Spreadsheet] [Refresh]
```

## 📋 Checklist de Teste

- [ ] Botão aparece corretamente no Topbar
- [ ] Clique abre dialog modal
- [ ] Avisos de segurança são exibidos
- [ ] Campo de confirmação funciona
- [ ] Botão só habilita com texto correto
- [ ] Loading state aparece durante execução
- [ ] Success state aparece após sucesso
- [ ] Error state aparece se houver erro
- [ ] Dashboard atualiza automaticamente
- [ ] Status do banco atualiza para 0 registros

## 🔧 Troubleshooting

### Problema: Botão não aparece
- Verificar import do `ClearDataDialog` no `Topbar.tsx`
- Verificar se compilação passou sem erros

### Problema: Dialog não abre
- Verificar se `Dialog` components estão funcionando
- Verificar console para erros JavaScript

### Problema: Clear não executa
- Verificar se API Flask está rodando
- Verificar endpoint `/limpar-banco` (DELETE)
- Verificar console para erros de rede

### Problema: Dashboard não atualiza
- Verificar invalidação de queries no `useLimparBanco`
- Forçar refresh manual se necessário

## 📋 Novo: Empty State (Estado Vazio)

### Quando Aparece
- Após usar Clear Data com sucesso
- Quando banco está conectado mas vazio (0 registros)
- Não aparece durante loading ou erro

### Elementos da Interface

#### Cabeçalho
```
🔵 Connected to database
📊 0 records in database
```

#### Mensagem Principal
```
📄 [Ícone FileSpreadsheet grande]
No Data Available
Upload a spreadsheet to view data and analytics in your dashboard
```

#### Botões de Ação
- **Upload Spreadsheet** - Botão principal azul escuro
- **Refresh** - Botão secundário com borda

#### Informações de Suporte
```
📋 Supported formats:
• Excel files (.xlsx, .xls)
• CSV files (.csv)
• Must contain delivery data columns
```

### Lógica de Detecção
```typescript
const isDatabaseEmpty = statusBanco?.banco_conectado && 
                        (statusBanco?.total_registros_banco === 0 || totalDeliveries === 0) &&
                        !isLoading && !error;
```

### Design System
- **Cor principal**: `#001B38` (azul escuro)
- **Ícones**: `FileSpreadsheet`, `Upload`, `RefreshCw`
- **Texto**: Inglês para consistência
- **Layout**: Centralizado, min-height 400px
- **Responsivo**: Grid adaptável para mobile 