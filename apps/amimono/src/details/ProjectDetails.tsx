import './ProjectDetails.css';
import { Project } from '../projects/types';
import { sortByPosition } from '../projects/sortByPosition';
import { GaugeSummary } from './GaugeSummary';
import { YarnSummary } from './YarnSummary';

type ProjectDetailsProps = {
  project: Project;
};

export function ProjectDetails({ project }: ProjectDetailsProps) {
  const { pattern, yarns, gauge } = project;
  const patternName = pattern?.name || pattern?.url;

  return (
    <div className="project-details">
      {patternName &&
        (pattern?.url ? (
          <a href={pattern.url} target="_blank" rel="noreferrer">
            {patternName}
          </a>
        ) : (
          <span>{patternName}</span>
        ))}
      {yarns && (
        <div className="yarns">
          {sortByPosition(Object.values(yarns)).map((yarn) => (
            <YarnSummary key={yarn.id} yarn={yarn} />
          ))}
        </div>
      )}
      {gauge && <GaugeSummary gauge={gauge} />}
    </div>
  );
}
