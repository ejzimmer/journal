import { LANGUAGE_FLAGS, LANGUAGE_NAMES } from './names';
import { TooltipOption } from './TooltipOption';
import { Language } from './types';

export function LanguageOption({ value }: { value: Language }) {
  return (
    <TooltipOption
      icon={
        <span className="flag" aria-hidden="true">
          {LANGUAGE_FLAGS[value]}
        </span>
      }
      label={LANGUAGE_NAMES[value]}
    />
  );
}
