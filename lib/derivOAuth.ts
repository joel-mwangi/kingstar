const DERIV_CLIENT_ID =
  process.env.NEXT_PUBLIC_DERIV_CLIENT_ID || '34yEbiGrjbggKPYwNs9kA';

export const DERIV_OAUTH_CONFIG = {
  clientId: DERIV_CLIENT_ID,
  authEndpoint: 'https://auth.deriv.com/oauth2/auth',
  scopes: ['trade', 'account_manage', 'payment', 'application_read'],
};

function randomBase64Url(bytes = 64): string {
  const data = new Uint8Array(bytes);
  crypto.getRandomValues(data);
  return btoa(String.fromCharCode(...data))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export async function initiateDerivLogin(isSignUp = false): Promise<void> {
  if (typeof window === 'undefined') return;

  const codeVerifier = randomBase64Url(64);
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(codeVerifier)
  );
  const codeChallenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  const state = randomBase64Url(32);

  sessionStorage.setItem('pkce_code_verifier', codeVerifier);
  sessionStorage.setItem('oauth_state', state);

  const redirectUri = window.location.origin + '/auth/deriv/callback';
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: DERIV_OAUTH_CONFIG.clientId,
    redirect_uri: redirectUri,
    scope: DERIV_OAUTH_CONFIG.scopes.join(' '),
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  if (isSignUp) params.set('prompt', 'registration');

  window.location.assign(
    DERIV_OAUTH_CONFIG.authEndpoint + '?' + params.toString()
  );
}

export function verifyOAuthCallback(): {
  code?: string;
  codeVerifier?: string;
  error?: string;
} | null {
  if (typeof window === 'undefined') return null;

  const params = new URLSearchParams(window.location.search);
  const error = params.get('error');
  const errorDescription = params.get('error_description');

  if (error) {
    sessionStorage.removeItem('oauth_state');
    sessionStorage.removeItem('pkce_code_verifier');
    return { error: errorDescription || error };
  }

  const code = params.get('code');
  const returnedState = params.get('state');
  const storedState = sessionStorage.getItem('oauth_state');
  const codeVerifier = sessionStorage.getItem('pkce_code_verifier');

  if (!code || !returnedState || !storedState || !codeVerifier) {
    return { error: 'Incomplete OAuth callback.' };
  }

  if (returnedState !== storedState) {
    sessionStorage.removeItem('oauth_state');
    sessionStorage.removeItem('pkce_code_verifier');
    return { error: 'OAuth state validation failed.' };
  }

  return { code, codeVerifier };
}
