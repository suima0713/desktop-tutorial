import requests
import json
import logging
from typing import Dict, Optional, Any
from abc import ABC, abstractmethod
import sqlite3
import pandas as pd
from datetime import datetime, timedelta

class DataConnector(ABC):
    """データソース接続の抽象基底クラス"""
    
    @abstractmethod
    def get_maintenance_rate(self) -> float:
        """信用維持率を取得"""
        pass
    
    @abstractmethod
    def get_account_info(self) -> Dict[str, Any]:
        """口座情報を取得"""
        pass
    
    @abstractmethod
    def get_position_info(self) -> Dict[str, Any]:
        """ポジション情報を取得"""
        pass

class MockDataConnector(DataConnector):
    """モックデータコネクター（テスト用）"""
    
    def __init__(self, base_rate: float = 167.0, volatility: float = 2.0):
        self.base_rate = base_rate
        self.volatility = volatility
        self.trend = 0.1  # 徐々に改善する傾向
        
    def get_maintenance_rate(self) -> float:
        """シミュレーション用の信用維持率を生成"""
        import random
        import math
        
        # 時間経過による改善傾向を加味
        time_factor = datetime.now().hour / 24.0  # 0-1の範囲
        trend_effect = self.trend * time_factor
        
        # ランダム変動
        random_variation = random.uniform(-self.volatility, self.volatility)
        
        # 改善傾向を加味した信用維持率
        current_rate = self.base_rate + trend_effect + random_variation
        
        return round(max(150.0, current_rate), 2)  # 最低150%を保証
    
    def get_account_info(self) -> Dict[str, Any]:
        """モック口座情報"""
        return {
            'account_id': 'MOCK001',
            'balance': 1000000,
            'margin_used': 600000,
            'available_margin': 400000,
            'maintenance_rate': self.get_maintenance_rate(),
            'last_updated': datetime.now().isoformat()
        }
    
    def get_position_info(self) -> Dict[str, Any]:
        """モックポジション情報"""
        return {
            'total_positions': 5,
            'long_positions': 3,
            'short_positions': 2,
            'total_pnl': 50000,
            'unrealized_pnl': 30000,
            'realized_pnl': 20000,
            'risk_level': 'MEDIUM'
        }

class APIDataConnector(DataConnector):
    """API経由でデータを取得するコネクター"""
    
    def __init__(self, api_url: str, api_key: str, api_secret: str = None):
        self.api_url = api_url
        self.api_key = api_key
        self.api_secret = api_secret
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        })
    
    def get_maintenance_rate(self) -> float:
        """APIから信用維持率を取得"""
        try:
            response = self.session.get(f"{self.api_url}/account/maintenance-rate")
            response.raise_for_status()
            
            data = response.json()
            return float(data.get('maintenance_rate', 0))
            
        except requests.RequestException as e:
            logging.error(f"API接続エラー: {e}")
            return 167.0  # デフォルト値
    
    def get_account_info(self) -> Dict[str, Any]:
        """APIから口座情報を取得"""
        try:
            response = self.session.get(f"{self.api_url}/account/info")
            response.raise_for_status()
            
            return response.json()
            
        except requests.RequestException as e:
            logging.error(f"口座情報取得エラー: {e}")
            return {}
    
    def get_position_info(self) -> Dict[str, Any]:
        """APIからポジション情報を取得"""
        try:
            response = self.session.get(f"{self.api_url}/positions")
            response.raise_for_status()
            
            return response.json()
            
        except requests.RequestException as e:
            logging.error(f"ポジション情報取得エラー: {e}")
            return {}

class DatabaseDataConnector(DataConnector):
    """データベースからデータを取得するコネクター"""
    
    def __init__(self, db_path: str):
        self.db_path = db_path
    
    def get_maintenance_rate(self) -> float:
        """データベースから最新の信用維持率を取得"""
        try:
            conn = sqlite3.connect(self.db_path)
            query = """
            SELECT maintenance_rate 
            FROM account_data 
            ORDER BY timestamp DESC 
            LIMIT 1
            """
            
            result = pd.read_sql_query(query, conn)
            conn.close()
            
            if not result.empty:
                return float(result.iloc[0]['maintenance_rate'])
            else:
                return 167.0
                
        except Exception as e:
            logging.error(f"データベース接続エラー: {e}")
            return 167.0
    
    def get_account_info(self) -> Dict[str, Any]:
        """データベースから口座情報を取得"""
        try:
            conn = sqlite3.connect(self.db_path)
            query = """
            SELECT * FROM account_data 
            ORDER BY timestamp DESC 
            LIMIT 1
            """
            
            result = pd.read_sql_query(query, conn)
            conn.close()
            
            if not result.empty:
                return result.iloc[0].to_dict()
            else:
                return {}
                
        except Exception as e:
            logging.error(f"口座情報取得エラー: {e}")
            return {}
    
    def get_position_info(self) -> Dict[str, Any]:
        """データベースからポジション情報を取得"""
        try:
            conn = sqlite3.connect(self.db_path)
            query = """
            SELECT * FROM position_data 
            ORDER BY timestamp DESC 
            LIMIT 1
            """
            
            result = pd.read_sql_query(query, conn)
            conn.close()
            
            if not result.empty:
                return result.iloc[0].to_dict()
            else:
                return {}
                
        except Exception as e:
            logging.error(f"ポジション情報取得エラー: {e}")
            return {}

class DataConnectorFactory:
    """データコネクターのファクトリークラス"""
    
    @staticmethod
    def create_connector(connector_type: str, **kwargs) -> DataConnector:
        """指定されたタイプのデータコネクターを作成"""
        
        if connector_type.lower() == 'mock':
            return MockDataConnector(**kwargs)
        elif connector_type.lower() == 'api':
            return APIDataConnector(**kwargs)
        elif connector_type.lower() == 'database':
            return DatabaseDataConnector(**kwargs)
        else:
            raise ValueError(f"サポートされていないコネクタータイプ: {connector_type}")

class DataAnalyzer:
    """データ分析クラス"""
    
    def __init__(self, connector: DataConnector):
        self.connector = connector
        self.history = []
    
    def analyze_trend(self, hours: int = 24) -> Dict[str, Any]:
        """トレンド分析"""
        if len(self.history) < 2:
            return {'trend': 'INSUFFICIENT_DATA', 'slope': 0, 'confidence': 0}
        
        # 指定時間内のデータを抽出
        cutoff_time = datetime.now() - timedelta(hours=hours)
        recent_data = [
            entry for entry in self.history 
            if datetime.fromisoformat(entry['timestamp']) > cutoff_time
        ]
        
        if len(recent_data) < 2:
            return {'trend': 'INSUFFICIENT_DATA', 'slope': 0, 'confidence': 0}
        
        # 線形回帰でトレンドを計算
        timestamps = [datetime.fromisoformat(entry['timestamp']) for entry in recent_data]
        rates = [entry['rate'] for entry in recent_data]
        
        # 時間を数値に変換（時間単位）
        time_nums = [(t - timestamps[0]).total_seconds() / 3600 for t in timestamps]
        
        # 線形回帰
        slope, intercept = self._linear_regression(time_nums, rates)
        
        # トレンド判定
        if slope > 0.1:
            trend = 'IMPROVING'
        elif slope < -0.1:
            trend = 'DECLINING'
        else:
            trend = 'STABLE'
        
        # 信頼度計算（R²）
        confidence = self._calculate_r_squared(time_nums, rates, slope, intercept)
        
        return {
            'trend': trend,
            'slope': slope,
            'confidence': confidence,
            'data_points': len(recent_data)
        }
    
    def _linear_regression(self, x, y):
        """線形回帰計算"""
        n = len(x)
        if n == 0:
            return 0, 0
        
        sum_x = sum(x)
        sum_y = sum(y)
        sum_xy = sum(x[i] * y[i] for i in range(n))
        sum_x2 = sum(x[i] ** 2 for i in range(n))
        
        slope = (n * sum_xy - sum_x * sum_y) / (n * sum_x2 - sum_x ** 2)
        intercept = (sum_y - slope * sum_x) / n
        
        return slope, intercept
    
    def _calculate_r_squared(self, x, y, slope, intercept):
        """決定係数（R²）の計算"""
        n = len(x)
        if n == 0:
            return 0
        
        y_pred = [slope * xi + intercept for xi in x]
        y_mean = sum(y) / n
        
        ss_res = sum((y[i] - y_pred[i]) ** 2 for i in range(n))
        ss_tot = sum((y[i] - y_mean) ** 2 for i in range(n))
        
        if ss_tot == 0:
            return 0
        
        return 1 - (ss_res / ss_tot)
    
    def get_volatility(self, hours: int = 24) -> float:
        """ボラティリティ計算"""
        if len(self.history) < 2:
            return 0
        
        cutoff_time = datetime.now() - timedelta(hours=hours)
        recent_data = [
            entry for entry in self.history 
            if datetime.fromisoformat(entry['timestamp']) > cutoff_time
        ]
        
        if len(recent_data) < 2:
            return 0
        
        rates = [entry['rate'] for entry in recent_data]
        mean_rate = sum(rates) / len(rates)
        
        variance = sum((rate - mean_rate) ** 2 for rate in rates) / len(rates)
        return (variance ** 0.5)
    
    def predict_next_rate(self, hours_ahead: int = 1) -> Dict[str, Any]:
        """将来の信用維持率を予測"""
        trend_analysis = self.analyze_trend()
        
        if trend_analysis['trend'] == 'INSUFFICIENT_DATA':
            return {
                'predicted_rate': None,
                'confidence': 0,
                'method': 'INSUFFICIENT_DATA'
            }
        
        # 現在のレートを取得
        current_rate = self.connector.get_maintenance_rate()
        
        # 線形予測
        predicted_rate = current_rate + (trend_analysis['slope'] * hours_ahead)
        
        # 信頼区間の計算（簡易版）
        volatility = self.get_volatility()
        confidence_interval = volatility * 1.96  # 95%信頼区間
        
        return {
            'predicted_rate': round(predicted_rate, 2),
            'confidence': trend_analysis['confidence'],
            'confidence_interval': round(confidence_interval, 2),
            'method': 'LINEAR_REGRESSION',
            'trend': trend_analysis['trend']
        }
    
    def add_data_point(self, rate: float):
        """データポイントを追加"""
        self.history.append({
            'timestamp': datetime.now().isoformat(),
            'rate': rate
        })
        
        # 履歴を1000件に制限
        if len(self.history) > 1000:
            self.history = self.history[-1000:]





