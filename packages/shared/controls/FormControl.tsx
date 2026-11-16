import { forwardRef, InputHTMLAttributes, useId } from 'react';
import './FormControl.css';
import { XIcon } from '../icons/X';

type FormControlProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange' | 'defaultValue' | 'id' | 'className'
> & {
  label: string | React.ReactElement;
  value?: string;
  onChange?: (value: string) => void;
  errors?: string[] | false;
  defaultValue?: string;
  hideLabel?: boolean;
  inputClass?: string;
};

export const FormControl = forwardRef<HTMLInputElement, FormControlProps>(
  (
    {
      label,
      defaultValue,
      value,
      onChange,
      type = 'text',
      errors,
      hideLabel,
      inputClass,
      ...props
    },
    ref,
  ) => {
    const inputId = useId();
    const descriptionId = useId();

    return (
      <div className={`form-control ${errors ? 'error' : ''}`}>
        {!hideLabel && <label htmlFor={inputId}>{label}</label>}
        <input
          type={type}
          id={inputId}
          aria-label={hideLabel ? label.toString() : undefined}
          aria-describedby={descriptionId}
          ref={ref}
          defaultValue={defaultValue}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          className={inputClass}
          {...props}
        />
        {errors && (
          <div
            id={descriptionId}
            style={{ display: 'flex', flexDirection: 'column' }}
          >
            {errors.map((error) => (
              <div key={error} className="validation-error">
                <XIcon width="18px" />
                {error}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  },
);
