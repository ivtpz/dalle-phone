import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';

/**
 * Enusre there's a DB connection
 */
export async function middleware(req: NextRequest, event: NextFetchEvent) {
  await event.waitUntil(fetch(`${req.nextUrl.origin}/api/connect`));
  return NextResponse.next();
}

export const config = {
  matcher: '/((?!api/connect).*)',
};
