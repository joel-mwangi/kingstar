import { NextRequest, NextResponse } from 'next/server';

const APP_ID = process.env.NEXT_PUBLIC_DERIV_CLIENT_ID || '34yEbiGrjbggKPYwNs9kA';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  const { accountId } = await params;
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
    const response = await fetch(
      'https://api.derivws.com/trading/v1/options/accounts/' +
        encodeURIComponent(accountId) +
        '/reset-demo-balance',
      {
        method: 'POST',
        headers,
        cache: 'no-store',
      }
    );

    if (response.status === 200) {
      return new NextResponse(null, { status: 200 });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to reset demo balance.' },
      { status: 502 }
    );
  }
}
