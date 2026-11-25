import { useStorageContext } from 'shared/FirebaseContext';
import { writeJumperPattern } from './jumperPattern';
import { JUMPER_PATTERNS_KEY, JumperInputs, JumperPattern } from './types';

const compareNames = (first: JumperPattern, second: JumperPattern) =>
  first.name.localeCompare(second.name, undefined, { sensitivity: 'base' });

export function useJumperPatterns() {
  const { useValue, setValue } = useStorageContext();
  const { value: patternsById } =
    useValue<Record<string, JumperPattern>>(JUMPER_PATTERNS_KEY);

  const patterns = Object.values(patternsById ?? {}).sort(compareNames);

  const savePattern = (name: string, inputs: JumperInputs) => {
    const id = crypto.randomUUID();
    setValue<JumperPattern>(`${JUMPER_PATTERNS_KEY}/${id}`, {
      id,
      name,
      inputs,
      pieces: writeJumperPattern(inputs),
    });
  };

  return { patterns, savePattern };
}
