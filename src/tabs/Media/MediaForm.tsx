import { FormEvent, useRef, useState } from 'react';
import { FormControl } from '../../shared/controls/FormControl';
import { Combobox } from '../../shared/controls/combobox/Combobox';
import { OptionType } from '../../shared/controls/combobox/types';
import { Modal, useModal } from '../../shared/controls/Modal';
import { ModalDialog } from '../../shared/controls/ModalDialog';
import { TickIcon } from '../../shared/icons/Tick';
import { RubbishBinIcon } from '../../shared/icons/RubbishBin';
import { PlusIcon } from '../../shared/icons/Plus';
import { useMediaStorage } from './MediaStorageContext';
import { MediaDetails, NewMedia, SeriesDetails } from './types';

import './MediaForm.css';

export type MediaFormConfig<T extends MediaDetails> = {
  typeLabel: string;
  seriesList: SeriesDetails<T>[];
  authorOptions?: string[];
  getAuthor?: (item: T) => string | undefined;
  buildNew: (title: string, author?: string) => Omit<T, 'id'>;
  buildUpdated: (item: T, title: string, author?: string) => T;
};

export function MediaForm<T extends MediaDetails>({
  item,
  config,
}: {
  item?: T;
  config: MediaFormConfig<T>;
}) {
  const titleRef = useRef<HTMLInputElement>(null);
  const existingAuthor = item && config.getAuthor?.(item);
  const [author, setAuthor] = useState<OptionType | undefined>(
    existingAuthor ? { id: existingAuthor, label: existingAuthor } : undefined,
  );

  const { addMedia, addMediaSeries, updateMedia, moveMedia, deleteMedia } =
    useMediaStorage();
  const { closeModal } = useModal();

  const currentSeries = item
    ? config.seriesList.find((series) => item.id in (series.items ?? {}))
    : undefined;

  const [series, setSeries] = useState<OptionType | undefined>(
    currentSeries
      ? { id: currentSeries.id, label: currentSeries.name }
      : undefined,
  );
  const seriesOptions = config.seriesList.map((s) => ({
    id: s.id,
    label: s.name,
  }));

  const authorOptions = (config.authorOptions ?? []).map((name) => ({
    id: name,
    label: name,
  }));

  const saveItem = (event: FormEvent) => {
    event.preventDefault();

    const title = titleRef.current?.value;
    if (!title) return;

    if (item) {
      const updatedItem = config.buildUpdated(item, title, author?.label);

      if (series && series.id === '') {
        moveMedia(updatedItem, { name: series.label });
      } else if (series?.id !== currentSeries?.id) {
        moveMedia(updatedItem, series && { id: series.id });
      } else {
        updateMedia(updatedItem);
      }
    } else {
      const newItem = config.buildNew(title, author?.label) as NewMedia;

      if (series && series.id === '') {
        addMediaSeries(series.label, newItem);
      } else if (series) {
        addMedia(newItem, series.id);
      } else {
        addMedia(newItem);
      }

      if (titleRef.current) titleRef.current.value = '';
      setAuthor(undefined);
      setSeries(undefined);
    }

    closeModal();
  };

  const removeItem = () => {
    if (item) deleteMedia(item);
  };

  return (
    <form className="media-form" onSubmit={saveItem}>
      <Modal.Body>
        <div className="media-form-fields">
          <FormControl
            label={`${config.typeLabel} title`}
            ref={titleRef}
            defaultValue={item?.title}
          />
          {config.authorOptions && (
            <Combobox
              label="Author name"
              value={author}
              options={authorOptions}
              createOption={(label) => ({ id: '', label })}
              onChange={setAuthor}
            />
          )}
          <Combobox
            label="Series name"
            value={series}
            options={seriesOptions}
            createOption={(label) => ({ id: '', label })}
            onChange={setSeries}
          />
        </div>
      </Modal.Body>
      <Modal.Footer>
        {item && (
          <Modal.Action
            onClick={removeItem}
            className="ghost delete"
            aria-label={`Delete ${config.typeLabel.toLowerCase()}`}
          >
            <RubbishBinIcon width="20px" />
          </Modal.Action>
        )}
        <button type="submit" className="round save" aria-label="Save">
          <TickIcon width="18px" />
        </button>
      </Modal.Footer>
    </form>
  );
}

export function AddMediaForm<T extends MediaDetails>({
  ariaLabel,
  config,
}: {
  ariaLabel: string;
  config: MediaFormConfig<T>;
}) {
  return (
    <Modal
      trigger={(props) => (
        <button {...props} className="outline icon" aria-label={ariaLabel}>
          <PlusIcon width="26" strokeWidth="3.5" />
        </button>
      )}
    >
      <MediaForm config={config} />
    </Modal>
  );
}

export function EditMediaForm<T extends MediaDetails>({
  item,
  isOpen,
  onCancel,
  config,
}: {
  item: T;
  isOpen: boolean;
  onCancel: () => void;
  config: MediaFormConfig<T>;
}) {
  return (
    <ModalDialog isOpen={isOpen} onCancel={onCancel}>
      {isOpen && <MediaForm item={item} config={config} />}
    </ModalDialog>
  );
}
