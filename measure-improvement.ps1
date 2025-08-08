param(
    [string]$BeforeFile,
    [string]$AfterFile
)

function Count-Lines {
    param([string]$File)
    return (Get-Content $File | Measure-Object -Line).Lines
}

function Count-Duplicates {
    param([string]$File)
    $content = Get-Content $File -Raw
    $setupPythonCount = ([regex]::Matches($content, 'setup-python')).Count
    $checkoutCount = ([regex]::Matches($content, 'actions/checkout')).Count
    return @{
        SetupPython = $setupPythonCount
        Checkout = $checkoutCount
        Total = $setupPythonCount + $checkoutCount
    }
}

if ($BeforeFile -and $AfterFile) {
    $beforeLines = Count-Lines $BeforeFile
    $afterLines = Count-Lines $AfterFile
    $beforeDups = Count-Duplicates $BeforeFile
    $afterDups = Count-Duplicates $AfterFile

    $reduction = [math]::Round((($beforeLines - $afterLines) / $beforeLines) * 100, 2)

    Write-Host "`n📊 Improvement Metrics:" -ForegroundColor Cyan
    Write-Host "  Lines of code: $beforeLines → $afterLines (-$reduction%)" -ForegroundColor Green
    Write-Host "  Duplicate actions: $($beforeDups.Total) → $($afterDups.Total)" -ForegroundColor Green
    Write-Host "  Maintenance points: $($beforeDups.Total * 5) → $($afterDups.Total * 5)" -ForegroundColor Green
}
