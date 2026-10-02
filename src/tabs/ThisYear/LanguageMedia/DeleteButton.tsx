import { RubbishBinIcon } from '../../../shared/icons/RubbishBin';
import { useLanguageMediaStorage } from './LanguageMediaStorageContext';
import { ItemPath } from './types';

export function DeleteButton({ name, path }: { name: string; path: ItemPath }) {
  const { deleteItem } = useLanguageMediaStorage();

  return (
    <button
      type="button"
      aria-label={`Delete ${name}`}
      onClick={() => deleteItem(path)}
    >
      <RubbishBinIcon width="16px" />
    </button>
  );
}
