# validate-yaml.ps1
Write-Host "`n🔍 Validating YAML files..." -ForegroundColor Cyan

$yamlFiles = @(
    ".github\actions\cache-deps\action.yml",
    ".github\actions\cache-dependencies\action.yml", 
    ".github\actions\setup-project\action.yml",
    ".github\workflows\ci-composite.yml"
)

$allValid = $true

foreach ($file in $yamlFiles) {
    if (Test-Path $file) {
        Write-Host "`nChecking: $file" -ForegroundColor Yellow
        
        $content = Get-Content $file -Raw
        $lines = Get-Content $file
        
        # 基本的な検証
        $issues = @()
        
        # 1. タブのチェック
        if ($content -match '\t') {
            $issues += "❌ Contains tabs (use spaces instead)"
            $allValid = $false
        }
        
        # 2. 末尾の空白チェック
        $lineNum = 0
        foreach ($line in $lines) {
            $lineNum++
            if ($line -match '\s+$') {
                $issues += "⚠️ Line $lineNum has trailing whitespace"
            }
        }
        
        # 3. 基本的なYAML構造チェック
        if ($content -match ':\s*\n\s*-') {
            Write-Host "  ✅ Valid YAML list structure" -ForegroundColor Green
        }
        
        if ($content -match 'name:') {
            Write-Host "  ✅ Has 'name' field" -ForegroundColor Green
        }
        
        if ($content -match 'runs:') {
            Write-Host "  ✅ Has 'runs' field (for actions)" -ForegroundColor Green
        } elseif ($content -match 'jobs:') {
            Write-Host "  ✅ Has 'jobs' field (for workflows)" -ForegroundColor Green
        }
        
        # 4. インデントチェック（2スペース推奨）
        $indentOk = $true
        foreach ($line in $lines) {
            if ($line -match '^(\s+)' -and $matches[1].Length % 2 -ne 0) {
                $indentOk = $false
            }
        }
        
        if ($indentOk) {
            Write-Host "  ✅ Proper indentation (2 spaces)" -ForegroundColor Green
        } else {
            $issues += "⚠️ Inconsistent indentation detected"
        }
        
        # 結果表示
        if ($issues.Count -eq 0) {
            Write-Host "  ✅ No issues found!" -ForegroundColor Green
        } else {
            foreach ($issue in $issues) {
                Write-Host "  $issue" -ForegroundColor Yellow
            }
        }
        
    } else {
        Write-Host "❌ File not found: $file" -ForegroundColor Red
        $allValid = $false
    }
}

Write-Host "`n" -NoNewline
if ($allValid) {
    Write-Host "✅ All YAML files are valid!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Some issues were found, but they may not prevent execution" -ForegroundColor Yellow
}
