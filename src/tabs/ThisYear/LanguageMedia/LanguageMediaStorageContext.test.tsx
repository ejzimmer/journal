import { act, renderHook } from '@testing-library/react';
import { getThisYear } from '../../../shared/dates';
import { ContextType } from '../../../shared/FirebaseContext';
import { StorageContextWrapper } from '../../../shared/storageContextTestUtils';
import {
  LanguageMediaStorageProvider,
  useLanguageMediaStorage,
  useLanguageMediaStorageContext,
} from './LanguageMediaStorageContext';
import {
  getLanguageMediaPath,
  LANGUAGE_MEDIA_PATH,
  LanguageMedia,
  NewMedia,
  TvSeries,
} from './types';

const renderWithProvider = <T,>(
  hook: () => T,
  storage: Partial<ContextType> = {},
) =>
  renderHook(hook, {
    wrapper: ({ children }) => (
      <StorageContextWrapper value={storage}>
        <LanguageMediaStorageProvider>{children}</LanguageMediaStorageProvider>
      </StorageContextWrapper>
    ),
  });

const createLanguageMediaStorage = (storage: Partial<ContextType> = {}) =>
  renderWithProvider(useLanguageMediaStorage, storage).result.current;

const storeMedia = (
  mediaByYear: Record<number, Record<string, LanguageMedia>>,
) => jest.fn().mockReturnValue({ value: mediaByYear, loading: false });

const thisYear = getThisYear();
const thisYearsPath = getLanguageMediaPath(thisYear);

const lupin: TvSeries = {
  id: 'lupin',
  type: 'tv',
  name: 'Lupin',
  language: 'french',
  seasons: {
    s1: {
      id: 's1',
      number: 1,
      episodes: {
        e1: { id: 'e1', number: 1, lookups: 3, aiQuestions: 1, understood: 80 },
      },
    },
  },
  upTo: { season: 1, episode: 1, timestampInSeconds: 600 },
};

describe('LanguageMediaStorageContext', () => {
  it('throws when the hook is used outside a provider', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();

    expect(() => renderHook(useLanguageMediaStorage)).toThrow(
      'missing LanguageMediaStorageContext provider',
    );

    errorSpy.mockRestore();
  });

  describe('listing media', () => {
    it("lists this year's media from the language media path", () => {
      const useValue = storeMedia({ [thisYear]: { lupin } });

      const storage = createLanguageMediaStorage({ useValue });

      expect(useValue).toHaveBeenCalledWith(LANGUAGE_MEDIA_PATH);
      expect(storage.media).toEqual([lupin]);
    });

    describe('when there is none stored', () => {
      it('lists no media', () => {
        const storage = createLanguageMediaStorage();

        expect(storage.media).toEqual([]);
      });
    });
  });

  describe('years', () => {
    it('lists this year and every stored year, newest first', () => {
      const { result } = renderWithProvider(useLanguageMediaStorageContext, {
        useValue: storeMedia({ [thisYear - 2]: { lupin } }),
      });

      expect(result.current.years).toEqual([thisYear, thisYear - 2]);
    });

    describe('when an earlier year is selected', () => {
      it("lists that year's media", () => {
        const { result } = renderWithProvider(
          () => ({
            context: useLanguageMediaStorageContext(),
            storage: useLanguageMediaStorage(),
          }),
          { useValue: storeMedia({ [thisYear - 1]: { lupin } }) },
        );

        act(() => result.current.context.selectYear(thisYear - 1));

        expect(result.current.storage.media).toEqual([lupin]);
      });
    });

    describe('while the stored media is loading', () => {
      it('says it is loading', () => {
        const { result } = renderWithProvider(useLanguageMediaStorageContext, {
          useValue: () => ({ value: undefined, loading: true }),
        });

        expect(result.current.isLoading).toBe(true);
      });
    });
  });

  describe('adding media', () => {
    const addMedia = (media: NewMedia) => {
      const addItem = jest.fn().mockReturnValue('new');
      createLanguageMediaStorage({ addItem }).addMedia(media);
      return addItem.mock.calls;
    };

    it("saves its details to this year's path", () => {
      const [mediaCall] = addMedia({
        type: 'youtube',
        name: 'HugoDécrypte',
        language: 'french',
      });

      expect(mediaCall).toEqual([
        thisYearsPath,
        { type: 'youtube', name: 'HugoDécrypte', language: 'french' },
      ]);
    });

    describe('a tv series with a number of seasons', () => {
      it('adds each season to the new series', () => {
        const [, ...seasonCalls] = addMedia({
          type: 'tv',
          name: 'Lupin',
          language: 'french',
          seasonCount: 2,
        });

        expect(seasonCalls).toEqual([
          [`${thisYearsPath}/new/seasons`, { number: 1 }],
          [`${thisYearsPath}/new/seasons`, { number: 2 }],
        ]);
      });
    });

    describe('a manga series with a number of volumes', () => {
      it('adds each numbered volume to the new series', () => {
        const [, ...volumeCalls] = addMedia({
          type: 'manga',
          name: 'Yotsuba&!',
          language: 'japanese',
          volumeCount: 2,
        });

        expect(volumeCalls).toEqual([
          [`${thisYearsPath}/new/volumes`, { number: 1 }],
          [`${thisYearsPath}/new/volumes`, { number: 2 }],
        ]);
      });
    });

    describe('a book series with volume names', () => {
      it('adds a volume for each name to the new series', () => {
        const [, ...volumeCalls] = addMedia({
          type: 'book',
          name: 'Astérix',
          language: 'french',
          volumeNames: ['Astérix le Gaulois', 'La Serpe d’or'],
        });

        expect(volumeCalls).toEqual([
          [
            `${thisYearsPath}/new/volumes`,
            { number: 1, name: 'Astérix le Gaulois' },
          ],
          [
            `${thisYearsPath}/new/volumes`,
            { number: 2, name: 'La Serpe d’or' },
          ],
        ]);
      });
    });
  });

  describe('adding an item', () => {
    it('saves it under the given collection and returns its id', () => {
      const addItem = jest.fn().mockReturnValue('e2');
      const storage = createLanguageMediaStorage({ addItem });

      const id = storage.addItem(['lupin', 'seasons', 's1', 'episodes'], {
        number: 2,
      });

      expect(addItem).toHaveBeenCalledWith(
        `${thisYearsPath}/lupin/seasons/s1/episodes`,
        { number: 2 },
      );
      expect(id).toBe('e2');
    });

    describe('with fields left empty', () => {
      it('saves it without them', () => {
        const addItem = jest.fn();
        const storage = createLanguageMediaStorage({ addItem });

        storage.addItem(['yotsuba', 'volumes'], { number: 2, name: undefined });

        expect(addItem.mock.calls[0][1]).toStrictEqual({ number: 2 });
      });
    });
  });

  describe('updating an item', () => {
    it('saves only the changed fields', () => {
      const setValues = jest.fn();
      const storage = createLanguageMediaStorage({ setValues });

      storage.updateItem(['lupin', 'seasons', 's1', 'episodes', 'e1'], {
        lookups: 4,
      });

      expect(setValues).toHaveBeenCalledWith({
        [`${thisYearsPath}/lupin/seasons/s1/episodes/e1/lookups`]: 4,
      });
    });

    describe('when a field has been cleared', () => {
      it('removes it', () => {
        const setValues = jest.fn();
        const storage = createLanguageMediaStorage({ setValues });

        storage.updateItem(['lupin'], { upTo: undefined });

        expect(setValues).toHaveBeenCalledWith({
          [`${thisYearsPath}/lupin/upTo`]: null,
        });
      });
    });
  });

  it('deletes an item', () => {
    const deleteItem = jest.fn();
    const storage = createLanguageMediaStorage({ deleteItem });

    storage.deleteItem(['lupin', 'seasons', 's1']);

    expect(deleteItem).toHaveBeenCalledWith(`${thisYearsPath}/lupin/seasons`, {
      id: 's1',
    });
  });
});
