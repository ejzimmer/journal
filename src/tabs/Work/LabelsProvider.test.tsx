import { useContext } from "react"
import { render, screen } from "@testing-library/react"
import { LabelsProvider } from "./LabelsProvider"
import { LabelsContext } from "./LabelsContext"
import { FirebaseContext, ContextType } from "../../shared/FirebaseContext"
import { Label } from "./types"

function createStorageContext(labelsById: Record<string, Label>): ContextType {
  return {
    addItem: jest.fn(),
    updateItem: jest.fn(),
    deleteItem: jest.fn(),
    updateList: jest.fn(),
    useValue: <T,>() => ({ value: labelsById as unknown as T, loading: false }),
  }
}

function LabelValues() {
  const labels = useContext(LabelsContext)
  return <>{labels?.map((l) => <span key={l.id}>{l.value}</span>)}</>
}

describe("LabelsProvider", () => {
  it("provides the labels from the database via context", () => {
    const usedLabel: Label = { id: "label-1", value: "a11y", colour: "blue" }
    const storageContext = createStorageContext({ [usedLabel.id]: usedLabel })

    render(
      <FirebaseContext.Provider value={storageContext}>
        <LabelsProvider usedLabelIds={new Set(["label-1"])}>
          <LabelValues />
        </LabelsProvider>
      </FirebaseContext.Provider>,
    )

    expect(screen.getByText("a11y")).toBeInTheDocument()
  })

  it("marks a label as removed when it's no longer used anywhere", () => {
    const unusedLabel: Label = {
      id: "label-1",
      value: "a11y",
      colour: "blue",
    }
    const storageContext = createStorageContext({
      [unusedLabel.id]: unusedLabel,
    })

    render(
      <FirebaseContext.Provider value={storageContext}>
        <LabelsProvider usedLabelIds={new Set()}>
          <LabelValues />
        </LabelsProvider>
      </FirebaseContext.Provider>,
    )

    expect(storageContext.updateItem).toHaveBeenCalledWith(
      "work-labels",
      expect.objectContaining({ id: "label-1", lastRemoved: expect.any(Number) }),
    )
  })

  it("doesn't re-mark a label that's already flagged as removed", () => {
    const alreadyRemoved: Label = {
      id: "label-1",
      value: "a11y",
      colour: "blue",
      lastRemoved: Date.now() - 1000,
    }
    const storageContext = createStorageContext({
      [alreadyRemoved.id]: alreadyRemoved,
    })

    render(
      <FirebaseContext.Provider value={storageContext}>
        <LabelsProvider usedLabelIds={new Set()}>
          <LabelValues />
        </LabelsProvider>
      </FirebaseContext.Provider>,
    )

    expect(storageContext.updateItem).not.toHaveBeenCalled()
  })

  it("clears the removed flag when a label is used again", () => {
    const reusedLabel: Label = {
      id: "label-1",
      value: "a11y",
      colour: "blue",
      lastRemoved: Date.now() - 1000,
    }
    const storageContext = createStorageContext({
      [reusedLabel.id]: reusedLabel,
    })

    render(
      <FirebaseContext.Provider value={storageContext}>
        <LabelsProvider usedLabelIds={new Set(["label-1"])}>
          <LabelValues />
        </LabelsProvider>
      </FirebaseContext.Provider>,
    )

    expect(storageContext.updateItem).toHaveBeenCalledWith("work-labels", {
      id: "label-1",
      value: "a11y",
      colour: "blue",
    })
  })
})
