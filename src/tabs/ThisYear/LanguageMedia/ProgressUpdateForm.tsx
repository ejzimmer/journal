import { ComprehensionUpdateForm } from './ComprehensionUpdateForm';
import { useLanguageMediaStorage } from './LanguageMediaStorageContext';
import { PageTile } from './PageTile';
import { parseNumber } from './fields';
import { formatVolumeName, formatVolumeTitle } from './format';
import { Comprehension, PrintSeries, Volume } from './types';

type ProgressUpdateFormProps = {
  series: PrintSeries;
  volume: Volume;
};

export function ProgressUpdateForm({
  series,
  volume,
}: ProgressUpdateFormProps) {
  const { updateItem } = useLanguageMediaStorage();
  const path = [series.id, 'volumes', volume.id];

  const pageUpTo =
    series.upTo?.volume === volume.number ? series.upTo.page : undefined;

  const saveProgress = (data: FormData, changes: Comprehension) => {
    const page = parseNumber(data, 'page');
    if (page !== undefined) {
      updateItem([series.id], { upTo: { volume: volume.number, page } });
    }
    updateItem(path, changes);
  };

  return (
    <ComprehensionUpdateForm
      title={formatVolumeTitle(series, volume)}
      name={formatVolumeName(volume)}
      path={path}
      comprehension={volume}
      flowerType={series.type}
      positionTile={<PageTile page={pageUpTo} pages={volume.pages} />}
      onSave={saveProgress}
    />
  );
}
