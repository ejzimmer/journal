import { FormEvent, useId, useState } from 'react';

import './ProjectEditForm.css';
import { createCardStyle } from '../projects/createCardStyle';
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
  const nameId = useId();
  const [draft, setDraft] = useState(() => createProjectDraft(project));
  const { updateProject, deleteProject } = useProjectActions();
  const classNames = [
    'project-card',
    'project-edit-form',
    'expanded',
    listKey !== 'future' && 'queued',
  ].filter(Boolean);

  const updateDraft = (changes: Partial<ProjectDraft>) =>
    setDraft((currentDraft) => ({ ...currentDraft, ...changes }));

  const saveProject = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.name.trim()) return;
    updateProject(project.id, convertDraftToFields(draft));
    onClose();
  };

  return (
    <li className={classNames.join(' ')} style={createCardStyle(draft.type)}>
      <form onSubmit={saveProject}>
        <div className="project-card-header">
          <img
            className="project-type-icon"
            src={PROJECT_TYPES[draft.type].icon}
            alt=""
          />
          <label htmlFor={nameId} className="visually-hidden">
            Name
          </label>
          <input
            id={nameId}
            className="name-input"
            value={draft.name}
            onChange={(event) => updateDraft({ name: event.target.value })}
            required
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
          <PatternFields draft={draft} onChange={updateDraft} />
          <YarnFieldList
            yarns={draft.yarns}
            onChange={(yarns) => updateDraft({ yarns })}
          />
          <GaugeFields draft={draft} onChange={updateDraft} />
          <EditFormActions
            onCancel={onClose}
            onDelete={() => deleteProject(project.id, listKey)}
          />
        </div>
      </form>
    </li>
  );
}
