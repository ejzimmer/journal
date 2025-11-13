import { ReactNode, useState } from "react";
import { Combobox } from "../../shared/controls/combobox/Combobox";
import { Category } from "./types";
import { ColourPicker } from "./ColourPicker";
import { COLOURS } from "../../shared/TaskList/types";

export type CategoryControlProps = {
  value?: Category;
  onChange: (value?: Category) => void;
  options: Category[];
};

export function CategoryControl({
  value,
  options,
  onChange,
}: CategoryControlProps) {
  const [text, setText] = useState<string>("");
  const [emoji, setEmoji] = useState<string>("");
  const [colour, setColour] = useState<(typeof COLOURS)[number]>(COLOURS[0]);

  const handleChangeText = (option: Category) => {
    if (option.emoji) {
      onChange(option);
      setText("");
    } else {
      onChange(undefined);
      setText(option.text);
    }
  };

  const handleSubmit = () => {
    onChange({ text, emoji, colour });
  };

  return (
    <div onKeyDown={handleSubmit}>
      {value || (!value && !text) ? (
        <Combobox
          createOption={(text) => ({ text, emoji: "", colour })}
          label="Category"
          onChange={handleChangeText}
          options={options}
          value={text ? { text: text, emoji: "", colour } : value}
          Option={CategoryOption}
        />
      ) : (
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            aria-label="Text"
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
          <input
            aria-label="Emoji"
            value={emoji}
            onChange={(event) => setEmoji(event.target.value)}
          />
          <ColourPicker
            label="Category colour"
            options={[...COLOURS]}
            onChange={(colour) => setColour(colour)}
          />
          <button onClick={handleSubmit}>Create</button>
          <button>Cancel</button>
        </div>
      )}
    </div>
  );
}

function CategoryOption({
  option,
  children,
}: {
  option: Category;
  children?: ReactNode;
}) {
  return (
    <>
      {option.emoji} {option.text}
      {children}
    </>
  );
}
