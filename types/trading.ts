export type BotStatus = 'RUNNING' | 'PAUSED' | 'EMERGENCY_STOP' | 'SHADOW';
export type TradingMode = 'PAPER' | 'SHADOW' | 'BACKTEST' | 'SANDBOX';

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume: number;
  bid: number;
  ask: number;
  rsi: number;
  macd: number;
  sma50: number;
  ema20: number;
  volatility: number;
  prediction: {
    probabilityUp: number;
    probabilityDown: number;
    expectedReturn: number;
    signal: 'BUY' | 'SELL' | 'HOLD';
    modelVersion: string;
  };
}

export interface Position {
  id: string;
  assetId: string;
  symbol: string;
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  stopLoss: number;
  takeProfit: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  status: 'OPEN' | 'CLOSED';
  openedAt: string;
}

export interface Order {
  id: string;
  brokerOrderId: string;
  assetId: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  orderType: 'MARKET' | 'LIMIT';
  requestedPrice: number;
  submittedAt: string;
  status: 'SUBMITTED' | 'ACCEPTED' | 'FILLED' | 'REJECTED' | 'CANCELLED';
  filledPrice?: number;
  filledQuantity?: number;
}

export interface RiskEvent {
  id: string;
  timestamp: string;
  symbol: string;
  actionRequested: string;
  status: 'APPROVED' | 'REJECTED';
  reason: string;
  accountEquity: number;
  riskLimitApplied: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'SUCCESS' | 'ERROR' | 'RISK';
  source: 'MARKET_ENGINE' | 'ML_MODEL' | 'STRATEGY' | 'RISK_MANAGER' | 'ORDER_ENGINE' | 'DATABASE';
  message: string;
}

export interface StrategyConfig {
  minProbability: number;
  minExpectedReturn: number;
  maxRiskPerTradePercent: number;
  maxDailyLoss: number;
  maxPositionSize: number;
  stopLossPercent: number;
  takeProfitPercent: number;
  allowShorts: boolean;
  activeModel: 'XGBoost_v2.4' | 'LSTM_Attention' | 'Transformer_Fin' | 'Ensemble_Voting';
}
