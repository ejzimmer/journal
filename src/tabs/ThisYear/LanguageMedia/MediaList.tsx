import { RubbishBinIcon } from '../../../shared/icons/RubbishBin';
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
import { listByNumber, listInAddedOrder } from './lists';
import { LANGUAGE_NAMES, MEDIA_TYPE_NAMES } from './names';
import {
  Chapter,
  Episode,
  ItemPath,
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
  const { media } = useLanguageMediaStorage();

  return (
    <ul>
      {media.map((item) => (
        <li key={item.id}>
          <MediaDetails media={item} path={[item.id]} />
        </li>
      ))}
    </ul>
  );
}

function DeleteButton({ name, path }: { name: string; path: ItemPath }) {
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

function MediaDetails({
  media,
  path,
}: {
  media: LanguageMedia;
  path: ItemPath;
}) {
  const { updateItem } = useLanguageMediaStorage();

  return (
    <>
      {media.name}, {LANGUAGE_NAMES[media.language]}{' '}
      {MEDIA_TYPE_NAMES[media.type]}
      <EditMediaForm
        media={media}
        onChange={(changes) => updateItem(path, changes)}
      />
      <DeleteButton name={media.name} path={path} />
      {media.type === 'tv' && <TvSeriesDetails series={media} path={path} />}
      {media.type === 'youtube' && (
        <YoutubeChannelDetails channel={media} path={path} />
      )}
      {(media.type === 'manga' || media.type === 'book') && (
        <PrintSeriesDetails series={media} path={path} />
      )}
    </>
  );
}

const formatStatus = (status?: Status) => status && `, ${STATUS_NAMES[status]}`;

function TvSeriesDetails({
  series,
  path,
}: {
  series: TvSeries;
  path: ItemPath;
}) {
  const { addItem } = useLanguageMediaStorage();

  return (
    <>
      {series.upTo && (
        <div>
          Up to {series.upTo.season}-{series.upTo.episode}-
          {formatMinutesAndSeconds(series.upTo.timestampInSeconds)}
        </div>
      )}
      <ul>
        {listByNumber(series.seasons).map((season) => (
          <li key={season.id}>
            <SeasonDetails
              season={season}
              path={[...path, 'seasons', season.id]}
            />
          </li>
        ))}
      </ul>
      <AddSeasonForm
        seasons={series.seasons}
        onAdd={(season, episodes) => {
          const seasonId = addItem([...path, 'seasons'], season);
          if (!seasonId) return;
          episodes.forEach((episode) =>
            addItem([...path, 'seasons', seasonId, 'episodes'], episode),
          );
        }}
      />
    </>
  );
}

function SeasonDetails({ season, path }: { season: Season; path: ItemPath }) {
  const { addItem, updateItem } = useLanguageMediaStorage();
  const name = `Season ${season.number}`;

  return (
    <>
      {name}
      <EditSeasonForm
        name={name}
        season={season}
        onChange={(changes) => updateItem(path, changes)}
      />
      <DeleteButton name={name} path={path} />
      <ul>
        {listByNumber(season.episodes).map((episode) => (
          <li key={episode.id}>
            <EpisodeDetails
              episode={episode}
              path={[...path, 'episodes', episode.id]}
            />
          </li>
        ))}
      </ul>
      <AddEpisodeForm
        episodes={season.episodes}
        onAdd={(episode) => addItem([...path, 'episodes'], episode)}
      />
    </>
  );
}

function EpisodeDetails({
  episode,
  path,
}: {
  episode: Episode;
  path: ItemPath;
}) {
  const { updateItem } = useLanguageMediaStorage();
  const name = formatEpisodeName(episode);

  return (
    <>
      {name}
      {episode.lengthInSeconds !== undefined &&
        ` (${formatMinutesAndSeconds(episode.lengthInSeconds)})`}
      {formatStatus(episode.status)}: {formatComprehension(episode)}
      <EditEpisodeForm
        name={name}
        episode={episode}
        onChange={(changes) => updateItem(path, changes)}
      />
      <DeleteButton name={name} path={path} />
    </>
  );
}

function YoutubeChannelDetails({
  channel,
  path,
}: {
  channel: YoutubeChannel;
  path: ItemPath;
}) {
  const { addItem } = useLanguageMediaStorage();

  return (
    <>
      <ul>
        {listInAddedOrder(channel.videos).map((video) => (
          <li key={video.id}>
            <VideoDetails video={video} path={[...path, 'videos', video.id]} />
          </li>
        ))}
      </ul>
      <AddVideoForm onAdd={(video) => addItem([...path, 'videos'], video)} />
    </>
  );
}

function VideoDetails({ video, path }: { video: Video; path: ItemPath }) {
  const { updateItem } = useLanguageMediaStorage();
  return (
    <>
      {video.url}
      {video.lengthInSeconds !== undefined &&
        ` (${formatHoursMinutesAndSeconds(video.lengthInSeconds)})`}
      {video.upToInSeconds !== undefined &&
        `, up to ${formatHoursMinutesAndSeconds(video.upToInSeconds)}`}
      {formatStatus(video.status)}: {formatComprehension(video)}
      <EditVideoForm
        video={video}
        onChange={(changes) => updateItem(path, changes)}
      />
      <DeleteButton name={video.url} path={path} />
    </>
  );
}

function PrintSeriesDetails({
  series,
  path,
}: {
  series: PrintSeries;
  path: ItemPath;
}) {
  const { addItem } = useLanguageMediaStorage();

  return (
    <>
      {series.upTo && (
        <div>
          Up to {series.upTo.volume}-{series.upTo.chapter}-{series.upTo.page}
        </div>
      )}
      <ul>
        {listByNumber(series.volumes).map((volume) => (
          <li key={volume.id}>
            <VolumeDetails
              volume={volume}
              isNameRequired={series.type === 'book'}
              path={[...path, 'volumes', volume.id]}
            />
          </li>
        ))}
      </ul>
      <AddVolumeForm
        volumes={series.volumes}
        isNameRequired={series.type === 'book'}
        onAdd={(volume) => addItem([...path, 'volumes'], volume)}
      />
    </>
  );
}

function VolumeDetails({
  volume,
  path,
  isNameRequired,
}: {
  volume: Volume;
  path: ItemPath;
  isNameRequired: boolean;
}) {
  const { addItem, updateItem } = useLanguageMediaStorage();
  const name = formatVolumeName(volume);

  return (
    <>
      {name}
      {volume.pages !== undefined && ` (${volume.pages} pages)`}
      <EditVolumeForm
        name={name}
        volume={volume}
        isNameRequired={isNameRequired}
        onChange={(changes) => updateItem(path, changes)}
      />
      <DeleteButton name={name} path={path} />
      <ul>
        {listByNumber(volume.chapters).map((chapter) => (
          <li key={chapter.id}>
            <ChapterDetails
              chapter={chapter}
              path={[...path, 'chapters', chapter.id]}
            />
          </li>
        ))}
      </ul>
      <AddChapterForm
        chapters={volume.chapters}
        onAdd={(chapter) => addItem([...path, 'chapters'], chapter)}
      />
    </>
  );
}

function ChapterDetails({
  chapter,
  path,
}: {
  chapter: Chapter;
  path: ItemPath;
}) {
  const { updateItem } = useLanguageMediaStorage();
  const name = formatChapterName(chapter);

  return (
    <>
      {name}
      {chapter.lastPage !== undefined && ` (to page ${chapter.lastPage})`}
      {formatStatus(chapter.status)}: {formatComprehension(chapter)}
      <EditChapterForm
        name={name}
        chapter={chapter}
        onChange={(changes) => updateItem(path, changes)}
      />
      <DeleteButton name={name} path={path} />
    </>
  );
}
