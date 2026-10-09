import { ReactNode, useEffect, useRef, useState } from 'react';
import { CloudShape } from './CloudShape';

export function CloudFrame({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ width: number; height: number }>();

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const measureSize = () =>
      setSize({ width: element.offsetWidth, height: element.offsetHeight });
    measureSize();

    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measureSize);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="cloud-frame">
      {size && <CloudShape width={size.width} height={size.height} />}
      {children}
    </div>
  );
}
