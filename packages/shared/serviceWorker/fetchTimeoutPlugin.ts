import type { WorkboxPlugin } from 'workbox-core';

export const FETCH_TIMEOUT_MS = 10_000;

// A worker that has called skipWaiting() still can't activate while the
// current worker has a fetch in flight, including a background revalidation
// whose response has already been served from cache. On a stalled connection
// that leaves the update waiting indefinitely, so every network fetch gets a
// deadline.
export const fetchTimeoutPlugin: WorkboxPlugin = {
  requestWillFetch: async ({ request }) =>
    new Request(request, {
      signal: AbortSignal.any([
        request.signal,
        AbortSignal.timeout(FETCH_TIMEOUT_MS),
      ]),
    }),
};
