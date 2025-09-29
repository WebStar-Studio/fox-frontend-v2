# 📋 Configuração de Logs do Sistema

## 🎯 Sobre

O sistema Fox Delivery possui logs detalhados para desenvolvimento, mas **automaticamente silencia** todos os logs em produção para evitar poluição do console.

## 🔧 Como Funciona

O `ApiService` detecta automaticamente o ambiente através de `process.env.NODE_ENV`:

- **Desenvolvimento** (`NODE_ENV=development`): Logs **ATIVADOS** ✅
- **Produção** (`NODE_ENV=production`): Logs **DESATIVADOS** ❌

## 🚀 Comportamento por Ambiente

### Em Desenvolvimento (localhost)
```javascript
// Logs detalhados visíveis:
[ApiService] 🔄 Paginação MANUAL no frontend para /dados-banco
[ApiService] Buscando página 1 (offset: 0, limit: 1000)
[ApiService] ✅ Página 1: +1000 registros (0 → 1000)
[ApiService] ✅ Dados agregados obtidos com sucesso
```

### Em Produção (deploy)
```javascript
// Console limpo - sem logs
// Sistema funciona normalmente, mas silenciosamente
```

## 📝 O Que Foi Silenciado

### Logs Removidos em Produção:
- ❌ Logs de paginação detalhados
- ❌ Erros de requisição (404, 500, etc)
- ❌ Avisos de páginas vazias
- ❌ Mensagens de debug de agregação
- ❌ Estatísticas de performance

### Sempre Visíveis:
- ✅ Erros críticos do sistema (apenas em dev)
- ✅ Exceções não tratadas

## 🔍 Como Testar

### Forçar Modo Produção Local:
```bash
# No terminal, antes de rodar o projeto:
set NODE_ENV=production
npm run dev
```

### Voltar para Desenvolvimento:
```bash
set NODE_ENV=development
npm run dev
```

## 🛠️ Customização

Se precisar ajustar o comportamento, edite `src/lib/api.ts`:

```typescript
class ApiService {
  private debugMode: boolean;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    // Modificar esta linha para customizar:
    this.debugMode = process.env.NODE_ENV === 'development';
    
    // Exemplos de customização:
    // this.debugMode = false; // Sempre desligado
    // this.debugMode = true; // Sempre ligado
    // this.debugMode = localStorage.getItem('debug') === 'true'; // Controle manual
  }
}
```

## ✅ Resultado

Agora quando você publicar a plataforma:
- ✅ Console limpo para usuários finais
- ✅ Sem mensagens de erro assustadoras
- ✅ Performance não afetada
- ✅ Logs detalhados disponíveis em dev

## 🎉 Pronto!

Seu sistema agora está configurado para:
- **Desenvolvimento**: Logs completos para debug
- **Produção**: Interface limpa e profissional
