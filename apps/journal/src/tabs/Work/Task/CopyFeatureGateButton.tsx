import { useEffect, useRef, useState } from 'react';
import { ClipboardIcon } from 'shared/icons/Clipboard';

const TICK_DURATION_MS = 1500;

type CopyState = 'idle' | 'copied' | 'resetting';

type CopyFeatureGateButtonProps = {
  featureGateName: string;
};

export function CopyFeatureGateButton({
  featureGateName,
}: CopyFeatureGateButtonProps) {
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const buttonRef = useRef<HTMLButtonElement>(null);
  const resetTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(resetTimeout.current), []);

  useEffect(() => {
    if (copyState !== 'resetting') return;

    // Firefox doesn't always repaint the icon if it morphs back while the
    // button is at opacity 0, so the button stays visible until the morph ends
    const animations = buttonRef.current?.getAnimations?.({ subtree: true });
    const finishResetting = () =>
      setCopyState((state) => (state === 'resetting' ? 'idle' : state));
    Promise.all(animations?.map((animation) => animation.finished) ?? []).then(
      finishResetting,
      finishResetting,
    );
  }, [copyState]);

  const copyFeatureGateName = async () => {
    await navigator.clipboard.writeText(featureGateName);
    setCopyState('copied');
    clearTimeout(resetTimeout.current);
    resetTimeout.current = setTimeout(
      () => setCopyState('resetting'),
      TICK_DURATION_MS,
    );
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      className={`add-metadata ghost ${copyState !== 'idle' ? 'copied' : ''}`}
      aria-label={`Copy ${featureGateName}`}
      onClick={copyFeatureGateName}
    >
      <ClipboardIcon width="18px" showTick={copyState === 'copied'} />
    </button>
  );
}
