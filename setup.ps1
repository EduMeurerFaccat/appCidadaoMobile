# Criar pastas
New-Item -ItemType Directory -Force -Path "src\telas"
New-Item -ItemType Directory -Force -Path "src\componentes"
New-Item -ItemType Directory -Force -Path "src\navegacao"
New-Item -ItemType Directory -Force -Path "src\servicos"
New-Item -ItemType Directory -Force -Path "assets"

# Criar arquivos de telas
New-Item -ItemType File -Path "src\telas\DetalhesProblema.tsx"
New-Item -ItemType File -Path "src\telas\FotosProblema.tsx"
New-Item -ItemType File -Path "src\telas\LocalizacaoProblema.tsx"
New-Item -ItemType File -Path "src\telas\Resumo.tsx"

# Criar arquivo de navegação
New-Item -ItemType File -Path "src\navegacao\NavegadorStack.tsx"

# Criar arquivo App.tsx se não existir
if (-not (Test-Path -Path "App.tsx")) {
    New-Item -ItemType File -Path "App.tsx"
}

Write-Host "✅ Estrutura criada com sucesso!"
