/**
 * Deriv OAuth 2.0 PKCE Flow Utility
 * Compliant with official Deriv OAuth 2.0 specifications:
 * - Authorization endpoint: https://auth.deriv.com/oauth2/auth
 * - Token endpoint: https://auth.deriv.com/oauth2/token
 */

export const DERIV_OAUTH_CONFIG = {
  clientId: '34yEbiGrjbggKPYwNs9kA',
  authEndpoint: 'https://auth.deriv.com/oauth2/auth',
  tokenEndpoint: 'https://auth.deriv.com/oauth2/token',
  scopes: ['trade', 'account_manage', 'payment', 'application_read']
};

export async function initiateDerivLogin(isSignUp = false) {
  if (typeof window === 'undefined') return;

  // 1. Generate a random code_verifier (43-128 chars)
  const array = crypto.getRandomValues(new Uint8Array(64));
  const codeVerifier = Array.from(array)
    .map(v => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'[v % 66])
    .join('');

  // 2. Derive the code_challenge
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(codeVerifier));
  const codeChallenge = btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  // 3. Generate a random state for CSRF protection
  const state = crypto.getRandomValues(new Uint8Array(16))
    .reduce((s, b) => s + b.toString(16).padStart(2, '0'), '');

  // 4. Store code_verifier and state in sessionStorage
  sessionStorage.setItem('pkce_code_verifier', codeVerifier);
  sessionStorage.setItem('oauth_state', state);

  const redirectUri = window.location.origin + window.location.pathname;
  const scopeStr = DERIV_OAUTH_CONFIG.scopes.join('+');

  let authUrl = `${DERIV_OAUTH_CONFIG.authEndpoint}?response_type=code&client_id=${DERIV_OAUTH_CONFIG.clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopeStr}&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256`;

  if (isSignUp) {
    authUrl += `&prompt=registration`;
  }

  window.location.href = authUrl;
}

export function verifyAndHandleOAuthReturn() {
  if (typeof window === 'undefined') return null;

  const urlParams = new URLSearchParams(window.location.search || window.location.hash.replace('#', '?'));
  const code = urlParams.get('code');
  const returnedState = urlParams.get('state');
  const error = urlParams.get('error');
  const errorDescription = urlParams.get('error_description');

  if (error) {
    console.error('Deriv OAuth Error:', error, errorDescription);
    return { error: errorDescription || error };
  }

  const storedState = sessionStorage.getItem('oauth_state');
  if (code && returnedState) {
    if (returnedState !== storedState) {
      console.error('Deriv OAuth State mismatch (CSRF warning)');
      return { error: 'State mismatch error' };
    }
    sessionStorage.removeItem('oauth_state');
    return { code, codeVerifier: sessionStorage.getItem('pkce_code_verifier') };
  }

  return null;
}
