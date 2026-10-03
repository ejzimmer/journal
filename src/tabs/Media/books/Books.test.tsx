import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithMediaStorage } from '../mediaStorageTestUtils';
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

        expect(storageContext.reorderSeries).toHaveBeenCalledWith(watch, [
          menAtArms,
          guards,
          feetOfClay,
        ]);
      });
    });

    describe('when ArrowRight is pressed on a book', () => {
      it('moves the book one place later', async () => {
        const user = userEvent.setup();
        const { storageContext } = renderBooks();

        getSpineTitle('Men at Arms').focus();
        await user.keyboard('{ArrowRight}');

        expect(storageContext.reorderSeries).toHaveBeenCalledWith(watch, [
          guards,
          feetOfClay,
          menAtArms,
        ]);
      });
    });

    describe('when Shift is held', () => {
      it('moves the book to the start with ArrowLeft', async () => {
        const user = userEvent.setup();
        const { storageContext } = renderBooks();

        getSpineTitle('Feet of Clay').focus();
        await user.keyboard('{Shift>}{ArrowLeft}{/Shift}');

        expect(storageContext.reorderSeries).toHaveBeenCalledWith(watch, [
          feetOfClay,
          guards,
          menAtArms,
        ]);
      });

      it('moves the book to the end with ArrowRight', async () => {
        const user = userEvent.setup();
        const { storageContext } = renderBooks();

        getSpineTitle('Guards! Guards!').focus();
        await user.keyboard('{Shift>}{ArrowRight}{/Shift}');

        expect(storageContext.reorderSeries).toHaveBeenCalledWith(watch, [
          menAtArms,
          feetOfClay,
          guards,
        ]);
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
});
