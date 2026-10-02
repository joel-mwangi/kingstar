import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
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
        method: 'POST',
        timing: 12
      }
    }, { status: 401 });
  }

  try {
    const body = await req.json();

    if (!body.currency || !body.group || !body.account_type) {
      return NextResponse.json({
        errors: [
          {
            status: 400,
            code: 'FieldIsRequired',
            message: 'currency, group, and account_type fields are required'
          }
        ],
        meta: {
          endpoint: '/accounts',
          method: 'POST',
          timing: 23
        }
      }, { status: 400 });
    }

    const upstreamHeaders: Record<string, string> = {
      'Authorization': authHeader,
      'Content-Type': 'application/json'
    };

    if (appIdHeader) {
      upstreamHeaders['Deriv-App-ID'] = appIdHeader;
    }

    const response = await fetch('https://api.derivws.com/trading/v1/options/accounts', {
      method: 'POST',
      headers: upstreamHeaders,
      body: JSON.stringify(body)
    });

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
        endpoint: '/accounts',
        method: 'POST',
        timing: 67
      }
    }, { status: 504 });
  }
}
