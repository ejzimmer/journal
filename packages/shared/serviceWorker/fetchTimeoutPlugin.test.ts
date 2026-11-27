import { FETCH_TIMEOUT_MS, fetchTimeoutPlugin } from './fetchTimeoutPlugin';

function prepareRequest(request: Request) {
  return fetchTimeoutPlugin.requestWillFetch!({
    request,
    event: new Event('fetch') as ExtendableEvent,
    state: {},
  });
}

describe('fetchTimeoutPlugin', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('passes the request through unchanged', async () => {
    const request = await prepareRequest(
      new Request('https://example.com/image.png', {
        headers: { Accept: 'image/png' },
      }),
    );

    expect(request.url).toBe('https://example.com/image.png');
    expect(request.headers.get('Accept')).toBe('image/png');
  });

  describe('when the fetch is still running', () => {
    it('aborts it once the timeout passes', async () => {
      const request = await prepareRequest(
        new Request('https://example.com/image.png'),
      );

      jest.advanceTimersByTime(FETCH_TIMEOUT_MS - 1);
      expect(request.signal.aborted).toBe(false);

      jest.advanceTimersByTime(1);
      expect(request.signal.aborted).toBe(true);
    });
  });

  describe('when the original request is aborted', () => {
    it('aborts the fetch too', async () => {
      const controller = new AbortController();
      const request = await prepareRequest(
        new Request('https://example.com/image.png', {
          signal: controller.signal,
        }),
      );

      controller.abort();

      expect(request.signal.aborted).toBe(true);
    });
  });
});
