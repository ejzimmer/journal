import { useState } from 'react';
import { FormControl } from '../../../shared/controls/FormControl';
import { TickIcon } from '../../../shared/icons/Tick';

export function ApiKeyForm({
  onSubmit,
}: {
  onSubmit: (apiKey: string) => void;
}) {
  const [apiKey, setApiKey] = useState('');

  return (
    <form
      className="wanikani-api-key-form"
      onSubmit={(event) => {
        event.preventDefault();
        if (apiKey.trim()) onSubmit(apiKey.trim());
      }}
    >
      <FormControl
        label="WaniKani API key"
        type="password"
        value={apiKey}
        onChange={setApiKey}
      />
      <button type="submit" className="ghost" aria-label="Save">
        <TickIcon width="24px" colour="var(--success-colour)" />
      </button>
    </form>
  );
}
