import { register } from './serviceWorkerRegistration';

function stubServiceWorker({
  waiting,
  controller,
}: {
  waiting: object | null;
  controller: object | null;
}) {
  const registration = { waiting } as unknown as ServiceWorkerRegistration;
  Object.defineProperty(navigator, 'serviceWorker', {
    configurable: true,
    value: {
      controller,
      ready: new Promise(() => {}),
      register: jest.fn().mockResolvedValue(registration),
    },
  });
  return registration;
}

async function registerOnLoad(onUpdate: jest.Mock) {
  register({ onUpdate });
  window.dispatchEvent(new Event('load'));
  await new Promise((resolve) => setTimeout(resolve));
}

describe('register', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, NODE_ENV: 'production', PUBLIC_URL: '' };
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      headers: new Headers({ 'content-type': 'application/javascript' }),
    });
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('when a new version was already waiting before the page loaded', () => {
    it('reports the update', async () => {
      const registration = stubServiceWorker({
        waiting: {},
        controller: {},
      });
      const onUpdate = jest.fn();

      await registerOnLoad(onUpdate);

      expect(onUpdate).toHaveBeenCalledWith(registration);
    });
  });
});
