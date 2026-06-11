import { Agent, fetch as undiciFetch } from 'undici';

const agent = new Agent({
  connectTimeout: 15_000,
  keepAliveTimeout: 30_000,
  keepAliveMaxTimeout: 30_000,
});

/** Node fetch with explicit dispatcher — fixes intermittent `fetch failed` on Windows dev. */
export const supabaseServerFetch: typeof fetch = (input, init) =>
  undiciFetch(input as never, {
    ...init,
    dispatcher: agent,
  } as never) as unknown as ReturnType<typeof fetch>;
