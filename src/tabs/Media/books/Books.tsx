import {
  BOOK_STATUS_ORDER,
  BookDetails,
  BookStatus,
  getBookStatus,
  isSeries,
  SeriesDetails,
} from '../types';
import { getCoverHue } from '../coverHue';
import { getSeriesBandKey } from './getSeriesBandKey';
import { MediaList } from '../MediaList';
import { MediaEditFormProps, StatusConfig } from '../MediaSpine';
import { AddMediaForm, EditMediaForm } from '../MediaForm';
import { useBookFormConfig } from './bookFormConfig';
import { Shelf } from '../Shelf';
import { useMediaStorage } from '../MediaStorageContext';
import { useMediaYears } from '../useMediaYears';
import { YearTabs } from '../../../shared/controls/YearTabs';

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
  series,
}: {
  books?: Record<string, BookDetails>;
  series?: SeriesDetails<BookDetails>;
}) {
  const { reorderSeries, getSeriesItemsPath } = useMediaStorage();

  return (
    <MediaList
      items={books}
      listId={series && getSeriesItemsPath(series)}
      bandHue={series && getCoverHue(getSeriesBandKey(series))}
      onReorder={series && ((items) => reorderSeries(series, items))}
      hue={(book) => getCoverHue(book.author ?? book.title)}
      config={BOOK_CONFIG}
      EditForm={EditBookForm}
    />
  );
}

export function Books() {
  const { books, updateMediaSeries } = useMediaStorage();
  const formConfig = useBookFormConfig();
  const { years, selectedYear, selectYear, isThisYearSelected, entriesInYear } =
    useMediaYears(books);

  return (
    <div className="books">
      <h2>Books</h2>
      <YearTabs
        years={years}
        selectedYear={selectedYear}
        onSelectYear={selectYear}
      >
        <div className="shelves">
          {entriesInYear.map((entry) =>
            isSeries(entry) ? (
              <Shelf
                key={entry.id}
                label={entry.name}
                onRenameLabel={(name) => updateMediaSeries(entry, name)}
              >
                <BookMediaList books={entry.items} series={entry} />
              </Shelf>
            ) : (
              <Shelf key={entry.id} single>
                <BookMediaList books={{ [entry.id]: entry }} />
              </Shelf>
            ),
          )}
        </div>
      </YearTabs>
      {isThisYearSelected && (
        <AddMediaForm ariaLabel="Add a book" config={formConfig} />
      )}
    </div>
  );
}
