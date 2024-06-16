import { render, screen } from "@testing-library/react";
import { SubTask } from "./SubTask";
import userEvent from "@testing-library/user-event";
import { TaskContext, TaskContextType } from "../../shared/TaskContext";
import { List } from "@chakra-ui/react";

const mockTask = {
  id: "1",
  description: "Cut out pattern",
  isDone: false,
};

function renderSubTask(props?: Partial<TaskContextType>) {
  const mockValue = {
    changeDescription: props?.changeDescription ?? jest.fn(),
    changeDone: props?.changeDone ?? jest.fn(),
    deleteTask: props?.deleteTask ?? jest.fn(),
    getTask: jest.fn().mockResolvedValue(mockTask),
  };

  return render(
    <TaskContext.Provider value={mockValue}>
      {<SubTask id="1" />}
    </TaskContext.Provider>,
    { wrapper: List }
  );
}

describe("SubTask", () => {
  describe("when the user clicks the sub-task", () => {
    it("toggles the status between done & not done", async () => {
      const changeDone = jest.fn();
      renderSubTask({ changeDone });

      const task = await screen.findByRole("checkbox", {
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
      renderSubTask({ deleteTask, changeDone });

      const deleteButton = await screen.findByRole("button", {
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
      renderSubTask({ changeDone });

      await userEvent.click(
        await screen.findByRole("textbox", { name: "Cut out pattern" })
      );

      expect(screen.getByRole("textbox")).toBeInTheDocument();
      expect(changeDone).not.toHaveBeenCalled();
    });

    it("updates the title on blur", async () => {
      const changeDescription = jest.fn();
      const { container } = renderSubTask({ changeDescription });

      const description = await screen.findByRole("textbox", {
        name: "Cut out pattern",
      });
      await userEvent.clear(description);
      await userEvent.type(description, "Buy fabric");
      await userEvent.click(container);

      expect(changeDescription).toHaveBeenCalledWith("1", "Buy fabric");
    });
  });
});
