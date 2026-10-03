import {
  CSSProperties,
  Ref,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { useFormToggle } from './useFormToggle';
import './EditableText.css';

export type EditableTextHandle = {
  focus: () => void;
};

export type EditableTextProps = {
  ref?: Ref<EditableTextHandle>;
  value: string;
  onChange: (text: string) => void;
  onDelete?: () => void;
  label: string;
  style?: CSSProperties;
  className?: string;
};

const measureStyle: CSSProperties = {
  position: 'absolute',
  visibility: 'hidden',
  height: 0,
  overflow: 'hidden',
  whiteSpace: 'pre',
};

function copyTextStyles(from: HTMLElement, to: HTMLElement) {
  const { fontFamily, fontSize, fontStyle, fontWeight, letterSpacing } =
    getComputedStyle(from);
  Object.assign(to.style, {
    fontFamily,
    fontSize,
    fontStyle,
    fontWeight,
    letterSpacing,
  });
}

export function EditableText({
  ref,
  value,
  onChange,
  onDelete,
  label,
  style,
  className = '',
}: EditableTextProps) {
  const {
    isFormOpen: isEditing,
    triggerRef: displayRef,
    openForm: startEditing,
    closeForm: stopEditing,
    openFormOnEnterOrSpace,
  } = useFormToggle<HTMLDivElement>();
  const [text, setText] = useState(value);
  const [inputWidth, setInputWidth] = useState<number>();
  const inputRef = useRef<HTMLInputElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => displayRef.current?.focus(),
  }));

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing, inputRef]);

  useLayoutEffect(() => {
    const input = inputRef.current;
    const measure = measureRef.current;
    if (!isEditing || !input || !measure) return;

    copyTextStyles(input, measure);
    setInputWidth(measure.scrollWidth + 12);
  }, [isEditing, text]);

  const handleSubmit = () => {
    if (value && !text && onDelete) {
      onDelete();
    } else if (value !== text) {
      onChange(text);
    }

    stopEditing();
  };

  return isEditing ? (
    <>
      <span ref={measureRef} aria-hidden="true" style={measureStyle}>
        {text || ' '}
      </span>
      <input
        className={`editable-text ${className}`}
        ref={inputRef}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            handleSubmit();
            event.preventDefault();
          } else if (event.key === 'Escape') {
            setText(value);
            stopEditing();
          }
        }}
        onChange={(event) => setText(event.target.value)}
        value={text}
        aria-label={label}
        style={{ fontSize: '.8em', ...style, width: inputWidth }}
      />
    </>
  ) : (
    <div
      ref={displayRef}
      role="button"
      tabIndex={0}
      aria-label={label}
      onClick={startEditing}
      onKeyDown={openFormOnEnterOrSpace}
      style={style}
      className={className}
    >
      {value}
    </div>
  );
}
