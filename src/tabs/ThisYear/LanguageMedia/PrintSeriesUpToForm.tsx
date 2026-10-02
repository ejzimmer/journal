import { DisclosureForm } from './DisclosureForm';
import { NumberField } from './NumberField';
import { readNumber } from './fields';
import { PrintSeries } from './types';

export function PrintSeriesUpToForm({
  upTo,
  onChange,
}: {
  upTo: PrintSeries['upTo'];
  onChange: (upTo: PrintSeries['upTo']) => void;
}) {
  return (
    <DisclosureForm
      summary="Update"
      label="Update where I'm up to"
      onSubmit={(data) =>
        onChange({
          volume: readNumber(data, 'volume')!,
          page: readNumber(data, 'page')!,
        })
      }
    >
      <NumberField
        label="Volume"
        name="volume"
        defaultValue={upTo?.volume}
        isRequired
      />
      <NumberField
        label="Page"
        name="page"
        defaultValue={upTo?.page}
        isRequired
      />
    </DisclosureForm>
  );
}
