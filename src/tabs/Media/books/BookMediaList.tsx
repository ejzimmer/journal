import {
  BOOK_STATUS_ORDER,
  BookDetails,
  BookStatus,
  getBookStatus,
  SeriesDetails,
} from '../types';
import { getCoverHue } from '../coverHue';
import { getSeriesBandKey } from './getSeriesBandKey';
import { MediaList } from '../MediaList';
import { StatusConfig } from '../MediaSpine';
import { useMediaStorage } from '../MediaStorageContext';
import { EditBookForm } from './EditBookForm';

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

export function BookMediaList({
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
