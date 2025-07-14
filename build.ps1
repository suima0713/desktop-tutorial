<#
  build.ps1 – Cross‑platform (Win / macOS / Linux) & Fail‑fast
#>

# ─────────────────────────────────────────────────────
# 0) Strict / Fail‑fast 初期化
# ─────────────────────────────────────────────────────
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$ProgressPreference   = 'SilentlyContinue'

# ─────────────────────────────────────────────────────
# 0‑1) OS 判定付きパス組み立て  ★★ NEW ★★
# ─────────────────────────────────────────────────────
$venvRoot = '.smoke'

# PowerShell 7 では組み込み変数 $IsWindows / $IsLinux / $IsMacOS が使える
$pyExe         = if ($IsWindows) { Join-Path $venvRoot 'Scripts/python.exe' }
                 elseif ($IsMacOS -or $IsLinux) { Join-Path $venvRoot 'bin/python' }
                 else { throw 'Unsupported OS' }

$activateScript = if ($IsWindows) { Join-Path $venvRoot 'Scripts/Activate.ps1' }
                  else            { Join-Path $venvRoot 'bin/Activate.ps1' }  # POSIX でも py‑venv が生成

# ヘルパー：コマンドを実行し、失敗したら即終了
function Invoke-Step {
    param(
        [Parameter(Mandatory)][scriptblock]$Cmd,
        [Parameter(Mandatory)][string]$Name
    )
    Write-Output "`n✅ Pipeline finished successfully"
    $global:LASTEXITCODE = 0          # 初期化（多段パイプ対策）
    & $Cmd
    $exit = $LASTEXITCODE
    $global:LASTEXITCODE = 0
    if ($exit -ne 0) {
        Write-Error "$Name failed (exit $exit)"
        exit $exit
    }
}

# ─────────────────────────────────────────────────────
# 1) venv 再作成 & 有効化
# ─────────────────────────────────────────────────────
if (Test-Path $venvRoot) { Remove-Item -Recurse -Force $venvRoot }
Invoke-Step { python -m venv $venvRoot } 'Create venv'
if ($IsWindows) { Unblock-File $activateScript }      # ダウンロード属性対策（Win のみ）
& $activateScript                                     # ここで venv がアクティブ化

# ─────────────────────────────────────────────────────
# 2) 依存インストール
# ─────────────────────────────────────────────────────
Invoke-Step { & $pyExe -m pip install -U pip }                 'Upgrade pip'
Invoke-Step { & $pyExe -m pip install -e .[dev] --no-deps }    'Install editable pkg'
Invoke-Step { & $pyExe -m pip install -r requirements-lock.txt } 'Install locked deps'
Invoke-Step { & $pyExe -m pip install pre-commit } 'install pre-commit'
Invoke-Step { & $pyExe -m pip install pre-commit mypy } 'install dev tools'
# ─────────────────────────────────────────────────────
# 3) 静的解析（パス区切りを / に統一） ★★ UPDATED ★★
# ─────────────────────────────────────────────────────
Invoke-Step { & $pyExe -m mypy src/ } 'mypy type-check'
Invoke-Step { & $pyExe -m pip install pre-commit mypy pytest pytest-cov pip-audit } 'install dev tools'
# ─────────────────────────────────────────────────────
# 4) テスト＋カバレッジ
# ─────────────────────────────────────────────────────
Invoke-Step {
    & $pyExe -m pytest -q `
              --cov=core --cov=adapters --cov=app `
              --cov-report=xml --cov-fail-under=90
} 'pytest + coverage 90%'

# ─────────────────────────────────────────────────────
# 5) 静的セキュリティ
# ─────────────────────────────────────────────────────
Invoke-Step { & $pyExe -m pip_audit -r requirements.txt } 'pip-audit'

# ─────────────────────────────────────────────────────
# 6) ビルド（dist クリーンは別タスクで追加予定）
# ───────────────────────────────Invoke-Step { & $py──────────────────────
Invoke-Step { & $pyExe -m pip install pre-commit mypy pytest pytest-cov pip-audit build } 'install dev tools'

# oversize (>10 MB) チェック
if (Test-Path dist) {
    $oversize = Get-ChildItem dist -Filter *.whl | Where-Object Length -gt 10MB
    if ($oversize) { Write-Error "❌ Wheel >10 MB: $($oversize.Name)"; exit 1 }
}
# ─────────────────────────────────────────────────────
# 7) バージョン一致
# ─────────────────────────────────────────────────────
Invoke-Step {
    # ---------- Python 部分を文字列に ----------
    $pyScript = @"
import importlib.metadata as im, pathlib, re, sys
pkg = "desktop_tutorial"
code_v = im.version(pkg)
proj_v = re.search(r'version\s*=\s*"([^"]+)"',
                   pathlib.Path("pyproject.toml").read_text())[1]
if code_v != proj_v:
    sys.exit(f"Version mismatch: {code_v} (code) != {proj_v} (pyproject)")
print("Version check OK →", code_v)
"@

    # ---------- Python を実行 ----------
    $pyScript | & $pyExe -
} 'Version consistency'
