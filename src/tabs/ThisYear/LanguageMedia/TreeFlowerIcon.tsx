import { CallistemonFlowerIcon } from './CallistemonFlowerIcon';
import { SaguaroFlowerIcon } from './SaguaroFlowerIcon';
import { SakuraFlowerIcon } from './SakuraFlowerIcon';
import { PrintSeries, YoutubeChannel } from './types';

export type FlowerType = PrintSeries['type'] | YoutubeChannel['type'];

const FLOWER_ICONS = {
  book: CallistemonFlowerIcon,
  manga: SakuraFlowerIcon,
  youtube: SaguaroFlowerIcon,
};

export function TreeFlowerIcon({
  flowerType,
  width,
}: {
  flowerType: FlowerType;
  width?: string;
}) {
  const FlowerIcon = FLOWER_ICONS[flowerType];
  return <FlowerIcon width={width} />;
}
