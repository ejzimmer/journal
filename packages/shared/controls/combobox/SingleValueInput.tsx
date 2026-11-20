import { XIcon } from '../../icons/X';
import { SearchInput } from './SearchInput';
import { OptionType, SingleValueInputProps } from './types';

export function SingleValueInput<T extends OptionType>({
  value,
  searchInputValue,
  onChangeSearchTerm,
  isPopoverOpen,
  children,
  onClear,
  clearLabel,
  ...searchInputProps
}: SingleValueInputProps<T>) {
  const isShowingValue = !isPopoverOpen && !!(children || value);

  return (
    <div
      className={`single-value-container${isShowingValue ? ' showing-value' : ''}${onClear ? ' clearable' : ''}`}
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
      {onClear && value && (
        <button
          type="button"
          className="clear"
          aria-label={clearLabel}
          title={clearLabel}
          onClick={onClear}
        >
          <XIcon width="12" />
        </button>
      )}
      {isShowingValue && (
        <div className="value">{children ?? value?.label}</div>
      )}
    </div>
  );
}
