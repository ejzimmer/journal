import { useStorageContext } from 'shared/FirebaseContext';
import { Project } from '../projects/types';
import { calculateSockNumbers } from './sockNumbers';
import { Recipient, RECIPIENTS_KEY } from './types';

export function useRecipientSockNumbers({ recipientId, gauge }: Project) {
  const { useValue } = useStorageContext();
  const { value: recipient } = useValue<Recipient>(
    recipientId ? `${RECIPIENTS_KEY}/${recipientId}` : undefined,
  );

  if (!recipientId || !recipient) return undefined;
  return calculateSockNumbers(recipient, gauge?.stitches);
}
