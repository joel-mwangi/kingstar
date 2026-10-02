import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  const { accountId } = await params;
  const authHeader = req.headers.get('authorization');
  const appIdHeader = req.headers.get('deriv-app-id');

  if (!authHeader) {
    return NextResponse.json({
      errors: [
        {
          status: 401,
          code: 'Unauthorized',
          message: 'Invalid or missing authentication credentials'
        }
      ],
      meta: {
        endpoint: `/accounts/${accountId}/reset-demo-balance`,
        method: 'POST',
        timing: 12
      }
    }, { status: 401 });
  }

  try {
    const upstreamHeaders: Record<string, string> = {
      'Authorization': authHeader,
      'Content-Type': 'application/json'
    };

    if (appIdHeader) {
      upstreamHeaders['Deriv-App-ID'] = appIdHeader;
    }

    const response = await fetch(`https://api.derivws.com/trading/v1/options/accounts/${accountId}/reset-demo-balance`, {
      method: 'POST',
      headers: upstreamHeaders
    });

    if (response.status === 200) {
      return new NextResponse(null, { status: 200 });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (err: any) {
    return NextResponse.json({
      errors: [
        {
          status: 504,
          code: 'GatewayTimeout',
          message: err.message || 'Upstream service timeout'
        }
      ],
      meta: {
        endpoint: `/accounts/${accountId}/reset-demo-balance`,
        method: 'POST',
        timing: 67
      }
    }, { status: 504 });
  }
}
