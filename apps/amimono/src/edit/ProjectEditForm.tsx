import { FormEvent, useState } from 'react';
import { FormControl } from 'shared/controls/FormControl';

import './ProjectEditForm.css';
import { createCardStyle } from '../projects/createCardStyle';
import { NON_BLANK_PATTERN } from '../projects/nonBlankPattern';
import { PROJECT_TYPES } from '../projects/projectTypes';
import { ListKey, Project } from '../projects/types';
import { useProjectActions } from '../projects/useProjectActions';
import { CraftPicker } from './CraftPicker';
import { EditFormActions } from './EditFormActions';
import { GaugeFields } from './GaugeFields';
import { PatternFields } from './PatternFields';
import {
  convertDraftToFields,
  createProjectDraft,
  ProjectDraft,
} from './projectDraft';
import { TypePicker } from './TypePicker';
import { YarnFieldList } from './YarnFieldList';

type ProjectEditFormProps = {
  project: Project;
  listKey: ListKey;
  onClose: () => void;
};

export function ProjectEditForm({
  project,
  listKey,
  onClose,
}: ProjectEditFormProps) {
  const [draft, setDraft] = useState(() => createProjectDraft(project));
  const { updateProject, deleteProject } = useProjectActions();

  const updateDraft = (changes: Partial<ProjectDraft>) =>
    setDraft((currentDraft) => ({ ...currentDraft, ...changes }));

  const saveProject = (event: FormEvent) => {
    event.preventDefault();
    updateProject(project.id, convertDraftToFields(draft));
    onClose();
  };

  return (
    <li
      className="project-card project-edit-form expanded"
      style={createCardStyle(draft.type)}
    >
      <form aria-label="Edit project" onSubmit={saveProject}>
        <div className="project-card-header">
          <img
            className="project-type-icon"
            src={PROJECT_TYPES[draft.type].icon}
            alt=""
          />
          <FormControl
            label="Name"
            hideLabel
            inputClass="name-input"
            value={draft.name}
            onChange={(name) => updateDraft({ name })}
            required
            pattern={NON_BLANK_PATTERN}
            autoFocus
          />
        </div>
        <div className="edit-fields">
          <CraftPicker
            craft={draft.craft}
            onChange={(craft) => updateDraft({ craft })}
          />
          <TypePicker
            type={draft.type}
            onChange={(type) => updateDraft({ type })}
          />
          <PatternFields
            pattern={draft.pattern}
            onChange={(pattern) => updateDraft({ pattern })}
          />
          <YarnFieldList
            yarns={draft.yarns}
            onChange={(yarns) => updateDraft({ yarns })}
          />
          <GaugeFields
            gauge={draft.gauge}
            onChange={(gauge) => updateDraft({ gauge })}
          />
          <EditFormActions
            onCancel={onClose}
            onDelete={() => deleteProject(project.id, listKey)}
          />
        </div>
      </form>
    </li>
  );
}
