import React, { useState } from 'react';
import { CheckCircle2, Lock, ShieldAlert, ShieldCheck, XCircle } from 'lucide-react';
import { RiskEvent, StrategyConfig } from '@/types/trading';

interface Props {
  strategyConfig: StrategyConfig;
  riskEvents: RiskEvent[];
  onUpdateRiskConfig: (value: StrategyConfig) => Promise<void>;
}

export function RiskManagementView({ strategyConfig, riskEvents, onUpdateRiskConfig }: Props) {
  const [config, setConfig] = useState(strategyConfig);
  const [saved, setSaved] = useState(false);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    await onUpdateRiskConfig(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="space-y-6">
      <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-emerald-400" /> Risk Management</h2>
        <p className="text-xs text-slate-400 mt-1">Every entry is validated before it can reach the broker. Pause and emergency-stop states block new entries.</p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={save} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2"><Lock className="h-4 w-4 text-emerald-400" /> Guardrails</h3>

          <label className="block text-xs text-slate-300">
            Max risk per trade (%)
            <input type="number" min="0.1" max="5" step="0.1" value={config.maxRiskPerTradePercent} onChange={(e) => setConfig({ ...config, maxRiskPerTradePercent: Number(e.target.value) })} className="mt-2 w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100" />
          </label>

          <label className="block text-xs text-slate-300">
            Hard max stake ($)
            <input type="number" min="1" max="100000" step="1" value={config.maxPositionSize} onChange={(e) => setConfig({ ...config, maxPositionSize: Number(e.target.value) })} className="mt-2 w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100" />
          </label>

          <label className="block text-xs text-slate-300">
            Max daily loss ($)
            <input type="number" min="1" max="100000" step="1" value={config.maxDailyLoss} onChange={(e) => setConfig({ ...config, maxDailyLoss: Number(e.target.value) })} className="mt-2 w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100" />
          </label>

          <button className="w-full px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold">Save guardrails</button>
          {saved && <p className="text-xs text-emerald-400">Risk configuration saved.</p>}
        </form>

        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-amber-400" /> Risk audit</h3>
            <span className="text-xs text-slate-500">{riskEvents.length} recorded</span>
          </div>

          <div className="space-y-3 max-h-[28rem] overflow-y-auto">
            {riskEvents.length === 0 && <p className="text-xs text-slate-500 py-10 text-center">No risk events recorded yet.</p>}
            {riskEvents.map((event) => {
              const approved = event.status === 'APPROVED';
              return (
                <div key={event.id} className="rounded-xl bg-slate-950/70 border border-slate-800 p-4">
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <div><b className="text-slate-100">{event.symbol}</b> <span className="text-slate-400">{event.actionRequested}</span></div>
                    <span className={approved ? 'text-emerald-400' : 'text-rose-400'}>
                      {approved ? <CheckCircle2 className="inline h-3.5 w-3.5 mr-1" /> : <XCircle className="inline h-3.5 w-3.5 mr-1" />}
                      {event.status}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-300">{event.reason}</p>
                  <p className="mt-2 text-[11px] text-slate-500">{event.timestamp} • {event.riskLimitApplied} • Equity {'$' + event.accountEquity.toFixed(2)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
