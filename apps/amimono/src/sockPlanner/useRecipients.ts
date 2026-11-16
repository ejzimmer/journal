import { useStorageContext } from 'shared/FirebaseContext';
import { Recipient, RECIPIENTS_KEY, SockNumbers } from './types';

const compareNames = (first: Recipient, second: Recipient) =>
  first.name.localeCompare(second.name, undefined, { sensitivity: 'base' });

export function useRecipients() {
  const { useValue, setValue, setValues } = useStorageContext();
  const { value: recipientsById, loading } =
    useValue<Record<string, Recipient>>(RECIPIENTS_KEY);

  const recipients = Object.values(recipientsById ?? {}).sort(compareNames);

  const addRecipient = (name: string, euSize: number) => {
    const id = crypto.randomUUID();
    setValue<Recipient>(`${RECIPIENTS_KEY}/${id}`, { id, name, euSize });
  };

  const updateRecipient = (
    id: string,
    fields: Partial<Pick<Recipient, 'name' | 'euSize'>>,
  ) => {
    setValues(
      Object.fromEntries(
        Object.entries(fields).map(([field, value]) => [
          `${RECIPIENTS_KEY}/${id}/${field}`,
          value,
        ]),
      ),
    );
  };

  const overrideSockNumber = (
    id: string,
    field: keyof SockNumbers,
    value: number | null,
  ) => {
    setValues({ [`${RECIPIENTS_KEY}/${id}/overrides/${field}`]: value });
  };

  const deleteRecipient = (id: string) => {
    setValues({ [`${RECIPIENTS_KEY}/${id}`]: null });
  };

  return {
    recipients,
    loading,
    addRecipient,
    updateRecipient,
    overrideSockNumber,
    deleteRecipient,
  };
}
