import { useEffect } from 'react';
import { isEditing, isUndoShortcut } from '../../shared/keyboard';
import { useWorkStorage } from './WorkStorageContext';

export function useUndoSubtaskDeleteShortcut() {
  const { restoreLastDeletedSubtask } = useWorkStorage();

  useEffect(() => {
    const restoreOnUndo = (event: KeyboardEvent) => {
      if (!isUndoShortcut(event) || isEditing(event.target)) return;
      if (restoreLastDeletedSubtask()) event.preventDefault();
    };
    document.addEventListener('keydown', restoreOnUndo);
    return () => document.removeEventListener('keydown', restoreOnUndo);
  }, [restoreLastDeletedSubtask]);
}
