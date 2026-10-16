import { CallistemonFlowerIcon } from './CallistemonFlowerIcon';
import { MorningGloryIcon } from './MorningGloryIcon';
import { SaguaroBlossomIcon } from './SaguaroBlossomIcon';
import { SakuraFlowerIcon } from './SakuraFlowerIcon';
import { MediaType } from './types';

const ICONS = {
  book: CallistemonFlowerIcon,
  manga: SakuraFlowerIcon,
  youtube: SaguaroBlossomIcon,
  tv: MorningGloryIcon,
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
