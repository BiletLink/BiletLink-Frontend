import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const hostname = request.headers.get('host') || '';

    // Handle admin.biletlink.co subdomain
    if (hostname === 'admin.biletlink.co' || hostname === 'www.admin.biletlink.co') {
        const url = request.nextUrl.clone();

        // If not already under /admin path, rewrite to /admin
        if (!url.pathname.startsWith('/admin')) {
            url.pathname = `/admin${url.pathname}`;
            return NextResponse.rewrite(url);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        // Match all paths except static files and api routes
        '/((?!_next/static|_next/image|favicon.ico|logos|api).*)',
    ],
};
