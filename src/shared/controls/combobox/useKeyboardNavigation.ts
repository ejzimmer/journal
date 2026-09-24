import { useState } from 'react';
import { OptionType } from './types';

export function useKeyboardNavigation<T extends OptionType>({
  value,
  options,
  onChange,
}: {
  value?: T;
  options: T[];
  onChange: (value: T) => void;
}) {
  const [navigatedOption, setNavigatedOption] = useState<T>();
  if (navigatedOption && !options.includes(navigatedOption)) {
    setNavigatedOption(undefined);
  }

  const highlightedOption =
    navigatedOption ?? options.find((option) => option.id === value?.id);

  const onArrowKeyDown = (direction: 'up' | 'down') => {
    const highlightedIndex = options.findIndex((o) => o === highlightedOption);
    const nextIndex =
      direction === 'up'
        ? Math.max(highlightedIndex, 0) - 1 + options.length
        : highlightedIndex + 1;
    const nextOption = options[nextIndex % options.length];

    onChange(nextOption);
    setNavigatedOption(nextOption);
  };

  return { highlightedOption, onArrowKeyDown };
}
