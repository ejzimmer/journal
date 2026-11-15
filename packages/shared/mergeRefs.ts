import { Ref, RefCallback } from 'react';

function attachRef<T>(ref: Ref<T> | undefined, value: T): () => void {
  if (typeof ref === 'function') {
    const cleanup = ref(value);
    return typeof cleanup === 'function' ? cleanup : () => ref(null);
  }
  if (ref) {
    ref.current = value;
    return () => {
      ref.current = null;
    };
  }
  return () => {};
}

export function mergeRefs<T>(...refs: (Ref<T> | undefined)[]): RefCallback<T> {
  return (value) => {
    if (value === null) return;

    const cleanups = refs.map((ref) => attachRef(ref, value));
    return () => cleanups.forEach((cleanup) => cleanup());
  };
}
