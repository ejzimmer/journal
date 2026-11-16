import {
  CSSProperties,
  Ref,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useFormToggle } from './useFormToggle';
import { mergeRefs } from '../mergeRefs';
import './EditableText.css';

export type EditableTextHandle = {
  focus: () => void;
};

type EditableTextProps = {
  ref?: Ref<EditableTextHandle>;
  elementRef?: Ref<HTMLElement>;
  value: string;
  onChange: (text: string) => void;
  onDelete?: () => void;
  label: string;
  style?: CSSProperties;
  className?: string;
};

export function EditableText({
  ref,
  elementRef,
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
  const mergedInputRef = useMemo(
    () => mergeRefs(inputRef, elementRef),
    [elementRef],
  );
  const mergedDisplayRef = useMemo(
    () => mergeRefs(displayRef, elementRef),
    [displayRef, elementRef],
  );

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
      ref={mergedInputRef}
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
      ref={mergedDisplayRef}
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
