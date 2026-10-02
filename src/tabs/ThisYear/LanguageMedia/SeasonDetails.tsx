import { AddEpisodeForm } from './AddEpisodeForm';
import { DeleteButton } from './DeleteButton';
import { EditSeasonForm } from './EditSeasonForm';
import { EpisodeDetails } from './EpisodeDetails';
import { useLanguageMediaStorage } from './LanguageMediaStorageContext';
import { listByNumber } from './lists';
import { ItemPath, Season } from './types';

export function SeasonDetails({
  season,
  path,
}: {
  season: Season;
  path: ItemPath;
}) {
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
