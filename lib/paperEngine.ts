import { Position } from '@/types/trading';

export function createPaperPosition(input: {
  id: string;
  assetId: string;
  symbol: string;
  side: 'CALL' | 'PUT';
  stake: number;
  entryPrice: number;
}): Position {
  return {
    id: input.id,
    assetId: input.assetId,
    symbol: input.symbol,
    contractType: input.side,
    stake: input.stake,
    entryPrice: input.entryPrice,
    currentValue: input.stake,
    payout: input.stake,
    profit: 0,
    profitPercent: 0,
    status: 'OPEN',
    openedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    source: 'PAPER',
  };
}

export function markPaperPosition(position: Position, currentPrice: number): Position {
  if (position.source !== 'PAPER' || position.status !== 'OPEN' || position.entryPrice <= 0) {
    return position;
  }

  const rawMove = (currentPrice - position.entryPrice) / position.entryPrice;
  const directionalMove = position.contractType === 'CALL' ? rawMove : -rawMove;
  const profit = position.stake * directionalMove;
  const currentValue = Math.max(0, position.stake + profit);

  return {
    ...position,
    currentValue,
    profit,
    profitPercent: position.stake > 0 ? (profit / position.stake) * 100 : 0,
    updatedAt: new Date().toISOString(),
  };
}
