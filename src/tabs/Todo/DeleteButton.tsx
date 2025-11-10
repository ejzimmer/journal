import { XIcon } from "../../shared/icons/X";

type DeleteButtonProps = {
  onDelete: () => void;
};
export function DeleteButton({ onDelete }: DeleteButtonProps) {
  return (
    <button onClick={onDelete} className="ghost">
      <XIcon width="16px" />
    </button>
  );
}
