import 'fake-indexeddb/auto';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FirebaseContext } from '../../../shared/FirebaseContext';
import { createMockFirebaseContext } from '../../../shared/mockFirebase';
import { API_KEY_PATH, WaniKani } from '.';
import { clearCachedCollections } from './collectionCache';

const subjects = [
  { id: 1, object: 'radical', data: { level: 1, hidden_at: null } },
  { id: 2, object: 'kanji', data: { level: 1, hidden_at: null } },
  { id: 3, object: 'kana_vocabulary', data: { level: 1, hidden_at: null } },
  { id: 4, object: 'radical', data: { level: 2, hidden_at: null } },
  { id: 5, object: 'kanji', data: { level: 2, hidden_at: null } },
  { id: 6, object: 'kanji', data: { level: 2, hidden_at: null } },
  { id: 7, object: 'kanji', data: { level: 2, hidden_at: '2025-01-01' } },
];

const assignments = [
  { id: 11, object: 'assignment', data: createAssignment(1, 9, true) },
  { id: 12, object: 'assignment', data: createAssignment(2, 9, true) },
  { id: 13, object: 'assignment', data: createAssignment(3, 6, true) },
  { id: 14, object: 'assignment', data: createAssignment(4, 5, true) },
  { id: 15, object: 'assignment', data: createAssignment(5, 3, false) },
];

const levelProgressions = [
  {
    id: 21,
    object: 'level_progression',
    data: {
      level: 1,
      unlocked_at: '2026-09-01T00:00:00Z',
      passed_at: '2026-09-11T00:00:00Z',
      abandoned_at: null,
    },
  },
  {
    id: 22,
    object: 'level_progression',
    data: {
      level: 2,
      unlocked_at: '2026-09-11T00:00:00Z',
      passed_at: null,
      abandoned_at: null,
    },
  },
];

function createAssignment(
  subjectId: number,
  srsStage: number,
  isPassed: boolean,
) {
  return {
    subject_id: subjectId,
    srs_stage: srsStage,
    passed_at: isPassed ? '2026-01-01T00:00:00Z' : null,
    hidden: false,
  };
}

function createCollection(data: unknown[]) {
  return {
    data_updated_at: '2026-09-01T00:00:00Z',
    pages: { next_url: null },
    data,
  };
}

function respondWith(body: unknown, status = 200) {
  return Promise.resolve({
    ok: status < 400,
    status,
    json: () => Promise.resolve(body),
  } as Response);
}

const fetchMock = jest.fn();

function mockWaniKani() {
  fetchMock.mockImplementation((url: string) => {
    const { pathname } = new URL(url);
    if (pathname === '/v2/user') return respondWith({ data: { level: 2 } });
    if (pathname === '/v2/subjects')
      return respondWith(createCollection(subjects));
    if (pathname === '/v2/assignments')
      return respondWith(createCollection(assignments));
    if (pathname === '/v2/level_progressions')
      return respondWith(createCollection(levelProgressions));
    return respondWith({}, 404);
  });
}

function getRequestedUrls() {
  return fetchMock.mock.calls.map(([url]) => url as string);
}

function renderWaniKani(storedApiKey?: string) {
  const storage = createMockFirebaseContext(
    storedApiKey ? { wanikani: { apiKey: storedApiKey } } : {},
  );
  const setValue = jest.spyOn(storage, 'setValue');
  const view = render(
    <FirebaseContext.Provider value={storage}>
      <WaniKani />
    </FirebaseContext.Provider>,
  );
  return { ...view, setValue };
}

beforeEach(async () => {
  global.fetch = fetchMock;
  await clearCachedCollections();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('WaniKani', () => {
  describe('with no API key saved', () => {
    it('loads progress with the key that gets entered', async () => {
      mockWaniKani();
      const user = userEvent.setup();
      renderWaniKani();

      await user.type(screen.getByLabelText('WaniKani API key'), 'my-key');
      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(
        await screen.findByRole('region', { name: 'Level 2' }),
      ).toBeInTheDocument();
      expect(fetchMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer my-key',
          }),
        }),
      );
    });

    it('remembers the key', async () => {
      mockWaniKani();
      const user = userEvent.setup();
      const { setValue } = renderWaniKani();

      await user.type(screen.getByLabelText('WaniKani API key'), 'my-key');
      await user.click(screen.getByRole('button', { name: 'Save' }));
      await screen.findByRole('region', { name: 'Level 2' });

      expect(setValue).toHaveBeenCalledWith(API_KEY_PATH, 'my-key');
    });
  });

  describe('with an API key saved', () => {
    beforeEach(() => {
      mockWaniKani();
    });

    it('shows progress through the current level', async () => {
      renderWaniKani('my-key');

      const level = await screen.findByRole('region', { name: 'Level 2' });
      expect(
        within(level).getByRole('img', {
          name: 'Radicals 1 of 1, Kanji 0 of 2',
        }),
      ).toBeInTheDocument();
    });

    it('predicts how long until level 60 is finished', async () => {
      jest.useFakeTimers({
        now: new Date('2026-09-15T00:00:00Z'),
        doNotFake: ['setTimeout', 'setInterval', 'queueMicrotask'],
      });
      renderWaniKani('my-key');

      const level = await screen.findByRole('region', { name: 'Level 2' });
      expect(
        within(level).getByRole('img', { name: 'Days remaining' }),
      ).toBeInTheDocument();
      expect(level).toHaveTextContent('586');
    });

    it('shows how many of each type are at each SRS stage', async () => {
      renderWaniKani('my-key');

      expect(
        await screen.findByRole('img', {
          name: 'Kanji: 1 apprentice, 0 guru, 0 master, 0 enlightened, 1 burned of 3',
        }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('img', {
          name: 'Vocabulary: 0 apprentice, 1 guru, 0 master, 0 enlightened, 0 burned of 1',
        }),
      ).toBeInTheDocument();
    });

    it('shows the percent of each type unlocked at each level', async () => {
      renderWaniKani('my-key');

      expect(
        await screen.findByRole('img', {
          name: 'Level 2: Radicals 100% unlocked, Kanji 50% unlocked, Vocabulary 0% unlocked',
        }),
      ).toBeInTheDocument();
    });

    it('shows every level up to 60', async () => {
      renderWaniKani('my-key');

      expect(
        await screen.findByRole('img', {
          name: 'Level 60: Radicals 0% unlocked, Kanji 0% unlocked, Vocabulary 0% unlocked',
        }),
      ).toBeInTheDocument();
    });

    describe('when progress has been loaded before', () => {
      it('only asks WaniKani for what changed since then', async () => {
        const { unmount } = renderWaniKani('my-key');
        await screen.findByRole('region', { name: 'Level 2' });
        unmount();
        fetchMock.mockClear();

        renderWaniKani('my-key');
        await screen.findByRole('region', { name: 'Level 2' });

        expect(getRequestedUrls()).toContain(
          'https://api.wanikani.com/v2/subjects?updated_after=2026-09-01T00%3A00%3A00Z',
        );
      });
    });
  });

  describe('when WaniKani rejects the saved API key', () => {
    beforeEach(() => {
      fetchMock.mockImplementation(() => respondWith({}, 401));
    });

    it('asks for a new key', async () => {
      renderWaniKani('old-key');

      expect(
        await screen.findByLabelText('WaniKani API key'),
      ).toBeInTheDocument();
    });
  });
});
