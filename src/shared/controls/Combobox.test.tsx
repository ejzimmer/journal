import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Combobox } from "./Combobox";

describe("Combobox", () => {
  describe("mouse interactions", () => {
    it("can select an option from the list", async () => {
      const user = userEvent.setup();
      const { container } = render(<Combobox />);

      await user.click(screen.getByRole("textbox"));
      const benderOption = screen.getByRole("checkbox", { name: "Bender" });
      await user.click(benderOption);

      // Don't close the pop-up yet
      expect(benderOption).toBeVisible();
      expect(
        screen.getByRole("button", { name: "Bender, remove" })
      ).toBeInTheDocument();

      await user.click(container);
      expect(benderOption).not.toBeVisible();
    });
  });

  describe("keyboard interactions", () => {
    it("can select an option from the list", async () => {
      const user = userEvent.setup();
      render(<Combobox />);

      await user.keyboard("{Tab}");
      const leelaOption = screen.getByRole("checkbox", { name: "Leela" });
      expect(leelaOption).toBeVisible();

      await user.keyboard("{ArrowDown}{ArrowDown}");
      // expect leelaOption to be highlighted
      await user.keyboard(" ");
      expect(leelaOption).toBeSelected();
    });
  });
  // selects an option from the list
  // types to filter options in the list
  // type to create a new option + change colour
  // displays selected options
  // works with a keyboard
  // open popup on focus, close on blur
});
