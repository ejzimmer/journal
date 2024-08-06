import { render, screen } from "@testing-library/react";
import { Task } from "./Task";
import userEvent from "@testing-library/user-event";
import { TaskContext, TaskContextType } from "../../shared/TaskContext";
import { List } from "@chakra-ui/react";
import { TaskMetadata } from "./types";

const mockTasks = [
  {
    id: "1",
    description: "Cut out pattern",
    isDone: false,
  },
  {
    id: "2",
    description: "Buy pattern",
    isDone: false,
  },
  {
    id: "3",
    description: "Trace pieces",
    isDone: false,
  },
];

async function renderTask(
  props?: Partial<TaskContextType & { task?: TaskMetadata[] }>
) {
  const mockValue = {
    getTask: jest.fn(),
    changeDescription: props?.changeDescription ?? jest.fn(),
    changeDone: props?.changeDone ?? jest.fn(),
    deleteTask: props?.deleteTask ?? jest.fn(),
    addSubTask: props?.addSubTask ?? jest.fn(),
  };

  const view = render(
    <TaskContext.Provider value={mockValue}>
      {<Task task={mockTasks[1]} />}
    </TaskContext.Provider>,
    { wrapper: List }
  );
  await screen.findByText("Cut out pattern");
  return view;
}

describe("SubTask", () => {
  describe("when the user clicks the sub-task", () => {
    it("toggles the status between done & not done", async () => {
      const changeDone = jest.fn();
      await renderTask({ changeDone });

      const task = screen.getByRole("checkbox", {
        name: /Cut out pattern done/,
      });
      await userEvent.click(task);

      expect(changeDone).toHaveBeenCalledWith("1", true);
    });
  });

  describe("when the user clicks the delete button", () => {
    it("shows a confirmation dialogue, then calls the onDelete handler", async () => {
      const deleteTask = jest.fn();
      const changeDone = jest.fn();
      await renderTask({ deleteTask, changeDone });

      const deleteButton = screen.getByRole("button", {
        name: "Delete task: Cut out pattern",
      });
      await userEvent.click(deleteButton);

      expect(
        screen.getByText("Are you sure you want to delete Cut out pattern?")
      ).toBeInTheDocument();

      await userEvent.click(screen.getByRole("button", { name: "Yes" }));

      expect(deleteTask).toHaveBeenCalledWith("1");
      expect(changeDone).not.toHaveBeenCalled();
    });
  });

  describe("when the user edits the task title", () => {
    it("does not mark the task as done", async () => {
      const changeDone = jest.fn();
      await renderTask({ changeDone });

      await userEvent.click(screen.getByText("Cut out pattern"));

      expect(screen.getByRole("textbox")).toBeInTheDocument();
      expect(changeDone).not.toHaveBeenCalled();
    });

    it("updates the title on blur", async () => {
      const changeDescription = jest.fn();
      const { container } = await renderTask({ changeDescription });

      const description = screen.getByText("Cut out pattern");
      await userEvent.click(description);

      const input = screen.getByRole("textbox", {
        name: "Edit Cut out pattern",
      });
      await userEvent.clear(input);
      await userEvent.type(input, "Buy fabric");
      await userEvent.click(container);

      expect(changeDescription).toHaveBeenCalledWith("1", "Buy fabric");
    });
  });

  const queryAddSubTaskButton = () =>
    screen.queryByRole("button", { name: "Add subtasks to Cut out pattern" });
  const addSubTaskButton = () =>
    screen.getByRole("button", { name: "Add subtasks to Cut out pattern" });
  const newSubTaskInput = () =>
    screen.getByRole("textbox", { name: "New subtask for Cut out pattern" });

  describe("when the task has no subtasks", () => {
    describe("and the user clicks the add subtasks button", () => {
      it("shows the subtask form and focusses the input & hides the add subtasks button", async () => {
        await renderTask();
        expect(
          screen.queryByRole("textbox", {
            name: "New subtask for Cut out pattern",
          })
        ).not.toBeInTheDocument();

        await userEvent.click(addSubTaskButton());

        const input = newSubTaskInput();
        expect(input).toBeInTheDocument();
        expect(input).toHaveFocus();
        expect(queryAddSubTaskButton()).not.toBeInTheDocument();
      });

      describe("when the user clicks away from the subtask form without entering any text", () => {
        it("hides the subtask form & shows the button", async () => {
          const changeDescription = jest.fn();
          const { container } = await renderTask({ changeDescription });

          await userEvent.click(addSubTaskButton());
          const input = newSubTaskInput();
          await userEvent.click(container);

          expect(
            screen.getByRole("button", {
              name: "Add subtasks to Cut out pattern",
            })
          ).toBeVisible();
          expect(input).not.toBeInTheDocument();
          expect(changeDescription).not.toHaveBeenCalled();
        });
      });

      describe("when the user enters text, then clicks away", () => {
        it("adds the subtask & keeps the form visible (but cleared) & the button hidden", async () => {
          const addSubTask = jest.fn();
          const { container } = await renderTask({ addSubTask });

          await userEvent.click(addSubTaskButton());
          await userEvent.type(newSubTaskInput(), "Trace pattern pieces");
          await userEvent.click(container);

          expect(addSubTask).toHaveBeenCalledWith("1", "Trace pattern pieces");
          expect(queryAddSubTaskButton()).not.toBeInTheDocument();
          expect(newSubTaskInput()).toBeInTheDocument();
          expect(newSubTaskInput()).toHaveValue("");
        });
      });
    });
  });

  describe("when the task has subtasks", () => {
    const tasks = [
      { ...mockTasks[0], tasks: ["2", "3"] },
      mockTasks[1],
      mockTasks[2],
    ];

    it("displays the list of subtasks & the add subtask form", async () => {
      await renderTask({ tasks });

      expect(await screen.findByText("Buy pattern")).toBeInTheDocument();
      expect(await screen.findByText("Trace pieces")).toBeInTheDocument();
    });

    describe("when the subtasks are all complete", () => {
      it("marks the task as complete", async () => {
        await renderTask({ tasks });

        const [, ...subtasks] = tasks;
        await Promise.all(
          subtasks.map(async ({ description }) =>
            userEvent.click(await screen.findByText(`${description} done`))
          )
        );

        expect(
          screen.getByRole("checkbox", { name: "Cut out pattern done" })
        ).toBeChecked();
      });
      //     describe("if the user then changes the task back to uncomplete", () => {
      //       it("stays uncomplete");
      //     });
    });

    //   describe("when the subtasks are all deleted", () => {
    //     it("hides the subtask form & shows the add subtasks button");
    //   });
  });
});
