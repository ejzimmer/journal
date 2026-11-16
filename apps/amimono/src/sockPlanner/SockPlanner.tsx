import { AddRecipientForm } from './AddRecipientForm';
import { RecipientRow } from './RecipientRow';
import { useRecipients } from './useRecipients';

import './SockPlanner.css';

export function SockPlanner() {
  const {
    recipients,
    addRecipient,
    updateRecipient,
    overrideSockNumber,
    deleteRecipient,
  } = useRecipients();

  return (
    <section className="sock-planner" aria-label="Sock planner">
      <table>
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Size</th>
            <th scope="col">Length</th>
            <th scope="col">Cast-on stitches</th>
            <th scope="col">Start toe at</th>
            <td />
          </tr>
        </thead>
        <tbody>
          {recipients.map((recipient) => (
            <RecipientRow
              key={recipient.id}
              recipient={recipient}
              onUpdate={(fields) => updateRecipient(recipient.id, fields)}
              onOverride={(field, value) =>
                overrideSockNumber(recipient.id, field, value)
              }
              onDelete={() => deleteRecipient(recipient.id)}
            />
          ))}
        </tbody>
      </table>
      <AddRecipientForm onAdd={addRecipient} />
    </section>
  );
}
