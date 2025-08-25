import { forwardRef, useId } from "react"
import "./FormControl.css"
import { XIcon } from "../icons/X"

type FormControlProps = {
  label: string | React.ReactElement
  value?: string
  onChange?: (value: string) => void
  errors?: string[] | false
}

export const FormControl = forwardRef<HTMLInputElement, FormControlProps>(
  ({ label, value, onChange, errors }, ref) => {
    const inputId = useId()
    const descriptionId = useId()

    return (
      <div className={`form-control ${errors ? "error" : ""}`}>
        <label htmlFor={inputId}>{label}</label>
        <input
          id={inputId}
          aria-describedby={descriptionId}
          ref={ref}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
        />
        {errors && (
          <div
            id={descriptionId}
            style={{ display: "flex", flexDirection: "column" }}
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
    )
  }
)
