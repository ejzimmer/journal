import { Recommendation } from '../../shared/types';
import { ChevronUpIcon } from '../../shared/icons/ChevronUp';
import { ChevronDownIcon } from '../../shared/icons/ChevronDown';
import { MinusIcon } from '../../shared/icons/Minus';

export type RecommendationOption = Recommendation | 'no change';

type RecommendationOptionIconProps = { value: RecommendationOption };

export function RecommendationOptionIcon({
  value,
}: RecommendationOptionIconProps) {
  if (value === 'increase') {
    return <ChevronUpIcon role="img" aria-label={value} />;
  }
  if (value === 'decrease') {
    return <ChevronDownIcon role="img" aria-label={value} />;
  }
  return <MinusIcon role="img" aria-label={value} />;
}
