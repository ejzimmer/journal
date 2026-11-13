import { Spine, SpineAppearance } from './Spine';

function ignoreClick() {}

type SpineCopyProps = {
  appearance: SpineAppearance;
  className: string;
};

export function SpineCopy({ appearance, className }: SpineCopyProps) {
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
