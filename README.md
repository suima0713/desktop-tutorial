# Desktop Tutorial

[![CI Tests](https://github.com/suima0713/desktop-tutorial/actions/workflows/ci-tests.yml/badge.svg)](https://github.com/suima0713/desktop-tutorial/actions/workflows/ci-tests.yml)
[![Static Analysis](https://github.com/suima0713/desktop-tutorial/actions/workflows/static-analysis.yml/badge.svg)](https://github.com/suima0713/desktop-tutorial/actions/workflows/static-analysis.yml)
[![License Check](https://github.com/suima0713/desktop-tutorial/actions/workflows/license-check.yml/badge.svg)](https://github.com/suima0713/desktop-tutorial/actions/workflows/license-check.yml)
[![Security Audit](https://github.com/suima0713/desktop-tutorial/actions/workflows/security-audit.yml/badge.svg)](https://github.com/suima0713/desktop-tutorial/actions/workflows/security-audit.yml)

## 🔒 Security Features

### Phase 3 完了 ✅
- Automated dependency updates (Dependabot)
- Security vulnerability scanning (Trivy)
- License compliance checks
- SBOM generation with digital signatures
- Branch protection policies

### Phase 4 実装中 🚧
- GitHub Actions usage monitoring
- Performance optimization
- Alert notifications

## Quick Start

```python
# Install dependencies
poetry install

# Run tests
poetry run pytest

# Run security scan
poetry run safety check
License
MIT

# GitHub Composite Actions

## ✅ 実装済みのComposite Actions

### 📦 setup-project
Python環境のセットアップを行うアクション

```yaml
- uses: ./.github/actions/setup-project
  with:
    python-version: '3.11'  # オプション、デフォルト: 3.11
