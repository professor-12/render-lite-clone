import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  const loginUrl = new URL('/auth/login', request.nextUrl.origin);
  if (error) {
    loginUrl.searchParams.set('error', error);
    return new NextResponse(
      `
      <script>
        window.opener.postMessage(
          { type: "oauth_error", error: "${error || 'missing_code'}" },
          window.location.origin
        );
        window.close();
      </script>
      `,
      { headers: { 'Content-Type': 'text/html' } },
    );
  }

  if (!code) {
    loginUrl.searchParams.set('error', 'missing_code');
    return new NextResponse(
      `
      <script>
        window.opener.postMessage(
          { type: "oauth_error", error: "${'missing_code'}" },
          window.location.origin
        );
        window.close();
      </script>
      `,
      { headers: { 'Content-Type': 'text/html' } },
    );
  }

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL!;
  if (!backendUrl) {
    console.error('[GithubCallback] BACKEND_URL environment variable is not set');
    loginUrl.searchParams.set('error', 'server_misconfiguration');
    return new NextResponse(
      `
      <script>
        window.opener.postMessage(
          { type: "oauth_error", error: "${error || 'server_misconfiguration'}" },
          window.location.origin
        );
        window.close();
      </script>
      `,
      { headers: { 'Content-Type': 'text/html' } },
    );
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
    return new NextResponse(
      `
      <script>
        window.opener.postMessage(
          { type: "oauth_error", error: "${error || 'server_unreachable'}" },
          window.location.origin
        );
        window.close();
      </script>
      `,
      { headers: { 'Content-Type': 'text/html' } },
    );
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
    return new NextResponse(
      `
      <script>
        window.opener.postMessage(
          { type: "oauth_error", error: "${errorCode || 'missing_code'}" },
          window.location.origin
        );
        window.close();
      </script>
      `,
      { headers: { 'Content-Type': 'text/html' } },
    );
  }
  const successUrl = new URL('/?auth_status=success', request.nextUrl.origin);
  const redirectResponse = NextResponse.redirect(successUrl);

  const setCookieHeaders = response.headers.getSetCookie();
  const html = `
    <script>
      window.opener.postMessage(
        { type: "oauth_success" },
        window.location.origin
      );
      window.close();
    </script>
  `;

  const res = new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' },
  });

  for (const cookie of setCookieHeaders) {
    res.headers.append('Set-Cookie', cookie);
  }

  return res;
}
