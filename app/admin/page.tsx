/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useEffect, useState } from 'react';
import { Activity, LogOut, Save, ShieldAlert, ShieldCheck, Users } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import {
  AdminSystemSettings,
  DEFAULT_ADMIN_SETTINGS,
  getAdminSystemSettings,
  isAdmin,
  listUserProfiles,
  saveAdminSystemSettings,
  AdminUserSummary,
} from '@/lib/admin';

export default function AdminPage() {
  const [authorizing, setAuthorizing] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [settings, setSettings] = useState<AdminSystemSettings>(DEFAULT_ADMIN_SETTINGS);
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        const user = auth.currentUser;

        if (!user) {
          window.location.replace('/admin/login');
          return;
        }

        const admin = await isAdmin(user.uid);

        if (!admin) {
          window.location.replace('/');
          return;
        }

        setAllowed(true);

        const [systemSettings, userProfiles] = await Promise.all([
          getAdminSystemSettings(),
          listUserProfiles(),
        ]);

        setSettings(systemSettings);
        setUsers(userProfiles);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Admin console could not load.');
      } finally {
        setAuthorizing(false);
      }
    };

    void run();
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    setMessage('');

    try {
      await saveAdminSystemSettings(settings);
      setMessage('Platform settings saved.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not save settings.');
    } finally {
      setSaving(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
    window.location.replace('/admin/login');
  };

  if (authorizing) {
    return <main className="min-h-screen bg-slate-950 text-slate-100 grid place-items-center text-sm text-slate-400">Checking administrator access...</main>;
  }

  if (!allowed) return null;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-rose-400" />
              <h1 className="font-bold text-lg">Kingstar Admin Console</h1>
              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">ADMIN ONLY</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Administration is isolated from the trader workspace.</p>
          </div>
          <button onClick={() => void logout()} className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold flex items-center gap-2"><LogOut className="h-4 w-4" /> Sign out</button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {message && <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3 text-xs text-cyan-300">{message}</div>}

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5">
            <span className="text-xs text-slate-500">Registered users</span>
            <div className="mt-2 text-3xl font-mono font-bold">{users.length}</div>
          </div>
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5">
            <span className="text-xs text-slate-500">Application trading gate</span>
            <div className="mt-2 text-lg font-semibold">{settings.tradingEnabled ? 'Enabled' : 'Disabled'}</div>
          </div>
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5">
            <span className="text-xs text-slate-500">Real trading permission</span>
            <div className="mt-2 text-lg font-semibold">{settings.allowRealTrading ? 'Allowed' : 'Blocked'}</div>
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-5">
            <div className="flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-rose-400" /><h2 className="font-bold">Platform controls</h2></div>

            <label className="flex items-center justify-between gap-4 rounded-xl bg-slate-950/70 border border-slate-800 p-4 text-sm">
              <span><b>Trading enabled</b><span className="block text-xs text-slate-500 mt-1">Application-level state shown to traders.</span></span>
              <input type="checkbox" checked={settings.tradingEnabled} onChange={(event) => setSettings({ ...settings, tradingEnabled: event.target.checked })} />
            </label>

            <label className="flex items-center justify-between gap-4 rounded-xl bg-slate-950/70 border border-slate-800 p-4 text-sm">
              <span><b>Maintenance mode</b><span className="block text-xs text-slate-500 mt-1">Application-level maintenance state.</span></span>
              <input type="checkbox" checked={settings.maintenanceMode} onChange={(event) => setSettings({ ...settings, maintenanceMode: event.target.checked })} />
            </label>

            <label className="flex items-center justify-between gap-4 rounded-xl bg-slate-950/70 border border-slate-800 p-4 text-sm">
              <span><b>Allow real trading</b><span className="block text-xs text-slate-500 mt-1">Application permission flag; broker authentication and live arming still apply.</span></span>
              <input type="checkbox" checked={settings.allowRealTrading} onChange={(event) => setSettings({ ...settings, allowRealTrading: event.target.checked })} />
            </label>

            <label className="block text-xs text-slate-300">
              Admin notice
              <textarea maxLength={500} value={settings.notice} onChange={(event) => setSettings({ ...settings, notice: event.target.value })} className="mt-2 min-h-28 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-sm text-slate-100" />
            </label>

            <button onClick={() => void saveSettings()} disabled={saving} className="rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 px-4 py-2.5 text-sm font-semibold flex items-center gap-2"><Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save controls'}</button>
          </div>

          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6">
            <div className="flex items-center gap-2"><Users className="h-5 w-5 text-cyan-400" /><h2 className="font-bold">Users</h2></div>
            <div className="mt-4 space-y-2 max-h-[28rem] overflow-y-auto">
              {users.length === 0 && <p className="text-xs text-slate-500 py-10 text-center">No user profiles found.</p>}
              {users.map((user) => (
                <div key={user.userId} className="rounded-xl bg-slate-950/70 border border-slate-800 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div><b className="text-sm text-slate-100">{user.fullName}</b><p className="text-xs text-slate-500 mt-1">{user.email || 'No email'}</p></div>
                    <span className="text-[10px] font-mono text-slate-500">{user.userId.slice(0, 8)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-slate-900 border border-slate-800 p-6">
          <div className="flex items-center gap-2"><Activity className="h-5 w-5 text-cyan-400" /><h2 className="font-bold">Authority model</h2></div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-400">
            <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-4"><b className="text-slate-200">ADMIN</b><p className="mt-2">Can access the isolated administration console, platform settings and cross-user visibility.</p></div>
            <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-4"><b className="text-slate-200">USER</b><p className="mt-2">Can use the trading workspace and access only their own positions, orders, risk events, logs and strategy.</p></div>
          </div>
        </section>
      </div>
    </main>
  );
}
