$files = @(
    ".github\actions\cache-dependencies\action.yml",
    ".github\actions\setup-project\action.yml",
    ".github\workflows\ci-composite.yml"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file
        $cleaned = $content | ForEach-Object { $_.TrimEnd() }
        $cleaned | Out-File -FilePath $file -Encoding UTF8 -NoNewline
        Write-Host "✅ Cleaned: $file" -ForegroundColor Green
    }
}
