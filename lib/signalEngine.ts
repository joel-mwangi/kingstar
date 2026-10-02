import { Asset, DirectionalSignal } from '@/types/trading';

function logistic(value: number): number {
  return 1 / (1 + Math.exp(-value));
}

function std(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (values.length - 1);
  return Math.sqrt(Math.max(variance, 0));
}

export function deriveSignal(prices: number[]): DirectionalSignal {
  const clean = prices.filter((value) => Number.isFinite(value) && value > 0);
  if (clean.length < 20) {
    return {
      confidenceUp: 0.5,
      confidenceDown: 0.5,
      expectedReturn: 0,
      signal: 'HOLD',
      source: 'HEURISTIC',
    };
  }

  const recent = clean.slice(-20);
  const fast = recent.slice(-5).reduce((a, b) => a + b, 0) / 5;
  const slow = recent.reduce((a, b) => a + b, 0) / recent.length;
  const returns = recent.slice(1).map((price, index) => (price - recent[index]) / recent[index]);
  const volatility = std(returns);
  const momentum = slow === 0 ? 0 : (fast - slow) / slow;
  const score = volatility > 0 ? momentum / volatility : momentum * 100;
  const confidenceUp = logistic(score * 3);
  const confidenceDown = 1 - confidenceUp;
  const expectedReturn = momentum * 100;

  return {
    confidenceUp,
    confidenceDown,
    expectedReturn,
    signal: confidenceUp >= 0.65 ? 'CALL' : confidenceDown >= 0.65 ? 'PUT' : 'HOLD',
    source: 'HEURISTIC',
  };
}

export function updateAsset(asset: Asset, price: number, time: number): Asset {
  const recentPrices = [...(asset.recentPrices || []), price].slice(-120);
  const previous = asset.price > 0 ? asset.price : price;
  const change24h = previous > 0 ? ((price - previous) / previous) * 100 : 0;
  const returns = recentPrices.slice(1).map((value, index) => {
    const prior = recentPrices[index];
    return prior > 0 ? (value - prior) / prior : 0;
  });

  return {
    ...asset,
    price,
    bid: price,
    ask: price,
    change24h,
    volatility: std(returns),
    recentPrices,
    quoteTimestamp: time,
    prediction: deriveSignal(recentPrices),
  };
}
