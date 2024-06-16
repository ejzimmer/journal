import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogOverlay,
  Button,
  HStack,
  ListItem,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { EditableLabel } from "./style";
import { Checkbox } from "./Checkbox";
import { useTask } from "../../shared/TaskContext";

type Props = {
  id: string;
};

export function SubTask({ id }: Props) {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const {
    changeDescription,
    changeDone,
    deleteTask,
    task: { isDone, description },
  } = useTask(id);

  return (
    <ListItem
      style={{
        display: "flex",
        alignItems: "center",
        paddingLeft: "1em",
        cursor: "pointer",
      }}
      opacity={isDone ? ".6" : 1}
    >
      <Checkbox
        label={`${description} done`}
        isChecked={isDone}
        onChange={(event) => {
          changeDone(event.target.checked);
        }}
      />
      <EditableLabel
        aria-label={`${description}`}
        defaultValue={description}
        onBlur={(event) => changeDescription(event.target.value)}
        paddingStart=".25em"
        marginStart=".25em"
        paddingTop=".3em"
        paddingBottom=".1em"
        height="unset"
        textDecoration={isDone ? "line-through" : "none"}
      />
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
      <ConfirmDelete
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        task={description}
        onDelete={deleteTask}
      />
    </ListItem>
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
