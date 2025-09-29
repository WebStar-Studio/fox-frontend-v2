$filePath = "c:\Users\lucca\OneDrive\Área de Trabalho\fox-front-vFinal\fox-frontend-v2\fox-front\src\hooks\useApiData.ts"

# Ler o conteúdo do arquivo
$content = Get-Content $filePath -Raw

# Texto antigo (com escape correto)
$oldText = @"
  const statusBanco = useStatusBanco();
  // Usar o total de registros do banco como limit para garantir que buscamos TODOS os dados
  const statusData = statusBanco.data as StatusBanco;
  const totalRegistros = statusData?.total_registros_banco;
  // Só buscar dados do banco quando já soubermos o total, para evitar uma primeira busca sem limit
  const dadosBanco = useDadosBanco(
    totalRegistros && totalRegistros > 0 ? totalRegistros : undefined,
    { enabled: typeof totalRegistros === 'number' && totalRegistros >= 0 }
  );
"@

# Texto novo
$newText = @"
  const statusBanco = useStatusBanco();
  const statusData = statusBanco.data as StatusBanco;
  
  // CRÍTICO: NÃO passar limit - undefined ativa paginação automática no frontend
  // Se passar limit, getDadosBanco(limit) retorna só aquela quantidade SEM paginar
  const dadosBanco = useDadosBanco(
    undefined,
    { enabled: statusData?.banco_conectado && statusData?.total_registros_banco > 0 }
  );
"@

# Fazer a substituição
$newContent = $content -replace [regex]::Escape($oldText), $newText

# Salvar o arquivo
$newContent | Set-Content $filePath -NoNewline

Write-Host "Arquivo atualizado com sucesso!" -ForegroundColor Green
