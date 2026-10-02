import 'fake-indexeddb/auto';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WaniKani } from '.';
import { clearCachedCollections } from './collectionCache';

const API_KEY_STORAGE_KEY = 'wanikaniApiKey';

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
  { id: 11, object: 'assignment', data: assignment(1, 9, true) },
  { id: 12, object: 'assignment', data: assignment(2, 9, true) },
  { id: 13, object: 'assignment', data: assignment(3, 6, true) },
  { id: 14, object: 'assignment', data: assignment(4, 5, true) },
  { id: 15, object: 'assignment', data: assignment(5, 3, false) },
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

function assignment(subjectId: number, srsStage: number, isPassed: boolean) {
  return {
    subject_id: subjectId,
    srs_stage: srsStage,
    passed_at: isPassed ? '2026-01-01T00:00:00Z' : null,
    hidden: false,
  };
}

function collection(data: unknown[]) {
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
    if (pathname === '/v2/subjects') return respondWith(collection(subjects));
    if (pathname === '/v2/assignments')
      return respondWith(collection(assignments));
    if (pathname === '/v2/level_progressions')
      return respondWith(collection(levelProgressions));
    return respondWith({}, 404);
  });
}

function getRequestedUrls() {
  return fetchMock.mock.calls.map(([url]) => url as string);
}

beforeEach(async () => {
  global.fetch = fetchMock;
  localStorage.clear();
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
      render(<WaniKani />);

      await user.type(screen.getByLabelText('WaniKani API key'), 'my-key');
      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(
        await screen.findByRole('heading', { name: 'Level 2' }),
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
      render(<WaniKani />);

      await user.type(screen.getByLabelText('WaniKani API key'), 'my-key');
      await user.click(screen.getByRole('button', { name: 'Save' }));
      await screen.findByRole('heading', { name: 'Level 2' });

      expect(localStorage.getItem(API_KEY_STORAGE_KEY)).toBe('my-key');
    });
  });

  describe('with an API key saved', () => {
    beforeEach(() => {
      localStorage.setItem(API_KEY_STORAGE_KEY, 'my-key');
      mockWaniKani();
    });

    it('shows progress through the current level', async () => {
      render(<WaniKani />);

      const level = await screen.findByRole('region', { name: 'Level 2' });
      expect(level).toHaveTextContent('Radicals 1 / 1');
      expect(level).toHaveTextContent('Kanji 0 / 2');
    });

    it('predicts how long until level 60 is finished', async () => {
      jest.useFakeTimers({
        now: new Date('2026-09-15T00:00:00Z'),
        doNotFake: ['setTimeout', 'setInterval', 'queueMicrotask'],
      });
      render(<WaniKani />);

      const level = await screen.findByRole('region', { name: 'Level 2' });
      expect(level).toHaveTextContent('586 days to finish level 60');
    });

    it('shows how many of each type are at each SRS stage', async () => {
      render(<WaniKani />);

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

    it('shows the percent of each type burned at each level', async () => {
      render(<WaniKani />);

      const levelOne = await screen.findByRole('row', { name: /^1 / });
      const percents = within(levelOne)
        .getAllByRole('cell')
        .map((cell) => cell.textContent);
      expect(percents).toEqual(['100%', '100%', '0%']);
    });

    describe('when progress has been loaded before', () => {
      it('only asks WaniKani for what changed since then', async () => {
        const { unmount } = render(<WaniKani />);
        await screen.findByRole('heading', { name: 'Level 2' });
        unmount();
        fetchMock.mockClear();

        render(<WaniKani />);
        await screen.findByRole('heading', { name: 'Level 2' });

        expect(getRequestedUrls()).toContain(
          'https://api.wanikani.com/v2/subjects?updated_after=2026-09-01T00%3A00%3A00Z',
        );
      });
    });
  });

  describe('when WaniKani rejects the saved API key', () => {
    beforeEach(() => {
      localStorage.setItem(API_KEY_STORAGE_KEY, 'old-key');
      fetchMock.mockImplementation(() => respondWith({}, 401));
    });

    it('asks for a new key', async () => {
      render(<WaniKani />);

      expect(
        await screen.findByLabelText('WaniKani API key'),
      ).toBeInTheDocument();
      expect(localStorage.getItem(API_KEY_STORAGE_KEY)).toBeNull();
    });
  });
});
