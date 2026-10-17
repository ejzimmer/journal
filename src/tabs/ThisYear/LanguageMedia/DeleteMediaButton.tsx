import { DeleteWithConfirmation } from '../../../shared/controls/DeleteWithConfirmation';
import { useModal } from '../../../shared/controls/Modal';
import { useLanguageMediaStorage } from './LanguageMediaStorageContext';
import { LanguageMedia } from './types';

export function DeleteMediaButton({ media }: { media: LanguageMedia }) {
  const { deleteItem } = useLanguageMediaStorage();
  const { closeModal } = useModal();

  const deleteMedia = () => {
    deleteItem([media.id]);
    closeModal();
  };

  return (
    <DeleteWithConfirmation
      className="progress-update-delete"
      label={`Delete ${media.name}`}
      onDelete={deleteMedia}
    />
  );
}
