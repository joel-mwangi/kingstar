'use client';

import { useEffect, useState } from 'react';
import { verifyOAuthCallback } from '@/lib/derivOAuth';

export default function DerivOAuthCallbackPage() {
  const [message, setMessage] = useState('Completing secure Deriv sign-in...');

  useEffect(() => {
    const run = async () => {
      const callback = verifyOAuthCallback();

      if (!callback || callback.error) {
        setMessage(callback?.error || 'OAuth callback was incomplete.');
        return;
      }

      try {
        const response = await fetch('/api/auth/deriv/exchange', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: callback.code,
            codeVerifier: callback.codeVerifier,
            redirectUri: window.location.origin + '/auth/deriv/callback',
          }),
        });

        const data = await response.json();
        sessionStorage.removeItem('oauth_state');
        sessionStorage.removeItem('pkce_code_verifier');

        if (!response.ok) {
          setMessage(data?.error || 'Deriv sign-in failed.');
          return;
        }

        window.location.replace('/');
      } catch (error) {
        sessionStorage.removeItem('oauth_state');
        sessionStorage.removeItem('pkce_code_verifier');
        setMessage(error instanceof Error ? error.message : 'Deriv sign-in failed.');
      }
    };

    void run();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 grid place-items-center p-6">
      <div className="max-w-md w-full rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center">
        <div className="mx-auto mb-4 h-10 w-10 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
        <h1 className="text-lg font-semibold">Deriv authentication</h1>
        <p className="mt-2 text-sm text-slate-400">{message}</p>
      </div>
    </main>
  );
}
