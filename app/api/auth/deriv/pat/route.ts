import { NextRequest, NextResponse } from 'next/server';

const APP_ID = process.env.NEXT_PUBLIC_DERIV_CLIENT_ID || '34yEbiGrjbggKPYwNs9kA';
const DERIV_URL = 'https://api.derivws.com/trading/v1/options/accounts';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = typeof body?.token === 'string' ? body.token.trim() : '';

    if (!token || token.length < 12 || token.length > 4096) {
      return NextResponse.json({ error: 'A valid Deriv PAT is required.' }, { status: 400 });
    }

    const response = await fetch(DERIV_URL, {
      headers: {
        Authorization: 'Bearer ' + token,
        'Deriv-App-ID': APP_ID,
      },
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    const result = NextResponse.json(data);
    result.cookies.set('deriv_access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60,
    });
    result.cookies.set('deriv_auth_type', 'pat', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60,
    });
    return result;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'PAT authentication failed.' },
      { status: 500 }
    );
  }
}
