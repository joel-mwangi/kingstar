'use client';

import React, { useState } from 'react';
import { LockKeyhole, ShieldCheck } from 'lucide-react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { isAdmin } from '@/lib/admin';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const allowed = await isAdmin(credential.user.uid);

      if (!allowed) {
        await signOut(auth);
        throw new Error('This account is not registered as an administrator.');
      }

      window.location.replace('/admin');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Administrator sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 grid place-items-center p-6">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-5">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-rose-500/10 border border-rose-500/20 grid place-items-center">
            <ShieldCheck className="h-5 w-5 text-rose-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Kingstar Admin</h1>
            <p className="text-xs text-slate-400">Administrator accounts only</p>
          </div>
        </div>

        <label className="block text-xs text-slate-300">
          Admin email
          <input type="email" required autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-sm text-slate-100" />
        </label>

        <label className="block text-xs text-slate-300">
          Password
          <input type="password" required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-sm text-slate-100" />
        </label>

        {message && <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-300">{message}</div>}

        <button disabled={loading} className="w-full rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 px-4 py-2.5 text-sm font-semibold flex items-center justify-center gap-2">
          <LockKeyhole className="h-4 w-4" /> {loading ? 'Signing in...' : 'Sign in as admin'}
        </button>
      </form>
    </main>
  );
}
