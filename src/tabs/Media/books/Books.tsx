import {
  BOOK_STATUS_ORDER,
  BookDetails,
  BookStatus,
  getBookStatus,
  isSeries,
  SeriesDetails,
} from '../types';
import { getCoverHue } from '../coverHue';
import { MediaList } from '../MediaList';
import { MediaEditFormProps, StatusConfig } from '../MediaSpine';
import { AddMediaForm, EditMediaForm } from '../MediaForm';
import { useBookFormConfig } from './bookFormConfig';
import { Shelf } from '../Shelf';
import { useMediaStorage } from '../MediaStorageContext';

const BOOK_CONFIG: StatusConfig<BookDetails, BookStatus> = {
  order: BOOK_STATUS_ORDER,
  spineStatus: {
    unread: 'todo',
    reading: 'active',
    listening: 'active',
    read: 'done',
  },
  glyph: {
    unread: '📖',
    reading: '📖',
    listening: '🎧',
    read: '✓',
  },
  getStatus: getBookStatus,
  setStatus: (book, status) => ({ ...book, status }),
  getAuthor: (book) => book.author,
};

function EditBookForm({
  item,
  isOpen,
  onCancel,
}: MediaEditFormProps<BookDetails>) {
  return (
    <EditMediaForm
      item={item}
      isOpen={isOpen}
      onCancel={onCancel}
      config={useBookFormConfig()}
    />
  );
}

function BookMediaList({
  books,
  bandHue,
}: {
  books?: Record<string, BookDetails>;
  bandHue?: number;
}) {
  return (
    <MediaList
      items={books}
      bandHue={bandHue}
      hue={(book) => getCoverHue(book.author ?? book.title)}
      config={BOOK_CONFIG}
      EditForm={EditBookForm}
    />
  );
}

export function Books() {
  const { books, updateMediaSeries } = useMediaStorage();

  const series = books.filter((item): item is SeriesDetails<BookDetails> =>
    isSeries(item),
  );
  const singleBooks = books.filter(
    (item): item is BookDetails => !isSeries(item),
  );

  return (
    <div className="books">
      <h2>Books</h2>
      <div className="shelves">
        {series.map((item) => (
          <Shelf
            key={item.id}
            label={item.name}
            onRenameLabel={(name) => updateMediaSeries(item, name)}
          >
            <BookMediaList books={item.items} bandHue={item.bandHue} />
          </Shelf>
        ))}
        {singleBooks.map((book) => (
          <Shelf key={book.id} single>
            <BookMediaList books={{ [book.id]: book }} />
          </Shelf>
        ))}
      </div>
      <AddMediaForm ariaLabel="Add a book" config={useBookFormConfig()} />
    </div>
  );
}
