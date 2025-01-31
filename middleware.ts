import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const isApiRoute = request.nextUrl.pathname.startsWith('/api');
    const token = request.cookies.get('auth_token');

    if (isApiRoute && !token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/api/:path*'], // Only apply middleware to API routes
};
