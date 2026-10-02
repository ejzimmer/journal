import { EditItemForm } from './EditItemForm';
import { TextField } from './TextField';
import { readText } from './fields';
import { LANGUAGE_NAMES } from './names';
import { Language, LanguageMedia, LANGUAGES } from './types';

export function EditMediaForm({
  media,
  onChange,
}: {
  media: LanguageMedia;
  onChange: (changes: Partial<LanguageMedia>) => void;
}) {
  return (
    <EditItemForm
      name={media.name}
      onSubmit={(data) =>
        onChange({
          name: readText(data, 'name') ?? media.name,
          language: data.get('language') as Language,
        })
      }
    >
      <TextField
        label="Name"
        name="name"
        defaultValue={media.name}
        isRequired
      />
      <label>
        Language
        <select name="language" defaultValue={media.language}>
          {LANGUAGES.map((language) => (
            <option key={language} value={language}>
              {LANGUAGE_NAMES[language]}
            </option>
          ))}
        </select>
      </label>
    </EditItemForm>
  );
}
