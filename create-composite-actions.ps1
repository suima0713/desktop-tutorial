# create-composite-actions.ps1
Write-Host "Creating Composite Actions..." -ForegroundColor Cyan

# ディレクトリ作成
$dir = ".github\actions\setup-project"
New-Item -ItemType Directory -Force -Path $dir | Out-Null

# action.yml作成
@"
name: 'Setup Project'
description: 'Setup Python project'
author: 'suima0713'

inputs:
  python-version:
    description: 'Python version'
    required: false
    default: '3.11'

runs:
  using: 'composite'
  steps:
    - name: Checkout
      uses: actions/checkout@v4
    
    - name: Setup Python
      uses: actions/setup-python@v5
      with:
        python-version: `${{ inputs.python-version }}
        cache: 'pip'
    
    - name: Install dependencies
      shell: bash
      run: |
        pip install --upgrade pip
        if [ -f requirements.txt ]; then
          pip install -r requirements.txt
        fi
"@ | Out-File -FilePath "$dir\action.yml" -Encoding UTF8

Write-Host "✅ Created: $dir\action.yml" -ForegroundColor Green

# 2つ目のアクション
$dir2 = ".github\actions\cache-deps"
New-Item -ItemType Directory -Force -Path $dir2 | Out-Null

@"
name: 'Cache Dependencies'
description: 'Cache pip dependencies'

runs:
  using: 'composite'
  steps:
    - name: Cache
      uses: actions/cache@v4
      with:
        path: ~/.cache/pip
        key: deps-`${{ runner.os }}-`${{ hashFiles('**/requirements*.txt') }}
"@ | Out-File -FilePath "$dir2\action.yml" -Encoding UTF8

Write-Host "✅ Created: $dir2\action.yml" -ForegroundColor Green
Write-Host "✅ All done!" -ForegroundColor Green
