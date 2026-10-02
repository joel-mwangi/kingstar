import React, { useEffect, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Layers, XCircle } from 'lucide-react';
import { Asset, Order, Position, RiskEvent, StrategyConfig, SystemLog, TradeSide } from '@/types/trading';
import { markPaperPosition } from '@/lib/paperEngine';

interface Props {
  assets: Asset[];
  positions: Position[];
  orders: Order[];
  riskEvents: RiskEvent[];
  logs: SystemLog[];
  strategyConfig: StrategyConfig;
  onExecuteManualOrder: (symbol: string, side: TradeSide, stake: number) => Promise<void>;
  onClosePosition: (position: Position) => Promise<void>;
}

export function DashboardView({
  assets,
  positions,
  orders,
  riskEvents,
  logs,
  strategyConfig,
  onExecuteManualOrder,
  onClosePosition,
}: Props) {
  const [selectedSymbol, setSelectedSymbol] = useState(assets[0]?.symbol || '');
  const [stake, setStake] = useState(10);
  const [tab, setTab] = useState<'positions' | 'orders' | 'logs'>('positions');

  const selectedAsset = assets.find((asset) => asset.symbol === selectedSymbol) || assets[0];

  useEffect(() => {
    if (!assets.some((asset) => asset.symbol === selectedSymbol)) {
      setSelectedSymbol(assets[0]?.symbol || '');
    }
  }, [assets, selectedSymbol]);

  const quote = selectedAsset?.price || 0;
  const confidenceUp = selectedAsset?.prediction.confidenceUp || 0.5;
  const confidenceDown = selectedAsset?.prediction.confidenceDown || 0.5;
  const expected = selectedAsset?.prediction.expectedReturn || 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5"><span className="text-xs text-slate-500">Strategy</span><div className="mt-1 text-lg font-semibold">Heuristic Momentum</div><p className="mt-2 text-xs text-slate-400">Confidence gate {(strategyConfig.minProbability * 100).toFixed(0)}%</p></div>
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5"><span className="text-xs text-slate-500">Open positions</span><div className="mt-1 text-2xl font-mono font-bold">{positions.length}</div><p className="mt-2 text-xs text-slate-400">Paper/broker reconciled</p></div>
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5"><span className="text-xs text-slate-500">Risk events</span><div className="mt-1 text-2xl font-mono font-bold">{riskEvents.length}</div><p className="mt-2 text-xs text-slate-400">Deterministic gate decisions</p></div>
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5"><span className="text-xs text-slate-500">Latest quote</span><div className="mt-1 text-2xl font-mono font-bold">{quote > 0 ? quote.toFixed(5) : '—'}</div><p className="mt-2 text-xs text-slate-400">{selectedAsset?.symbol || 'No symbol'} • public Deriv feed</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2"><Layers className="h-4 w-4 text-cyan-400" /> Market universe</h2>
          <div className="mt-4 space-y-2">
            {assets.map((asset) => (
              <button key={asset.id} onClick={() => setSelectedSymbol(asset.symbol)} className={'w-full text-left rounded-xl border p-3 ' + (selectedAsset?.symbol === asset.symbol ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-slate-950/50 border-slate-800')}>
                <div className="flex items-center justify-between"><div><b className="text-slate-100">{asset.symbol}</b><p className="text-[11px] text-slate-500">{asset.name}</p></div><span className="font-mono text-xs text-slate-200">{asset.price > 0 ? asset.price.toFixed(asset.price < 100 ? 5 : 2) : '—'}</span></div>
                <div className="mt-2 text-[11px] text-slate-400">{asset.prediction.signal} • up {(asset.prediction.confidenceUp * 100).toFixed(0)}% • down {(asset.prediction.confidenceDown * 100).toFixed(0)}%</div>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
            <div><h3 className="text-xl font-bold text-slate-100">{selectedAsset?.symbol}</h3><p className="text-xs text-slate-400 mt-1">Heuristic directional analysis from live ticks.</p></div>
            <div className="text-right"><div className="text-2xl font-mono">{quote > 0 ? quote.toFixed(5) : '—'}</div><span className="text-[11px] text-slate-500">confidence is not calibrated probability</span></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
            <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-4"><span className="text-xs text-slate-500">Up confidence</span><div className="mt-1 text-lg font-mono text-cyan-400">{(confidenceUp * 100).toFixed(1)}%</div></div>
            <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-4"><span className="text-xs text-slate-500">Down confidence</span><div className="mt-1 text-lg font-mono text-amber-400">{(confidenceDown * 100).toFixed(1)}%</div></div>
            <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-4"><span className="text-xs text-slate-500">Expected direction</span><div className="mt-1 text-lg font-mono">{expected.toFixed(3)}%</div></div>
            <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-4"><span className="text-xs text-slate-500">Volatility</span><div className="mt-1 text-lg font-mono">{((selectedAsset?.volatility || 0) * 100).toFixed(3)}%</div></div>
          </div>

          <div className="mt-6 rounded-xl bg-slate-950/60 border border-slate-800 p-4">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-300">Stake</span>
              <input type="number" min="1" max="100000" step="1" value={stake} onChange={(e) => setStake(Number(e.target.value))} className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200" />
              <span className="text-[11px] text-slate-500">Duration: {strategyConfig.defaultDuration}{strategyConfig.defaultDurationUnit}</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button onClick={() => selectedAsset && void onExecuteManualOrder(selectedAsset.symbol, 'CALL', stake)} disabled={!selectedAsset} className="rounded-xl px-4 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2"><ArrowUpRight className="h-4 w-4" /> Buy CALL</button>
              <button onClick={() => selectedAsset && void onExecuteManualOrder(selectedAsset.symbol, 'PUT', stake)} disabled={!selectedAsset} className="rounded-xl px-4 py-3 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2"><ArrowDownRight className="h-4 w-4" /> Buy PUT</button>
            </div>
            <p className="mt-3 text-[11px] text-slate-500">Paper mode uses a directional price proxy. Demo/Real mode uses Deriv proposal and buy operations.</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          {(['positions', 'orders', 'logs'] as const).map((key) => (
            <button key={key} onClick={() => setTab(key)} className={'px-3 py-2 text-xs ' + (tab === key ? 'text-cyan-400 border-b-2 border-cyan-500' : 'text-slate-400')}>{key}</button>
          ))}
        </div>

        {tab === 'positions' && (
          <div className="mt-4 space-y-2">
            {positions.length === 0 && <p className="py-10 text-center text-xs text-slate-500">No open positions.</p>}
            {positions.map((position) => {
              const liveAsset = assets.find((asset) => asset.symbol === position.symbol);
              const displayPosition = position.source === 'PAPER' && liveAsset
                ? markPaperPosition(position, liveAsset.price)
                : position;
              return (
                <div key={position.id} className="rounded-xl bg-slate-950/70 border border-slate-800 p-4 flex items-center justify-between gap-4">
                  <div><b className="text-slate-100">{position.symbol}</b><p className="text-xs text-slate-400">{position.contractType} • stake {'$' + position.stake.toFixed(2)} • {position.source}</p></div>
                  <div className="text-right">
                    <div className={'font-mono font-semibold ' + (displayPosition.profit >= 0 ? 'text-emerald-400' : 'text-rose-400')}>{(displayPosition.profit >= 0 ? '+' : '') + '$' + displayPosition.profit.toFixed(2) + ' (' + displayPosition.profitPercent.toFixed(2) + '%)'}</div>
                    <button onClick={() => void onClosePosition(position)} className="mt-2 text-xs text-rose-400 hover:text-rose-300"><XCircle className="inline h-3.5 w-3.5 mr-1" /> Close</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === 'orders' && (
          <div className="mt-4 space-y-2">
            {orders.length === 0 && <p className="py-10 text-center text-xs text-slate-500">No orders.</p>}
            {orders.map((order) => (
              <div key={order.id} className="rounded-xl bg-slate-950/70 border border-slate-800 p-4 text-xs">
                <b className="text-slate-100">{order.symbol}</b>
                <span className="text-slate-400"> {order.side} • {order.status} • stake {'$' + order.stake.toFixed(2)}</span>
                {order.error && <p className="mt-1 text-rose-400">{order.error}</p>}
              </div>
            ))}
          </div>
        )}

        {tab === 'logs' && (
          <div className="mt-4 space-y-2 max-h-80 overflow-y-auto">
            {logs.length === 0 ? <p className="py-10 text-center text-xs text-slate-500">No logs.</p> : logs.map((log) => (
              <div key={log.id} className="text-xs font-mono border-b border-slate-900 py-2">
                <span className="text-slate-500">{log.timestamp}</span>{' '}
                <span className={log.level === 'ERROR' || log.level === 'RISK' ? 'text-rose-400' : log.level === 'SUCCESS' ? 'text-emerald-400' : 'text-cyan-400'}>[{log.source}]</span>{' '}
                <span className="text-slate-300">{log.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}