import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogOverlay,
  Button,
  HStack,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { Checkbox } from "./Checkbox";
import { EditableText } from "./EditableText";
import { NewTaskForm } from "./NewTaskForm";
import { TaskList } from "./TaskList";
import { TaskMetadata } from "./types";
import { useTaskMutators } from "../../shared/TaskContext";

type Props = {
  task: TaskMetadata;
};

export function Task({ task: { id, isDone, description, tasks } }: Props) {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const newTaskRef = useRef<HTMLInputElement>(null);

  const { changeDescription, changeDone, deleteTask, addSubTask } =
    useTaskMutators(id);

  useEffect(() => {
    if (showAddTaskForm) {
      newTaskRef.current?.focus();
    }
  }, [showAddTaskForm]);

  return (
    <li
      style={{
        display: "flex",
        alignItems: "center",
        paddingLeft: "1em",
        cursor: "pointer",
        opacity: isDone ? ".6" : 1,
      }}
    >
      <Checkbox
        label={`${description} done`}
        isChecked={isDone}
        onChange={(event) => {
          changeDone(event.target.checked);
        }}
      />
      <EditableText
        defaultValue={description}
        onChange={changeDescription}
        paddingStart=".25em"
        marginStart=".25em"
        paddingTop=".3em"
        paddingBottom=".1em"
        height="unset"
        textDecoration={isDone ? "line-through" : "none"}
      >
        {description}
      </EditableText>
      {(!Array.isArray(tasks) || tasks.length === 0) && !showAddTaskForm && (
        <Button
          aria-label={`Add subtasks to ${description}`}
          onClick={() => {
            setShowAddTaskForm(true);
          }}
        >
          +
        </Button>
      )}

      <Button
        aria-label={`Delete task: ${description}`}
        onClick={() => setShowDeleteConfirmation(true)}
        backgroundColor="transparent"
        opacity=".6"
        _hover={{
          backgroundColor: "transparent",
          opacity: 1,
        }}
        _active={{
          backgroundColor: "transparent",
          opacity: 1,
        }}
        transform="opacity .2s"
      >
        🗑️
      </Button>
      <TaskList tasks={tasks} />
      {showAddTaskForm && (
        <NewTaskForm
          label={`New subtask for ${description}`}
          onSubmit={addSubTask}
          onCancel={() => setShowAddTaskForm(false)}
          ref={newTaskRef}
        />
      )}
      <ConfirmDelete
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        task={description}
        onDelete={deleteTask}
      />
    </li>
  );
}

function ConfirmDelete({
  isOpen,
  onClose,
  task,
  onDelete,
}: {
  isOpen: boolean;
  onClose: () => void;
  task: string;
  onDelete: () => void;
}) {
  const noRef = useRef<HTMLButtonElement>(null);

  return (
    <AlertDialog isOpen={isOpen} leastDestructiveRef={noRef} onClose={onClose}>
      <AlertDialogOverlay>
        <AlertDialogContent width="max-content">
          <AlertDialogBody mt="4">
            Are you sure you want to delete {task}?
          </AlertDialogBody>

          <AlertDialogFooter>
            <HStack spacing={2}>
              <Button ref={noRef} onClick={onClose}>
                No
              </Button>
              <Button colorScheme="red" onClick={onDelete}>
                Yes
              </Button>
            </HStack>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
}
