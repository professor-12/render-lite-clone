import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  const loginUrl = new URL('/auth/login', request.nextUrl.origin);
  if (error) {
    loginUrl.searchParams.set('error', error);
    return NextResponse.redirect(loginUrl);
  }

  if (!code) {
    loginUrl.searchParams.set('error', 'missing_code');
    return NextResponse.redirect(loginUrl);
  }

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) {
    console.error('[GithubCallback] BACKEND_URL environment variable is not set');
    loginUrl.searchParams.set('error', 'server_misconfiguration');
    return NextResponse.redirect(loginUrl);
  }

  let response: Response;
  try {
    const qs = new URLSearchParams({ code });
    response = await fetch(`${backendUrl}/api/v1/auth/github/callback?${qs}`, {
      method: 'GET',
      cache: 'no-store',
    });
  } catch (err) {
    console.error('[GithubCallback] Failed to reach auth backend:', err);
    loginUrl.searchParams.set('error', 'server_unreachable');
    return NextResponse.redirect(loginUrl);
  }

  if (!response.ok) {
    let errorCode = 'oauth_failed';
    try {
      const body = await response.json();
      if (body?.error) errorCode = body.error;
    } catch {
      // ignore parse errors — fall back to generic error code
    }
    console.error(`[GithubCallback] Backend returned ${response.status}: ${errorCode}`);
    loginUrl.searchParams.set('error', errorCode);
    return NextResponse.redirect(loginUrl);
  }
  const successUrl = new URL('/?auth_status=success', request.nextUrl.origin);
  const redirectResponse = NextResponse.redirect(successUrl);

  const setCookieHeaders = response.headers.getSetCookie();
  for (const cookie of setCookieHeaders) {
    redirectResponse.headers.append('Set-Cookie', cookie);
  }

  return redirectResponse;
}
