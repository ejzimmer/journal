import { MediaTypeIcon } from './MediaTypeIcon';
import { MEDIA_TYPE_NAMES } from './names';
import { TooltipOption } from './TooltipOption';
import { MediaType } from './types';

export function MediaTypeOption({ value }: { value: MediaType }) {
  return (
    <TooltipOption
      icon={<MediaTypeIcon type={value} width="34px" />}
      label={MEDIA_TYPE_NAMES[value]}
    />
  );
}
