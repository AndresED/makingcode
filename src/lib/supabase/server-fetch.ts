import { Agent, fetch as undiciFetch } from 'undici';

const agent = new Agent({
  connectTimeout: 15_000,
  keepAliveTimeout: 30_000,
  keepAliveMaxTimeout: 30_000,
});

/** Node fetch with explicit dispatcher — fixes intermittent `fetch failed` on Windows dev. */
export function supabaseServerFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  return undiciFetch(input, {
    ...init,
    dispatcher: agent,
  } as Parameters<typeof undiciFetch>[1]);
}
