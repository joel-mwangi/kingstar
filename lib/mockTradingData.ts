import { Asset, Position, Order, RiskEvent, SystemLog, StrategyConfig } from '@/types/trading';

export const initialAssets: Asset[] = [
  {
    id: 'ast_aapl',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 252.30,
    change24h: 1.84,
    volume: 48291000,
    bid: 252.28,
    ask: 252.32,
    rsi: 68.4,
    macd: 1.45,
    sma50: 248.10,
    ema20: 250.60,
    volatility: 0.014,
    prediction: {
      probabilityUp: 0.78,
      probabilityDown: 0.22,
      expectedReturn: 0.43,
      signal: 'BUY',
      modelVersion: 'XGBoost_v2.4'
    }
  },
  {
    id: 'ast_nvda',
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    price: 138.45,
    change24h: 3.42,
    volume: 124500000,
    bid: 138.42,
    ask: 138.48,
    rsi: 74.2,
    macd: 2.18,
    sma50: 132.50,
    ema20: 136.10,
    volatility: 0.028,
    prediction: {
      probabilityUp: 0.84,
      probabilityDown: 0.16,
      expectedReturn: 0.89,
      signal: 'BUY',
      modelVersion: 'XGBoost_v2.4'
    }
  },
  {
    id: 'ast_tsla',
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    price: 245.80,
    change24h: -1.25,
    volume: 78340000,
    bid: 245.75,
    ask: 245.85,
    rsi: 42.1,
    macd: -0.65,
    sma50: 250.20,
    ema20: 247.30,
    volatility: 0.035,
    prediction: {
      probabilityUp: 0.31,
      probabilityDown: 0.69,
      expectedReturn: -0.38,
      signal: 'SELL',
      modelVersion: 'XGBoost_v2.4'
    }
  },
  {
    id: 'ast_msft',
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 432.10,
    change24h: 0.92,
    volume: 21400000,
    bid: 432.05,
    ask: 432.15,
    rsi: 58.6,
    macd: 0.82,
    sma50: 428.40,
    ema20: 430.50,
    volatility: 0.011,
    prediction: {
      probabilityUp: 0.62,
      probabilityDown: 0.38,
      expectedReturn: 0.21,
      signal: 'HOLD',
      modelVersion: 'XGBoost_v2.4'
    }
  },
  {
    id: 'ast_btc',
    symbol: 'BTC-USD',
    name: 'Bitcoin',
    price: 91450.00,
    change24h: 4.15,
    volume: 38200000000,
    bid: 91440.00,
    ask: 91460.00,
    rsi: 71.9,
    macd: 840.50,
    sma50: 88200.00,
    ema20: 90100.00,
    volatility: 0.042,
    prediction: {
      probabilityUp: 0.81,
      probabilityDown: 0.19,
      expectedReturn: 1.15,
      signal: 'BUY',
      modelVersion: 'Transformer_Fin'
    }
  }
];

export const initialPositions: Position[] = [
  {
    id: 'pos_1',
    assetId: 'ast_aapl',
    symbol: 'AAPL',
    quantity: 10,
    entryPrice: 252.30,
    currentPrice: 253.12,
    stopLoss: 249.80,
    takeProfit: 257.30,
    unrealizedPnl: 8.20,
    unrealizedPnlPercent: 0.32,
    status: 'OPEN',
    openedAt: '10:01:05'
  },
  {
    id: 'pos_2',
    assetId: 'ast_nvda',
    symbol: 'NVDA',
    quantity: 15,
    entryPrice: 137.20,
    currentPrice: 138.45,
    stopLoss: 134.50,
    takeProfit: 143.00,
    unrealizedPnl: 18.75,
    unrealizedPnlPercent: 0.91,
    status: 'OPEN',
    openedAt: '10:14:22'
  }
];

export const initialOrders: Order[] = [
  {
    id: 'ord_101',
    brokerOrderId: 'BRK-99281',
    assetId: 'ast_aapl',
    symbol: 'AAPL',
    side: 'BUY',
    quantity: 10,
    orderType: 'MARKET',
    requestedPrice: 252.30,
    submittedAt: '10:01:01',
    status: 'FILLED',
    filledPrice: 252.30,
    filledQuantity: 10
  },
  {
    id: 'ord_102',
    brokerOrderId: 'BRK-99282',
    assetId: 'ast_nvda',
    symbol: 'NVDA',
    side: 'BUY',
    quantity: 15,
    orderType: 'MARKET',
    requestedPrice: 137.20,
    submittedAt: '10:14:20',
    status: 'FILLED',
    filledPrice: 137.20,
    filledQuantity: 15
  },
  {
    id: 'ord_103',
    brokerOrderId: 'BRK-99283',
    assetId: 'ast_tsla',
    symbol: 'TSLA',
    side: 'SELL',
    quantity: 8,
    orderType: 'MARKET',
    requestedPrice: 246.10,
    submittedAt: '10:28:12',
    status: 'REJECTED',
  }
];

export const initialRiskEvents: RiskEvent[] = [
  {
    id: 'risk_1',
    timestamp: '10:01:00',
    symbol: 'AAPL',
    actionRequested: 'BUY 10 shares ($2,523)',
    status: 'APPROVED',
    reason: 'Position size (25.2% of cap) <= Max Position ($2,000 allowance adjusted). Daily drawdown -0.0% < $300 limit.',
    accountEquity: 10245.00,
    riskLimitApplied: 'Max Position $2,000 / Max Risk 1%'
  },
  {
    id: 'risk_2',
    timestamp: '10:28:10',
    symbol: 'TSLA',
    actionRequested: 'SHORT 8 shares ($1,968)',
    status: 'REJECTED',
    reason: 'Risk Manager vetoed: Expected return (-0.38%) does not meet minimum strategy threshold (>0.45%) and volatility risk exceeds 3.0%.',
    accountEquity: 10263.75,
    riskLimitApplied: 'Strategy Probability / Return Threshold'
  }
];

export const initialLogs: SystemLog[] = [
  {
    id: 'log_1',
    timestamp: '10:00:05',
    level: 'INFO',
    source: 'MARKET_ENGINE',
    message: 'Connected to WebSocket market feed (Polygon/Alpaca sandbox). Stream active.'
  },
  {
    id: 'log_2',
    timestamp: '10:00:08',
    level: 'SUCCESS',
    source: 'ML_MODEL',
    message: 'Loaded XGBoost_v2.4 model weights. Inference latency: 1.4ms per symbol.'
  },
  {
    id: 'log_3',
    timestamp: '10:01:00',
    level: 'RISK',
    source: 'RISK_MANAGER',
    message: 'Risk validation passed for AAPL BUY signal. Position size approved.'
  },
  {
    id: 'log_4',
    timestamp: '10:01:05',
    level: 'SUCCESS',
    source: 'ORDER_ENGINE',
    message: 'Broker order BRK-99281 FILLED: 10 AAPL @ $252.30.'
  },
  {
    id: 'log_5',
    timestamp: '10:28:12',
    level: 'WARN',
    source: 'STRATEGY',
    message: 'TSLA signal rejected by Risk Management engine. Holding cash.'
  }
];

export const initialStrategyConfig: StrategyConfig = {
  minProbability: 0.70,
  minExpectedReturn: 0.35,
  maxRiskPerTradePercent: 1.0,
  maxDailyLoss: 300,
  maxPositionSize: 2500,
  stopLossPercent: 1.5,
  takeProfitPercent: 3.0,
  allowShorts: true,
  activeModel: 'XGBoost_v2.4'
};
