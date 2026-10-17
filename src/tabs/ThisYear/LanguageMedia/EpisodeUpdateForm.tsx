import { FormEvent, KeyboardEvent, useState } from 'react';
import { useModal } from '../../../shared/controls/Modal';
import { TickIcon } from '../../../shared/icons/Tick';
import { CountTile } from './CountTile';
import { EpisodeTimeTile } from './EpisodeTimeTile';
import { LadyBeetleIcon } from './LadyBeetleIcon';
import { UnderstoodTile } from './UnderstoodTile';
import { useLanguageMediaStorage } from './LanguageMediaStorageContext';
import { parseNumber, readDuration } from './fields';
import { formatEpisodeTitle } from './format';
import { Episode, EpisodeUpdate, Season, TvSeries } from './types';

import './ProgressUpdateForm.css';

type EpisodeUpdateFormProps = {
  series: TvSeries;
  season: Season;
  episode: Episode;
};

export function EpisodeUpdateForm({
  series,
  season,
  episode,
}: EpisodeUpdateFormProps) {
  const { updateItem } = useLanguageMediaStorage();
  const { closeModal } = useModal();
  const [updateKey] = useState(() => crypto.randomUUID());
  const updatePath = [
    series.id,
    'seasons',
    season.id,
    'episodes',
    episode.id,
    'updates',
    updateKey,
  ];
  const update = episode.updates?.[updateKey];
  const name = formatEpisodeTitle(series, season, episode);
  const { upTo } = series;
  const startingTimestamp =
    upTo?.season === season.number && upTo.episode === episode.number
      ? upTo.timestampInSeconds
      : undefined;

  const submitOnEnter = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key === 'Enter' && event.target instanceof HTMLInputElement) {
      event.preventDefault();
      event.currentTarget.requestSubmit();
    }
  };

  const saveUpdate = (changes: Partial<EpisodeUpdate>) =>
    updateItem(
      updatePath,
      update
        ? changes
        : {
            at: Temporal.Now.instant().toString(),
            lookups: 0,
            aiQuestions: 0,
            timestampInSeconds: startingTimestamp,
            ...changes,
          },
    );

  const saveProgress = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const timestampInSeconds = readDuration(data, 'timestamp');
    if (timestampInSeconds !== undefined) {
      updateItem([series.id], {
        upTo: {
          season: season.number,
          episode: episode.number,
          timestampInSeconds,
        },
      });
    }
    const changes = {
      lookups: parseNumber(data, 'lookups') ?? 0,
      aiQuestions: parseNumber(data, 'aiQuestions') ?? 0,
      understood: parseNumber(data, 'understood'),
    };
    const hasProgress =
      changes.lookups > 0 ||
      changes.aiQuestions > 0 ||
      changes.understood !== undefined ||
      (timestampInSeconds !== undefined &&
        timestampInSeconds !== startingTimestamp);
    if (update || hasProgress) {
      saveUpdate({
        ...changes,
        timestampInSeconds: timestampInSeconds ?? startingTimestamp,
      });
    }
    closeModal();
  };

  return (
    <form
      className="progress-update-form"
      aria-label={`Track ${name}`}
      onKeyDown={submitOnEnter}
      onSubmit={saveProgress}
    >
      <h2 className="progress-update-title">{name}</h2>
      <div className="progress-update-body">
        <div className="progress-tiles">
          <CountTile
            name="lookups"
            label="Looked up"
            addLabel={`Add a lookup to ${name}`}
            icon={<LadyBeetleIcon colour="red" width="45px" />}
            count={update?.lookups ?? 0}
            onAdd={() => saveUpdate({ lookups: (update?.lookups ?? 0) + 1 })}
          />
          <CountTile
            name="aiQuestions"
            label="Asked AI"
            addLabel={`Add an AI question to ${name}`}
            icon={<LadyBeetleIcon colour="yellow" width="45px" />}
            count={update?.aiQuestions ?? 0}
            onAdd={() =>
              saveUpdate({ aiQuestions: (update?.aiQuestions ?? 0) + 1 })
            }
          />
          <EpisodeTimeTile
            timestampInSeconds={startingTimestamp}
            lengthInSeconds={episode.lengthInSeconds}
          />
          <UnderstoodTile mediaType="tv" />
        </div>
        <div className="progress-update-actions">
          <button
            type="submit"
            className="progress-update-save"
            aria-label="Save"
          >
            <TickIcon width="20px" strokeWidth="2.6" />
          </button>
        </div>
      </div>
    </form>
  );
}
