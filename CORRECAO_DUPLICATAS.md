# Correção de Duplicatas - Job ID

## Problemas Identificados

### 1. **Busca de Job IDs sem Paginação**
**Problema:** A função `salvar_dados_no_supabase()` buscava job_ids existentes sem paginação:
```python
result_existentes = supabase.table('fox_deliveries').select('job_id').execute()
```

**Impacto:** O Supabase/PostgREST tem limite de 1000 registros por query. Se o banco tiver mais de 1000 entregas, apenas os primeiros 1000 job_ids eram verificados, permitindo duplicatas para registros além desse limite.

**Solução:** Implementada busca com paginação para obter TODOS os job_ids:
```python
while True:
    result_existentes = supabase.table('fox_deliveries').select('job_id').range(offset, offset + page_size - 1).execute()
    if not result_existentes.data or len(result_existentes.data) < page_size:
        break
    offset += page_size
```

### 2. **Cache Atualizado com Duplicatas**
**Problema:** O cache era atualizado com TODOS os registros da planilha, incluindo duplicatas:
```python
cache_atualizado = atualizar_cache_metricas_incremental(df)  # df completo
```

**Impacto:** Métricas ficavam infladas, contando duplicatas que não foram inseridas no banco.

**Solução:** 
- Função `salvar_dados_no_supabase()` agora retorna lista de job_ids efetivamente inseridos
- Cache é atualizado APENAS com registros novos:
```python
job_ids_inseridos = set(resultado_db.get('job_ids_inseridos', []))
df_novos = df[df['Job ID'].isin(job_ids_inseridos)]
cache_atualizado = atualizar_cache_metricas_incremental(df_novos)
```

## Mudanças Implementadas

### `salvar_dados_no_supabase()`
1. ✅ Busca paginada de TODOS os job_ids existentes
2. ✅ Retorna lista de job_ids efetivamente inseridos
3. ✅ Logs melhorados com contador de duplicatas

### Upload Endpoint
1. ✅ Filtra DataFrame para incluir APENAS registros novos
2. ✅ Cache atualizado apenas com dados realmente inseridos
3. ✅ Tratamento para caso de 100% duplicatas

## Como Testar

### Teste 1: Upload da mesma planilha 2x
```bash
# 1. Fazer upload da planilha
curl -X POST http://127.0.0.1:5000/upload -F "file=@planilha.xlsx"

# Resposta esperada:
# {
#   "sucesso": true,
#   "registros_inseridos": 567,
#   "duplicatas_evitadas": 0
# }

# 2. Fazer upload DA MESMA planilha novamente
curl -X POST http://127.0.0.1:5000/upload -F "file=@planilha.xlsx"

# Resposta esperada:
# {
#   "sucesso": true,
#   "registros_inseridos": 0,
#   "duplicatas_evitadas": 567,
#   "mensagem": "...e 567 duplicatas evitadas"
# }
```

### Teste 2: Verificar contagem no banco
```bash
# Verificar métricas
curl http://127.0.0.1:5000/metricas-resumo-banco | python3 -c "import sys, json; data = json.load(sys.stdin); print('Total deliveries:', data['metrics']['total_deliveries']['value'])"

# Deve retornar o mesmo número após 2 uploads da mesma planilha
```

### Teste 3: Upload com banco > 1000 registros
```bash
# Com mais de 1000 registros no banco, fazer upload de duplicatas
# Verificar nos logs do backend:
# "Total de X Job IDs únicos no banco"
# "Total de Y duplicatas evitadas"
```

## Logs de Exemplo

### Upload com Novos Dados
```
Verificando Job IDs existentes para evitar duplicatas...
Total de 2743 Job IDs únicos no banco
Lote 1 inserido: 100 registros
Lote 2 inserido: 100 registros
...
✅ Total de 567 registros NOVOS salvos no Supabase
🔄 Iniciando atualização do cache de métricas...
   Registros NOVOS: 567
   DataFrame filtrado: 567 linhas (apenas novos registros)
✅ Cache de métricas atualizado com SUCESSO!
```

### Upload com 100% Duplicatas
```
Verificando Job IDs existentes para evitar duplicatas...
Total de 3310 Job IDs únicos no banco
⚠️ Total de 567 duplicatas evitadas
Nenhum dado novo para inserir (todos eram duplicatas ou sem Job ID)
⚠️ Nenhum registro novo para atualizar cache (todos duplicatas)
```

## Resultado Final

✅ **Duplicatas Evitadas:** Job IDs duplicados não são inseridos no banco
✅ **Cache Correto:** Métricas calculadas APENAS com registros novos
✅ **Escalabilidade:** Funciona com qualquer quantidade de registros no banco
✅ **Performance:** Busca otimizada com paginação em lotes de 1000
