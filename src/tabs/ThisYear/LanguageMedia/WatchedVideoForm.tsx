import { FormEvent, KeyboardEvent, useState } from 'react';
import { useModal } from '../../../shared/controls/Modal';
import { TickIcon } from '../../../shared/icons/Tick';
import { CountTile } from './CountTile';
import { LadyBeetleIcon } from './LadyBeetleIcon';
import { UnderstoodTile } from './UnderstoodTile';
import { useLanguageMediaStorage } from './LanguageMediaStorageContext';
import { VideoLengthTile } from './VideoLengthTile';
import { VideoUrlTile } from './VideoUrlTile';
import { parseNumber, readDuration, readText } from './fields';
import { YoutubeChannel } from './types';

import './ProgressUpdateForm.css';

export function WatchedVideoForm({ channel }: { channel: YoutubeChannel }) {
  const { addItem } = useLanguageMediaStorage();
  const { closeModal } = useModal();
  const [lookups, setLookups] = useState(0);
  const [aiQuestions, setAiQuestions] = useState(0);

  const submitOnEnter = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key === 'Enter' && event.target instanceof HTMLInputElement) {
      event.preventDefault();
      event.currentTarget.requestSubmit();
    }
  };

  const addWatchedVideo = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const lengthInSeconds = readDuration(data, 'length');
    addItem([channel.id, 'videos'], {
      url: readText(data, 'url'),
      lengthInSeconds,
      upToInSeconds: lengthInSeconds,
      status: 'done',
      lookups: parseNumber(data, 'lookups') ?? 0,
      aiQuestions: parseNumber(data, 'aiQuestions') ?? 0,
      understood: parseNumber(data, 'understood'),
    });
    closeModal();
  };

  return (
    <form
      className="progress-update-form"
      aria-label={`Add a watched video to ${channel.name}`}
      onKeyDown={submitOnEnter}
      onSubmit={addWatchedVideo}
    >
      <h2 className="progress-update-title">{channel.name}</h2>
      <div className="progress-update-body">
        <div className="progress-tiles">
          <VideoUrlTile />
          <CountTile
            name="lookups"
            label="Looked up"
            addLabel="Add a lookup"
            icon={<LadyBeetleIcon colour="red" width="45px" />}
            count={lookups}
            onAdd={() => setLookups((count) => count + 1)}
          />
          <CountTile
            name="aiQuestions"
            label="Asked AI"
            addLabel="Add an AI question"
            icon={<LadyBeetleIcon colour="yellow" width="45px" />}
            count={aiQuestions}
            onAdd={() => setAiQuestions((count) => count + 1)}
          />
          <VideoLengthTile />
          <UnderstoodTile mediaType="youtube" />
        </div>
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
