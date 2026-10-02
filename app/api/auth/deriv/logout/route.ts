import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });

  response.cookies.set('deriv_access_token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });
  response.cookies.set('deriv_auth_type', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });

  return response;
}
