import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = [
  '/new/project',
  '/projects/:path*',
  '/projects/:path*/deployments/:path*',
  '/projects/:path*/deployments/:path*/logs',
  '/projects/:path*/deployments/:path*/logs/stream',
  '/projects/:path*/deployments/:path*/logs/stream/sse',
  '/projects/:path*/deployments/:path*/logs/stream/sse/stream',
  '/projects/:path*/deployments/:path*/logs/stream/sse/stream/stream',
  '/projects/:path*/deployments/:path*/logs/stream/sse/stream/stream/stream',
];

// This function can be marked `async` if using `await` inside
export function proxy(request: NextRequest) {
  if (protectedRoutes.includes(request.nextUrl.pathname)) {
    const cookieHeader = request.headers.get('cookie') ?? '';
    const token = cookieHeader
      .split(';')
      .map((c) => {
        const idx = c.indexOf('=');
        return idx === -1 ? [c.trim(), ''] : [c.slice(0, idx).trim(), c.slice(idx + 1)];
      })
      .find(([name]) => name === 'renderLite-access')?.[1];
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }
  return NextResponse.next();
}
