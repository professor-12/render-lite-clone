import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const installationId = searchParams.get('installation_id') ?? searchParams.get('installationId');
  const code = searchParams.get('code');

  if (!BACKEND_URL) {
    return NextResponse.json({ success: false, error: 'Server misconfiguration' }, { status: 500 });
  }

  if (!installationId) {
    console.error('Installation ID and code are required');
    return NextResponse.json(
      { success: false, error: 'Installation ID and code are required' },
      { status: 400 },
    );
  }
  const cookieHeader = request.headers.get('cookie') ?? '';
  const token = cookieHeader
    .split(';')
    .map((c) => {
      const idx = c.indexOf('=');
      return idx === -1 ? [c.trim(), ''] : [c.slice(0, idx).trim(), c.slice(idx + 1)];
    })
    .find(([name]) => name === 'renderLite-access')?.[1];

  if (!token) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const res = await fetch(
      `${BACKEND_URL}/api/v1/github/install?installation_id=${encodeURIComponent(installationId)}&code=${encodeURIComponent(code ?? '')}`,
      {
        method: 'GET',
        cache: 'no-store',
        headers: {
          Cookie: `renderLite-access=${token}`,
          Accept: 'application/json',
        },
      },
    );

    const body = await res.json().catch(() => ({}));
    const data = body as { message?: string; installationId?: string; account?: string };

    if (!res.ok) {
      const error = data.message ?? 'Failed to install GitHub app';
      return NextResponse.json({ success: false, error }, { status: res.status });
    }

    return NextResponse.json({
      success: true,
      message: data.message,
      installationId: data.installationId,
      account: data.account,
    });
  } catch (err) {
    console.error('[GitHub install] Backend request failed:', err);
    return NextResponse.json({ success: false, error: 'Failed to reach server' }, { status: 502 });
  }
}
