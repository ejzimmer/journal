import { JSX } from 'react';
import { ChevronUpIcon } from '../../shared/icons/ChevronUp';
import { ChevronDownIcon } from '../../shared/icons/ChevronDown';
import { IconProps } from '../../shared/icons/types';
import { Recommendation } from '../../shared/types';

const recommendationIcons: Record<
  Recommendation,
  (props: IconProps) => JSX.Element
> = {
  increase: ChevronUpIcon,
  decrease: ChevronDownIcon,
};

const recommendationColours: Record<Recommendation, string> = {
  increase: 'var(--increase)',
  decrease: 'var(--decrease)',
};

export function RecommendationIcon({
  recommendation,
}: {
  recommendation: Recommendation;
}) {
  const Icon = recommendationIcons[recommendation];

  return (
    <span className="recommendation">
      {/* The icon is drawn twice, a thicker white copy under the coloured one,
          to give it an outline. That's simpler than getting the same effect
          from box-shadows or filters. */}
      <Icon width="24px" colour="white" strokeWidth="6" />
      <Icon
        role="img"
        aria-label={recommendation}
        width="24px"
        colour={recommendationColours[recommendation]}
        strokeWidth="4"
      />
    </span>
  );
}
