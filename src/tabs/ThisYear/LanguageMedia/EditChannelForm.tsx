import { FormEvent, useState } from 'react';
import { DeleteWithConfirmation } from '../../../shared/controls/DeleteWithConfirmation';
import { useModal } from '../../../shared/controls/Modal';
import { Switch } from '../../../shared/controls/Switch';
import { TickIcon } from '../../../shared/icons/Tick';
import { readDuration, readText } from './fields';
import { LanguageOption } from './LanguageOption';
import { useLanguageMediaStorage } from './LanguageMediaStorageContext';
import { getItemsInAddedOrder } from './lists';
import { Language, LANGUAGES, Video, YoutubeChannel } from './types';
import { VideoRow } from './VideoRow';

import './ProgressUpdateForm.css';
import './AddMediaForm.css';
import './GardenEditForms.css';

const readVideoChanges = (data: FormData, video: Video) => {
  const lengthInSeconds = readDuration(data, `length-${video.id}`);
  return {
    url: readText(data, `url-${video.id}`) ?? video.url,
    lengthInSeconds,
    ...(video.status === 'done' && { upToInSeconds: lengthInSeconds }),
  };
};

export function EditChannelForm({ channel }: { channel: YoutubeChannel }) {
  const { updateItem, deleteItem } = useLanguageMediaStorage();
  const { closeModal } = useModal();
  const [language, setLanguage] = useState<Language>(channel.language);
  const videos = getItemsInAddedOrder(channel.videos);

  const saveChannel = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    updateItem([channel.id], {
      name: readText(data, 'name') ?? channel.name,
      language,
    });
    videos.forEach((video) =>
      updateItem(
        [channel.id, 'videos', video.id],
        readVideoChanges(data, video),
      ),
    );
    closeModal();
  };

  const deleteChannel = () => {
    deleteItem([channel.id]);
    closeModal();
  };

  return (
    <form
      className="edit-media-form"
      aria-label={`Edit ${channel.name}`}
      onSubmit={saveChannel}
    >
      <input
        className="add-media-name"
        name="name"
        aria-label="Name"
        autoComplete="off"
        defaultValue={channel.name}
        required
      />
      <div className="add-media-switches">
        <Switch
          options={[...LANGUAGES]}
          value={language}
          onChange={setLanguage}
          name="language"
          Option={LanguageOption}
        />
      </div>
      <div className="edit-video-rows">
        {videos.map((video) => (
          <VideoRow key={video.id} video={video} />
        ))}
      </div>
      <div className="edit-media-actions">
        <DeleteWithConfirmation
          className="progress-update-delete"
          label={`Delete ${channel.name}`}
          onDelete={deleteChannel}
        />
        <button
          type="submit"
          className="progress-update-save"
          aria-label="Save"
        >
          <TickIcon width="20px" strokeWidth="2.6" />
        </button>
      </div>
    </form>
  );
}
