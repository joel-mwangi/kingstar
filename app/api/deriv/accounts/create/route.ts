import { NextRequest, NextResponse } from 'next/server';

const APP_ID = process.env.NEXT_PUBLIC_DERIV_CLIENT_ID || '34yEbiGrjbggKPYwNs9kA';
const DERIV_URL = 'https://api.derivws.com/trading/v1/options/accounts';

export async function POST(req: NextRequest) {
  const token = req.cookies.get('deriv_access_token')?.value;
  const authType = req.cookies.get('deriv_auth_type')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated with Deriv.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.currency || !body?.group || !body?.account_type) {
    return NextResponse.json(
      { error: 'currency, group, and account_type are required.' },
      { status: 400 }
    );
  }

  const headers: Record<string, string> = {
    Authorization: 'Bearer ' + token,
    'Content-Type': 'application/json',
  };

  if (authType === 'pat') {
    headers['Deriv-App-ID'] = APP_ID;
  }

  try {
    const response = await fetch(DERIV_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Deriv account creation failed.' },
      { status: 502 }
    );
  }
}
