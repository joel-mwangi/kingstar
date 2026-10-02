import { Asset } from '@/types/trading';

const instruments = [
  ['R_100', 'Volatility 100 Index'],
  ['R_75', 'Volatility 75 Index'],
  ['1HZ100V', 'Volatility 100 (1s) Index'],
  ['1HZ75V', 'Volatility 75 (1s) Index'],
  ['frxEURUSD', 'EUR/USD'],
] as const;

export const initialAssets: Asset[] = instruments.map(function(item) {
  const symbol = item[0];
  const name = item[1];

  return {
    id: 'deriv_' + symbol.toLowerCase(),
    symbol,
    name,
    currency: 'USD',
    price: 0,
    change24h: 0,
    volume: 0,
    bid: 0,
    ask: 0,
    rsi: null,
    macd: null,
    sma50: null,
    ema20: null,
    volatility: 0,
    recentPrices: [],
    prediction: {
      confidenceUp: 0.5,
      confidenceDown: 0.5,
      expectedReturn: 0,
      signal: 'HOLD',
      source: 'HEURISTIC',
    },
  };
});
