[![CI](https://github.com/suima0713/desktop-tutorial/actions/workflows/ci.yml/badge.svg)](https://github.com/suima0713/desktop-tutorial/actions/workflows/ci.yml)
# Welcome to GitHub Desktop!

This is your README. READMEs are where you can communicate what your project is and how to use it.

 HEAD
Write your name on line 6, save it, and then head back to GitHub Desktop.
Write your name on line 6, save it, and then head back to GitHub Desktop.
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
    Write-Host "`n── $Name ──"
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

# ─────────────────────────────────────────────────────
# 3) 静的解析（パス区切りを / に統一） ★★ UPDATED ★★
# ─────────────────────────────────────────────────────
Invoke-Step { pre-commit run --all-files } 'pre‑commit'
Invoke-Step { mypy src/ }                  'mypy type‑check'

# ─────────────────────────────────────────────────────
# 4) テスト＋カバレッジ
# ─────────────────────────────────────────────────────
Invoke-Step {
    pytest -q --cov=core --cov=adapters --cov=app `
           --cov-report=xml --cov-fail-under=90
} 'pytest + coverage 90%'

# ─────────────────────────────────────────────────────
# 5) 静的セキュリティ
# ─────────────────────────────────────────────────────
Invoke-Step { pip-audit -r requirements.txt } 'pip‑audit'

# ─────────────────────────────────────────────────────
# 6) ビルド（dist クリーンは別タスクで追加予定）
# ─────────────────────────────────────────────────────
Invoke-Step { & $pyExe -m build } 'Build artifacts'

# oversize (>10 MB) チェック
$oversize = Get-ChildItem dist -Filter *.whl | Where-Object Length -gt 10MB
if ($oversize) { Write-Error "❌ Wheel >10 MB: $($oversize.Name)"; exit 1 }

# ─────────────────────────────────────────────────────
# 7) バージョン一致
# ─────────────────────────────────────────────────────
Invoke-Step {
    & $pyExe - <<'PY'
import importlib.metadata as im, pathlib, re, sys
pkg = "package"      # ←自パッケージ名
code_v = im.version(pkg)
proj_v = re.search(r'version\s*=\s*"([^"]+)"',
                   pathlib.Path("pyproject.toml").read_text())[1]
if code_v != proj_v:
    sys.exit(f"Version mismatch: {code_v} (code) != {proj_v} (pyproject)")
print("Version check OK →", code_v)
PY
} 'Version consistency'

Write-Host "`n✅ Pipeline finished successfully"
 473bd2b (Add build.ps1 and update README)
