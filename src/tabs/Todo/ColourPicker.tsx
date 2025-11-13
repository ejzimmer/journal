import { useRef } from "react";

import "./ColourPicker.css";

type ColourPickerProps = {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  options: string[];
};

export function ColourPicker({ value, onChange, options }: ColourPickerProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <button
        aria-label={label}
        onClick={() => popoverRef.current?.togglePopover()}
      >
        <Swatch colour={value ?? options[0]} />
      </button>
      <div className="colour-picker-popover" ref={popoverRef} popover="manual">
        {options.map((o) => (
          <button
            key={o}
            className="ghost colour-option"
            style={{ opacity: 1 }}
            onClick={() => {
              onChange(o);
              popoverRef.current?.hidePopover();
            }}
          >
            <Swatch key={o} colour={o} />
          </button>
        ))}
      </div>
    </>
  );
}

function Swatch({ colour }: { colour: string }) {
  return (
    <div
      aria-label={colour}
      className={`swatch ${colour}`}
      style={{ width: "20px", height: "20px" }}
    ></div>
  );
}
