import React from 'react';
import { BarChart3, Cpu, Database, LockKeyhole, Pause, Play, RefreshCw, ShieldAlert, ShieldCheck, Terminal, Unlock, Zap } from 'lucide-react';
import { BotStatus, TradingMode } from '@/types/trading';

interface Props {
  status: BotStatus;
  mode: TradingMode;
  onStatusChange: (status: BotStatus) => void;
  onModeChange: (mode: TradingMode) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  accountBalance: number;
  accountEquity: number;
  dailyPnl: number;
  realTradingArmed: boolean;
  onArmRealTrading: () => void;
  onEmergencyStop: () => void;
}

export function Navbar(props: Props) {
  const navItems = [
    { id: 'dashboard', label: 'Trading Dashboard', icon: BarChart3 },
    { id: 'strategy', label: 'Strategy Engine', icon: Cpu },
    { id: 'risk', label: 'Risk Management', icon: ShieldCheck },
    { id: 'backtest', label: 'Research Backtest', icon: RefreshCw },
    { id: 'db', label: 'Data Inspector', icon: Database },
    { id: 'analyst', label: 'AI Analyst', icon: Terminal },
  ];
  const statusClass =
    props.status === 'RUNNING'
      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      : props.status === 'PAUSED'
        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
        : 'bg-rose-500/10 text-rose-400 border-rose-500/20';

  return (
    <header className="bg-slate-900/95 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col xl:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full xl:w-auto">
          <div className="h-10 w-10 rounded-xl bg-cyan-600 grid place-items-center"><Zap className="h-5 w-5 text-white" /></div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-slate-100">KINGSTAR <span className="text-xs text-cyan-400 font-mono">TRADING TERMINAL</span></h1>
            <p className="text-xs text-slate-400">Deriv Options • deterministic risk • advisory AI</p>
          </div>
          <span className={'ml-auto xl:ml-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ' + statusClass}>
            <span className="h-2 w-2 rounded-full bg-current" /> {props.status}
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-5 bg-slate-800/60 px-4 py-2 rounded-xl border border-slate-700/50 text-xs">
          <div><span className="text-slate-400 block">Balance</span><span className="font-mono text-slate-100">{'$' + props.accountBalance.toFixed(2)}</span></div>
          <div className="h-6 w-px bg-slate-700" />
          <div><span className="text-slate-400 block">Equity</span><span className="font-mono text-slate-100">{'$' + props.accountEquity.toFixed(2)}</span></div>
          <div className="h-6 w-px bg-slate-700" />
          <div><span className="text-slate-400 block">Daily P/L</span><span className={'font-mono ' + (props.dailyPnl >= 0 ? 'text-emerald-400' : 'text-rose-400')}>{(props.dailyPnl >= 0 ? '+' : '') + '$' + props.dailyPnl.toFixed(2)}</span></div>
        </div>

        <div className="flex items-center gap-2 w-full xl:w-auto justify-end">
          <select value={props.mode} onChange={(event) => props.onModeChange(event.target.value as TradingMode)} className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200">
            <option value="PAPER">Paper</option>
            <option value="DEMO">Deriv Demo</option>
            <option value="REAL">Deriv Real</option>
            <option value="BACKTEST">Backtest</option>
          </select>

          {props.mode === 'REAL' && (
            <button onClick={props.onArmRealTrading} className={'px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 ' + (props.realTradingArmed ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30')}>
              {props.realTradingArmed ? <Unlock className="h-3.5 w-3.5" /> : <LockKeyhole className="h-3.5 w-3.5" />}
              {props.realTradingArmed ? 'Live armed' : 'Arm live'}
            </button>
          )}

          {props.status === 'RUNNING' ? (
            <button onClick={() => props.onStatusChange('PAUSED')} className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold flex items-center gap-1.5"><Pause className="h-3.5 w-3.5" /> Pause</button>
          ) : (
            <button onClick={() => props.onStatusChange('RUNNING')} className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center gap-1.5"><Play className="h-3.5 w-3.5" /> Run</button>
          )}

          <button onClick={props.onEmergencyStop} className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold flex items-center gap-1.5"><ShieldAlert className="h-4 w-4" /> Kill switch</button>
        </div>
      </div>

      <div className="bg-slate-950/70 border-t border-slate-800/80 px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => props.setActiveTab(id)} className={'flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 whitespace-nowrap ' + (props.activeTab === id ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5' : 'border-transparent text-slate-400 hover:text-slate-200')}>
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
