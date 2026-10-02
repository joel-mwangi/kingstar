import React, { useState } from 'react';
import { BarChart3, Play, RefreshCw } from 'lucide-react';
import { derivClient } from '@/lib/derivWebSocket';

type Result = {
  symbol: string;
  candles: number;
  start: string;
  end: string;
  totalReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  totalTrades: number;
  profitFactor: number;
};

function mean(values: number[]): number {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}

function std(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  return Math.sqrt(values.reduce((s, x) => s + (x - m) ** 2, 0) / (values.length - 1));
}

export function BacktestView() {
  const [symbol, setSymbol] = useState('1HZ100V');
  const [lookback, setLookback] = useState(30);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');

  const run = async () => {
    setRunning(true);
    setError('');

    try {
      if (!derivClient.isConnected) {
        derivClient.connectPublic();
        await new Promise((resolve) => setTimeout(resolve, 900));
      }

      const candles = await derivClient.getTickHistory(symbol, Math.min(5000, lookback * 24), 3600);
      if (candles.length < 60) throw new Error('Not enough hourly history for this test.');

      const prices = candles.map((c) => c.close);
      const strategyReturns: number[] = [];
      const equityCurve = [10000];

      for (let i = 50; i < prices.length - 6; i += 1) {
        const fast = mean(prices.slice(i - 5, i + 1));
        const slow = mean(prices.slice(i - 20, i + 1));
        const entry = prices[i];
        const exit = prices[i + 6];

        if (fast === slow) continue;

        const raw = fast > slow ? (exit - entry) / entry : (entry - exit) / entry;
        const net = raw - 0.0004;
        strategyReturns.push(net);
        equityCurve.push(equityCurve[equityCurve.length - 1] * (1 + net));
      }

      const average = mean(strategyReturns);
      const deviation = std(strategyReturns);
      const sharpe = deviation > 0 ? (average / deviation) * Math.sqrt(Math.max(1, strategyReturns.length)) : 0;

      let peak = equityCurve[0];
      let maxDrawdown = 0;
      for (const value of equityCurve) {
        peak = Math.max(peak, value);
        maxDrawdown = Math.min(maxDrawdown, ((value - peak) / peak) * 100);
      }

      const winners = strategyReturns.filter((value) => value > 0);
      const gains = winners.reduce((s, v) => s + v, 0);
      const losses = strategyReturns.filter((value) => value < 0).reduce((s, v) => s + Math.abs(v), 0);

      setResult({
        symbol,
        candles: candles.length,
        start: new Date(candles[0].time * 1000).toLocaleString(),
        end: new Date(candles[candles.length - 1].time * 1000).toLocaleString(),
        totalReturn: ((equityCurve[equityCurve.length - 1] / 10000) - 1) * 100,
        sharpeRatio: sharpe,
        maxDrawdown,
        winRate: strategyReturns.length ? (winners.length / strategyReturns.length) * 100 : 0,
        totalTrades: strategyReturns.length,
        profitFactor: losses > 0 ? gains / losses : Number.POSITIVE_INFINITY,
      });
    } catch (errorValue) {
      setError(errorValue instanceof Error ? errorValue.message : 'Backtest failed.');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2"><RefreshCw className="h-5 w-5 text-cyan-400" /> Research Backtest</h2>
        <p className="text-xs text-slate-400 mt-1">Uses actual Deriv hourly candles and a simple directional momentum strategy. It is not an options-payout backtest.</p>
      </section>

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <label className="text-xs text-slate-300">Symbol
          <select value={symbol} onChange={(e) => setSymbol(e.target.value)} className="mt-2 w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs">
            <option>1HZ100V</option><option>1HZ75V</option><option>R_100</option><option>R_75</option><option>frxEURUSD</option>
          </select>
        </label>

        <label className="text-xs text-slate-300">Lookback
          <select value={lookback} onChange={(e) => setLookback(Number(e.target.value))} className="mt-2 w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs">
            <option value="7">7 days</option><option value="30">30 days</option><option value="90">90 days</option><option value="180">180 days</option>
          </select>
        </label>

        <div className="flex items-end">
          <button onClick={() => void run()} disabled={running} className="w-full px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2">
            <Play className={running ? 'h-3.5 w-3.5 animate-spin' : 'h-3.5 w-3.5'} /> {running ? 'Running...' : 'Run test'}
          </button>
        </div>
      </div>

      {error && <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300">{error}</div>}

      {result && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              ['Return', result.totalReturn.toFixed(2) + '%'],
              ['Sharpe', result.sharpeRatio.toFixed(2)],
              ['Max DD', result.maxDrawdown.toFixed(2) + '%'],
              ['Win rate', result.winRate.toFixed(1) + '%'],
              ['Trades', String(result.totalTrades)],
              ['Profit factor', Number.isFinite(result.profitFactor) ? result.profitFactor.toFixed(2) : '∞'],
            ].map(([label, value]) => (
              <div key={label} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
                <span className="text-xs text-slate-500">{label}</span>
                <div className="mt-1 text-xl font-mono font-bold text-slate-100">{value}</div>
              </div>
            ))}
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2"><BarChart3 className="h-4 w-4 text-cyan-400" /> Test window</h3>
            <p className="text-xs text-slate-400 mt-2">{result.symbol} • {result.candles} hourly candles • {result.start} → {result.end}</p>
            <p className="text-[11px] text-slate-500 mt-2">Assumption: 0.04% round-trip friction. Historical results do not predict future performance.</p>
          </div>
        </>
      )}
    </div>
  );
}
