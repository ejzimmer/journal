import { isSeries } from '../types';
import { AddMediaForm } from '../AddMediaForm';
import { useBookFormConfig } from './bookFormConfig';
import { BookMediaList } from './BookMediaList';
import { Shelf } from '../Shelf';
import { useMediaStorage } from '../MediaStorageContext';
import { useMediaYears } from '../useMediaYears';
import { YearTabs } from '../../../shared/controls/YearTabs';

export function Books() {
  const { books, updateMediaSeries } = useMediaStorage();
  const formConfig = useBookFormConfig();
  const { years, selectedYear, selectYear, isThisYearSelected, entriesInYear } =
    useMediaYears(books);

  return (
    <div className="books">
      <div className="media-heading">
        <h2>Books</h2>
        {isThisYearSelected && (
          <AddMediaForm ariaLabel="Add a book" config={formConfig} />
        )}
      </div>
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
    </div>
  );
}
