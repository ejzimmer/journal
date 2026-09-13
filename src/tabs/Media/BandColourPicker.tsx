import { CSSProperties } from "react"
import { BAND_COLOURS } from "./bandHue"

import "./BandColourPicker.css"

export function BandColourPicker({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (hue: number) => void
}) {
  return (
    <div className="band-colour-picker">
      <span className="label">{label}</span>
      <div className="swatches">
        {BAND_COLOURS.map((colour) => (
          <button
            key={colour.hue}
            type="button"
            className="swatch"
            style={{ "--hue": colour.hue } as CSSProperties}
            aria-pressed={value === colour.hue}
            aria-label={colour.name}
            title={colour.name}
            onClick={() => onChange(colour.hue)}
          />
        ))}
      </div>
    </div>
  )
}
