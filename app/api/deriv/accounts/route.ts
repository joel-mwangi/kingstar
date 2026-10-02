import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
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
        endpoint: '/accounts',
        method: 'GET',
        timing: 15
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

    const response = await fetch('https://api.derivws.com/trading/v1/options/accounts', {
      method: 'GET',
      headers: upstreamHeaders
    });

    if (!response.ok) {
      const errorData = await response.text();
      return NextResponse.json({
        errors: [
          {
            status: response.status,
            code: 'UpstreamError',
            message: errorData || 'Failed to fetch options accounts from Deriv'
          }
        ],
        meta: {
          endpoint: '/accounts',
          method: 'GET',
          timing: 45
        }
      }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
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
        endpoint: '/accounts',
        method: 'GET',
        timing: 100
      }
    }, { status: 504 });
  }
}
