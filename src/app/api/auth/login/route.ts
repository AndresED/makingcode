import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

function normalizeEmail(raw: unknown): string {
  return String(raw ?? '')
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/\u200b/g, '');
}

function devDebug(extra?: Record<string, unknown>) {
  if (process.env.NODE_ENV !== 'development') return undefined;
  return {
    authKeyType: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.startsWith('eyJ')
      ? 'anon'
      : 'publishable',
    ...extra,
  };
}

async function requestSupabaseToken(email: string, password: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    return { ok: false as const, status: 500, msg: 'Supabase env missing' };
  }

  const res = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      apikey: key,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
    cache: 'no-store',
  });

  const body = (await res.json()) as {
    access_token?: string;
    refresh_token?: string;
    msg?: string;
    error_code?: string;
  };

  if (!res.ok || !body.access_token || !body.refresh_token) {
    return {
      ok: false as const,
      status: res.status,
      msg: body.msg ?? body.error_code ?? 'auth failed',
    };
  }

  return {
    ok: true as const,
    access_token: body.access_token,
    refresh_token: body.refresh_token,
  };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const email = normalizeEmail(
    typeof body === 'object' && body && 'email' in body ? body.email : '',
  );
  const password =
    typeof body === 'object' && body && 'password' in body
      ? String(body.password).trim()
      : '';

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email and password are required' },
      { status: 400 },
    );
  }

  const token = await requestSupabaseToken(email, password);

  if (!token.ok) {
    return NextResponse.json(
      {
        error: 'Invalid email or password',
        ...devDebug({
          supabaseStatus: token.status,
          supabaseMsg: token.msg,
        }),
      },
      { status: 401 },
    );
  }

  const supabase = await createClient();
  const { error: sessionError } = await supabase.auth.setSession({
    access_token: token.access_token,
    refresh_token: token.refresh_token,
  });

  if (sessionError) {
    return NextResponse.json({ error: 'Could not start session' }, { status: 500 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Could not read session' }, { status: 500 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.role !== 'admin') {
    await supabase.auth.signOut();
    return NextResponse.json(
      { error: 'This account is not authorized' },
      { status: 403 },
    );
  }

  return NextResponse.json({ ok: true });
}
