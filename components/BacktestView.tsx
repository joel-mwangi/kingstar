import React, { useState } from 'react';
import { RefreshCw, Play, BarChart3, TrendingUp, Award, ShieldAlert, CheckCircle } from 'lucide-react';

export function BacktestView() {
  const [timeframe, setTimeframe] = useState<'30d' | '90d' | '1y' | '3y'>('90d');
  const [model, setModel] = useState('XGBoost_v2.4');
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<{
    totalReturn: number;
    sharpeRatio: number;
    maxDrawdown: number;
    winRate: number;
    totalTrades: number;
    profitFactor: number;
  } | null>({
    totalReturn: 24.8,
    sharpeRatio: 2.14,
    maxDrawdown: -4.2,
    winRate: 64.5,
    totalTrades: 142,
    profitFactor: 1.82
  });

  const handleRunBacktest = () => {
    setRunning(true);
    setTimeout(() => {
      // Simulate slight variation based on timeframe & model
      const multiplier = timeframe === '30d' ? 0.4 : timeframe === '1y' ? 3.2 : timeframe === '3y' ? 9.5 : 1.0;
      setResults({
        totalReturn: +(18.5 * multiplier).toFixed(1),
        sharpeRatio: +(1.9 + Math.random() * 0.4).toFixed(2),
        maxDrawdown: -((3.5 + Math.random() * 2).toFixed(1) as any),
        winRate: +(61 + Math.random() * 6).toFixed(1),
        totalTrades: Math.floor(45 * multiplier),
        profitFactor: +(1.7 + Math.random() * 0.3).toFixed(2)
      });
      setRunning(false);
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-cyan-400" /> Backtesting Studio & Historical Research
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Test strategy signals and ML probability thresholds against historical tick & candle data before paper/live deployment.
          </p>
        </div>

        <button
          onClick={handleRunBacktest}
          disabled={running}
          className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-cyan-600/20 transition-all"
        >
          <Play className={`h-4 w-4 ${running ? 'animate-spin' : ''}`} />
          {running ? 'Running Backtest...' : 'Run Backtest'}
        </button>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4 space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Historical Period</label>
          <div className="flex items-center gap-1.5">
            {(['30d', '90d', '1y', '3y'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                  timeframe === t 
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' 
                    : 'bg-slate-950/40 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4 space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Target Model</label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="XGBoost_v2.4">XGBoost v2.4 (Momentum)</option>
            <option value="LSTM_Attention">LSTM + Attention</option>
            <option value="Transformer_Fin">Financial Transformer</option>
            <option value="Ensemble">Ensemble Voting</option>
          </select>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4 space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Initial Capital</label>
          <div className="bg-slate-950 border border-slate-800 text-xs rounded-xl px-3 py-2 text-slate-200 font-mono">
            $10,000.00 USD
          </div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4 space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Slippage & Commission</label>
          <div className="bg-slate-950 border border-slate-800 text-xs rounded-xl px-3 py-2 text-slate-200 font-mono text-cyan-400">
            0.02% per fill
          </div>
        </div>

      </div>

      {/* Results Metrics */}
      {results && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4">
            <span className="text-xs text-slate-400 uppercase">Total Return</span>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">+{results.totalReturn}%</div>
          </div>
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4">
            <span className="text-xs text-slate-400 uppercase">Sharpe Ratio</span>
            <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">{results.sharpeRatio}</div>
          </div>
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4">
            <span className="text-xs text-slate-400 uppercase">Max Drawdown</span>
            <div className="text-2xl font-bold font-mono text-rose-400 mt-1">{results.maxDrawdown}%</div>
          </div>
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4">
            <span className="text-xs text-slate-400 uppercase">Win Rate</span>
            <div className="text-2xl font-bold font-mono text-slate-100 mt-1">{results.winRate}%</div>
          </div>
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4">
            <span className="text-xs text-slate-400 uppercase">Total Trades</span>
            <div className="text-2xl font-bold font-mono text-slate-100 mt-1">{results.totalTrades}</div>
          </div>
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4">
            <span className="text-xs text-slate-400 uppercase">Profit Factor</span>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">{results.profitFactor}</div>
          </div>
        </div>
      )}

      {/* Equity Curve Simulated Visualization */}
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-cyan-400" /> Equity Curve Backtest Performance ({timeframe})
        </h3>

        <div className="h-64 bg-slate-950/80 rounded-xl border border-slate-800/80 p-4 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/5 to-transparent pointer-events-none" />
          
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono z-10">
            <span>$12,500</span>
            <span className="text-emerald-400 font-bold">Peak: $12,480.20</span>
          </div>

          {/* SVG simulated equity line chart */}
          <div className="absolute inset-x-6 bottom-8 top-12 flex items-end">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150" preserveAspectRatio="none">
              <path
                d="M 0 120 Q 50 110 100 95 T 200 80 T 300 65 T 400 40 T 500 25"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="3"
                className="drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]"
              />
              <path
                d="M 0 120 Q 50 110 100 95 T 200 80 T 300 65 T 400 40 T 500 25 L 500 150 L 0 150 Z"
                fill="url(#gradient)"
                opacity="0.2"
              />
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 font-mono z-10 pt-4 border-t border-slate-800/50">
            <span>Start: $10,000.00</span>
            <span>End: $12,480.20 (+24.8%)</span>
          </div>
        </div>
      </div>

    </div>
  );
}
