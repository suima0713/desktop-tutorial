import subprocess
import sys

def install_duckdb():
    """DuckDBのインストール"""
    try:
        import duckdb
        print("✅ DuckDB既にインストール済み")
        print(f"バージョン: {duckdb.__version__}")
    except ImportError:
        print("📦 DuckDBをインストール中...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "duckdb"])
        print("✅ DuckDBインストール完了")

if __name__ == "__main__":
    install_duckdb()
