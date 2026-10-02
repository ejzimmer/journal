import { RubbishBinIcon } from '../../../shared/icons/RubbishBin';
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
  return (
    <>
      {media.name}, {LANGUAGE_NAMES[media.language]}{' '}
      {MEDIA_TYPE_NAMES[media.type]}
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
    </>
  );
}

function SeasonDetails({ season, path }: { season: Season; path: ItemPath }) {
  const name = `Season ${season.number}`;

  return (
    <>
      {name}
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
  const name = formatEpisodeName(episode);

  return (
    <>
      {name}
      {episode.lengthInSeconds !== undefined &&
        ` (${formatMinutesAndSeconds(episode.lengthInSeconds)})`}
      {formatStatus(episode.status)}: {formatComprehension(episode)}
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
  return (
    <ul>
      {listInAddedOrder(channel.videos).map((video) => (
        <li key={video.id}>
          <VideoDetails video={video} path={[...path, 'videos', video.id]} />
        </li>
      ))}
    </ul>
  );
}

function VideoDetails({ video, path }: { video: Video; path: ItemPath }) {
  return (
    <>
      {video.url}
      {video.lengthInSeconds !== undefined &&
        ` (${formatHoursMinutesAndSeconds(video.lengthInSeconds)})`}
      {video.upToInSeconds !== undefined &&
        `, up to ${formatHoursMinutesAndSeconds(video.upToInSeconds)}`}
      {formatStatus(video.status)}: {formatComprehension(video)}
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
              path={[...path, 'volumes', volume.id]}
            />
          </li>
        ))}
      </ul>
    </>
  );
}

function VolumeDetails({ volume, path }: { volume: Volume; path: ItemPath }) {
  const name = formatVolumeName(volume);

  return (
    <>
      {name}
      {volume.pages !== undefined && ` (${volume.pages} pages)`}
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
  const name = formatChapterName(chapter);

  return (
    <>
      {name}
      {chapter.lastPage !== undefined && ` (to page ${chapter.lastPage})`}
      {formatStatus(chapter.status)}: {formatComprehension(chapter)}
      <DeleteButton name={name} path={path} />
    </>
  );
}
