import { SearchInput } from './SearchInput';
import { OptionType, SingleValueInputProps } from './types';

export function SingleValueInput<T extends OptionType>({
  value,
  searchInputValue,
  onChangeSearchTerm,
  isPopoverOpen,
  children,
  ...searchInputProps
}: SingleValueInputProps<T>) {
  const isShowingValue = !isPopoverOpen && !!(children || value);

  return (
    <div
      className={`single-value-container${isShowingValue ? ' showing-value' : ''}`}
    >
      <SearchInput
        isPopoverOpen={isPopoverOpen}
        value={searchInputValue}
        onChange={onChangeSearchTerm}
        {...searchInputProps}
      />
      <label
        className="arrow"
        htmlFor={searchInputProps.id}
        aria-hidden
        data-testid="arrow"
      />
      {isShowingValue && (
        <div className="value">{children ?? value?.label}</div>
      )}
    </div>
  );
}
