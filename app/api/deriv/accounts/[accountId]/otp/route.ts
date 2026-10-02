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
        endpoint: `/accounts/${accountId}/otp`,
        method: 'POST',
        timing: 45
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

    const response = await fetch(`https://api.derivws.com/trading/v1/options/accounts/${accountId}/otp`, {
      method: 'POST',
      headers: upstreamHeaders
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (err: any) {
    return NextResponse.json({
      errors: [
        {
          status: 500,
          code: 'InternalServerError',
          message: err.message || 'Failed to generate OTP'
        }
      ],
      meta: {
        endpoint: `/accounts/${accountId}/otp`,
        method: 'POST',
        timing: 234
      }
    }, { status: 500 });
  }
}
