import React, { useState, useEffect } from 'react';
import { derivClient, DerivTick, DerivAccount } from '@/lib/derivWebSocket';
import { initiateDerivLogin } from '@/lib/derivOAuth';
import { Wifi, WifiOff, Key, ExternalLink, ShieldCheck, UserPlus, LogOut } from 'lucide-react';

interface DerivBrokerWidgetProps {
  onDerivTick?: (tick: DerivTick) => void;
}

export function DerivBrokerWidget({ onDerivTick }: DerivBrokerWidgetProps) {
  const [isConnected, setIsConnected] = useState(derivClient.isConnected);
  const [isAuthorized, setIsAuthorized] = useState(derivClient.isAuthorized);
  const [authData, setAuthData] = useState<any>(null);
  const [accounts, setAccounts] = useState<DerivAccount[]>([]);
  const [manualToken, setManualToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [latestTick, setLatestTick] = useState<DerivTick | null>(null);

  useEffect(() => {
    const savedAccounts = localStorage.getItem('deriv_accounts');
    if (savedAccounts) {
      try {
        setAccounts(JSON.parse(savedAccounts));
      } catch (e) {}
    }

    derivClient.connect(() => {
      setIsConnected(true);
    });

    const unsubAuth = derivClient.onAuth((auth) => {
      setIsAuthorized(true);
      setAuthData(auth);
    });

    const unsubTick = derivClient.onTick((tick) => {
      setLatestTick(tick);
      if (onDerivTick) onDerivTick(tick);
    });

    setTimeout(() => {
      derivClient.subscribeTicks('R_100');
      derivClient.subscribeTicks('frxEURUSD');
    }, 1000);

    const interval = setInterval(() => {
      setIsConnected(derivClient.isConnected);
      setIsAuthorized(derivClient.isAuthorized);
    }, 1000);

    return () => {
      unsubAuth();
      unsubTick();
      clearInterval(interval);
    };
  }, [onDerivTick]);

  const handleManualAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualToken.trim()) {
      derivClient.authorize(manualToken.trim());
      setShowTokenInput(false);
    }
  };

  const handleSwitchAccount = (acc: DerivAccount) => {
    derivClient.authorize(acc.token);
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-xl text-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
      
      <div className="flex items-center gap-3">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${isConnected ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'}`}>
          {isConnected ? <Wifi className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-sm tracking-tight">Deriv OAuth 2.0 PKCE</h4>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              App ID: 34yEbiGrjbggKPYwNs9kA
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            auth.deriv.com/oauth2/auth • wss://ws.derivws.com/websockets/v3
          </p>
        </div>
      </div>

      {/* Connection & Auth Status */}
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
        
        {latestTick && (
          <div className="hidden lg:flex items-center gap-2 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono">
            <span className="text-slate-400">{latestTick.symbol}:</span>
            <span className="text-emerald-400 font-bold">${latestTick.quote.toFixed(2)}</span>
          </div>
        )}

        {isAuthorized ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-xs font-mono text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              <div>
                <span className="font-bold block">{authData?.fullname || authData?.email || 'Authorized Account'}</span>
                <span className="text-[10px] text-emerald-300 block">ID: {authData?.loginid} | Balance: ${authData?.balance} {authData?.currency}</span>
              </div>
            </div>

            {accounts.length > 1 && (
              <select
                onChange={(e) => {
                  const acc = accounts.find((a) => a.acct === e.target.value);
                  if (acc) handleSwitchAccount(acc);
                }}
                className="bg-slate-800 border border-slate-700 text-xs rounded-lg px-2 py-1.5 text-slate-200 font-mono"
              >
                {accounts.map((acc) => (
                  <option key={acc.acct} value={acc.acct}>
                    {acc.acct} ({acc.currency})
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={() => derivClient.logout()}
              className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-all"
              title="Logout & Clear Private Session"
            >
              <LogOut className="h-3.5 w-3.5" /> Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => initiateDerivLogin(false)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-orange-600/20 transition-all"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Login (OAuth PKCE)
            </button>

            <button
              onClick={() => initiateDerivLogin(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-blue-600/20 transition-all"
              title="Register / Sign Up via Deriv"
            >
              <UserPlus className="h-3.5 w-3.5" /> Sign Up
            </button>

            <button
              onClick={() => setShowTokenInput(!showTokenInput)}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
              title="Enter Personal Access Token (PAT)"
            >
              <Key className="h-3.5 w-3.5" /> PAT
            </button>
          </div>
        )}

      </div>

      {showTokenInput && (
        <form onSubmit={handleManualAuth} className="w-full mt-3 pt-3 border-t border-slate-800 flex gap-2">
          <input
            type="password"
            placeholder="Enter Deriv Personal Access Token (PAT)..."
            value={manualToken}
            onChange={(e) => setManualToken(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs rounded-xl"
          >
            Authorize PAT
          </button>
        </form>
      )}

    </div>
  );
}
