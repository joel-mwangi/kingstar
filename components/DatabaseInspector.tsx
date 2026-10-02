import React from 'react';
import { Database, ShieldCheck } from 'lucide-react';
import { Asset, Order, Position, RiskEvent, SystemLog } from '@/types/trading';

interface Props {
  assets: Asset[];
  positions: Position[];
  orders: Order[];
  riskEvents: RiskEvent[];
  logs: SystemLog[];
}

export function DatabaseInspector({ assets, positions, orders, riskEvents, logs }: Props) {
  const datasets = [
    ['Assets', assets.length],
    ['Open positions', positions.length],
    ['Orders', orders.length],
    ['Risk events', riskEvents.length],
    ['System logs', logs.length],
  ] as const;

  return (
    <div className="space-y-6">
      <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2"><Database className="h-5 w-5 text-cyan-400" /> Data Inspector</h2>
        <p className="text-xs text-slate-400 mt-1">Firestore is the persistence layer. React state is a view/cache and is not presented as a SQL database.</p>
      </section>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {datasets.map(([label, count]) => (
          <div key={label} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
            <span className="text-xs text-slate-500">{label}</span>
            <div className="mt-1 text-2xl font-mono font-bold text-slate-100">{count}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-200">Orders</h3>
          <div className="mt-3 space-y-2 max-h-80 overflow-y-auto">
            {orders.length === 0 && <p className="text-xs text-slate-500">No orders.</p>}
            {orders.map((order) => (
              <div key={order.id} className="rounded-lg bg-slate-950/70 p-3 text-xs">
                <b className="text-slate-100">{order.symbol}</b>
                <span className="text-slate-400"> {order.side} • {order.status} • {'$' + order.stake.toFixed(2)}</span>
                {order.error && <p className="mt-1 text-rose-400">{order.error}</p>}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-200">Risk events</h3>
          <div className="mt-3 space-y-2 max-h-80 overflow-y-auto">
            {riskEvents.length === 0 && <p className="text-xs text-slate-500">No risk events.</p>}
            {riskEvents.map((event) => (
              <div key={event.id} className="rounded-lg bg-slate-950/70 p-3 text-xs">
                <span className={event.status === 'APPROVED' ? 'text-emerald-400' : 'text-rose-400'}>{event.status}</span>
                <span className="text-slate-300"> {event.symbol} • {event.reason}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4 text-xs text-slate-400 flex items-start gap-2">
        <ShieldCheck className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
        Persisted records are scoped by the Firebase Authentication UID in Firestore security rules.
      </div>
    </div>
  );
}
