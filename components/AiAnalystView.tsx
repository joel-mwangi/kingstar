import React, { useState } from 'react';
import { Terminal, Sparkles, Send, Bot, Shield, ArrowRight } from 'lucide-react';
import { Asset, StrategyConfig } from '@/types/trading';

interface AiAnalystViewProps {
  assets: Asset[];
  strategyConfig: StrategyConfig;
}

export function AiAnalystView({ assets, strategyConfig }: AiAnalystViewProps) {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');

  const handleFetchAnalysis = async (customPrompt?: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: customPrompt || undefined,
          assetData: assets,
          riskRules: strategyConfig
        })
      });
      const data = await res.json();
      if (data.error) {
        setAnalysis(`Error: ${data.error}`);
      } else {
        setAnalysis(data.analysis);
      }
    } catch (err: any) {
      setAnalysis(`Failed to reach server: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-cyan-400" /> AI Trading Desk Co-Pilot (Gemini Powered)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time quantitative market synthesis, portfolio risk audit, and model explainability powered by Gemini AI.
          </p>
        </div>

        <button
          onClick={() => handleFetchAnalysis()}
          disabled={loading}
          className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-cyan-600/20 transition-all"
        >
          <Bot className={`h-4 w-4 ${loading ? 'animate-bounce' : ''}`} />
          {loading ? 'Synthesizing Market Data...' : 'Generate AI Desk Report'}
        </button>
      </div>

      {/* Custom Prompt Input */}
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Terminal className="h-4 w-4 text-cyan-400" /> Ask Quantitative Co-Pilot
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g., Analyze our current NVDA and AAPL exposure given volatility and macroeconomic risks..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleFetchAnalysis(prompt)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
          />
          <button
            onClick={() => handleFetchAnalysis(prompt)}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all"
          >
            <Send className="h-3.5 w-3.5" /> Send
          </button>
        </div>
      </div>

      {/* Output Report */}
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Quant Desk Synthesis Report</h3>
        
        {loading && (
          <div className="py-16 text-center space-y-3">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
            <p className="text-xs text-slate-400 font-mono">Analyzing tick vectors, model probabilities, and risk guardrails...</p>
          </div>
        )}

        {!loading && !analysis && (
          <div className="py-16 text-center space-y-3">
            <Sparkles className="h-10 w-10 text-cyan-500/40 mx-auto" />
            <p className="text-xs text-slate-400 font-mono">Click "Generate AI Desk Report" or enter a custom prompt above to consult the Gemini trading co-pilot.</p>
          </div>
        )}

        {!loading && analysis && (
          <div className="bg-slate-950/80 border border-slate-800 p-6 rounded-xl font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
            {analysis}
          </div>
        )}
      </div>

    </div>
  );
}
