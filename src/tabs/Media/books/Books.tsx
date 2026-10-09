import {
  BOOK_STATUS_ORDER,
  BookDetails,
  BookStatus,
  getBookStatus,
  SeriesDetails,
} from '../types';
import { getCoverHue } from '../coverHue';
import { MediaList } from '../MediaList';
import { MediaEditFormProps, StatusConfig } from '../MediaSpine';
import { AddMediaForm, EditMediaForm } from '../MediaForm';
import { useBookFormConfig } from './bookFormConfig';
import { Shelf } from '../Shelf';
import { useMediaStorage } from '../MediaStorageContext';
import { mergeReorderedSeriesItems } from '../seriesOrder';
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
      bandHue={series?.bandHue}
      onReorder={
        series &&
        ((items) =>
          reorderSeries(series, mergeReorderedSeriesItems(series.items, items)))
      }
      hue={(book) => getCoverHue(book.author ?? book.title)}
      config={BOOK_CONFIG}
      EditForm={EditBookForm}
    />
  );
}

export function Books() {
  const { books, updateMediaSeries } = useMediaStorage();
  const formConfig = useBookFormConfig();
  const {
    years,
    selectedYear,
    selectYear,
    isThisYearSelected,
    seriesInYear,
    singlesInYear,
  } = useMediaYears(books);

  return (
    <div className="books">
      <h2>Books</h2>
      <YearTabs
        years={years}
        selectedYear={selectedYear}
        onSelectYear={selectYear}
      >
        <div className="shelves">
          {seriesInYear.map(({ series, items }) => (
            <Shelf
              key={series.id}
              label={series.name}
              onRenameLabel={(name) => updateMediaSeries(series, name)}
            >
              <BookMediaList books={items} series={series} />
            </Shelf>
          ))}
          {singlesInYear.map((book) => (
            <Shelf key={book.id} single>
              <BookMediaList books={{ [book.id]: book }} />
            </Shelf>
          ))}
        </div>
      </YearTabs>
      {isThisYearSelected && (
        <AddMediaForm ariaLabel="Add a book" config={formConfig} />
      )}
    </div>
  );
}
