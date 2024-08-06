import { Box, BoxProps, Input } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";

interface Props extends Omit<BoxProps, "onChange"> {
  onChange: (text: string) => void;
  children: string;
}

export function EditableText({ children, onChange, ...style }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const startEditing = () => setIsEditing(true);
  const stopEditing = () => setIsEditing(false);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing, inputRef]);

  const handleSubmit = () => {
    const value = inputRef.current?.value ?? "";
    if (value !== children) {
      onChange(value);
    }

    stopEditing();
  };

  return isEditing ? (
    <form>
      <Input
        aria-label={`Edit ${children}`}
        ref={inputRef}
        onBlur={handleSubmit}
        defaultValue={children}
        {...style}
      />
      <button type="submit" style={{ display: "none" }}>
        Save title
      </button>
    </form>
  ) : (
    <Box {...style} tabIndex={0} onFocus={startEditing} onClick={startEditing}>
      {children}
      <button type="button" onClick={startEditing}>
        Edit {children}
      </button>
    </Box>
  );
}
