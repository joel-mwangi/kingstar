import { NextRequest, NextResponse } from 'next/server';

const APP_ID = process.env.NEXT_PUBLIC_DERIV_CLIENT_ID || '34yEbiGrjbggKPYwNs9kA';
const DERIV_URL = 'https://api.derivws.com/trading/v1/options/accounts';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('deriv_access_token')?.value;
  const authType = req.cookies.get('deriv_auth_type')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated with Deriv.' }, { status: 401 });
  }

  const headers: Record<string, string> = {
    Authorization: 'Bearer ' + token,
  };

  if (authType === 'pat') {
    headers['Deriv-App-ID'] = APP_ID;
  }

  try {
    const response = await fetch(DERIV_URL, {
      headers,
      cache: 'no-store',
    });
    const data = await response.json();

    if (response.status === 401) {
      const result = NextResponse.json(data, { status: 401 });
      result.cookies.set('deriv_access_token', '', { httpOnly: true, expires: new Date(0), path: '/' });
      result.cookies.set('deriv_auth_type', '', { httpOnly: true, expires: new Date(0), path: '/' });
      return result;
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Deriv account lookup failed.' },
      { status: 502 }
    );
  }
}
