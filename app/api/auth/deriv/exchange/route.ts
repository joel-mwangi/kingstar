import { NextRequest, NextResponse } from 'next/server';

const CLIENT_ID = process.env.NEXT_PUBLIC_DERIV_CLIENT_ID || '34yEbiGrjbggKPYwNs9kA';
const TOKEN_ENDPOINT = 'https://auth.deriv.com/oauth2/token';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const code = typeof body?.code === 'string' ? body.code : '';
    const codeVerifier = typeof body?.codeVerifier === 'string' ? body.codeVerifier : '';

    if (!code || !codeVerifier) {
      return NextResponse.json({ error: 'OAuth code and verifier are required.' }, { status: 400 });
    }

    const expectedRedirectUri = new URL('/auth/deriv/callback', req.url).toString();
    const suppliedRedirectUri =
      typeof body?.redirectUri === 'string' ? body.redirectUri : expectedRedirectUri;

    if (suppliedRedirectUri !== expectedRedirectUri) {
      return NextResponse.json({ error: 'Invalid redirect URI.' }, { status: 400 });
    }

    const form = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      code,
      code_verifier: codeVerifier,
      redirect_uri: expectedRedirectUri,
    });

    const upstream = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
      cache: 'no-store',
    });

    const data = await upstream.json();

    if (!upstream.ok || !data?.access_token) {
      return NextResponse.json(
        { error: data?.error_description || data?.error || 'Token exchange failed.' },
        { status: upstream.status || 502 }
      );
    }

    const response = NextResponse.json({
      success: true,
      expiresIn: Number(data.expires_in || 3600),
    });

    response.cookies.set('deriv_access_token', data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: Number(data.expires_in || 3600),
    });
    response.cookies.set('deriv_auth_type', 'oauth', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: Number(data.expires_in || 3600),
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Token exchange failed.' },
      { status: 500 }
    );
  }
}
