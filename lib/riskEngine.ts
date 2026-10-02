import { Asset, StrategyConfig, TradeSide, TradingMode } from '@/types/trading';

export interface RiskContext {
  status: 'RUNNING' | 'PAUSED' | 'EMERGENCY_STOP' | 'SHADOW';
  mode: TradingMode;
  equity: number;
  dailyPnl: number;
  strategy: StrategyConfig;
  authorized: boolean;
  realTradingArmed: boolean;
  accountIsVirtual?: boolean;
}

export interface RiskDecision {
  allowed: boolean;
  reason: string;
}

export function validateEntry(
  asset: Asset,
  side: TradeSide,
  stake: number,
  context: RiskContext
): RiskDecision {
  if (!Number.isFinite(stake) || stake <= 0) {
    return { allowed: false, reason: 'Stake must be a positive number.' };
  }

  if (context.status !== 'RUNNING') {
    return { allowed: false, reason: 'Trading is not RUNNING.' };
  }

  if (context.mode === 'BACKTEST') {
    return { allowed: false, reason: 'Backtest mode does not place broker orders.' };
  }

  if (context.mode === 'DEMO' || context.mode === 'REAL') {
    if (!context.authorized) {
      return { allowed: false, reason: 'Connect an authenticated Deriv account first.' };
    }

    if (context.mode === 'DEMO' && context.accountIsVirtual !== true) {
      return { allowed: false, reason: 'Demo mode requires a Deriv virtual/demo account.' };
    }

    if (context.mode === 'REAL' && context.accountIsVirtual !== false) {
      return { allowed: false, reason: 'Real mode requires a confirmed Deriv real account.' };
    }
  }

  if (context.mode === 'REAL' && !context.realTradingArmed) {
    return { allowed: false, reason: 'Real-money trading is not armed.' };
  }

  if (context.dailyPnl <= -Math.abs(context.strategy.maxDailyLoss)) {
    return { allowed: false, reason: 'Daily/session loss limit reached.' };
  }

  const percentageCap = context.equity > 0
    ? (context.equity * context.strategy.maxRiskPerTradePercent) / 100
    : 0;
  const riskCap = Math.max(1, Math.min(context.strategy.maxPositionSize, percentageCap));

  if (stake > riskCap) {
    return {
      allowed: false,
      reason: 'Stake exceeds the current per-trade risk cap of $' + riskCap.toFixed(2) + '.',
    };
  }

  const confidence = side === 'CALL'
    ? asset.prediction.confidenceUp
    : asset.prediction.confidenceDown;

  if (confidence < context.strategy.minProbability) {
    return {
      allowed: false,
      reason:
        'Directional confidence ' +
        (confidence * 100).toFixed(1) +
        '% is below the ' +
        (context.strategy.minProbability * 100).toFixed(0) +
        '% threshold.',
    };
  }

  const expected = side === 'CALL'
    ? asset.prediction.expectedReturn
    : -asset.prediction.expectedReturn;

  if (expected < context.strategy.minExpectedReturn) {
    return {
      allowed: false,
      reason:
        'Expected directional return ' +
        expected.toFixed(2) +
        '% is below the ' +
        context.strategy.minExpectedReturn.toFixed(2) +
        '% threshold.',
    };
  }

  return { allowed: true, reason: 'Risk checks passed.' };
}
