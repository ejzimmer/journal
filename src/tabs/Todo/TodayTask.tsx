import { EditableText } from "../../shared/controls/EditableText";
import { DeleteButton } from "./DeleteButton";
import { Task } from "./types";

import "./TodayTask.css";

export function TodayTask({
  task,
  onChange,
  onDelete,
}: {
  task: Task;
  onChange: (task: Task) => void;
  onDelete: () => void;
}) {
  const handleStatusChange = () => {
    if (task.status === "done") {
      onChange({ ...task, status: "ready" });
    } else {
      onChange({ ...task, status: "done" });
    }
  };

  return (
    <div className={`today-task status-${task.status}`}>
      <div className="button-edge">
        <div className="button-surface">
          <span>
            <input
              type="checkbox"
              onChange={handleStatusChange}
              checked={task.status === "done" || task.status === "finished"}
            />
            {task.category.emoji}
            <EditableText
              label="description"
              onChange={(description) => onChange({ ...task, description })}
            >
              {task.description}
            </EditableText>
            <DeleteButton onDelete={onDelete} />
          </span>
        </div>
      </div>
    </div>
  );
}
