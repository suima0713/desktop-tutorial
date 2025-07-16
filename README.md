# desktop‑tutorial

[![CI smoke](https://github.com/suima0713/desktop-tutorial/actions/workflows/ci-smoke.yml/badge.svg)](https://github.com/suima0713/desktop-tutorial/actions/workflows/ci-smoke.yml)

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

