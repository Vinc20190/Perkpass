import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect /super-admin routes
  if (!pathname.startsWith('/super-admin')) {
    return NextResponse.next();
  }

  // Extract access token from cookies (supabase-js stores it in sb-<ref>-auth-token)
  const authCookie = req.cookies.getAll().find((c) => c.name.startsWith('sb-') && c.name.includes('auth-token'));

  if (!authCookie?.value) {
    return NextResponse.redirect(new URL('/login?redirect=/super-admin', req.url));
  }

  try {
    // Verify the token by calling the auth user endpoint
    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${authCookie.value}`,
        apikey: anonKey,
      },
    });

    if (!userRes.ok) {
      return NextResponse.redirect(new URL('/login?redirect=/super-admin', req.url));
    }

    const user = await userRes.json();
    if (!user?.email) {
      return NextResponse.redirect(new URL('/login?redirect=/super-admin', req.url));
    }

    // Check super_admins table with service role key (bypasses RLS for the lookup)
    const adminRes = await fetch(
      `${supabaseUrl}/rest/v1/super_admins?email=eq.${encodeURIComponent(user.email)}&is_active=eq.true&select=id`,
      {
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
        },
      }
    );

    const adminRows = await adminRes.json();

    if (!adminRows || adminRows.length === 0) {
      // User is authenticated but NOT a super admin — redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard?error=forbidden', req.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/login?redirect=/super-admin', req.url));
  }
}

export const config = {
  matcher: ['/super-admin/:path*'],
};
