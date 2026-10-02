import {
  AddChapterForm,
  AddEpisodeForm,
  AddSeasonForm,
  AddVideoForm,
  AddVolumeForm,
} from './AddItemForms';
import {
  EditChapterForm,
  EditEpisodeForm,
  EditMediaForm,
  EditSeasonForm,
  EditVideoForm,
  EditVolumeForm,
} from './EditItemForms';
import {
  formatChapterName,
  formatComprehension,
  formatEpisodeName,
  formatHoursMinutesAndSeconds,
  formatMinutesAndSeconds,
  formatVolumeName,
  STATUS_NAMES,
} from './format';
import { useLanguageMediaStorage } from './LanguageMediaStorageContext';
import { appendItem, removeItemAt, replaceItemAt } from './listUpdates';
import { LANGUAGE_NAMES, MEDIA_TYPE_NAMES } from './names';
import {
  Chapter,
  Episode,
  LanguageMedia,
  PrintSeries,
  Season,
  Status,
  TvSeries,
  Video,
  Volume,
  YoutubeChannel,
} from './types';

export function MediaList() {
  const { media, updateMedia, deleteMedia } = useLanguageMediaStorage();

  return (
    <ul>
      {media.map((item) => (
        <li key={item.id}>
          <MediaDetails
            media={item}
            onChange={updateMedia}
            onDelete={() => deleteMedia(item)}
          />
        </li>
      ))}
    </ul>
  );
}

type DetailsProps<T> = {
  onChange: (item: T) => void;
  onDelete: () => void;
};

function DeleteButton({
  name,
  onDelete,
}: {
  name: string;
  onDelete: () => void;
}) {
  return (
    <button type="button" aria-label={`Delete ${name}`} onClick={onDelete}>
      Delete
    </button>
  );
}

function MediaDetails({
  media,
  onChange,
  onDelete,
}: DetailsProps<LanguageMedia> & { media: LanguageMedia }) {
  return (
    <>
      {media.name}, {LANGUAGE_NAMES[media.language]}{' '}
      {MEDIA_TYPE_NAMES[media.type]}
      <EditMediaForm media={media} onChange={onChange} />
      <DeleteButton name={media.name} onDelete={onDelete} />
      {media.type === 'tv' && (
        <TvSeriesDetails series={media} onChange={onChange} />
      )}
      {media.type === 'youtube' && (
        <YoutubeChannelDetails channel={media} onChange={onChange} />
      )}
      {(media.type === 'manga' || media.type === 'book') && (
        <PrintSeriesDetails series={media} onChange={onChange} />
      )}
    </>
  );
}

const formatStatus = (status?: Status) => status && `, ${STATUS_NAMES[status]}`;

function TvSeriesDetails({
  series,
  onChange,
}: {
  series: TvSeries;
  onChange: (series: TvSeries) => void;
}) {
  return (
    <>
      {series.upTo && (
        <div>
          Up to {series.upTo.season}-{series.upTo.episode}-
          {formatMinutesAndSeconds(series.upTo.timestampInSeconds)}
        </div>
      )}
      <ul>
        {series.seasons?.map((season, index) => (
          <li key={season.number}>
            <SeasonDetails
              season={season}
              onChange={(changed) =>
                onChange({
                  ...series,
                  seasons: replaceItemAt(series.seasons, index, changed),
                })
              }
              onDelete={() =>
                onChange({
                  ...series,
                  seasons: removeItemAt(series.seasons, index),
                })
              }
            />
          </li>
        ))}
      </ul>
      <AddSeasonForm
        seasons={series.seasons}
        onAdd={(season) =>
          onChange({ ...series, seasons: appendItem(series.seasons, season) })
        }
      />
    </>
  );
}

function SeasonDetails({
  season,
  onChange,
  onDelete,
}: DetailsProps<Season> & { season: Season }) {
  const name = `Season ${season.number}`;

  return (
    <>
      {name}
      <EditSeasonForm name={name} season={season} onChange={onChange} />
      <DeleteButton name={name} onDelete={onDelete} />
      <ul>
        {season.episodes?.map((episode, index) => (
          <li key={episode.number}>
            <EpisodeDetails
              episode={episode}
              onChange={(changed) =>
                onChange({
                  ...season,
                  episodes: replaceItemAt(season.episodes, index, changed),
                })
              }
              onDelete={() =>
                onChange({
                  ...season,
                  episodes: removeItemAt(season.episodes, index),
                })
              }
            />
          </li>
        ))}
      </ul>
      <AddEpisodeForm
        episodes={season.episodes}
        onAdd={(episode) =>
          onChange({
            ...season,
            episodes: appendItem(season.episodes, episode),
          })
        }
      />
    </>
  );
}

function EpisodeDetails({
  episode,
  onChange,
  onDelete,
}: DetailsProps<Episode> & { episode: Episode }) {
  const name = formatEpisodeName(episode);

  return (
    <>
      {name}
      {episode.lengthInSeconds !== undefined &&
        ` (${formatMinutesAndSeconds(episode.lengthInSeconds)})`}
      {formatStatus(episode.status)}: {formatComprehension(episode)}
      <EditEpisodeForm name={name} episode={episode} onChange={onChange} />
      <DeleteButton name={name} onDelete={onDelete} />
    </>
  );
}

function YoutubeChannelDetails({
  channel,
  onChange,
}: {
  channel: YoutubeChannel;
  onChange: (channel: YoutubeChannel) => void;
}) {
  return (
    <>
      <ul>
        {channel.videos?.map((video, index) => (
          <li key={index}>
            <VideoDetails
              video={video}
              onChange={(changed) =>
                onChange({
                  ...channel,
                  videos: replaceItemAt(channel.videos, index, changed),
                })
              }
              onDelete={() =>
                onChange({
                  ...channel,
                  videos: removeItemAt(channel.videos, index),
                })
              }
            />
          </li>
        ))}
      </ul>
      <AddVideoForm
        onAdd={(video) =>
          onChange({ ...channel, videos: appendItem(channel.videos, video) })
        }
      />
    </>
  );
}

function VideoDetails({
  video,
  onChange,
  onDelete,
}: DetailsProps<Video> & { video: Video }) {
  return (
    <>
      {video.url}
      {video.lengthInSeconds !== undefined &&
        ` (${formatHoursMinutesAndSeconds(video.lengthInSeconds)})`}
      {video.upToInSeconds !== undefined &&
        `, up to ${formatHoursMinutesAndSeconds(video.upToInSeconds)}`}
      {formatStatus(video.status)}: {formatComprehension(video)}
      <EditVideoForm video={video} onChange={onChange} />
      <DeleteButton name={video.url} onDelete={onDelete} />
    </>
  );
}

function PrintSeriesDetails({
  series,
  onChange,
}: {
  series: PrintSeries;
  onChange: (series: PrintSeries) => void;
}) {
  return (
    <>
      {series.upTo && (
        <div>
          Up to {series.upTo.volume}-{series.upTo.chapter}-{series.upTo.page}
        </div>
      )}
      <ul>
        {series.volumes?.map((volume, index) => (
          <li key={volume.number}>
            <VolumeDetails
              volume={volume}
              isNameRequired={series.type === 'book'}
              onChange={(changed) =>
                onChange({
                  ...series,
                  volumes: replaceItemAt(series.volumes, index, changed),
                })
              }
              onDelete={() =>
                onChange({
                  ...series,
                  volumes: removeItemAt(series.volumes, index),
                })
              }
            />
          </li>
        ))}
      </ul>
      <AddVolumeForm
        volumes={series.volumes}
        isNameRequired={series.type === 'book'}
        onAdd={(volume) =>
          onChange({ ...series, volumes: appendItem(series.volumes, volume) })
        }
      />
    </>
  );
}

function VolumeDetails({
  volume,
  isNameRequired,
  onChange,
  onDelete,
}: DetailsProps<Volume> & { volume: Volume; isNameRequired: boolean }) {
  const name = formatVolumeName(volume);

  return (
    <>
      {name}
      {volume.pages !== undefined && ` (${volume.pages} pages)`}
      <EditVolumeForm
        name={name}
        volume={volume}
        isNameRequired={isNameRequired}
        onChange={onChange}
      />
      <DeleteButton name={name} onDelete={onDelete} />
      <ul>
        {volume.chapters?.map((chapter, index) => (
          <li key={chapter.number}>
            <ChapterDetails
              chapter={chapter}
              onChange={(changed) =>
                onChange({
                  ...volume,
                  chapters: replaceItemAt(volume.chapters, index, changed),
                })
              }
              onDelete={() =>
                onChange({
                  ...volume,
                  chapters: removeItemAt(volume.chapters, index),
                })
              }
            />
          </li>
        ))}
      </ul>
      <AddChapterForm
        chapters={volume.chapters}
        onAdd={(chapter) =>
          onChange({
            ...volume,
            chapters: appendItem(volume.chapters, chapter),
          })
        }
      />
    </>
  );
}

function ChapterDetails({
  chapter,
  onChange,
  onDelete,
}: DetailsProps<Chapter> & { chapter: Chapter }) {
  const name = formatChapterName(chapter);

  return (
    <>
      {name}
      {chapter.lastPage !== undefined && ` (to page ${chapter.lastPage})`}
      {formatStatus(chapter.status)}: {formatComprehension(chapter)}
      <EditChapterForm name={name} chapter={chapter} onChange={onChange} />
      <DeleteButton name={name} onDelete={onDelete} />
    </>
  );
}
