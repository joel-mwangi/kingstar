import React, { useEffect, useState } from 'react';
import { CheckCircle, Cpu, Sliders } from 'lucide-react';
import { StrategyConfig } from '@/types/trading';

interface Props {
  strategyConfig: StrategyConfig;
  onUpdateStrategyConfig: (value: StrategyConfig) => Promise<void>;
}

export function MlStrategyView({ strategyConfig, onUpdateStrategyConfig }: Props) {
  const [config, setConfig] = useState(strategyConfig);
  const [saved, setSaved] = useState(false);

  useEffect(() => setConfig(strategyConfig), [strategyConfig]);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    await onUpdateStrategyConfig(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="space-y-6">
      <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2"><Cpu className="h-5 w-5 text-cyan-400" /> Strategy Engine</h2>
        <p className="text-xs text-slate-400 mt-1">Deterministic heuristic momentum gate. The displayed confidence is not a calibrated ML probability.</p>
      </section>

      <form onSubmit={save} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2"><Sliders className="h-4 w-4 text-cyan-400" /> Signal thresholds</h3>

          <label className="block text-xs text-slate-300">
            Minimum directional confidence: <b>{(config.minProbability * 100).toFixed(0) + '%'}</b>
            <input type="range" min="0.50" max="0.90" step="0.01" value={config.minProbability} onChange={(e) => setConfig({ ...config, minProbability: Number(e.target.value) })} className="w-full mt-2" />
          </label>

          <label className="block text-xs text-slate-300">
            Minimum expected directional return: <b>{Math.max(0, config.minExpectedReturn).toFixed(2) + '%'}</b>
            <input type="range" min="0" max="2" step="0.05" value={Math.max(0, config.minExpectedReturn)} onChange={(e) => setConfig({ ...config, minExpectedReturn: Number(e.target.value) })} className="w-full mt-2" />
          </label>

          <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-4 text-xs text-slate-400">
            Live quotes come from the Deriv public feed. The heuristic uses recent momentum and return dispersion to produce a directional score.
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5">
          <h3 className="text-sm font-semibold text-slate-200">Risk parameters</h3>

          <label className="block text-xs text-slate-300">
            Max risk per trade: <b>{config.maxRiskPerTradePercent.toFixed(2) + '%'}</b>
            <input type="range" min="0.1" max="5" step="0.1" value={config.maxRiskPerTradePercent} onChange={(e) => setConfig({ ...config, maxRiskPerTradePercent: Number(e.target.value) })} className="w-full mt-2" />
          </label>

          <label className="block text-xs text-slate-300">
            Hard max stake: <b>{'$' + config.maxPositionSize.toFixed(2)}</b>
            <input type="number" min="1" max="100000" step="1" value={config.maxPositionSize} onChange={(e) => setConfig({ ...config, maxPositionSize: Number(e.target.value) })} className="mt-2 w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100" />
          </label>

          <label className="block text-xs text-slate-300">
            Max daily loss: <b>{'$' + config.maxDailyLoss.toFixed(2)}</b>
            <input type="number" min="1" max="100000" step="1" value={config.maxDailyLoss} onChange={(e) => setConfig({ ...config, maxDailyLoss: Number(e.target.value) })} className="mt-2 w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100" />
          </label>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500">Source: {config.activeModel}</span>
            <button className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5" /> Save</button>
          </div>
          {saved && <p className="text-xs text-emerald-400">Strategy configuration saved.</p>}
        </div>
      </form>
    </div>
  );
}
