import React, { useState } from 'react';
import { Cpu, Sliders, CheckCircle, Zap, Shield, BarChart2, RefreshCw } from 'lucide-react';
import { StrategyConfig } from '@/types/trading';

interface MlStrategyViewProps {
  strategyConfig: StrategyConfig;
  onUpdateStrategyConfig: (newConfig: StrategyConfig) => void;
}

export function MlStrategyView({ strategyConfig, onUpdateStrategyConfig }: MlStrategyViewProps) {
  const [config, setConfig] = useState<StrategyConfig>(strategyConfig);
  const [saved, setSaved] = useState(false);

  const handleChange = (key: keyof StrategyConfig, value: any) => {
    const updated = { ...config, [key]: value };
    setConfig(updated);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStrategyConfig(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Cpu className="h-5 w-5 text-cyan-400" /> ML Prediction Engine & Strategy Rules
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Configure machine learning model hyperparameters, probability thresholds, and decision triggers.
            </p>
          </div>
          {saved && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
              <CheckCircle className="h-4 w-4" /> Strategy Updated
            </span>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Model Selection & Parameters */}
        <div className="lg:col-span-1 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Zap className="h-4 w-4 text-cyan-400" /> Active Model Registry
          </h3>

          <div className="space-y-3">
            {[
              { id: 'XGBoost_v2.4', name: 'XGBoost Gradient Boosting', desc: 'Optimized for daily momentum & RSI/MACD convergence. Latency: 1.2ms' },
              { id: 'LSTM_Attention', name: 'LSTM + Attention Network', desc: 'Captures sequential order book depth and temporal volume patterns.' },
              { id: 'Transformer_Fin', name: 'Financial Transformer', desc: 'Transformer encoder trained on tick-level multi-asset cross-correlations.' },
              { id: 'Ensemble_Voting', name: 'Ensemble Weighted Vote', desc: 'Combines XGBoost + LSTM with dynamic confidence weighting.' }
            ].map((model) => (
              <div
                key={model.id}
                onClick={() => handleChange('activeModel', model.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  config.activeModel === model.id
                    ? 'bg-cyan-500/10 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-950/40 border-slate-800 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-100 text-sm">{model.name}</span>
                  {config.activeModel === model.id && (
                    <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">{model.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Thresholds & Triggers */}
        <div className="lg:col-span-2 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="h-4 w-4 text-cyan-400" /> Strategy Thresholds & Decision Logic
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Min Probability Slider */}
            <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Minimum ML Probability</label>
                <span className="font-mono text-cyan-400 font-bold">{(config.minProbability * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.50"
                max="0.95"
                step="0.01"
                value={config.minProbability}
                onChange={(e) => handleChange('minProbability', parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500">Bot requires this confidence score before triggering a BUY/SELL signal.</p>
            </div>

            {/* Min Expected Return */}
            <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Min Expected Return</label>
                <span className="font-mono text-emerald-400 font-bold">+{config.minExpectedReturn}%</span>
              </div>
              <input
                type="range"
                min="0.10"
                max="2.00"
                step="0.05"
                value={config.minExpectedReturn}
                onChange={(e) => handleChange('minExpectedReturn', parseFloat(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500">Ensures expected alpha exceeds estimated slippage and broker commissions.</p>
            </div>

            {/* Stop Loss Percent */}
            <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Default Stop Loss</label>
                <span className="font-mono text-rose-400 font-bold">{config.stopLossPercent}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.1"
                value={config.stopLossPercent}
                onChange={(e) => handleChange('stopLossPercent', parseFloat(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500">Automatic stop-loss order placed with broker upon position fill.</p>
            </div>

            {/* Take Profit Percent */}
            <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Default Take Profit</label>
                <span className="font-mono text-emerald-400 font-bold">{config.takeProfitPercent}%</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="10.0"
                step="0.25"
                value={config.takeProfitPercent}
                onChange={(e) => handleChange('takeProfitPercent', parseFloat(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500">Automatic take-profit limit order placed upon position fill.</p>
            </div>

          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="allowShorts"
                checked={config.allowShorts}
                onChange={(e) => handleChange('allowShorts', e.target.checked)}
                className="h-4 w-4 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-cyan-500"
              />
              <label htmlFor="allowShorts" className="text-xs text-slate-300 font-medium">
                Allow short-selling when ML probability is &lt; 30% (DOWN signal)
              </label>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-lg shadow-cyan-600/20 transition-all"
            >
              Save Strategy Config
            </button>
          </div>

        </div>

      </form>

    </div>
  );
}
