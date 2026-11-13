import { useEffect, useRef, useState } from 'react';
import { ClipboardIcon } from 'shared/icons/Clipboard';

const TICK_DURATION_MS = 1500;

type CopyFeatureGateButtonProps = {
  featureGateName: string;
};

export function CopyFeatureGateButton({
  featureGateName,
}: CopyFeatureGateButtonProps) {
  const [isCopied, setIsCopied] = useState(false);
  const resetTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(resetTimeout.current), []);

  const copyFeatureGateName = async () => {
    await navigator.clipboard.writeText(featureGateName);
    setIsCopied(true);
    clearTimeout(resetTimeout.current);
    resetTimeout.current = setTimeout(
      () => setIsCopied(false),
      TICK_DURATION_MS,
    );
  };

  return (
    <button
      type="button"
      className="add-metadata ghost"
      aria-label={`Copy ${featureGateName}`}
      onClick={copyFeatureGateName}
    >
      <ClipboardIcon width="18px" showTick={isCopied} />
    </button>
  );
}
