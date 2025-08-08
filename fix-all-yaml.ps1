# YAMLファイルを完全に修正するスクリプト
Write-Host "🔧 Fixing all YAML files..." -ForegroundColor Cyan

function Fix-YamlFile {
    param([string]$FilePath)
    
    if (Test-Path $FilePath) {
        Write-Host "  Fixing: $FilePath" -ForegroundColor Yellow
        
        # ファイルを読み込む
        $lines = Get-Content $FilePath
        
        # 各行の末尾の空白を削除
        $cleanedLines = $lines | ForEach-Object { $_.TrimEnd() }
        
        # 空の行を削除（ファイル末尾）
        while ($cleanedLines.Count -gt 0 -and $cleanedLines[-1] -eq '') {
            $cleanedLines = $cleanedLines[0..($cleanedLines.Count - 2)]
        }
        
        # ファイルに書き込む（最後に改行を1つ追加）
        $content = ($cleanedLines -join "`n") + "`n"
        [System.IO.File]::WriteAllText($FilePath, $content, [System.Text.Encoding]::UTF8)
        
        Write-Host "    ✅ Fixed!" -ForegroundColor Green
    }
}

# すべてのYAMLファイルを修正
$yamlFiles = @(
    ".github\actions\cache-dependencies\action.yml",
    ".github\actions\cache-deps\action.yml",
    ".github\actions\setup-project\action.yml",
    ".github\workflows\ci-composite.yml",
    ".github\workflows\ci-optimized.yml",
    ".github\workflows\test-composite.yml"
)

foreach ($file in $yamlFiles) {
    Fix-YamlFile -FilePath $file
}

Write-Host "`n✅ All YAML files fixed!" -ForegroundColor Green
