import { ClipboardIcon } from '../../../shared/icons/Clipboard';

type CopyFeatureGateButtonProps = {
  featureGateName: string;
};

export function CopyFeatureGateButton({
  featureGateName,
}: CopyFeatureGateButtonProps) {
  return (
    <button
      type="button"
      className="add-metadata ghost"
      aria-label={`Copy ${featureGateName}`}
      onClick={() => navigator.clipboard.writeText(featureGateName)}
    >
      <ClipboardIcon width="18px" />
    </button>
  );
}
