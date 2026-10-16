import { CallistemonFlowerIcon } from './CallistemonFlowerIcon';
import { SaguaroBlossomIcon } from './SaguaroBlossomIcon';
import { SakuraFlowerIcon } from './SakuraFlowerIcon';
import { WisteriaRacemeIcon } from './WisteriaRacemeIcon';
import { MediaType } from './types';

const ICONS = {
  book: CallistemonFlowerIcon,
  manga: SakuraFlowerIcon,
  youtube: SaguaroBlossomIcon,
  tv: WisteriaRacemeIcon,
};

export function MediaTypeIcon({
  type,
  width,
}: {
  type: MediaType;
  width?: string;
}) {
  const Icon = ICONS[type];
  return <Icon width={width} />;
}
