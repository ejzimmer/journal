import { PrintSeriesDetails } from './PrintSeriesDetails';
import { TvSeriesDetails } from './TvSeriesDetails';
import { YoutubeChannelDetails } from './YoutubeChannelDetails';
import { LANGUAGE_NAMES, MEDIA_TYPE_NAMES } from './names';
import { LanguageMedia } from './types';

export function MediaDetails({ media }: { media: LanguageMedia }) {
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
