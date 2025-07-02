# 📋 Empty State - Visual Example

Exemplo visual de como aparece o dashboard após Clear Data:

## 🖥️ Layout Visual

```
┌─────────────────────────────────────────────────────────────┐
│ Dashboard                                    [🔄 Refresh]   │
│                                              [🗑️ Clear Data]  │
│                                              [📤 Import Data] │
├─────────────────────────────────────────────────────────────┤
│ 🟢 Connected to database          0 records in database     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                          📄                                 │
│                    (FileSpreadsheet)                       │
│                                                             │
│                   No Data Available                        │
│                                                             │
│         Upload a spreadsheet to view data                  │
│         and analytics in your dashboard                    │
│                                                             │
│    ┌─────────────────┐  ┌─────────────────┐               │
│    │ 📤 Upload       │  │ 🔄 Refresh      │               │
│    │   Spreadsheet   │  │                 │               │
│    └─────────────────┘  └─────────────────┘               │
│                                                             │
│    ┌─────────────────────────────────────────┐             │
│    │ 📋 Supported formats:                   │             │
│    │ • Excel files (.xlsx, .xls)            │             │
│    │ • CSV files (.csv)                     │             │
│    │ • Must contain delivery data columns   │             │
│    └─────────────────────────────────────────┘             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 🎨 Cores e Estilos

### Topbar
- **Background**: Branco
- **Texto**: `#001B38` (azul escuro)
- **Clear Data**: `text-red-600` com hover vermelho claro

### Status Banner
- **Background**: `bg-blue-50` com borda `border-blue-200`
- **Indicador**: Círculo verde (`bg-green-500`)
- **Texto**: "Connected to database" em inglês

### Área Principal
- **Background**: Branco
- **Altura mínima**: 400px
- **Alinhamento**: Centralizado

### Ícone Principal
- **Tamanho**: 64px (`w-16 h-16`)
- **Cor**: `text-gray-400`
- **Tipo**: `FileSpreadsheet` do Lucide

### Títulos
- **Principal**: `text-2xl font-semibold text-[#001B38]`
- **Subtítulo**: `text-lg text-gray-600`

### Botões
- **Upload Spreadsheet**: 
  - Background: `bg-[#001B38]` 
  - Hover: `hover:bg-[#002855]`
  - Padding: `px-6 py-3`
  - Tamanho: Base (`text-base`)

- **Refresh**:
  - Border: `border-gray-300`
  - Hover: `hover:bg-gray-50`
  - Cor texto: `text-gray-600`

### Card de Informações
- **Background**: `bg-gray-50`
- **Border**: Rounded `rounded-lg`
- **Texto**: `text-sm text-gray-600`
- **Largura máxima**: `max-w-md`

## 🔄 Estados e Transições

### Antes do Clear Data
```
Dashboard normal com métricas → Botão Clear Data → Dialog de confirmação
```

### Durante Clear Data
```
Loading no dialog → Sucesso → Auto-close (2s)
```

### Após Clear Data
```
Dashboard atualiza → Detecta banco vazio → Mostra Empty State
```

### Próximos Passos
```
Upload planilha → Dashboard volta ao normal com dados
OU
Refresh → Mantém Empty State se ainda vazio
```

## 📱 Responsividade

### Desktop (xl:)
- Botões lado a lado horizontalmente
- Card de informações com largura máxima controlada

### Tablet (md:)
- Layout mantém estrutura vertical
- Botões ainda lado a lado

### Mobile
- Botões podem empilhar verticalmente se necessário
- Texto responsivo mantém legibilidade

## ✅ Checklist Visual

- [ ] Ícone FileSpreadsheet aparece centralizados
- [ ] Texto "No Data Available" em destaque
- [ ] Subtítulo explicativo claro
- [ ] Botão "Upload Spreadsheet" azul e proeminente
- [ ] Botão "Refresh" secundário mas visível
- [ ] Card de formatos suportados legível
- [ ] Status banner mostra "0 records"
- [ ] Indicador verde de conexão ativo
- [ ] Layout centralizado e equilibrado 