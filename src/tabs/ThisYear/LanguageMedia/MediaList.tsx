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
import { LANGUAGE_NAMES, MEDIA_TYPE_NAMES } from './names';
import {
  Chapter,
  Episode,
  LanguageMedia,
  PrintSeries,
  Status,
  TvSeries,
  Video,
  YoutubeChannel,
} from './types';

export function MediaList() {
  const { media } = useLanguageMediaStorage();

  return (
    <ul>
      {media.map((item) => (
        <li key={item.id}>
          <MediaDetails media={item} />
        </li>
      ))}
    </ul>
  );
}

function MediaDetails({ media }: { media: LanguageMedia }) {
  return (
    <>
      {media.name}, {LANGUAGE_NAMES[media.language]}{' '}
      {MEDIA_TYPE_NAMES[media.type]}
      {media.type === 'tv' && <TvSeriesDetails series={media} />}
      {media.type === 'youtube' && <YoutubeChannelDetails channel={media} />}
      {(media.type === 'manga' || media.type === 'book') && (
        <PrintSeriesDetails series={media} />
      )}
    </>
  );
}

const formatStatus = (status?: Status) => status && `, ${STATUS_NAMES[status]}`;

function TvSeriesDetails({ series }: { series: TvSeries }) {
  return (
    <>
      {series.upTo && (
        <div>
          Up to {series.upTo.season}-{series.upTo.episode}-
          {formatMinutesAndSeconds(series.upTo.timestampInSeconds)}
        </div>
      )}
      <ul>
        {series.seasons?.map((season) => (
          <li key={season.number}>
            Season {season.number}
            <ul>
              {season.episodes?.map((episode) => (
                <li key={episode.number}>
                  <EpisodeDetails episode={episode} />
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </>
  );
}

function EpisodeDetails({ episode }: { episode: Episode }) {
  return (
    <>
      {formatEpisodeName(episode)}
      {episode.lengthInSeconds !== undefined &&
        ` (${formatMinutesAndSeconds(episode.lengthInSeconds)})`}
      {formatStatus(episode.status)}: {formatComprehension(episode)}
    </>
  );
}

function YoutubeChannelDetails({ channel }: { channel: YoutubeChannel }) {
  return (
    <ul>
      {channel.videos?.map((video, index) => (
        <li key={index}>
          <VideoDetails video={video} />
        </li>
      ))}
    </ul>
  );
}

function VideoDetails({ video }: { video: Video }) {
  return (
    <>
      {video.url}
      {video.lengthInSeconds !== undefined &&
        ` (${formatHoursMinutesAndSeconds(video.lengthInSeconds)})`}
      {video.upToInSeconds !== undefined &&
        `, up to ${formatHoursMinutesAndSeconds(video.upToInSeconds)}`}
      {formatStatus(video.status)}: {formatComprehension(video)}
    </>
  );
}

function PrintSeriesDetails({ series }: { series: PrintSeries }) {
  return (
    <>
      {series.upTo && (
        <div>
          Up to {series.upTo.volume}-{series.upTo.chapter}-{series.upTo.page}
        </div>
      )}
      <ul>
        {series.volumes?.map((volume) => (
          <li key={volume.number}>
            {formatVolumeName(volume)}
            {volume.pages !== undefined && ` (${volume.pages} pages)`}
            <ul>
              {volume.chapters?.map((chapter) => (
                <li key={chapter.number}>
                  <ChapterDetails chapter={chapter} />
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </>
  );
}

function ChapterDetails({ chapter }: { chapter: Chapter }) {
  return (
    <>
      {formatChapterName(chapter)}
      {chapter.lastPage !== undefined && ` (to page ${chapter.lastPage})`}
      {formatStatus(chapter.status)}: {formatComprehension(chapter)}
    </>
  );
}
