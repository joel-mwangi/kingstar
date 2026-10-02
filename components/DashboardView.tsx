import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  DollarSign, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Send,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Terminal,
  Play
} from 'lucide-react';
import { Asset, Position, Order, RiskEvent, SystemLog, StrategyConfig } from '@/types/trading';

interface DashboardViewProps {
  assets: Asset[];
  positions: Position[];
  orders: Order[];
  riskEvents: RiskEvent[];
  logs: SystemLog[];
  strategyConfig: StrategyConfig;
  onExecuteManualOrder: (symbol: string, side: 'BUY' | 'SELL', qty: number) => void;
  onClosePosition: (positionId: string) => void;
}

export function DashboardView({
  assets,
  positions,
  orders,
  riskEvents,
  logs,
  strategyConfig,
  onExecuteManualOrder,
  onClosePosition
}: DashboardViewProps) {
  const [selectedAsset, setSelectedAsset] = useState<Asset>(assets[0]);
  const [manualQty, setManualQty] = useState<number>(10);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'positions' | 'orders' | 'logs'>('overview');

  const totalUnrealizedPnl = positions.reduce((acc, p) => acc + p.unrealizedPnl, 0);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-5 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 p-4 text-cyan-500/10">
            <Activity className="h-16 w-16" />
          </div>
          <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Active Strategy</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-100 font-mono">XGBoost + Risk Guard</span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-cyan-400">
            <span className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
            Min Prob: {(strategyConfig.minProbability * 100)}% | Min Ret: +{strategyConfig.minExpectedReturn}%
          </div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-5 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 p-4 text-emerald-500/10">
            <DollarSign className="h-16 w-16" />
          </div>
          <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Open Positions P/L</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-bold font-mono ${totalUnrealizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {totalUnrealizedPnl >= 0 ? '+' : ''}${totalUnrealizedPnl.toFixed(2)}
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-400">
            Across {positions.length} active holdings
          </div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-5 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 p-4 text-blue-500/10">
            <ShieldCheck className="h-16 w-16" />
          </div>
          <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Risk Engine Status</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-emerald-400 font-mono">ACTIVE (0 Breaches)</span>
          </div>
          <div className="mt-3 text-xs text-slate-400">
            Max Drawdown Cap: ${strategyConfig.maxDailyLoss} / day
          </div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-5 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 p-4 text-amber-500/10">
            <Zap className="h-16 w-16" />
          </div>
          <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">ML Prediction Latency</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-100 font-mono">1.2ms</span>
          </div>
          <div className="mt-3 text-xs text-slate-400">
            Inference engine running locally
          </div>
        </div>

      </div>

      {/* Main Asset Grid & Real-time Ticker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Asset Ticker List */}
        <div className="lg:col-span-1 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
              <Layers className="h-4 w-4 text-cyan-400" /> Monitored Assets & ML Signals
            </h2>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">{assets.length} symbols</span>
          </div>

          <div className="space-y-2.5">
            {assets.map((asset) => {
              const isSelected = selectedAsset.symbol === asset.symbol;
              const isBuy = asset.prediction.signal === 'BUY';
              const isSell = asset.prediction.signal === 'SELL';

              return (
                <div
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-slate-800/80 border-cyan-500/50 shadow-lg shadow-cyan-500/10' 
                      : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-100">{asset.symbol}</span>
                      <span className="text-xs text-slate-400 block">{asset.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-slate-100">${asset.price.toFixed(2)}</span>
                      <span className={`text-xs block font-mono ${asset.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">ML Prob:</span>
                      <span className="font-mono font-semibold text-cyan-400">
                        {(asset.prediction.probabilityUp * 100).toFixed(0)}% UP
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-md font-bold uppercase text-[10px] ${
                      isBuy ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      isSell ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' :
                      'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {asset.prediction.signal}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Asset Deep Dive & Strategy Details */}
        <div className="lg:col-span-2 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-slate-100">{selectedAsset.symbol}</h3>
                <span className="text-sm text-slate-400">{selectedAsset.name}</span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                  {selectedAsset.prediction.modelVersion}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Real-time quote, technical indicators, and ML probability vector.</p>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-mono font-bold text-slate-100">${selectedAsset.price.toFixed(2)}</div>
              <div className="text-xs text-slate-400 font-mono">Bid: ${selectedAsset.bid} | Ask: ${selectedAsset.ask}</div>
            </div>
          </div>

          {/* ML & Indicator Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-950/50 border border-slate-800/80 p-3.5 rounded-xl">
              <span className="text-xs text-slate-400">UP Probability</span>
              <div className="text-lg font-bold font-mono text-cyan-400 mt-1">
                {(selectedAsset.prediction.probabilityUp * 100).toFixed(1)}%
              </div>
            </div>
            <div className="bg-slate-950/50 border border-slate-800/80 p-3.5 rounded-xl">
              <span className="text-xs text-slate-400">Expected Return</span>
              <div className="text-lg font-bold font-mono text-emerald-400 mt-1">
                +{selectedAsset.prediction.expectedReturn}%
              </div>
            </div>
            <div className="bg-slate-950/50 border border-slate-800/80 p-3.5 rounded-xl">
              <span className="text-xs text-slate-400">RSI (14)</span>
              <div className="text-lg font-bold font-mono text-slate-200 mt-1">
                {selectedAsset.rsi}
              </div>
            </div>
            <div className="bg-slate-950/50 border border-slate-800/80 p-3.5 rounded-xl">
              <span className="text-xs text-slate-400">Volatility</span>
              <div className="text-lg font-bold font-mono text-amber-400 mt-1">
                {(selectedAsset.volatility * 100).toFixed(2)}%
              </div>
            </div>
          </div>

          {/* Technical indicators breakdown */}
          <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Feature Vector & Technicals</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div>
                <span className="text-slate-500 block">MACD</span>
                <span className="text-slate-200 font-semibold">{selectedAsset.macd}</span>
              </div>
              <div>
                <span className="text-slate-500 block">SMA (50)</span>
                <span className="text-slate-200 font-semibold">${selectedAsset.sma50}</span>
              </div>
              <div>
                <span className="text-slate-500 block">EMA (20)</span>
                <span className="text-slate-200 font-semibold">${selectedAsset.ema20}</span>
              </div>
              <div>
                <span className="text-slate-500 block">24h Volume</span>
                <span className="text-slate-200 font-semibold">{(selectedAsset.volume / 1000000).toFixed(1)}M</span>
              </div>
            </div>
          </div>

          {/* Manual Order Trigger / Simulation */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-xs font-semibold text-slate-300">Test Order:</span>
              <input
                type="number"
                min="1"
                max="1000"
                value={manualQty}
                onChange={(e) => setManualQty(Number(e.target.value))}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 w-24 text-slate-200 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <span className="text-xs text-slate-400">shares</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => onExecuteManualOrder(selectedAsset.symbol, 'BUY', manualQty)}
                className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/20 transition-all"
              >
                <ArrowUpRight className="h-4 w-4" /> Simulate BUY ({selectedAsset.symbol})
              </button>
              <button
                onClick={() => onExecuteManualOrder(selectedAsset.symbol, 'SELL', manualQty)}
                className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/20 transition-all"
              >
                <ArrowDownRight className="h-4 w-4" /> Simulate SELL / SHORT
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Tabs for Open Positions, Orders, Risk Events & Terminal Logs */}
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            {[
              { id: 'positions', label: `Open Positions (${positions.length})` },
              { id: 'orders', label: `Recent Orders (${orders.length})` },
              { id: 'logs', label: `Terminal System Logs (${logs.length})` },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveSubTab(t.id as any)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeSubTab === t.id
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-400 font-mono hidden sm:inline">Engine: Paper Trading Feed</span>
        </div>

        {/* Positions Table */}
        {activeSubTab === 'positions' && (
          <div className="overflow-x-auto">
            {positions.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">No open positions at the moment. Bot is scanning market feeds.</div>
            ) : (
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3 font-semibold">SYMBOL</th>
                    <th className="pb-3 font-semibold">QTY</th>
                    <th className="pb-3 font-semibold">ENTRY PRICE</th>
                    <th className="pb-3 font-semibold">CURRENT PRICE</th>
                    <th className="pb-3 font-semibold">STOP LOSS</th>
                    <th className="pb-3 font-semibold">TAKE PROFIT</th>
                    <th className="pb-3 font-semibold">UNREALIZED P/L</th>
                    <th className="pb-3 font-semibold text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {positions.map((pos) => (
                    <tr key={pos.id} className="hover:bg-slate-800/30">
                      <td className="py-3.5 font-bold text-slate-100">{pos.symbol}</td>
                      <td className="py-3.5 text-slate-300">{pos.quantity}</td>
                      <td className="py-3.5 text-slate-300">${pos.entryPrice.toFixed(2)}</td>
                      <td className="py-3.5 text-slate-100 font-semibold">${pos.currentPrice.toFixed(2)}</td>
                      <td className="py-3.5 text-rose-400">${pos.stopLoss.toFixed(2)}</td>
                      <td className="py-3.5 text-emerald-400">${pos.takeProfit.toFixed(2)}</td>
                      <td className="py-3.5">
                        <span className={`font-bold ${pos.unrealizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {pos.unrealizedPnl >= 0 ? '+' : ''}${pos.unrealizedPnl.toFixed(2)} ({pos.unrealizedPnlPercent >= 0 ? '+' : ''}{pos.unrealizedPnlPercent}%)
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => onClosePosition(pos.id)}
                          className="px-3 py-1 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 text-[11px] font-semibold transition-colors"
                        >
                          EXIT / SELL
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Orders Table */}
        {activeSubTab === 'orders' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 font-semibold">ORDER ID</th>
                  <th className="pb-3 font-semibold">BROKER ID</th>
                  <th className="pb-3 font-semibold">SYMBOL</th>
                  <th className="pb-3 font-semibold">SIDE</th>
                  <th className="pb-3 font-semibold">QTY</th>
                  <th className="pb-3 font-semibold">REQ PRICE</th>
                  <th className="pb-3 font-semibold">STATUS</th>
                  <th className="pb-3 font-semibold text-right">SUBMITTED AT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-800/30">
                    <td className="py-3.5 text-slate-400">{ord.id}</td>
                    <td className="py-3.5 font-bold text-slate-200">{ord.brokerOrderId}</td>
                    <td className="py-3.5 font-bold text-slate-100">{ord.symbol}</td>
                    <td className="py-3.5">
                      <span className={`font-semibold ${ord.side === 'BUY' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {ord.side}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-300">{ord.quantity}</td>
                    <td className="py-3.5 text-slate-300">${ord.requestedPrice.toFixed(2)}</td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ord.status === 'FILLED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        ord.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' :
                        'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right text-slate-400">{ord.submittedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Terminal Logs */}
        {activeSubTab === 'logs' && (
          <div className="bg-slate-950 font-mono text-xs rounded-xl p-4 border border-slate-800 space-y-2 max-h-80 overflow-y-auto">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 py-1 border-b border-slate-900/80">
                <span className="text-slate-500">{log.timestamp}</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                  log.level === 'SUCCESS' ? 'text-emerald-400 bg-emerald-500/10' :
                  log.level === 'WARN' ? 'text-amber-400 bg-amber-500/10' :
                  log.level === 'RISK' ? 'text-rose-400 bg-rose-500/10' :
                  'text-cyan-400 bg-cyan-500/10'
                }`}>
                  [{log.source}]
                </span>
                <span className="text-slate-300 flex-1">{log.message}</span>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
}
