import { Input, chakra } from "@chakra-ui/react";
import { forwardRef, useEffect, useRef } from "react";
import { ColouredButton } from "./style";

type Props = {
  onCancel: () => void;
  onSubmit: (description: string) => void;
  label: string;
};

export const NewTaskForm = forwardRef<HTMLInputElement, Props>(
  function NewTaskForm({ onCancel, onSubmit, label }, ref) {
    const formRef = useRef<HTMLFormElement>(null);
    const localInputRef = useRef<HTMLInputElement>(null);
    const inputRef = ref ?? localInputRef;

    useEffect(() => {
      const handleClick = (event: MouseEvent) => {
        const clickedOutside = !formRef.current?.contains(event.target as Node);
        if (!clickedOutside) return;

        // nfi how to deal with functionr refs
        if (typeof inputRef === "function") return;

        if (inputRef.current?.value) {
          handleSubmit();
        } else {
          onCancel();
        }
      };
      window.addEventListener("click", handleClick);

      return () => window.removeEventListener("click", handleClick);
    });

    const handleSubmit = () => {
      // nfi how to deal with functionr refs
      if (typeof inputRef === "function") return;

      const description = inputRef.current?.value;

      description && onSubmit(description);
      formRef.current?.reset();
    };

    return (
      <chakra.form
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit();
        }}
        ref={formRef}
        display="flex"
        padding=".25em"
        gap=".25em"
        aria-label="New task"
      >
        <Input ref={inputRef} aria-label={label} {...inputStyleProps} />
        <AddButton />
      </chakra.form>
    );
  }
);

function AddButton() {
  return (
    <ColouredButton type="submit" aria-label="Add" paddingX="0">
      <svg viewBox="0 0 100 100" height="100%">
        <path
          d="M10,60 L38 85, 85 20"
          stroke="hsl(180 50% 40%)"
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </ColouredButton>
  );
}

function CancelButton({ onClick }: { onClick: () => void }) {
  return (
    <ColouredButton aria-label="Cancel" onClick={onClick} paddingX="0">
      <svg
        viewBox="0 0 100 100"
        height="100%"
        stroke="hsl(0 50% 50%)"
        strokeWidth="10"
        strokeLinecap="round"
      >
        <path d="M20,20 L80 80" />
        <path d="M20, 80 L80 20" />
      </svg>
    </ColouredButton>
  );
}

const inputStyleProps = {
  backgroundColor: "hsl(0 0% 100% / 0.5)",
  height: "var(--input-height)",
  borderColor: "transparent",
  borderWidth: "2px",
  _hover: {
    borderColor:
      "color-mix(in hsl shorter hue, var(--colour), hsl(300 0% 25%))",
  },
  _focus: {
    borderColor:
      "color-mix(in hsl shorter hue, var(--colour), hsl(300 0% 25%))",
    outline: "none",
    boxShadow: "none",
  },
  color: "rgb(26, 32, 44)",
  paddingTop: ".25em",
};

const newTaskButtonStyles = {
  marginX: ".5em",
  marginY: ".4em",
  paddingLeft: ".5em",
  paddingTop: ".25em",
};
