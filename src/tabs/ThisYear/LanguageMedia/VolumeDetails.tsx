import { DeleteButton } from './DeleteButton';
import { EditVolumeForm } from './EditVolumeForm';
import { useLanguageMediaStorage } from './LanguageMediaStorageContext';
import { StatusSelect } from './StatusSelect';
import { sumReadings } from './sumReadings';
import { formatComprehension, formatStatus, formatVolumeName } from './format';
import { ItemPath, Volume } from './types';

export function VolumeDetails({
  volume,
  path,
  isNameRequired,
}: {
  volume: Volume;
  path: ItemPath;
  isNameRequired: boolean;
}) {
  const { updateItem } = useLanguageMediaStorage();
  const name = formatVolumeName(volume);

  return (
    <>
      {name}
      {volume.pages !== undefined && ` (${volume.pages} pages)`}
      {formatStatus(volume.status)}: {formatComprehension(sumReadings(volume))}
      {volume.pages === undefined && (
        <StatusSelect
          name={name}
          status={volume.status}
          onChange={(status) => updateItem(path, { status })}
        />
      )}
      <EditVolumeForm
        name={name}
        volume={volume}
        isNameRequired={isNameRequired}
        onChange={(changes) => updateItem(path, changes)}
      />
      <DeleteButton name={name} path={path} />
    </>
  );
}
