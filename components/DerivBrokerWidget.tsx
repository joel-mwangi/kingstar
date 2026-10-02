import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, ExternalLink, Key, LogOut, RefreshCw, ShieldCheck, UserPlus, Wifi, WifiOff } from 'lucide-react';
import { DerivAccount, DerivTick, derivClient } from '@/lib/derivWebSocket';
import { initiateDerivLogin } from '@/lib/derivOAuth';

interface Props {
  onDerivTick?: (tick: DerivTick) => void;
  onAccountAuthorized?: (account: { loginid?: string; fullname?: string; currency?: string; balance?: number; isVirtual?: boolean }) => void;
}

function normaliseAccounts(payload: any): DerivAccount[] {
  const rows = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload?.accounts) ? payload.accounts : [];
  return rows
    .map((item: any) => ({
      acct: String(item.id ?? item.acct ?? ''),
      currency: String(item.currency ?? 'USD'),
      account_type: String(item.account_type ?? (item.is_virtual ? 'demo' : 'real')),
      balance: Number(item.balance ?? 0),
      is_virtual: Number(item.is_virtual ?? (item.account_type === 'demo' ? 1 : 0)),
    }))
    .filter((item: DerivAccount) => item.acct);
}

export function DerivBrokerWidget({ onDerivTick, onAccountAuthorized }: Props) {
  const [connected, setConnected] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [accounts, setAccounts] = useState<DerivAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [manualToken, setManualToken] = useState('');
  const [showPat, setShowPat] = useState(false);
  const [message, setMessage] = useState('');

  const tickRef = useRef(onDerivTick);
  const accountRef = useRef(onAccountAuthorized);

  useEffect(() => {
    tickRef.current = onDerivTick;
    accountRef.current = onAccountAuthorized;
  }, [onDerivTick, onAccountAuthorized]);

  const loadAccounts = async () => {
    const response = await fetch('/api/deriv/accounts', { cache: 'no-store' });
    if (!response.ok) {
      setAccounts([]);
      return;
    }
    const payload = await response.json();
    const rows = normaliseAccounts(payload);
    setAccounts(rows);

    const preferred = localStorage.getItem('deriv_active_account');
    setSelectedAccount(
      rows.find((row) => row.acct === preferred)?.acct ||
      rows[0]?.acct ||
      ''
    );
  };

  useEffect(() => {
    derivClient.connectPublic();

    const offTick = derivClient.onTick((tick) => tickRef.current?.(tick));
    const offStatus = derivClient.onStatus((state) => {
      setConnected(state.connected);
      setAuthorized(state.authorized);
    });

    // Initial broker-account sync intentionally updates local view state after the effect starts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadAccounts().catch(() => undefined);

    return () => {
      offTick();
      offStatus();
      derivClient.disconnect();
    };
  }, []);

  const connectAccount = async () => {
    if (!selectedAccount) return;

    setMessage('Requesting secure broker session...');

    try {
      const response = await fetch('/api/deriv/accounts/' + encodeURIComponent(selectedAccount) + '/otp', { method: 'POST' });
      const payload = await response.json();

      if (!response.ok || !payload?.data?.url) {
        setMessage(payload?.error || payload?.errors?.[0]?.message || 'Unable to create broker session.');
        return;
      }

      const account = accounts.find((row) => row.acct === selectedAccount);
      localStorage.setItem('deriv_active_account', selectedAccount);
      derivClient.connectAuthenticated(payload.data.url);

      accountRef.current?.({
        loginid: selectedAccount,
        currency: account?.currency,
        balance: account?.balance,
        isVirtual: account?.is_virtual === 1,
      });

      setMessage('Authenticated broker session established.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Broker connection failed.');
    }
  };

  const submitPat = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('Validating PAT...');

    try {
      const response = await fetch('/api/auth/deriv/pat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: manualToken }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setMessage(payload?.error || payload?.errors?.[0]?.message || 'Invalid PAT.');
        return;
      }

      setManualToken('');
      setShowPat(false);
      setMessage('PAT accepted and stored in an httpOnly session cookie.');
      await loadAccounts();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'PAT authentication failed.');
    }
  };

  const logout = async () => {
    await fetch('/api/auth/deriv/logout', { method: 'POST' }).catch(() => undefined);
    derivClient.disconnect();
    derivClient.connectPublic();
    setAuthorized(false);
    setAccounts([]);
    setSelectedAccount('');
    localStorage.removeItem('deriv_active_account');
    setMessage('Deriv credentials cleared.');
  };

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 shadow-xl">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={'h-10 w-10 rounded-xl flex items-center justify-center border ' + (connected ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-500')}>
            {connected ? <Wifi className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm">Deriv broker connection</h4>
              {authorized && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="inline h-3 w-3 mr-1" /> authenticated
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">Public ticks feed market data; authenticated OTP sessions are used for broker operations.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!accounts.length ? (
            <>
              <button onClick={() => initiateDerivLogin(false)} className="px-3 py-2 rounded-xl bg-cyan-600 text-white text-xs font-semibold flex items-center gap-1.5"><ExternalLink className="h-3.5 w-3.5" /> OAuth login</button>
              <button onClick={() => initiateDerivLogin(true)} className="px-3 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold flex items-center gap-1.5"><UserPlus className="h-3.5 w-3.5" /> Sign up</button>
              <button onClick={() => setShowPat((value) => !value)} className="px-3 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold flex items-center gap-1.5"><Key className="h-3.5 w-3.5" /> PAT</button>
            </>
          ) : (
            <>
              <select value={selectedAccount} onChange={(event) => setSelectedAccount(event.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-200">
                {accounts.map((account) => <option key={account.acct} value={account.acct}>{account.acct} • {account.account_type}</option>)}
              </select>
              <button onClick={() => void connectAccount()} className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" /> Connect account</button>
              <button onClick={() => void loadAccounts()} className="px-3 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs"><RefreshCw className="h-3.5 w-3.5" /></button>
              <button onClick={() => void logout()} className="px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-1.5"><LogOut className="h-3.5 w-3.5" /> Logout</button>
            </>
          )}
        </div>
      </div>

      {showPat && (
        <form onSubmit={submitPat} className="mt-4 pt-4 border-t border-slate-800 flex gap-2">
          <input type="password" value={manualToken} onChange={(event) => setManualToken(event.target.value)} placeholder="Deriv PAT" className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200" autoComplete="off" />
          <button className="px-4 py-2 rounded-xl bg-cyan-600 text-white text-xs font-semibold">Authorize</button>
        </form>
      )}

      {message && <p className="mt-3 text-xs text-slate-400">{message}</p>}
    </div>
  );
}