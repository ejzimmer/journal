import { ReactElement } from "react"
import { render } from "@testing-library/react"
import {
  MediaStorageContext,
  MediaStorageContextType,
} from "./MediaStorageContext"

export function createMediaStorageContext(
  overrides: Partial<MediaStorageContextType> = {},
): MediaStorageContextType {
  return {
    books: undefined,
    games: undefined,
    isLoading: false,
    authors: [],
    seriesIn: () => [],
    addToList: jest.fn(),
    updateInList: jest.fn(),
    removeFromList: jest.fn(),
    moveToList: jest.fn(),
    ...overrides,
  }
}

export function renderWithMediaStorage(
  ui: ReactElement,
  overrides: Partial<MediaStorageContextType> = {},
) {
  const storage = createMediaStorageContext(overrides)
  const result = render(
    <MediaStorageContext.Provider value={storage}>
      {ui}
    </MediaStorageContext.Provider>,
  )
  return { ...result, storage }
}
