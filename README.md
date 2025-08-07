# Desktop Tutorial

<!-- Status Badges -->
<div align="center">

[![CI Tests](https://github.com/suima0713/desktop-tutorial/actions/workflows/ci-tests.yml/badge.svg)](https://github.com/suima0713/desktop-tutorial/actions/workflows/ci-tests.yml)
[![codecov](https://codecov.io/gh/suima0713/desktop-tutorial/branch/main/graph/badge.svg)](https://codecov.io/gh/suima0713/desktop-tutorial)
[![Security Audit](https://github.com/suima0713/desktop-tutorial/actions/workflows/security-audit.yml/badge.svg)](https://github.com/suima0713/desktop-tutorial/actions/workflows/security-audit.yml)
[![Static Analysis](https://github.com/suima0713/desktop-tutorial/actions/workflows/static-analysis.yml/badge.svg)](https://github.com/suima0713/desktop-tutorial/actions/workflows/static-analysis.yml)

[![Python](https://img.shields.io/badge/python-3.9%20%7C%203.10%20%7C%203.11-blue)](https://www.python.org/)
[![Poetry](https://img.shields.io/endpoint?url=https://python-poetry.org/badge/v0.json)](https://python-poetry.org/)
[![Ruff](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/astral-sh/ruff/main/assets/badge/v2.json)](https://github.com/astral-sh/ruff)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![SBOM](https://img.shields.io/badge/SBOM-CycloneDX-blue)](https://github.com/suima0713/desktop-tutorial/actions/workflows/nightly-sbom.yml)

</div>

---

## 📖 Overview

## Quick Overview

**Use case** Fetch AAPL / MSFT daily closes & quarterly balance sheets, then paste to research notes.
**Setup** `python -m venv .venv && pip install -r requirements-dev.txt`
**Cost** Works entirely with free‑tier APIs (Yahoo Finance, Alpha Vantage, FRED).

> **GitHub Desktop チュートリアル用リポジトリ**
> クロスプラットフォーム（Windows / macOS / Linux）で動く `build.ps1` を題材に、
> *commit → push → PR → CI* の一連のワークフローを学ぶサンプルです。

---

## 📦 事前条件

| ツール | 推奨バージョン | メモ |
|--------|---------------|------|
| Git | 2.40 以降 | CLI または GitHub Desktop |
| PowerShell | 7.x | `build.ps1` 実行用 |
| Python | 3.12 | `tests/` で使用（pip キャッシュ導入済み） |

### セットアップ

```bash
# 1. クローン
git clone https://github.com/suima0713/desktop-tutorial.git
cd desktop-tutorial

# 2. PowerShell で依存インストール
./build.ps1 setup          # venv 作成 & pip install

# 3. テスト
./build.ps1 test

## ✨ すぐに試す（ユースケース例）
```bash
poetry run python -m desktop_tutorial.cli price --symbol AAPL

## 4. 現状ステータス
BaseProvider 骨格　✅ 完了
## Branch Protection Test - 08/07/2025 22:14:19
# Test
