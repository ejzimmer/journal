import { Spine, SpineAppearance } from './Spine';

function ignoreClick() {}

export function SpineCopy({
  appearance,
  className,
}: {
  appearance: SpineAppearance;
  className: string;
}) {
  return (
    <div className={className} inert aria-hidden>
      <Spine
        {...appearance}
        titleAriaLabel={appearance.title}
        stampAriaLabel={appearance.glyph}
        onTitleClick={ignoreClick}
        onStampClick={ignoreClick}
      />
    </div>
  );
}
