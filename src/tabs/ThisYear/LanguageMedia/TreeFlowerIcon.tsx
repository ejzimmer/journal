import { CallistemonFlowerIcon } from './CallistemonFlowerIcon';
import { SakuraFlowerIcon } from './SakuraFlowerIcon';
import { PrintSeries } from './types';

export function TreeFlowerIcon({
  seriesType,
  width,
}: {
  seriesType: PrintSeries['type'];
  width?: string;
}) {
  return seriesType === 'book' ? (
    <CallistemonFlowerIcon width={width} />
  ) : (
    <SakuraFlowerIcon width={width} />
  );
}
