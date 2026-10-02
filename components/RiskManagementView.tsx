import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, CheckCircle2, XCircle, Sliders, Lock } from 'lucide-react';
import { RiskEvent, StrategyConfig } from '@/types/trading';

interface RiskManagementViewProps {
  strategyConfig: StrategyConfig;
  riskEvents: RiskEvent[];
  onUpdateRiskConfig: (newConfig: StrategyConfig) => void;
}

export function RiskManagementView({
  strategyConfig,
  riskEvents,
  onUpdateRiskConfig
}: RiskManagementViewProps) {
  const [config, setConfig] = useState<StrategyConfig>(strategyConfig);
  const [saved, setSaved] = useState(false);

  const handleChange = (key: keyof StrategyConfig, value: any) => {
    setConfig({ ...config, [key]: value });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateRiskConfig(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-400" /> Risk Management & Guardrail Engine
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Independent risk service that vetoes trades and enforces account capital preservation rules.
          </p>
        </div>
        {saved && (
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
            <CheckCircle2 className="h-4 w-4" /> Risk Rules Updated
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Risk Configuration Form */}
        <form onSubmit={handleSave} className="lg:col-span-1 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Lock className="h-4 w-4 text-emerald-400" /> Account Safeguards
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Max Risk Per Trade (%)</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="5.0"
                  value={config.maxRiskPerTradePercent}
                  onChange={(e) => handleChange('maxRiskPerTradePercent', parseFloat(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-xs text-slate-400 font-mono">%</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Maximum percentage of total equity risked on a single trade.</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Max Position Size ($ USD)</label>
              <div className="flex items-center gap-3">
                <span className="text-slate-400 font-mono">$</span>
                <input
                  type="number"
                  step="100"
                  min="500"
                  max="50000"
                  value={config.maxPositionSize}
                  onChange={(e) => handleChange('maxPositionSize', parseFloat(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Hard capital cap per single asset position.</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Max Daily Loss ($ USD)</label>
              <div className="flex items-center gap-3">
                <span className="text-slate-400 font-mono">$</span>
                <input
                  type="number"
                  step="50"
                  min="100"
                  max="5000"
                  value={config.maxDailyLoss}
                  onChange={(e) => handleChange('maxDailyLoss', parseFloat(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Triggers emergency pause if daily realized/unrealized loss exceeds this amount.</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/20 transition-all"
          >
            Update Risk Guardrails
          </button>
        </form>

        {/* Risk Event Audit Log */}
        <div className="lg:col-span-2 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-emerald-400" /> Risk Validation Audit Log
            </h3>
            <span className="text-xs text-slate-400 font-mono">Real-time gatekeeper checks</span>
          </div>

          <div className="space-y-3">
            {riskEvents.map((evt) => {
              const isApproved = evt.status === 'APPROVED';
              return (
                <div key={evt.id} className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100">{evt.symbol}</span>
                      <span className="text-slate-400 font-mono">{evt.actionRequested}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-mono">{evt.timestamp}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                        isApproved ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}>
                        {isApproved ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        {evt.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/60 font-mono">
                    {evt.reason}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Account Equity: <strong className="text-slate-300">${evt.accountEquity.toLocaleString()}</strong></span>
                    <span>Guardrail: <strong className="text-cyan-400">{evt.riskLimitApplied}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
