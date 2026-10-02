export type BotStatus = 'RUNNING' | 'PAUSED' | 'EMERGENCY_STOP' | 'SHADOW';
export type TradingMode = 'PAPER' | 'DEMO' | 'REAL' | 'BACKTEST';
export type TradeSide = 'CALL' | 'PUT';
export type AssetSignal = 'CALL' | 'PUT' | 'HOLD';

export interface DirectionalSignal {
  confidenceUp: number;
  confidenceDown: number;
  expectedReturn: number;
  signal: AssetSignal;
  source: 'HEURISTIC';
}

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  currency: string;
  price: number;
  change24h: number;
  volume: number;
  bid: number;
  ask: number;
  rsi: number | null;
  macd: number | null;
  sma50: number | null;
  ema20: number | null;
  volatility: number;
  quoteTimestamp?: number;
  recentPrices: number[];
  prediction: DirectionalSignal;
}

export interface Position {
  id: string;
  contractId?: number;
  assetId: string;
  symbol: string;
  contractType: TradeSide;
  stake: number;
  entryPrice: number;
  currentValue: number;
  payout: number;
  profit: number;
  profitPercent: number;
  status: 'OPEN' | 'CLOSED';
  openedAt: string;
  updatedAt: string;
  source: 'PAPER' | 'DERIV';
}

export interface Order {
  id: string;
  brokerOrderId?: string;
  contractId?: number;
  assetId: string;
  symbol: string;
  side: TradeSide | 'CLOSE';
  stake: number;
  orderType: 'MARKET';
  requestedPrice?: number;
  submittedAt: string;
  status: 'SUBMITTED' | 'ACCEPTED' | 'FILLED' | 'REJECTED' | 'CANCELLED' | 'CLOSED';
  filledPrice?: number;
  filledQuantity?: number;
  error?: string;
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
  source: 'MARKET_ENGINE' | 'AI_ANALYST' | 'STRATEGY' | 'RISK_MANAGER' | 'ORDER_ENGINE' | 'DATABASE' | 'BROKER';
  message: string;
}

export interface StrategyConfig {
  minProbability: number;
  minExpectedReturn: number;
  maxRiskPerTradePercent: number;
  maxDailyLoss: number;
  maxPositionSize: number;
  defaultDuration: number;
  defaultDurationUnit: 's' | 'm' | 'h';
  activeModel: 'Heuristic Momentum';
}
