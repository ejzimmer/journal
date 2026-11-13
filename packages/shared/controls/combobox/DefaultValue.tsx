import { ReactNode } from 'react';
import { OptionType } from './types';

type DefaultValueProps<T extends OptionType> = {
  value: T;
  children?: ReactNode;
};

export function DefaultValue<T extends OptionType>({
  value,
  children,
}: DefaultValueProps<T>) {
  return (
    <>
      {value.label} {children}
    </>
  );
}
