import React, { useState } from 'react';
import { Bot, Send, Sparkles, Terminal } from 'lucide-react';
import { Asset, Position, StrategyConfig } from '@/types/trading';
import { UserTenantProfile } from '@/lib/multiUserDb';

interface Props {
  assets: Asset[];
  positions: Position[];
  strategyConfig: StrategyConfig;
  currentUser: UserTenantProfile;
}

export function AiAnalystView({ assets, positions, strategyConfig, currentUser }: Props) {
  const [analysis, setAnalysis] = useState('');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const run = async (customPrompt?: string) => {
    setLoading(true);

    try {
      const response = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: customPrompt || undefined,
          assetData: assets,
          positions,
          account: currentUser,
          riskRules: strategyConfig,
        }),
      });

      const payload = await response.json();
      setAnalysis(response.ok ? payload.analysis : 'Error: ' + (payload.error || 'AI request failed.'));
    } catch (error) {
      setAnalysis(error instanceof Error ? error.message : 'AI request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2"><Sparkles className="h-5 w-5 text-cyan-400" /> AI Analyst</h2>
        <p className="text-xs text-slate-400 mt-1">Advisory only. Gemini cannot place, approve, or bypass a broker order.</p>
      </section>

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
        <label className="text-xs text-slate-400 uppercase tracking-wide flex items-center gap-2"><Terminal className="h-4 w-4" /> Ask the analyst</label>
        <div className="mt-3 flex gap-2">
          <input value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && void run(prompt)} placeholder="Explain current directional risk or portfolio exposure..." className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200" maxLength={2000} />
          <button onClick={() => void run(prompt)} disabled={loading || !prompt.trim()} className="px-4 py-2 rounded-xl bg-cyan-600 text-white text-xs font-semibold flex items-center gap-1.5"><Send className="h-3.5 w-3.5" /> Send</button>
          <button onClick={() => void run()} disabled={loading} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold flex items-center gap-1.5"><Bot className="h-3.5 w-3.5" /> Generate</button>
        </div>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
        {loading
          ? <p className="py-12 text-center text-xs text-slate-400">Generating analysis...</p>
          : analysis
            ? <pre className="whitespace-pre-wrap text-xs leading-6 text-slate-300 font-mono">{analysis}</pre>
            : <p className="py-12 text-center text-xs text-slate-500">No analysis generated yet.</p>}
      </div>
    </div>
  );
}
