import {
  CSSProperties,
  Ref,
  useEffect,
  useImperativeHandle,
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
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => displayRef.current?.focus(),
  }));

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing, inputRef]);

  const handleSubmit = () => {
    if (value && !text && onDelete) {
      onDelete();
    } else if (value !== text) {
      onChange(text);
    }

    stopEditing();
  };

  return isEditing ? (
    <textarea
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
      onChange={(event) => setText(event.target.value.replace(/\n/g, ''))}
      value={text}
      aria-label={label}
      style={{ fontSize: '.8em', ...style }}
    />
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
