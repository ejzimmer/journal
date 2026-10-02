import { renderHook } from '@testing-library/react';
import { ContextType } from '../../../shared/FirebaseContext';
import { StorageContextWrapper } from '../../../shared/storageContextTestUtils';
import {
  LanguageMediaStorageProvider,
  useLanguageMediaStorage,
} from './LanguageMediaStorageContext';
import { LANGUAGE_MEDIA_PATH, NewMedia, TvSeries } from './types';

const createLanguageMediaStorage = (storage: Partial<ContextType> = {}) =>
  renderHook(useLanguageMediaStorage, {
    wrapper: ({ children }) => (
      <StorageContextWrapper value={storage}>
        <LanguageMediaStorageProvider>{children}</LanguageMediaStorageProvider>
      </StorageContextWrapper>
    ),
  }).result.current;

const lupin: TvSeries = {
  id: 'lupin',
  type: 'tv',
  name: 'Lupin',
  language: 'french',
  seasons: [
    {
      number: 1,
      episodes: [{ number: 1, lookups: 3, aiQuestions: 1, understood: 80 }],
    },
  ],
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
    it('reads it from the language media path', () => {
      const useValue = jest
        .fn()
        .mockReturnValue({ value: undefined, loading: false });

      createLanguageMediaStorage({ useValue });

      expect(useValue).toHaveBeenCalledWith(LANGUAGE_MEDIA_PATH);
    });

    it('lists the stored media', () => {
      const storage = createLanguageMediaStorage({
        useValue: <T,>() => ({ value: { lupin } as T, loading: false }),
      });

      expect(storage.media).toEqual([lupin]);
    });

    describe('when there is none stored', () => {
      it('lists no media', () => {
        const storage = createLanguageMediaStorage();

        expect(storage.media).toEqual([]);
      });
    });

    describe('while the stored media is loading', () => {
      it('says it is loading', () => {
        const storage = createLanguageMediaStorage({
          useValue: () => ({ value: undefined, loading: true }),
        });

        expect(storage.isLoading).toBe(true);
      });
    });
  });

  describe('adding media', () => {
    const addMedia = (media: NewMedia) => {
      const addItem = jest.fn();
      createLanguageMediaStorage({ addItem }).addMedia(media);
      return addItem.mock.calls[0];
    };

    it('saves it to the language media path', () => {
      const [path] = addMedia({
        type: 'youtube',
        name: 'HugoDécrypte',
        language: 'french',
      });

      expect(path).toBe(LANGUAGE_MEDIA_PATH);
    });

    describe('a tv series', () => {
      it('creates the given number of seasons', () => {
        const [, series] = addMedia({
          type: 'tv',
          name: 'Lupin',
          language: 'french',
          seasonCount: 2,
        });

        expect(series).toEqual({
          type: 'tv',
          name: 'Lupin',
          language: 'french',
          seasons: [{ number: 1 }, { number: 2 }],
        });
      });

      describe('without a number of seasons', () => {
        it('creates no seasons', () => {
          const [, series] = addMedia({
            type: 'tv',
            name: 'Lupin',
            language: 'french',
          });

          expect(series.seasons).toEqual([]);
        });
      });
    });

    describe('a youtube channel', () => {
      it('saves its name and language', () => {
        const [, channel] = addMedia({
          type: 'youtube',
          name: 'Yuyu',
          language: 'japanese',
        });

        expect(channel).toEqual({
          type: 'youtube',
          name: 'Yuyu',
          language: 'japanese',
        });
      });
    });

    describe('a manga series', () => {
      it('creates the given number of numbered volumes', () => {
        const [, series] = addMedia({
          type: 'manga',
          name: 'Yotsuba&!',
          language: 'japanese',
          volumeCount: 2,
        });

        expect(series).toEqual({
          type: 'manga',
          name: 'Yotsuba&!',
          language: 'japanese',
          volumes: [{ number: 1 }, { number: 2 }],
        });
      });
    });

    describe('a book series', () => {
      it('creates a volume for each name', () => {
        const [, series] = addMedia({
          type: 'book',
          name: 'Harry Potter',
          language: 'french',
          volumeNames: ["Harry Potter à l'école des sorciers", 'La Chambre'],
        });

        expect(series).toEqual({
          type: 'book',
          name: 'Harry Potter',
          language: 'french',
          volumes: [
            { number: 1, name: "Harry Potter à l'école des sorciers" },
            { number: 2, name: 'La Chambre' },
          ],
        });
      });
    });
  });

  describe('updating media', () => {
    it('saves the changes', () => {
      const updateItem = jest.fn();
      const storage = createLanguageMediaStorage({ updateItem });
      const changed = { ...lupin, name: 'Lupin (Netflix)' };

      storage.updateMedia(changed);

      expect(updateItem).toHaveBeenCalledWith(LANGUAGE_MEDIA_PATH, changed);
    });

    describe('when a nested value has been cleared', () => {
      it('saves the media without that value', () => {
        const updateItem = jest.fn();
        const storage = createLanguageMediaStorage({ updateItem });

        storage.updateMedia({
          ...lupin,
          seasons: [
            {
              number: 1,
              episodes: [
                {
                  number: 1,
                  lookups: 0,
                  aiQuestions: 0,
                  understood: undefined,
                },
              ],
            },
          ],
        });

        expect(updateItem.mock.calls[0][1].seasons).toStrictEqual([
          { number: 1, episodes: [{ number: 1, lookups: 0, aiQuestions: 0 }] },
        ]);
      });
    });
  });

  it('deletes media', () => {
    const deleteItem = jest.fn();
    const storage = createLanguageMediaStorage({ deleteItem });

    storage.deleteMedia(lupin);

    expect(deleteItem).toHaveBeenCalledWith(LANGUAGE_MEDIA_PATH, lupin);
  });
});
