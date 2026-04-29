import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const role = req.cookies.get('role')?.value;
  const { pathname } = req.nextUrl;

  // Proteção de rotas Admin
  if (pathname.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Proteção de rotas Gerente
  if (pathname.startsWith('/gerente') && !['admin', 'gerente'].includes(role || '')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Proteção de rotas Vendedor
  if (pathname.startsWith('/vendedor') && !['admin', 'gerente', 'vendedor'].includes(role || '')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/gerente/:path*', '/vendedor/:path*'],
};
