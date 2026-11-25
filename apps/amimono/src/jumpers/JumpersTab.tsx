import { useState } from 'react';
import { convertDraftToInputs, EMPTY_JUMPER_DRAFT } from './jumperDraft';
import { JumperMeasurementsForm } from './JumperMeasurementsForm';
import { writeJumperPattern } from './jumperPattern';
import { PatternPieces } from './PatternPieces';
import { SavedPatterns } from './SavedPatterns';
import { SavePatternForm } from './SavePatternForm';
import { useJumperPatterns } from './useJumperPatterns';

import './JumpersTab.css';

export function JumpersTab() {
  const [draft, setDraft] = useState(EMPTY_JUMPER_DRAFT);
  const { patterns, savePattern } = useJumperPatterns();
  const inputs = convertDraftToInputs(draft);

  return (
    <div className="jumpers-tab">
      <section className="jumper-drafter" aria-label="New pattern">
        <JumperMeasurementsForm draft={draft} onChange={setDraft} />
        {inputs && (
          <div className="generated-pattern">
            <PatternPieces pieces={writeJumperPattern(inputs)} />
            <SavePatternForm onSave={(name) => savePattern(name, inputs)} />
          </div>
        )}
      </section>
      <SavedPatterns patterns={patterns} />
    </div>
  );
}
