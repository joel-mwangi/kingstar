import React, { useState } from 'react';
import { Database, Terminal, Table, Code, Search, CheckCircle } from 'lucide-react';
import { Asset, Position, Order, RiskEvent, SystemLog } from '@/types/trading';

interface DatabaseInspectorProps {
  assets: Asset[];
  positions: Position[];
  orders: Order[];
  riskEvents: RiskEvent[];
  logs: SystemLog[];
}

export function DatabaseInspector({
  assets,
  positions,
  orders,
  riskEvents,
  logs
}: DatabaseInspectorProps) {
  const [selectedTable, setSelectedTable] = useState<string>('orders');
  const [customQuery, setCustomQuery] = useState<string>('SELECT * FROM orders ORDER BY submitted_at DESC LIMIT 10;');
  const [queryResult, setQueryResult] = useState<string | null>(null);

  const tables = [
    { id: 'users', label: 'users', count: 1, desc: 'User profiles & API keys' },
    { id: 'accounts', label: 'accounts', count: 1, desc: 'Capital balances & margin limits' },
    { id: 'assets', label: 'assets', count: assets.length, desc: 'Monitored symbols & universe' },
    { id: 'market_prices', label: 'market_prices', count: 1420, desc: 'Tick-level price history' },
    { id: 'models', label: 'models', count: 4, desc: 'ML model registry & weights' },
    { id: 'predictions', label: 'predictions', count: 520, desc: 'ML probability inference logs' },
    { id: 'strategies', label: 'strategies', count: 2, desc: 'Algorithmic strategy parameters' },
    { id: 'orders', label: 'orders', count: orders.length, desc: 'Broker submitted orders' },
    { id: 'positions', label: 'positions', count: positions.length, desc: 'Active portfolio holdings' },
    { id: 'trades', label: 'trades', count: 38, desc: 'Executed trade fills & P/L' },
    { id: 'risk_events', label: 'risk_events', count: riskEvents.length, desc: 'Risk manager vetoes & approvals' },
    { id: 'system_logs', label: 'system_logs', count: logs.length, desc: 'Engine diagnostic logs' }
  ];

  const handleRunQuery = (e: React.FormEvent) => {
    e.preventDefault();
    setQueryResult(JSON.stringify({
      status: "success",
      rowCount: 3,
      executionTimeMs: 0.84,
      data: selectedTable === 'orders' ? orders : selectedTable === 'positions' ? positions : riskEvents
    }, null, 2));
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Database className="h-5 w-5 text-cyan-400" /> Supabase / PostgreSQL Database Inspector
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Inspect relational database tables, order history, ML inference logs, and execute SQL queries.
            </p>
          </div>
          <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-semibold flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Connected (Pool: 12 active)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Table List Sidebar */}
        <div className="lg:col-span-1 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4 space-y-2 shadow-xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-2 block mb-2">Database Tables</span>
          <div className="space-y-1">
            {tables.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTable(t.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-mono flex items-center justify-between transition-all ${
                  selectedTable === t.id
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold'
                    : 'text-slate-300 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Table className="h-3.5 w-3.5 text-slate-500" /> {t.label}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                  {t.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Table Records View & SQL Query Console */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* SQL Query Console */}
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Terminal className="h-4 w-4 text-cyan-400" /> SQL Query Runner
            </h3>

            <form onSubmit={handleRunQuery} className="flex gap-2">
              <input
                type="text"
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 font-mono text-xs text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-all flex items-center gap-1.5"
              >
                <Search className="h-3.5 w-3.5" /> Run SQL
              </button>
            </form>

            {queryResult && (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto max-h-48">
                <pre>{queryResult}</pre>
              </div>
            )}
          </div>

          {/* Table Data Inspector */}
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-slate-100 font-mono text-sm">Table: {selectedTable}</h3>
                <p className="text-xs text-slate-400">Showing current records stored in Supabase PostgreSQL instance.</p>
              </div>
              <span className="text-xs text-slate-400 font-mono">Schema: public</span>
            </div>

            <div className="overflow-x-auto">
              {selectedTable === 'orders' && (
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="pb-2">id</th>
                      <th className="pb-2">broker_order_id</th>
                      <th className="pb-2">symbol</th>
                      <th className="pb-2">side</th>
                      <th className="pb-2">quantity</th>
                      <th className="pb-2">status</th>
                      <th className="pb-2 text-right">submitted_at</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-800/30">
                        <td className="py-2.5 text-slate-400">{o.id}</td>
                        <td className="py-2.5 font-bold text-slate-200">{o.brokerOrderId}</td>
                        <td className="py-2.5 text-cyan-400">{o.symbol}</td>
                        <td className="py-2.5">{o.side}</td>
                        <td className="py-2.5 text-slate-300">{o.quantity}</td>
                        <td className="py-2.5 font-semibold text-emerald-400">{o.status}</td>
                        <td className="py-2.5 text-right text-slate-400">{o.submittedAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {selectedTable === 'positions' && (
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="pb-2">id</th>
                      <th className="pb-2">symbol</th>
                      <th className="pb-2">quantity</th>
                      <th className="pb-2">entry_price</th>
                      <th className="pb-2">current_price</th>
                      <th className="pb-2 text-right">unrealized_pnl</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {positions.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-800/30">
                        <td className="py-2.5 text-slate-400">{p.id}</td>
                        <td className="py-2.5 font-bold text-cyan-400">{p.symbol}</td>
                        <td className="py-2.5 text-slate-300">{p.quantity}</td>
                        <td className="py-2.5 text-slate-300">${p.entryPrice}</td>
                        <td className="py-2.5 text-slate-200">${p.currentPrice}</td>
                        <td className="py-2.5 text-right text-emerald-400">+${p.unrealizedPnl}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {selectedTable !== 'orders' && selectedTable !== 'positions' && (
                <div className="text-center py-8 text-slate-500 text-xs font-mono">
                  Table `{selectedTable}` contains structured trading records and schema definitions.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
