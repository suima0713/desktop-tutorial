import time
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import requests
import pandas as pd
import numpy as np
from dataclasses import dataclass
from enum import Enum

# ログ設定
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('maintenance_monitor.log'),
        logging.StreamHandler()
    ]
)

class AlertLevel(Enum):
    """アラートレベル定義"""
    INFO = "INFO"
    WARNING = "WARNING"
    CRITICAL = "CRITICAL"
    EMERGENCY = "EMERGENCY"

@dataclass
class MaintenanceThreshold:
    """信用維持率の閾値設定"""
    current_rate: float = 197.45  # 更新：現在の維持率
    target_rate: float = 180.0
    warning_threshold: float = 185.0  # 更新：警告レベルを緩和
    critical_threshold: float = 170.0  # 更新：危険レベルを緩和
    emergency_threshold: float = 150.0  # 更新：緊急レベルを緩和
    
    # 段階的改善目標
    phase1_target: float = 172.0  # 第1段階目標
    phase2_target: float = 176.0  # 第2段階目標
    phase3_target: float = 180.0  # 最終目標

@dataclass
class AlertConfig:
    """アラート設定"""
    email_enabled: bool = True
    email_recipients: List[str] = None
    smtp_server: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""
    
    # 開発環境用設定（実際のメール送信を無効化）
    development_mode: bool = True  # True: ログ出力のみ, False: 実際にメール送信
    
    # アラート間隔設定（分）
    alert_intervals: Dict[AlertLevel, int] = None
    
    def __post_init__(self):
        if self.email_recipients is None:
            self.email_recipients = ["admin@example.com"]
        if self.alert_intervals is None:
            self.alert_intervals = {
                AlertLevel.INFO: 60,      # 1時間
                AlertLevel.WARNING: 30,   # 30分
                AlertLevel.CRITICAL: 15,  # 15分
                AlertLevel.EMERGENCY: 5   # 5分
            }

class MaintenanceMonitor:
    """信用維持率監視システム"""
    
    def __init__(self, config_file: str = "monitor_config.json"):
        self.config_file = config_file
        self.threshold = MaintenanceThreshold()
        self.alert_config = AlertConfig()
        self.last_alert_time = {}
        self.history = []
        self.connector_type = 'mock'
        self.connector_kwargs = {}
        self.data_analyzer = None
        self.load_config()
        
    def load_config(self):
        """設定ファイルの読み込み"""
        try:
            with open(self.config_file, 'r', encoding='utf-8') as f:
                config = json.load(f)
                self.threshold = MaintenanceThreshold(**config.get('threshold', {}))
                alert_config_data = config.get('alert_config', {})
                # 開発環境モードの設定を追加
                if 'development_mode' not in alert_config_data:
                    alert_config_data['development_mode'] = True
                self.alert_config = AlertConfig(**alert_config_data)
                
                # データコネクター設定の読み込み
                connector_config = config.get('connector', {})
                self.connector_type = connector_config.get('type', 'mock')
                self.connector_kwargs = connector_config.get('kwargs', {})
                
            logging.info("設定ファイルを読み込みました")
        except FileNotFoundError:
            logging.warning("設定ファイルが見つかりません。デフォルト設定を使用します")
            self.save_config()
        except Exception as e:
            logging.error(f"設定ファイルの読み込みエラー: {e}")
    
    def save_config(self):
        """設定ファイルの保存"""
        config = {
            'threshold': {
                'current_rate': self.threshold.current_rate,
                'target_rate': self.threshold.target_rate,
                'warning_threshold': self.threshold.warning_threshold,
                'critical_threshold': self.threshold.critical_threshold,
                'emergency_threshold': self.threshold.emergency_threshold,
                'phase1_target': self.threshold.phase1_target,
                'phase2_target': self.threshold.phase2_target,
                'phase3_target': self.threshold.phase3_target
            },
            'alert_config': {
                'email_enabled': self.alert_config.email_enabled,
                'email_recipients': self.alert_config.email_recipients,
                'smtp_server': self.alert_config.smtp_server,
                'smtp_port': self.alert_config.smtp_port,
                'smtp_username': self.alert_config.smtp_username,
                'smtp_password': self.alert_config.smtp_password,
                'development_mode': getattr(self.alert_config, 'development_mode', True),
                'alert_intervals': {level.value: interval for level, interval in self.alert_config.alert_intervals.items()}
            },
            'connector': {
                'type': self.connector_type,
                'kwargs': self.connector_kwargs
            }
        }
        
        with open(self.config_file, 'w', encoding='utf-8') as f:
            json.dump(config, f, indent=2, ensure_ascii=False)
        logging.info("設定ファイルを保存しました")
    
    def get_current_maintenance_rate(self) -> float:
        """現在の信用維持率を取得（実際のAPIやデータソースから）"""
        # データコネクターを使用して信用維持率を取得
        try:
            from data_connector import DataConnectorFactory
            
            # 設定に基づいてデータコネクターを作成
            connector_type = getattr(self, 'connector_type', 'mock')
            connector_kwargs = getattr(self, 'connector_kwargs', {})
            
            connector = DataConnectorFactory.create_connector(connector_type, **connector_kwargs)
            return connector.get_maintenance_rate()
            
        except ImportError:
            # データコネクターが利用できない場合はモックデータを使用
            import random
            base_rate = 167.0
            variation = random.uniform(-2.0, 3.0)
            current_rate = base_rate + variation
            
            return round(current_rate, 2)
    
    def analyze_maintenance_rate(self, current_rate: float) -> Dict:
        """信用維持率の分析"""
        analysis = {
            'current_rate': current_rate,
            'target_rate': self.threshold.target_rate,
            'improvement_needed': self.threshold.target_rate - current_rate,
            'improvement_percentage': ((self.threshold.target_rate - current_rate) / current_rate) * 100,
            'status': 'GOOD',
            'alert_level': AlertLevel.INFO,
            'phase_progress': self.get_phase_progress(current_rate),
            'recommendations': []
        }
        
        # アラートレベルの判定
        if current_rate <= self.threshold.emergency_threshold:
            analysis['alert_level'] = AlertLevel.EMERGENCY
            analysis['status'] = 'EMERGENCY'
            analysis['recommendations'].append("緊急対応が必要です。即座にポジション調整を検討してください。")
        elif current_rate <= self.threshold.critical_threshold:
            analysis['alert_level'] = AlertLevel.CRITICAL
            analysis['status'] = 'CRITICAL'
            analysis['recommendations'].append("危険レベルです。ポジションの見直しを強く推奨します。")
        elif current_rate <= self.threshold.warning_threshold:
            analysis['alert_level'] = AlertLevel.WARNING
            analysis['status'] = 'WARNING'
            analysis['recommendations'].append("注意レベルです。ポジション調整を検討してください。")
        
        # 改善提案
        if current_rate < self.threshold.phase1_target:
            analysis['recommendations'].append(f"第1段階目標({self.threshold.phase1_target}%)達成のため、リスク軽減を優先してください。")
        elif current_rate < self.threshold.phase2_target:
            analysis['recommendations'].append(f"第2段階目標({self.threshold.phase2_target}%)達成のため、バランス調整を継続してください。")
        elif current_rate < self.threshold.phase3_target:
            analysis['recommendations'].append(f"最終目標({self.threshold.phase3_target}%)達成のため、微調整を継続してください。")
        else:
            analysis['recommendations'].append("目標達成！現在の水準を維持してください。")
        
        return analysis
    
    def get_phase_progress(self, current_rate: float) -> Dict:
        """段階的改善の進捗状況"""
        progress = {
            'phase1': {
                'target': self.threshold.phase1_target,
                'achieved': current_rate >= self.threshold.phase1_target,
                'progress_percentage': min(100, (current_rate / self.threshold.phase1_target) * 100)
            },
            'phase2': {
                'target': self.threshold.phase2_target,
                'achieved': current_rate >= self.threshold.phase2_target,
                'progress_percentage': min(100, (current_rate / self.threshold.phase2_target) * 100)
            },
            'phase3': {
                'target': self.threshold.phase3_target,
                'achieved': current_rate >= self.threshold.phase3_target,
                'progress_percentage': min(100, (current_rate / self.threshold.phase3_target) * 100)
            }
        }
        return progress
    
    def should_send_alert(self, alert_level: AlertLevel) -> bool:
        """アラート送信の判定"""
        current_time = datetime.now()
        last_time = self.last_alert_time.get(alert_level)
        
        if last_time is None:
            return True
        
        interval_minutes = self.alert_config.alert_intervals.get(alert_level, 60)
        time_diff = current_time - last_time
        
        return time_diff.total_seconds() >= interval_minutes * 60
    
    def send_alert(self, analysis: Dict):
        """アラート送信"""
        alert_level = analysis['alert_level']
        
        if not self.should_send_alert(alert_level):
            return
        
        # アラートメッセージの作成
        message = self.create_alert_message(analysis)
        
        # ログ出力
        logging.warning(f"アラート送信: {alert_level.value} - {message}")
        
        # メール送信
        if self.alert_config.email_enabled:
            self.send_email_alert(analysis, message)
        
        # アラート時間の更新
        self.last_alert_time[alert_level] = datetime.now()
    
    def create_alert_message(self, analysis: Dict) -> str:
        """アラートメッセージの作成"""
        current_rate = analysis['current_rate']
        target_rate = analysis['target_rate']
        status = analysis['status']
        alert_level = analysis['alert_level'].value
        
        message = f"""
=== 信用維持率監視アラート ===
時刻: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
アラートレベル: {alert_level}
現在の信用維持率: {current_rate}%
目標信用維持率: {target_rate}%
改善必要額: {analysis['improvement_needed']:.2f}%
改善必要率: {analysis['improvement_percentage']:.2f}%

ステータス: {status}

段階的改善進捗:
- 第1段階目標({analysis['phase_progress']['phase1']['target']}%): {'達成' if analysis['phase_progress']['phase1']['achieved'] else '未達成'} ({analysis['phase_progress']['phase1']['progress_percentage']:.1f}%)
- 第2段階目標({analysis['phase_progress']['phase2']['target']}%): {'達成' if analysis['phase_progress']['phase2']['achieved'] else '未達成'} ({analysis['phase_progress']['phase2']['progress_percentage']:.1f}%)
- 第3段階目標({analysis['phase_progress']['phase3']['target']}%): {'達成' if analysis['phase_progress']['phase3']['achieved'] else '未達成'} ({analysis['phase_progress']['phase3']['progress_percentage']:.1f}%)

推奨事項:
"""
        
        for i, recommendation in enumerate(analysis['recommendations'], 1):
            message += f"{i}. {recommendation}\n"
        
        return message
    
    def send_email_alert(self, analysis: Dict, message: str):
        """メールアラート送信"""
        try:
            # 開発環境モードの場合はログ出力のみ
            if getattr(self.alert_config, 'development_mode', True):
                logging.info("=== メールアラート（開発環境） ===")
                logging.info(f"送信先: {', '.join(self.alert_config.email_recipients)}")
                logging.info(f"件名: 信用維持率アラート - {analysis['alert_level'].value}")
                logging.info(f"本文:\n{message}")
                logging.info("=== メールアラート終了 ===")
                return
            
            # 本番環境用：実際のメール送信
            msg = MIMEMultipart()
            msg['From'] = self.alert_config.smtp_username
            msg['To'] = ', '.join(self.alert_config.email_recipients)
            msg['Subject'] = f"信用維持率アラート - {analysis['alert_level'].value}"
            
            msg.attach(MIMEText(message, 'plain', 'utf-8'))
            
            server = smtplib.SMTP(self.alert_config.smtp_server, self.alert_config.smtp_port)
            server.starttls()
            server.login(self.alert_config.smtp_username, self.alert_config.smtp_password)
            server.send_message(msg)
            server.quit()
            
            logging.info("メールアラートを送信しました")
            
        except Exception as e:
            logging.error(f"メール送信エラー: {e}")
    
    def generate_report(self) -> str:
        """監視レポートの生成"""
        if not self.history:
            return "監視データがありません"
        
        df = pd.DataFrame(self.history)
        
        report = f"""
=== 信用維持率監視レポート ===
生成時刻: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
監視期間: {df['timestamp'].min()} ～ {df['timestamp'].max()}
データ件数: {len(df)}

統計情報:
- 平均信用維持率: {df['rate'].mean():.2f}%
- 最高信用維持率: {df['rate'].max():.2f}%
- 最低信用維持率: {df['rate'].min():.2f}%
- 標準偏差: {df['rate'].std():.2f}%

目標達成状況:
- 第1段階目標({self.threshold.phase1_target}%)達成回数: {len(df[df['rate'] >= self.threshold.phase1_target])}
- 第2段階目標({self.threshold.phase2_target}%)達成回数: {len(df[df['rate'] >= self.threshold.phase2_target])}
- 最終目標({self.threshold.phase3_target}%)達成回数: {len(df[df['rate'] >= self.threshold.phase3_target])}

アラート統計:
- 緊急アラート: {len(df[df['alert_level'] == AlertLevel.EMERGENCY.value])}
- 重要アラート: {len(df[df['alert_level'] == AlertLevel.CRITICAL.value])}
- 警告アラート: {len(df[df['alert_level'] == AlertLevel.WARNING.value])}
"""
        
        return report
    
    def monitor(self, interval_seconds: int = 300):
        """監視の開始"""
        logging.info("信用維持率監視を開始しました")
        logging.info(f"現在の信用維持率: {self.threshold.current_rate}%")
        logging.info(f"目標信用維持率: {self.threshold.target_rate}%")
        
        try:
            while True:
                # 現在の信用維持率を取得
                current_rate = self.get_current_maintenance_rate()
                
                # 分析実行
                analysis = self.analyze_maintenance_rate(current_rate)
                
                # データアナライザーにデータポイントを追加
                if self.data_analyzer is None:
                    try:
                        from data_connector import DataAnalyzer, DataConnectorFactory
                        connector = DataConnectorFactory.create_connector(self.connector_type, **self.connector_kwargs)
                        self.data_analyzer = DataAnalyzer(connector)
                    except ImportError:
                        pass
                
                if self.data_analyzer:
                    self.data_analyzer.add_data_point(current_rate)
                
                # 履歴に追加
                self.history.append({
                    'timestamp': datetime.now().isoformat(),
                    'rate': current_rate,
                    'alert_level': analysis['alert_level'].value,
                    'status': analysis['status']
                })
                
                # ログ出力
                logging.info(f"信用維持率: {current_rate}% (ステータス: {analysis['status']})")
                
                # データアナライザーからの追加情報をログ出力
                if self.data_analyzer:
                    trend_analysis = self.data_analyzer.analyze_trend()
                    if trend_analysis['trend'] != 'INSUFFICIENT_DATA':
                        logging.info(f"トレンド: {trend_analysis['trend']} (信頼度: {trend_analysis['confidence']:.2f})")
                    
                    prediction = self.data_analyzer.predict_next_rate()
                    if prediction['predicted_rate']:
                        logging.info(f"1時間後予測: {prediction['predicted_rate']}% (信頼度: {prediction['confidence']:.2f})")
                
                # アラート判定・送信
                if analysis['alert_level'] != AlertLevel.INFO:
                    self.send_alert(analysis)
                
                # 設定ファイルの保存（定期的に）
                if len(self.history) % 10 == 0:
                    self.save_config()
                
                # 待機
                time.sleep(interval_seconds)
                
        except KeyboardInterrupt:
            logging.info("監視を停止しました")
            self.generate_final_report()
        except Exception as e:
            logging.error(f"監視エラー: {e}")
            raise
    
    def generate_final_report(self):
        """最終レポートの生成"""
        report = self.generate_report()
        
        # レポートファイルに保存
        with open(f"maintenance_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt", 'w', encoding='utf-8') as f:
            f.write(report)
        
        logging.info("最終レポートを生成しました")
        print(report)

def main():
    """メイン実行関数"""
    monitor = MaintenanceMonitor()
    
    # 設定の確認
    print("=== 信用維持率監視システム ===")
    print(f"現在の信用維持率: {monitor.threshold.current_rate}%")
    print(f"目標信用維持率: {monitor.threshold.target_rate}%")
    print(f"第1段階目標: {monitor.threshold.phase1_target}%")
    print(f"第2段階目標: {monitor.threshold.phase2_target}%")
    print(f"第3段階目標: {monitor.threshold.phase3_target}%")
    print()
    
    # 監視開始
    monitor.monitor()

if __name__ == "__main__":
    main()
