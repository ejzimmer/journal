import { CSSProperties, useId } from "react"
import { BAND_COLOURS } from "./bandHue"

import "./BandColourPicker.css"

export function BandColourPicker({
  label,
  value,
  onChange,
}: {
  label: string
  value?: number
  onChange: (hue: number) => void
}) {
  const name = useId()

  return (
    <fieldset className="band-colour-picker">
      <legend>{label}</legend>
      <div className="swatches">
        {BAND_COLOURS.map((colour) => (
          <label
            key={colour.hue}
            className="swatch"
            style={{ "--hue": colour.hue } as CSSProperties}
          >
            <input
              type="radio"
              name={name}
              aria-label={colour.name}
              checked={value === colour.hue}
              onChange={() => onChange(colour.hue)}
            />
          </label>
        ))}
      </div>
    </fieldset>
  )
}
