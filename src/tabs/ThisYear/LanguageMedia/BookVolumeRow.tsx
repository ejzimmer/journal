import { CountField } from './CountField';
import { formatVolumeName } from './format';
import { Volume } from './types';
import { VolumeNameField } from './VolumeNameField';

export function BookVolumeRow({ volume }: { volume: Volume }) {
  return (
    <div className="edit-volume-row">
      <VolumeNameField
        name={`name-${volume.id}`}
        label={`Volume ${volume.number} name`}
        defaultValue={volume.name}
      />
      <CountField
        name={`pages-${volume.id}`}
        label={`${formatVolumeName(volume)} pages`}
        icon="📖"
        defaultValue={volume.pages}
      />
    </div>
  );
}
