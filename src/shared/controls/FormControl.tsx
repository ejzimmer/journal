import { forwardRef, useId } from "react"
import "./FormControl.css"
import { XIcon } from "../icons/X"

type FormControlProps = {
  label: string | React.ReactElement
  value?: string
  onChange?: (value: string) => void
  errors?: string[] | false
  type?: HTMLInputElement["type"]
  size?: HTMLInputElement["size"]
}

export const FormControl = forwardRef<HTMLInputElement, FormControlProps>(
  ({ label, value, onChange, type = "text", errors, ...props }, ref) => {
    const inputId = useId()
    const descriptionId = useId()

    return (
      <div className={`form-control ${errors ? "error" : ""}`}>
        <label htmlFor={inputId}>{label}</label>
        <input
          type={type}
          id={inputId}
          aria-describedby={descriptionId}
          ref={ref}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          {...props}
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
