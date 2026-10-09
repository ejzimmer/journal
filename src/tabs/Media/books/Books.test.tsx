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

    const readGuards = { ...guards, status: 'read' as const };
    const readFeetOfClay = {
      ...feetOfClay,
      status: 'read' as const,
      completedAt: '2027-01-15',
    };
    const nation: BookDetails = {
      id: 'book-nation',
      type: 'book',
      title: 'Nation',
      status: 'read',
      completedAt: '2025-05-02',
    };
    const watchOverYears = {
      ...watch,
      items: {
        [readGuards.id]: { ...readGuards, position: 0 },
        [menAtArms.id]: { ...menAtArms, position: 1 },
        [readFeetOfClay.id]: { ...readFeetOfClay, position: 2 },
      },
    };

    const renderBooksOverYears = () =>
      renderWithMediaStorage(<Books />, {
        books: [watchOverYears, nation],
        bookSeries: [watchOverYears],
      });

    const listShelvedTitles = () =>
      screen
        .getAllByRole('button', { name: /, (unread|read)$/ })
        .map((spine) => spine.getAttribute('aria-label')?.split(',')[0]);

    it('has a tab for this year and each year a book was read', () => {
      renderBooksOverYears();

      expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual([
        '2027',
        '2026',
        '2025',
      ]);
    });

    describe('when this year is selected', () => {
      it('shelves the unread books and the ones read this year', () => {
        renderBooksOverYears();

        expect(listShelvedTitles()).toEqual(['Men at Arms', 'Feet of Clay']);
      });

      describe('and a book in a series is moved', () => {
        it('keeps the books read in earlier years where they were', async () => {
          const user = userEvent.setup({
            advanceTimers: jest.advanceTimersByTime,
          });
          const { storageContext } = renderBooksOverYears();

          getSpineTitle('Feet of Clay').focus();
          await user.keyboard('{ArrowLeft}');

          expect(listReorderedIds(storageContext.reorderSeries)).toEqual({
            seriesId: watch.id,
            itemIds: [guards.id, feetOfClay.id, menAtArms.id],
          });
        });
      });
    });

    describe('when an earlier year is selected', () => {
      it('shelves only the books read that year', async () => {
        const user = userEvent.setup({
          advanceTimers: jest.advanceTimersByTime,
        });
        renderBooksOverYears();

        await user.click(screen.getByRole('tab', { name: '2025' }));

        expect(listShelvedTitles()).toEqual(['Nation']);
      });

      describe('and a book has no date it was read', () => {
        it('counts it as read in 2026', async () => {
          const user = userEvent.setup({
            advanceTimers: jest.advanceTimersByTime,
          });
          renderBooksOverYears();

          await user.click(screen.getByRole('tab', { name: '2026' }));

          expect(listShelvedTitles()).toEqual(['Guards! Guards!']);
        });
      });
    });
  });
});
