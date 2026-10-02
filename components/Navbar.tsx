import React from 'react';
import { 
  Activity, 
  ShieldAlert, 
  Play, 
  Pause, 
  Square, 
  Sliders, 
  ShieldCheck, 
  BarChart3, 
  Database, 
  Cpu, 
  Terminal,
  TrendingUp,
  DollarSign,
  Zap,
  RefreshCw
} from 'lucide-react';
import { BotStatus, TradingMode } from '@/types/trading';

interface NavbarProps {
  status: BotStatus;
  mode: TradingMode;
  onStatusChange: (status: BotStatus) => void;
  onModeChange: (mode: TradingMode) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  accountBalance: number;
  accountEquity: number;
  dailyPnl: number;
  onEmergencyStop: () => void;
}

export function Navbar({
  status,
  mode,
  onStatusChange,
  onModeChange,
  activeTab,
  setActiveTab,
  accountBalance,
  accountEquity,
  dailyPnl,
  onEmergencyStop
}: NavbarProps) {
  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Status */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Zap className="h-5 w-5 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight flex items-center gap-2">
                ALGORUN <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">v2.4 AI</span>
              </h1>
              <p className="text-xs text-slate-400">Automated Algorithmic Trading & ML Platform</p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            {status === 'RUNNING' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                RUNNING
              </span>
            )}
            {status === 'PAUSED' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                PAUSED
              </span>
            )}
            {status === 'EMERGENCY_STOP' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30 animate-pulse">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                EMERGENCY STOP
              </span>
            )}
          </div>
        </div>

        {/* Portfolio Mini Ticker */}
        <div className="hidden lg:flex items-center gap-6 bg-slate-800/60 px-4 py-2 rounded-xl border border-slate-700/50 text-xs">
          <div>
            <span className="text-slate-400 block">Balance</span>
            <span className="font-mono font-semibold text-slate-200">${accountBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="h-6 w-px bg-slate-700" />
          <div>
            <span className="text-slate-400 block">Equity</span>
            <span className="font-mono font-semibold text-slate-200">${accountEquity.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="h-6 w-px bg-slate-700" />
          <div>
            <span className="text-slate-400 block">Today's P/L</span>
            <span className={`font-mono font-semibold flex items-center gap-1 ${dailyPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              <TrendingUp className={`h-3.5 w-3.5 ${dailyPnl < 0 ? 'rotate-180' : ''}`} />
              {dailyPnl >= 0 ? '+' : ''}${dailyPnl.toFixed(2)} ({((dailyPnl / 10000) * 100).toFixed(2)}%)
            </span>
          </div>
        </div>

        {/* Controls & Kill Switch */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <select 
            value={mode} 
            onChange={(e) => onModeChange(e.target.value as TradingMode)}
            className="bg-slate-800 border border-slate-700 text-xs rounded-lg px-2.5 py-1.5 text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="PAPER">Paper Trading</option>
            <option value="SHADOW">Shadow Mode</option>
            <option value="BACKTEST">Backtest Mode</option>
            <option value="SANDBOX">Broker Sandbox</option>
          </select>

          {status === 'RUNNING' ? (
            <button
              onClick={() => onStatusChange('PAUSED')}
              className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Pause className="h-3.5 w-3.5" /> Pause
            </button>
          ) : (
            <button
              onClick={() => onStatusChange('RUNNING')}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Play className="h-3.5 w-3.5" /> Run Bot
            </button>
          )}

          <button
            onClick={onEmergencyStop}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-rose-600/30 transition-all active:scale-95"
            title="Emergency Stop: Close all positions & halt all orders"
          >
            <ShieldAlert className="h-4 w-4" /> KILL SWITCH
          </button>
        </div>

      </div>

      {/* Navigation Tabs */}
      <div className="bg-slate-950/60 border-t border-slate-800/80 px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: 'dashboard', label: 'Live Trading Dashboard', icon: BarChart3 },
            { id: 'ml_strategy', label: 'ML & Strategy Engine', icon: Cpu },
            { id: 'risk_management', label: 'Risk Management', icon: ShieldCheck },
            { id: 'backtest', label: 'Backtesting Studio', icon: RefreshCw },
            { id: 'database', label: 'Supabase / PostgreSQL DB', icon: Database },
            { id: 'ai_analyst', label: 'AI Desk Co-Pilot', icon: Terminal },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
                  isActive 
                    ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5' 
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
