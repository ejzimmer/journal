import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithMediaStorage } from '../mediaStorageTestUtils';
import { MediaStorageContextType } from '../MediaStorageContext';
import { BookDetails, SeriesDetails } from '../types';
import { Books } from './Books';

const guards: BookDetails = {
  id: 'book-guards',
  type: 'book',
  title: 'Guards! Guards!',
};
const menAtArms: BookDetails = {
  id: 'book-men-at-arms',
  type: 'book',
  title: 'Men at Arms',
};
const feetOfClay: BookDetails = {
  id: 'book-feet-of-clay',
  type: 'book',
  title: 'Feet of Clay',
};

const watch: SeriesDetails<BookDetails> = {
  id: 'series-watch',
  type: 'series',
  name: 'City Watch',
  bandHue: 40,
  items: {
    [guards.id]: guards,
    [menAtArms.id]: menAtArms,
    [feetOfClay.id]: feetOfClay,
  },
};

function renderBooks() {
  return renderWithMediaStorage(<Books />, {
    books: [watch],
    bookSeries: [watch],
  });
}

function listReorderedIds(
  reorderSeries: MediaStorageContextType['reorderSeries'],
) {
  const [series, items] = jest.mocked(reorderSeries).mock.calls[0];
  return { seriesId: series.id, itemIds: items.map(({ id }) => id) };
}

const getSpineTitle = (title: string) =>
  screen.getByRole('button', { name: new RegExp(`^${title},`) });

describe('Books', () => {
  describe('reordering a series with the keyboard', () => {
    describe('when ArrowLeft is pressed on a book', () => {
      it('moves the book one place earlier', async () => {
        const user = userEvent.setup();
        const { storageContext } = renderBooks();

        getSpineTitle('Men at Arms').focus();
        await user.keyboard('{ArrowLeft}');

        expect(listReorderedIds(storageContext.reorderSeries)).toEqual({
          seriesId: watch.id,
          itemIds: [menAtArms.id, guards.id, feetOfClay.id],
        });
      });
    });

    describe('when ArrowRight is pressed on a book', () => {
      it('moves the book one place later', async () => {
        const user = userEvent.setup();
        const { storageContext } = renderBooks();

        getSpineTitle('Men at Arms').focus();
        await user.keyboard('{ArrowRight}');

        expect(listReorderedIds(storageContext.reorderSeries)).toEqual({
          seriesId: watch.id,
          itemIds: [guards.id, feetOfClay.id, menAtArms.id],
        });
      });
    });

    describe('when Shift is held', () => {
      it('moves the book to the start with ArrowLeft', async () => {
        const user = userEvent.setup();
        const { storageContext } = renderBooks();

        getSpineTitle('Feet of Clay').focus();
        await user.keyboard('{Shift>}{ArrowLeft}{/Shift}');

        expect(listReorderedIds(storageContext.reorderSeries)).toEqual({
          seriesId: watch.id,
          itemIds: [feetOfClay.id, guards.id, menAtArms.id],
        });
      });

      it('moves the book to the end with ArrowRight', async () => {
        const user = userEvent.setup();
        const { storageContext } = renderBooks();

        getSpineTitle('Guards! Guards!').focus();
        await user.keyboard('{Shift>}{ArrowRight}{/Shift}');

        expect(listReorderedIds(storageContext.reorderSeries)).toEqual({
          seriesId: watch.id,
          itemIds: [menAtArms.id, feetOfClay.id, guards.id],
        });
      });
    });

    describe('when the book is already first', () => {
      it('leaves the order alone on ArrowLeft', async () => {
        const user = userEvent.setup();
        const { storageContext } = renderBooks();

        getSpineTitle('Guards! Guards!').focus();
        await user.keyboard('{ArrowLeft}');

        expect(storageContext.reorderSeries).not.toHaveBeenCalled();
      });
    });

    describe('when the book is already last', () => {
      it('leaves the order alone on ArrowRight', async () => {
        const user = userEvent.setup();
        const { storageContext } = renderBooks();

        getSpineTitle('Feet of Clay').focus();
        await user.keyboard('{ArrowRight}');

        expect(storageContext.reorderSeries).not.toHaveBeenCalled();
      });
    });
  });

  describe('years', () => {
    beforeEach(() => {
      jest.useFakeTimers({ advanceTimers: true });
      jest.setSystemTime(new Date('2027-02-10'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    const createReadBook = (
      id: string,
      title: string,
      position: number,
      completedAt?: string,
    ): BookDetails => ({
      id,
      type: 'book',
      title,
      status: 'read',
      position,
      ...(completedAt && { completedAt }),
    });

    const halfReadWatch: SeriesDetails<BookDetails> = {
      ...watch,
      items: {
        [guards.id]: createReadBook(guards.id, guards.title, 0, '2026-04-01'),
        [menAtArms.id]: { ...menAtArms, position: 1 },
        [feetOfClay.id]: createReadBook(
          feetOfClay.id,
          feetOfClay.title,
          2,
          '2027-01-15',
        ),
      },
    };
    const colourOfMagic = createReadBook(
      'book-colour',
      'The Colour of Magic',
      0,
      '2025-03-02',
    );
    const lightFantastic = createReadBook(
      'book-light',
      'The Light Fantastic',
      1,
    );
    const rincewind: SeriesDetails<BookDetails> = {
      id: 'series-rincewind',
      type: 'series',
      name: 'Rincewind',
      items: {
        [colourOfMagic.id]: colourOfMagic,
        [lightFantastic.id]: lightFantastic,
      },
    };
    const nation = createReadBook('book-nation', 'Nation', 0, '2025-05-02');

    const renderBooksOverYears = () =>
      renderWithMediaStorage(<Books />, {
        books: [halfReadWatch, rincewind, nation],
        bookSeries: [halfReadWatch, rincewind],
      });

    const listShelvedTitles = () =>
      screen
        .getAllByRole('button', { name: /, (unread|read)$/ })
        .map((spine) => spine.getAttribute('aria-label')?.split(',')[0]);

    const selectYear = async (year: string) => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      await user.click(screen.getByRole('tab', { name: year }));
    };

    it('has a tab for this year and each year a book or a whole series was finished', () => {
      renderBooksOverYears();

      expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual([
        '2027',
        '2026',
        '2025',
      ]);
    });

    describe('when this year is selected', () => {
      it('shelves every book in a series that is still being read', () => {
        renderBooksOverYears();

        expect(listShelvedTitles()).toEqual([
          'Guards! Guards!',
          'Men at Arms',
          'Feet of Clay',
        ]);
      });
    });

    describe('when an earlier year is selected', () => {
      it('shelves the books read that year that are not in a series', async () => {
        renderBooksOverYears();

        await selectYear('2025');

        expect(listShelvedTitles()).toEqual(['Nation']);
      });

      describe('and a series was finished that year', () => {
        it('shelves the whole series', async () => {
          renderBooksOverYears();

          await selectYear('2026');

          expect(listShelvedTitles()).toEqual([
            'The Colour of Magic',
            'The Light Fantastic',
          ]);
        });
      });
    });

    describe('when a book has no date it was read', () => {
      it('counts it as read in 2026', async () => {
        renderWithMediaStorage(<Books />, {
          books: [createReadBook('book-mort', 'Mort', 0)],
        });

        await selectYear('2026');

        expect(listShelvedTitles()).toEqual(['Mort']);
      });
    });
  });
});
